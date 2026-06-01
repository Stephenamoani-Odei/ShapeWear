import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut } from 'lucide-react'

export function AdminLayout() {
  const { admin, logout, isSuperAdmin } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/orders', label: 'Orders', icon: ShoppingBag },
    ...(isSuperAdmin ? [{ path: '/admins', label: 'Admins', icon: Users }] : []),
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="logo-area">
          <div className="logo">SHAPEWEAR Admin</div>
          <div className="user-email">{admin?.email}</div>
          <div className="user-role">{admin?.role}</div>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-item">
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="nav-item logout-btn">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}