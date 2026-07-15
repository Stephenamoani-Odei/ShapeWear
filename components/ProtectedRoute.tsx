import { Navigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAdmin()

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>
  }

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  return children
}