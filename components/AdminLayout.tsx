import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'
import { LayoutDashboard, Package, ShoppingBag, Users, Settings, LogOut, Menu, X } from 'lucide-react'

export function AdminLayout() {
  const { admin, logout, isSuperAdmin } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/orders', label: 'Orders', icon: ShoppingBag },
    ...(isSuperAdmin ? [{ path: '/admins', label: 'Admins', icon: Users }] : []),
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="admin-layout">
      {/* Mobile top bar with hamburger toggle */}
      <div className="mobile-topbar">
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <span className="logo">SHAPEWEAR Admin</span>
      </div>

      {/* Backdrop shown behind the drawer on mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo-area" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="logo">SHAPEWEAR Admin</div>
            <div className="user-email">{admin?.email}</div>
            <div className="user-role">{admin?.role}</div>
          </div>
          <button
            onClick={closeSidebar}
            aria-label="Close menu"
            className="sidebar-close-btn"
          >
            <X size={20} />
          </button>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeSidebar}
            >
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
