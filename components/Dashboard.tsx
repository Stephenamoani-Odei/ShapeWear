import { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/currency';

interface OrderRow {
  id: number;
  amount_ghs: number;
  payment_status: string;
  status: string | null;
  created_at: string;
  items: { quantity?: number }[] | null;
}

interface MonthPoint {
  month: string;
  itemsSold: number;
  revenue: number;
}

export function Dashboard() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, amount_ghs, payment_status, status, created_at, items')
      .order('created_at', { ascending: true });

    if (!error) setOrders(data || []);
    setLoading(false);
  };

  // Only count orders that were actually paid for towards revenue/units-sold figures
  const paidOrders = orders.filter((o) => o.payment_status === 'success');

  const totalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.amount_ghs) || 0), 0);

  const totalItemsSold = paidOrders.reduce((acc, o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    return acc + items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
  }, 0);

  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const pendingCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;

  // Build a real revenue/units chart from the last 6 months of actual paid orders
  const monthlyData: MonthPoint[] = (() => {
    const now = new Date();
    const buckets: MonthPoint[] = [];
    const keyToIndex = new Map<string, number>();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      keyToIndex.set(key, buckets.length);
      buckets.push({ month: d.toLocaleString(undefined, { month: 'short' }), itemsSold: 0, revenue: 0 });
    }

    paidOrders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = keyToIndex.get(key);
      if (idx === undefined) return; // outside the 6-month window
      buckets[idx].revenue += Number(o.amount_ghs) || 0;
      const items = Array.isArray(o.items) ? o.items : [];
      buckets[idx].itemsSold += items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
    });

    return buckets;
  })();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#6b7280', gap: '0.5rem' }}>
        <Loader2 className="animate-spin" size={20} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Real-time business dynamics and sales indicators.</p>
      </div>

      {/* --- KPI STAT CARDS CARD ROW --- */}
      <div className="responsive-grid-stats">

        {/* Total Revenue */}
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>Total Revenue</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#111827' }}>{formatCurrency(totalRevenue)}</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#ecfdf5', borderRadius: '0.5rem', color: '#059669' }}>
            <DollarSign size={24} />
          </div>
        </div>

        {/* Volume Sold */}
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>Items Sold</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#111827' }}>{totalItemsSold} Units</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', color: '#2563eb' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        {/* Delivered Status */}
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>Delivered</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#059669' }}>{deliveredCount} Orders</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', color: '#16a34a' }}>
            <Truck size={24} />
          </div>
        </div>

        {/* Pending Delivery Status */}
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>Pending Delivery</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#d97706' }}>{pendingCount} Orders</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#fffbeb', borderRadius: '0.5rem', color: '#ea580c' }}>
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* --- CHARTS CONFIGURATION ZONE --- */}
      <div className="responsive-grid-charts">

        {/* Money Made / Revenue Chart */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Revenue Streams (₵)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="₵" />
                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" fillOpacity={0.1} fill="#4f46e5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quantities Sold Bar Chart */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Product Volume Sold (Units)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="itemsSold" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} name="Items Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
