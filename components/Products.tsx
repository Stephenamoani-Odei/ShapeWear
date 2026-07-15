import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '../utils/currency';
import { ConfirmDialog } from './ConfirmDialog';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  created_at: string;
  discount_percent?: number | null;
}

// Rounds to 2dp so sale prices never show floating point artifacts (e.g. 19.990000000000002)
function getSalePrice(price: number, discountPercent?: number | null) {
  if (!discountPercent || discountPercent <= 0) return price;
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Promotions: which product row is currently being edited, and its draft % value
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoDraft, setPromoDraft] = useState('');
  const [savingPromoId, setSavingPromoId] = useState<string | null>(null);

  // Delete confirmation modal (replaces window.confirm)
  const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Could not fetch products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Handles direct file picker selection and uploads directly to storage bucket
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = event.target;
    try {
      if (!inputEl.files || inputEl.files.length === 0) return;
      const file = inputEl.files[0];

      // Basic client-side guardrails so a bad file gives a clear message instead of a silent failure
      if (!file.type.startsWith('image/')) {
        toast.error('Please choose an image file (PNG, JPG, WEBP, etc).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image is too large — please pick one under 5MB.');
        return;
      }

      setUploadingImage(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // 1. Send file straight to your public bucket
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // 2. Extract public read link structure
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      setUploadedUrl(data.publicUrl);
      toast.success('Image attached successfully!');
    } catch (error: any) {
      console.error('Image upload failed:', error);
      // Surface the real Supabase error (bucket missing / RLS policy / etc.) instead of a generic message
      const message = error?.message || error?.error_description || 'Image upload failed. Check bucket name and storage policies.';
      toast.error(message);
    } finally {
      setUploadingImage(false);
      // Reset so selecting the exact same file again still fires onChange
      inputEl.value = '';
    }
  };

  // Submits the finalized values to the database table
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadedUrl) {
      toast.error('Please upload a product image first.');
      return;
    }

    try {
      setSubmittingForm(true);
      
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name: name.trim(),
            price: parseFloat(price),
            description: description.trim(),
            image: uploadedUrl, // Uses URL captured behind the scenes from image uploader
            discount_percent: discountPercent ? parseFloat(discountPercent) : 0
          }
        ]);

      if (error) throw error;

      toast.success('Product added successfully!');
      
      // Reset Form State Elements
      setName('');
      setPrice('');
      setDescription('');
      setUploadedUrl('');
      setDiscountPercent('');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Could not save product.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductPendingDelete(product);
  };

  const cancelDeleteProduct = () => {
    if (deletingProduct) return;
    setProductPendingDelete(null);
  };

  const confirmDeleteProduct = async () => {
    if (!productPendingDelete) return;
    try {
      setDeletingProduct(true);
      const { error } = await supabase.from('products').delete().eq('id', productPendingDelete.id);
      if (error) throw error;
      toast.success('Product removed.');
      setProductPendingDelete(null);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    } finally {
      setDeletingProduct(false);
    }
  };

  const startEditingPromo = (product: Product) => {
    setEditingPromoId(product.id);
    setPromoDraft(product.discount_percent ? String(product.discount_percent) : '');
  };

  const cancelEditingPromo = () => {
    setEditingPromoId(null);
    setPromoDraft('');
  };

  // Applies (or clears, when set to 0/blank) a promotional discount on a single product
  const handleSavePromo = async (id: string) => {
    const value = promoDraft.trim() === '' ? 0 : parseFloat(promoDraft);
    if (isNaN(value) || value < 0 || value > 90) {
      toast.error('Enter a discount between 0 and 90%');
      return;
    }
    try {
      setSavingPromoId(id);
      const { error } = await supabase
        .from('products')
        .update({ discount_percent: value })
        .eq('id', id);
      if (error) throw error;
      toast.success(value > 0 ? `Promotion set to ${value}% off` : 'Promotion removed');
      setEditingPromoId(null);
      setPromoDraft('');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Could not update promotion');
    } finally {
      setSavingPromoId(null);
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Manage Inventory</h1>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Add new items or clear products instantly.</p>
      </div>

      <div className="responsive-grid-products">
        
        {/* --- EXCLUSIVE FILE UPLOAD ADD FORM --- */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', color: '#1f2937' }}>Add New Product</h2>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Bodysuit Shaper" style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Price (₵)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="59.99" style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Promo Discount (%, optional)</label>
              <input type="number" min="0" max="90" step="1" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="e.g. 10 for 10% off" style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Provide item fabric details..." rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
            </div>

            {/* MANDATORY CONTROL: EXCLUSIVE IMAGE FILE PICKER BLOCK */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}>Product Representation Media</label>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage || submittingForm} 
                  id="exclusive-image-picker" 
                  style={{ display: 'none' }} 
                />
                
                <label 
                  htmlFor="exclusive-image-picker" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    border: '1px dashed #4f46e5',
                    borderRadius: '0.375rem',
                    cursor: uploadingImage ? 'not-allowed' : 'pointer',
                    backgroundColor: '#f5f3ff',
                    color: '#4f46e5',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                  {uploadingImage ? 'Uploading to Server...' : 'Upload Device Image'}
                </label>

                {/* Live Preview Display Box container */}
                <div style={{ width: '60px', height: '60px', borderRadius: '0.375rem', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {uploadedUrl ? (
                    <img src={uploadedUrl} alt="Upload Confirmation Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={20} style={{ color: '#9ca3af' }} />
                  )}
                </div>
              </div>
              {uploadedUrl && <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '500' }}>✓ Image processed and linked securely.</span>}
            </div>

            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={submittingForm || uploadingImage}>
              {submittingForm ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {submittingForm ? 'Creating Entry...' : 'Add Product to Store'}
            </button>
          </form>
        </div>

        {/* --- CURRENT INVENTORY DISPLAY TAB GRID --- */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', color: '#1f2937' }}>Active Catalog ({products.length})</h2>
          
          {loadingProducts ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: '#6b7280', gap: '0.5rem' }}>
              <Loader2 className="animate-spin" size={20} />
              <span>Syncing Catalog...</span>
            </div>
          ) : products.length === 0 ? (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No products listed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {products.map((product) => {
                const hasPromo = !!product.discount_percent && product.discount_percent > 0;
                const salePrice = getSalePrice(product.price, product.discount_percent);
                return (
                  <div key={product.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '0.75rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem' }}>
                    <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem', backgroundColor: '#f9fafb', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.937rem', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.125rem' }}>
                        {hasPromo ? (
                          <>
                            <span className="price-original">{formatCurrency(product.price)}</span>
                            <span className="price-sale">{formatCurrency(salePrice)}</span>
                            <span className="promo-badge">{product.discount_percent}% OFF</span>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#4f46e5' }}>{formatCurrency(product.price)}</span>
                        )}
                      </div>

                      {editingPromoId === product.id ? (
                        <div className="promo-inline-form" style={{ marginTop: '0.5rem' }}>
                          <input
                            type="number"
                            min="0"
                            max="90"
                            value={promoDraft}
                            onChange={(e) => setPromoDraft(e.target.value)}
                            placeholder="%"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSavePromo(product.id)}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                            disabled={savingPromoId === product.id}
                          >
                            {savingPromoId === product.id ? <Loader2 className="animate-spin" size={14} /> : 'Save'}
                          </button>
                          <button onClick={cancelEditingPromo} className="btn btn-outline" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingPromo(product)}
                          style={{ marginTop: '0.375rem', background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '0.75rem', fontWeight: '600', padding: 0 }}
                        >
                          {hasPromo ? 'Edit promotion' : '+ Add promotion'}
                        </button>
                      )}
                    </div>
                    <button onClick={() => handleDeleteProduct(product)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }} title="Remove Item">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <ConfirmDialog
        open={!!productPendingDelete}
        title="Remove this product?"
        message={productPendingDelete ? `"${productPendingDelete.name}" will be permanently removed from your store. This can't be undone.` : ''}
        confirmLabel="Delete"
        danger
        loading={deletingProduct}
        onConfirm={confirmDeleteProduct}
        onCancel={cancelDeleteProduct}
      />
    </div>
  );
}