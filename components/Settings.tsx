import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAdmin } from '../contexts/AdminContext'
import { toast } from 'sonner'

export function Settings() {
  const { admin } = useAdmin()
  const [newName, setNewName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingName, setLoadingName] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  // Change admin name
  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      toast.error('Please enter a new name')
      return
    }

    setLoadingName(true)
    try {
      // Get current email from the admin object
      const email = admin?.email
      if (!email) throw new Error('No admin email found')

      // Update the mapping table
      const { error: updateError } = await supabase
        .from('admin_name_mapping')
        .update({ name: newName.trim().toLowerCase() })
        .eq('email', email)

      if (updateError) throw updateError

      toast.success('Admin name changed successfully! Please login again.')
      // Logout to force re-login with new name
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error: any) {
      toast.error(error.message || 'Failed to change name')
    } finally {
      setLoadingName(false)
    }
  }

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoadingPassword(true)
    try {
      // First verify current password by attempting to sign in
      const email = admin?.email
      if (!email) throw new Error('No admin email found')

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (signInError) throw new Error('Current password is incorrect')

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (updateError) throw updateError

      toast.success('Password changed successfully! Please login again.')
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Settings</h1>

      {/* Change Name Section */}
      <div className="login-card" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Change Admin Name</h2>
        <form onSubmit={handleChangeName}>
          <div className="form-group">
            <label>Current Name</label>
            <input type="text" value={admin?.email?.split('@')[0] || ''} disabled />
          </div>
          <div className="form-group">
            <label>New Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              placeholder="Enter new admin name"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loadingName}>
            {loadingName ? 'Changing...' : 'Change Name'}
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="login-card" style={{ maxWidth: '400px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Change Password</h2>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={loadingPassword}>
            {loadingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}