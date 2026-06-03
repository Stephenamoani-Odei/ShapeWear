import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useApp } from '../context/AppContext';
import { supabase } from '../utils/supabase';
import { formatCurrency } from '../utils/currency';
import { motion, AnimatePresence } from 'motion/react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  ArrowRight,
  MapPin,
  CreditCard,
  Phone,
  Copy,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  size: string | null;
  color: string | null;
  image?: string;
}

interface ShippingAddress {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface TrackedOrder {
  id: string;
  created_at: string;
  user_email: string;
  customer_name: string;
  phone_number: string | null;
  amount_ghs: number;
  paystack_reference: string;
  payment_status: string;
  order_status: OrderStatus;
  status_updated_at: string | null;
  shipping_address: ShippingAddress | string;
  items: OrderItem[];
  tracking_number: string | null;
  courier_name: string | null;
  estimated_delivery: string | null;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; label: string; description: string }[] = [
  { key: 'pending',    label: 'Order placed',   description: 'Payment received, awaiting confirmation' },
  { key: 'processing', label: 'Processing',      description: 'Your order is being prepared' },
  { key: 'shipped',    label: 'Shipped',          description: 'On its way to you' },
  { key: 'delivered',  label: 'Delivered',        description: 'Order has arrived' },
];

const STATUS_ORDER: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1;
  return STATUS_ORDER.indexOf(status);
}

function StatusIcon({ status, size = 20 }: { status: OrderStatus; size?: number }) {
  const cls = `w-${size === 20 ? 5 : 6} h-${size === 20 ? 5 : 6}`;
  switch (status) {
    case 'pending':    return <Clock className={cls} />;
    case 'processing': return <Package className={cls} />;
    case 'shipped':    return <Truck className={cls} />;
    case 'delivered':  return <CheckCircle className={cls} />;
    case 'cancelled':  return <XCircle className={cls} />;
  }
}

function statusColor(status: OrderStatus): string {
  switch (status) {
    case 'delivered':  return 'bg-green-100 text-green-800 border-green-200';
    case 'shipped':    return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'pending':    return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'cancelled':  return 'bg-red-100 text-red-800 border-red-200';
  }
}

// ─── Helper: parse shipping address (handles both string and jsonb) ────────────

function parseAddress(raw: ShippingAddress | string): ShippingAddress {
  if (typeof raw === 'string') {
    return { address: raw };
  }
  return raw ?? {};
}

// ─── Lookup Form ──────────────────────────────────────────────────────────────

function LookupForm({ onFound }: { onFound: (order: TrackedOrder) => void }) {
  const [reference, setReference] = useState('');
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleLookup = async () => {
    const ref   = reference.trim();
    const mail  = email.trim().toLowerCase();

    if (!ref || !mail) {
      setError('Please enter both your order reference and email.');
      return;
    }

    setLoading(true);
    setError(null);

    // Use the secure RPC function so guests can't enumerate orders
    const { data, error: rpcError } = await supabase.rpc('get_order_by_reference', {
      p_reference: ref,
      p_email: mail,
    });

    setLoading(false);

    if (rpcError) {
      setError('Something went wrong. Please try again.');
      console.error(rpcError.message);
      return;
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      setError('No order found. Check your reference and email and try again.');
      return;
    }

    const order: TrackedOrder = Array.isArray(data) ? data[0] : data;
    onFound(order);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
          <Search className="w-7 h-7 text-white" />
        </div>
        <h1 className="mb-3">Track your order</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Enter the order reference from your confirmation email and the email you used at checkout.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Order reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => { setReference(e.target.value); setError(null); }}
            placeholder="e.g. order_1748901234567"
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="you@example.com"
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition-colors text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 px-4 py-3 text-sm"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleLookup}
          disabled={loading}
          className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Looking up order…
            </>
          ) : (
            <>
              Track order
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Status Stepper ───────────────────────────────────────────────────────────

function StatusStepper({ status }: { status: OrderStatus }) {
  const currentIndex = getStepIndex(status);
  const isCancelled  = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 px-6 py-5">
        <XCircle className="w-6 h-6 text-red-600 shrink-0" />
        <div>
          <p className="font-semibold text-red-800">Order cancelled</p>
          <p className="text-red-600 text-sm mt-0.5">This order has been cancelled. Contact support if you have questions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-5 left-5 right-5 h-px bg-gray-200 hidden sm:block" aria-hidden />
      <div
        className="absolute top-5 left-5 h-px bg-black hidden sm:block transition-all duration-700"
        style={{
          width: currentIndex === 0
            ? '0%'
            : `calc(${(currentIndex / (STATUS_STEPS.length - 1)) * 100}% - 2.5rem)`,
        }}
        aria-hidden
      />

      <ol className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
        {STATUS_STEPS.map((step, i) => {
          const done    = i < currentIndex;
          const active  = i === currentIndex;
          const future  = i > currentIndex;

          return (
            <li key={step.key} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-0 sm:flex-1">
              {/* Circle */}
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: done || active ? '#000' : '#fff',
                  borderColor: future ? '#d1d5db' : '#000',
                  scale: active ? 1.15 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0"
              >
                {done ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span className={active ? 'text-white' : 'text-gray-400'}>
                    <StatusIcon status={step.key} size={20} />
                  </span>
                )}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-black"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <div className="sm:mt-3 sm:text-center sm:px-2">
                <p className={`text-sm font-semibold ${future ? 'text-gray-400' : 'text-black'}`}>
                  {step.label}
                </p>
                {active && (
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{step.description}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ─── Order Detail View ────────────────────────────────────────────────────────

function OrderDetail({
  order,
  onBack,
}: {
  order: TrackedOrder;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [copied, setCopied]   = useState(false);
  const [reordering, setReordering] = useState(false);

  const address   = parseAddress(order.shipping_address);
  const createdAt = new Date(order.created_at);
  const updatedAt = order.status_updated_at ? new Date(order.status_updated_at) : null;
  const estDelivery = order.estimated_delivery ? new Date(order.estimated_delivery) : null;

  const copyReference = async () => {
    await navigator.clipboard.writeText(order.paystack_reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReorder = () => {
    setReordering(true);
    order.items.forEach((item) => {
      addToCart(
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image ?? '',
          category: '',
          description: '',
          features: [],
          colors: [],
          inStock: true,
        },
        item.quantity,
        item.size ?? undefined,
        item.color ?? undefined
      );
    });
    setTimeout(() => navigate('/cart'), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back + header */}
      <div className="flex items-center justify-between mb-8" data-aos="fade-up">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Track another order
        </button>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-full ${statusColor(order.order_status)}`}>
          <StatusIcon status={order.order_status} size={14} />
          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
        </span>
      </div>

      {/* Order ID row */}
      <div className="mb-8 pb-6 border-b border-gray-200" data-aos="fade-up">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order reference</p>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold">{order.paystack_reference}</span>
          <button
            onClick={copyReference}
            className="text-gray-400 hover:text-black transition-colors"
            title="Copy reference"
          >
            <Copy className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {copied && (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-green-600"
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Placed on {createdAt.toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })}
          {updatedAt && ` · Last updated ${updatedAt.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}`}
        </p>
      </div>

      {/* Status stepper */}
      <div className="mb-10" data-aos="fade-up" data-aos-delay="50">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-6">Delivery status</h2>
        <StatusStepper status={order.order_status} />
      </div>

      {/* Shipping + delivery info */}
      {(order.tracking_number || order.courier_name || estDelivery || address.address) && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-200 mb-8 border border-gray-200"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {address.address && (
            <div className="bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Shipping to</p>
              </div>
              <p className="text-sm font-semibold">{address.name ?? order.customer_name}</p>
              <p className="text-sm text-gray-600 mt-0.5">{address.address}</p>
              {(address.city || address.state) && (
                <p className="text-sm text-gray-600">
                  {[address.city, address.state, address.zipCode].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          )}

          {(order.courier_name || order.tracking_number || estDelivery) && (
            <div className="bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Courier info</p>
              </div>
              {order.courier_name && (
                <p className="text-sm font-semibold">{order.courier_name}</p>
              )}
              {order.tracking_number && (
                <p className="text-sm text-gray-600 font-mono mt-0.5">{order.tracking_number}</p>
              )}
              {estDelivery && (
                <p className="text-sm text-gray-600 mt-2">
                  Expected by{' '}
                  <span className="font-semibold text-black">
                    {estDelivery.toLocaleDateString('en-GH', { weekday: 'short', day: 'numeric', month: 'long' })}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="bg-white p-6">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Payment</p>
            </div>
            <p className="text-sm font-semibold">{formatCurrency(order.amount_ghs)}</p>
            <p className="text-sm text-gray-500 mt-0.5 capitalize">{order.payment_status}</p>
          </div>

          {order.phone_number && (
            <div className="bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">MoMo number</p>
              </div>
              <p className="text-sm font-semibold">{order.phone_number}</p>
            </div>
          )}
        </div>
      )}

      {/* Items list */}
      <div data-aos="fade-up" data-aos-delay="150">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="space-y-0 border border-gray-200 divide-y divide-gray-200">
          {order.items.map((item, i) => (
            <motion.div
              key={`${item.id}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 p-4 bg-white"
            >
              {/* Placeholder thumbnail */}
              <div className="w-16 h-16 bg-gray-100 shrink-0 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-300" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {item.size  && <span className="text-xs text-gray-500">Size: {item.size}</span>}
                  {item.color && <span className="text-xs text-gray-500">Colour: {item.color}</span>}
                  <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                </div>
              </div>

              <p className="text-sm font-semibold shrink-0">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </motion.div>
          ))}

          {/* Totals row */}
          <div className="flex justify-between items-center px-4 py-4 bg-gray-50">
            <span className="text-sm text-gray-500">Order total</span>
            <span className="font-bold">{formatCurrency(order.amount_ghs)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div
        className="mt-8 flex flex-col sm:flex-row gap-3"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        {/* Re-order */}
        {order.order_status === 'delivered' && (
          <button
            onClick={handleReorder}
            disabled={reordering}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            <ShoppingBag className="w-4 h-4" />
            {reordering ? 'Adding to cart…' : 'Re-order'}
          </button>
        )}

        {/* Contact support */}
        <a
          href={`mailto:support@shapewear.com?subject=Order query: ${order.paystack_reference}&body=Hi, I have a question about my order ${order.paystack_reference}.`}
          className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-black px-6 py-3 font-semibold hover:bg-black hover:text-white transition-colors"
        >
          Contact support
        </a>

        {/* Continue shopping */}
        <Link
          to="/shop"
          className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 font-semibold text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          Continue shopping
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Logged-in user order list ─────────────────────────────────────────────────

function MyOrders({ onSelect }: { onSelect: (order: TrackedOrder) => void }) {
  const { user } = useApp();
  const [orders, setOrders]   = useState<TrackedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_email', user!.email)
        .order('created_at', { ascending: false });

      if (!error && data) setOrders(data as TrackedOrder[]);
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-gray-300">
        <Package className="w-10 h-10 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">No orders yet</p>
        <Link to="/shop" className="text-sm font-semibold underline underline-offset-2">
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 mb-4">
        Showing {orders.length} order{orders.length !== 1 ? 's' : ''} for {user?.email}
      </p>
      {orders.map((order, i) => (
        <motion.button
          key={order.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => onSelect(order)}
          className="w-full text-left border border-gray-200 p-4 hover:border-black transition-colors bg-white group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs text-gray-400 mb-1 truncate">{order.paystack_reference}</p>
              <p className="font-semibold text-sm">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''} · {formatCurrency(order.amount_ghs)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {new Date(order.created_at).toLocaleDateString('en-GH', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold border rounded-full ${statusColor(order.order_status)}`}>
                <StatusIcon status={order.order_status} size={12} />
                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export function OrderTracker() {
  const { user } = useApp();
  const { id: refParam } = useParams<{ id?: string }>();

  const [view, setView]       = useState<'lookup' | 'orders' | 'detail'>('lookup');
  const [order, setOrder]     = useState<TrackedOrder | null>(null);
  const [tab, setTab]         = useState<'lookup' | 'myorders'>(user ? 'myorders' : 'lookup');

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  // If a reference was passed in the URL, auto-lookup (for link-from-email flows)
  useEffect(() => {
    if (refParam) {
      // Pre-fill is handled by passing ref as default; we just switch to lookup tab
      setTab('lookup');
    }
  }, [refParam]);

  const handleFound = (found: TrackedOrder) => {
    setOrder(found);
    setView('detail');
  };

  const handleSelectFromList = (selected: TrackedOrder) => {
    setOrder(selected);
    setView('detail');
  };

  const handleBack = () => {
    setOrder(null);
    setView('lookup');
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-10" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <span className="text-black">Order tracker</span>
        </nav>

        <AnimatePresence mode="wait">
          {view === 'detail' && order ? (
            <OrderDetail key="detail" order={order} onBack={handleBack} />
          ) : (
            <motion.div
              key="lookup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Page title */}
              <div className="mb-10" data-aos="fade-up">
                <h1 className="mb-2">Order tracker</h1>
                <p className="text-gray-500 text-sm">Follow your order from payment to your door.</p>
              </div>

              {/* Tabs — only show if logged in */}
              {user && (
                <div className="flex border-b border-gray-200 mb-8" data-aos="fade-up">
                  {(['myorders', 'lookup'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
                        tab === t
                          ? 'border-black text-black'
                          : 'border-transparent text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {t === 'myorders' ? 'My orders' : 'Track by reference'}
                    </button>
                  ))}
                </div>
              )}

              {/* Tab content */}
              <AnimatePresence mode="wait">
                {tab === 'lookup' || !user ? (
                  <motion.div
                    key="lookup-form"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <LookupForm onFound={handleFound} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="my-orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <MyOrders onSelect={handleSelectFromList} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
