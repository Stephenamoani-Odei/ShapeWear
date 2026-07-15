import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../contexts/AdminContext'
import { toast } from 'sonner'
import { Trash2, Loader2, UserPlus } from 'lucide-react'
import { ConfirmDialog } from './ConfirmDialog'

export function Admins() {
  const { isSuperAdmin, admin } = useAdmin()
  const [admins, setAdmins] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)

  // Fetch admin table records when the page loads
  useEffect(() => {
    if (isSuperAdmin) fetchAdmins()
  }, [isSuperAdmin])

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    setAdmins(data || [])
  }

  // FIXED: Your automated system-wide RPC handler integrated cleanly
  const handleCreateAdminForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      toast.error('All fields are required')
      return
    }
    
    setLoading(true)

    try {
      // Direct remote RPC invocation (handles Auth, mapping, and admin_users altogether)
      const { data, error } = await supabase.rpc('admin_create_user_automated', {
        admin_name: name.trim(),
        admin_email: email.trim(),
        admin_password: password,
        admin_role: role
      })

      if (error) throw error

      if (data?.success === false) {
        toast.error(data.message || 'Failed to initialize account profiles.')
      } else {
        toast.success('Admin added completely across all systems!')
        
        // Reset form inputs
        setName('')
        setEmail('')
        setPassword('')
        setRole('admin')
        
        // Instantly refresh the visual user list table
        fetchAdmins()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to trigger automated admin creation script.')
    } finally {
      setLoading(false)
    }
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [adminPendingDelete, setAdminPendingDelete] = useState<{ id: string; email: string } | null>(null)

  const requestDeleteAdmin = (id: string, adminEmail: string) => {
    setAdminPendingDelete({ id, email: adminEmail })
  }

  const cancelDeleteAdmin = () => {
    if (deletingId) return
    setAdminPendingDelete(null)
  }

  const confirmDeleteAdmin = async () => {
    if (!adminPendingDelete) return
    const { id } = adminPendingDelete

    setDeletingId(id)
    try {
      // Uses a server-side RPC (security definer) so this works regardless of table-level
      // RLS policies, and so the underlying auth user is removed too, not just the row.
      const { data, error } = await supabase.rpc('admin_delete_user_automated', {
        target_admin_id: id,
      })

      if (error) throw error
      if (data?.success === false) {
        throw new Error(data.message || 'Failed to remove admin')
      }

      toast.success('Admin removed from tracking metrics.')
      setAdminPendingDelete(null)
      fetchAdmins()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to complete profile deletion.')
    } finally {
      setDeletingId(null)
    }
  }

  // Guard Clause to block unauthorized workers
  if (!isSuperAdmin) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#dc2626', fontWeight: '500' }}>
        Access denied. Super admin privileges required.
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Manage Admins</h1>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Register new personnel credentials or manage existing security profiles.</p>
      </div>

      {/* --- ADMINS LIST DATAGRID TABLE --- */}
      <div className="table-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '560px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6', color: '#4b5563', fontSize: '0.875rem' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>EMAIL</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>ROLE</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>CREATED</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(adm => (
              <tr key={adm.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.937rem', color: '#1f2937' }}>
                <td style={{ padding: '1rem 0.5rem' }}>{adm.email}</td>
                <td style={{ padding: '1rem 0.5rem' }}>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: adm.role === 'super_admin' ? '#f5f3ff' : '#f3f4f6',
                    color: adm.role === 'super_admin' ? '#6d28d9' : '#374151'
                  }}>
                    {adm.role}
                  </span>
                </td>
                <td style={{ padding: '1rem 0.5rem', color: '#6b7280' }}>
                  {new Date(adm.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                  {adm.email !== admin?.email ? (
                    <button
                      onClick={() => requestDeleteAdmin(adm.id, adm.email)}
                      disabled={deletingId === adm.id}
                      style={{ background: 'none', border: 'none', cursor: deletingId === adm.id ? 'not-allowed' : 'pointer', padding: '0.25rem' }}
                    >
                      {deletingId === adm.id ? <Loader2 size={16} className="animate-spin" color="#dc2626" /> : <Trash2 size={16} color="#dc2626" />}
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>You (Active)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- AUTOMATED INTEGRATED REGISTRATION FORM --- */}
      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '450px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.25rem', color: '#1f2937' }}>Add New Admin</h2>
        
        <form onSubmit={handleCreateAdminForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Admin Name (login name)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. kofi" style={{ width: '100%' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="kofi@shapewear.com" style={{ width: '100%' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Temporary Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' }}>Admin Access Permissions Level</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: '#fff' }}>
              <option value="admin">Standard Admin Console User</option>
              <option value="super_admin">Super Admin System Authority</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
            {loading ? 'Generating System Identities...' : 'Add Admin System-Wide'}
          </button>
        </form>
      </div>

      <ConfirmDialog
        open={!!adminPendingDelete}
        title="Remove this admin?"
        message={adminPendingDelete ? `"${adminPendingDelete.email}" will lose access immediately and their login will be deleted. This can't be undone.` : ''}
        confirmLabel="Remove"
        danger
        loading={!!deletingId}
        onConfirm={confirmDeleteAdmin}
        onCancel={cancelDeleteAdmin}
      />
    </div>
  )
}