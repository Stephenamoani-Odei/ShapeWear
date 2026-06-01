import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image_url: string;
  created_at: string;
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingForm, setSubmittingForm] = useState(false);

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
    try {
      setUploadingImage(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // 1. Send file straight to your public bucket
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Extract public read link structure
      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setUploadedUrl(data.publicUrl);
      toast.success('Image attached successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Image placement failed. Check RLS or bucket name.');
    } finally {
      setUploadingImage(false);
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
            image_url: uploadedUrl // Uses URL captured behind the scenes from image uploader
          }
        ]);

      if (error) throw error;

      toast.success('Product added successfully!');
      
      // Reset Form State Elements
      setName('');
      setPrice('');
      setDescription('');
      setUploadedUrl('');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Could not save product.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product removed.');
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Manage Inventory</h1>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Add new items or clear products instantly.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        
        {/* --- EXCLUSIVE FILE UPLOAD ADD FORM --- */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', color: '#1f2937' }}>Add New Product</h2>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Product Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Bodysuit Shaper" style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Price ($)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required placeholder="59.99" style={{ width: '100%' }} />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Provide item fabric details..." rows={3} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', fontFamily: 'inherit' }} />
            </div>

            {/* MANDATORY CONTROL: EXCLUSIVE IMAGE FILE PICKER BLOCK */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500' }}>Product Representation Media</label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.25rem' }}>
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
              {products.map((product) => (
                <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'between', gap: '1rem', padding: '0.75rem', border: '1px solid #f3f4f6', borderRadius: '0.5rem' }}>
                  <img src={product.image_url} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '0.25rem', backgroundColor: '#f9fafb' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.937rem', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h4>
                    <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.875rem', fontWeight: '500', color: '#4f46e5' }}>${product.price.toFixed(2)}</p>
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }} title="Remove Item">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}