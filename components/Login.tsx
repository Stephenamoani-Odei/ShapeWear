import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { supabase } from '../lib/supabase' 
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react' 

export function Login() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // New state to manage the persistent feedback error message
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const { login } = useAdmin()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null) // Reset errors on every new login attempt

    try {
      const searchName = name.trim().toLowerCase()

      const { data, error } = await supabase
        .from('admin_name_mapping')
        .select('email')
        .eq('name', searchName)

      if (error) {
        setErrorMessage('Database configuration error.')
        return
      }

      // Check if username mapping profile exists
      if (!data || data.length === 0) {
        setErrorMessage('Incorrect credentials')
        return
      }

      const email = data[0].email
      
      // Attempt Supabase Auth Password Sign In
      await login(email, password)
      
      toast.success('Access Granted!')
      navigate('/')
    } catch (error: any) {
      console.error('Login engine snapshot rejection:', error)
      
      // Handle password failure or generic login restriction from Supabase Auth
      if (error?.message?.toLowerCase().includes('invalid login credentials') || error?.status === 400) {
        setErrorMessage('Incorrect credentials')
      } else {
        setErrorMessage(error.message || 'Authentication error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter admin identifier"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ paddingRight: '2.5rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Validating credentials...' : 'Login'}
          </button>

          {/* Feedback error message element rendered immediately under the button */}
          {errorMessage && (
            <div 
              style={{
                color: '#dc2626',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                marginTop: '1rem',
                fontSize: '0.875rem',
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              {errorMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}