import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { Login } from "./components/Login.tsx";
import { Dashboard } from "./components/Dashboard.tsx";
import { Products } from "./components/Products.tsx"; 
import { Orders } from "./components/Orders.tsx";
import { Admins } from "./components/Admins.tsx";
import { Settings } from "./components/Settings.tsx";
import { AdminProvider } from "./contexts/AdminContext.tsx";

export default function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Console Dashboard View */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="admins" element={<Admins />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}