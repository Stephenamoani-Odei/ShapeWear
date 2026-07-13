import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';


export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, user } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
    });

    if (user) {
      navigate('/account');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Successfully logged in!');
      } else {
        await register(email, password, name);
        toast.success('Account created successfully!');
      }
      navigate('/account');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div data-aos="fade-up" className="bg-white p-8 border border-gray-200">
          <h1 className="mb-8 text-center">
            {isLogin ? 'Login' : 'Create Account'}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black"
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  8 Minimum characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Please wait...'
                : isLogin
                ? 'Login'
                : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Login'}
            </button>
          </div>

  

          {isLogin && (
  <div className="mt-4 text-center">
    <button
      type="button"
      onClick={async () => {
        if (!email) {
          toast.error('Enter your email above first');
          return;
        }
        try {
          await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          toast.success('Password reset email sent — check your inbox!');
        } catch (e) {
          toast.error(e instanceof Error ? e.message : 'Failed to send reset email');
        }
      }}
      className="text-sm text-gray-600 hover:text-black transition-colors"
    >
      Forgot password?
    </button>
  </div>
)}

          <p className="text-xs text-gray-500 mt-6 text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
