import { ArrowUpRight, ShoppingBag, DollarSign, Truck, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';


const salesAnalyticsData = [
  { month: 'Jan', itemsSold: 3, revenue: 240 },
  { month: 'Feb', itemsSold: 4, revenue: 320 },
  { month: 'Mar', itemsSold: 10, revenue: 850 },
];

export function Dashboard() {

  const totalItemsSold = salesAnalyticsData.reduce((acc, item) => acc + item.itemsSold, 0);
  const totalRevenue = salesAnalyticsData.reduce((acc, item) => acc + item.revenue, 0);

  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Dashboard Overview</h1>
        <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>Real-time business dynamics and sales indicators.</p>
      </div>

      {/* --- KPI STAT CARDS CARD ROW --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        {/* Total Revenue */}
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>Total Revenue</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#111827' }}>${totalRevenue}.00</h3>
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
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#059669' }}>12 Orders</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', color: '#16a34a' }}>
            <Truck size={24} />
          </div>
        </div>

        {/* Pending Delivery Status */}
        <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: 0 }}>Pending Delivery</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.25rem 0 0 0', color: '#d97706' }}>5 Restless</h3>
          </div>
          <div style={{ padding: '0.5rem', backgroundColor: '#fffbp9', borderRadius: '0.5rem', color: '#ea580c' }}>
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* --- CHARTS CONFIGURATION ZONE --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem' }}>
        
        {/* Money Made / Revenue Chart */}
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Revenue Streams ($)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={salesAnalyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="$" />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
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
              <BarChart data={salesAnalyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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