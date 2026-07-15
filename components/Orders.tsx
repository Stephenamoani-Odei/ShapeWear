import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../utils/currency'
import { toast } from 'sonner'

export function Orders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) toast.error('Failed to load orders')
    else setOrders(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: number, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date() })
      .eq('id', id)
    if (error) toast.error('Failed to update status')
    else {
      toast.success('Status updated')
      fetchOrders()
    }
  }

  if (loading) return <div className="text-center mt-8">Loading orders...</div>

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Orders</h1>
      <div className="table-container">
        <table style={{ width: '100%', minWidth: '900px' }}>
          <thead>
            <tr>
              <th>ID</th><th>Date</th><th>Customer</th><th>Email</th><th>Amount</th><th>Payment</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td style={{ whiteSpace: 'nowrap', color: '#6b7280', fontSize: '0.875rem' }}>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })
                    : '—'}
                </td>
                <td>{order.customer_name}</td>
                <td>{order.user_email}</td>
                <td>{formatCurrency(order.amount_ghs)}</td>
                <td>
                  <span className={`badge ${order.payment_status === 'success' ? 'badge-success' : 'badge-warning'}`}>
                    {order.payment_status}
                  </span>
                </td>
                <td>
                  <span className="badge badge-warning">{order.status || 'pending'}</span>
                </td>
                <td>
                  <select onChange={(e) => updateStatus(order.id, e.target.value)} defaultValue={order.status || 'pending'}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}