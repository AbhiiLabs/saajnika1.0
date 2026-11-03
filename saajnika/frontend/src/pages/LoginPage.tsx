import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } else {
      setError(res.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 border border-[#E8E2D9] shadow-sm space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block">
            Private Boutique Portal
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817] font-normal">
            Client Sign In
          </h1>
          <p className="text-xs font-sans text-[#766F68]">
            Access your orders, saved addresses, and private salon privileges.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#A43E38]/10 border border-[#A43E38]/20 text-[#A43E38] text-xs font-sans flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="client@saajnika.com"
              className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[#766F68] uppercase tracking-wider text-[10px]">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full border border-[#E8E2D9] p-3 text-sm focus:outline-none focus:border-[#1A1817]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase py-3.5 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Atelier'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

          <div className="pt-2 text-center text-xs font-sans text-[#766F68]">
            New to Saajnika?{' '}
            <Link to="/register" className="text-[#1A1817] hover:text-[#966355] underline font-medium transition-colors">
              Create a Client Account
            </Link>
          </div>

      </div>
    </div>
  );
};
