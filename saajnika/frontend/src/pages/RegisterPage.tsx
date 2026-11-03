import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    const res = await register(formData);
    setLoading(false);

    if (res.success) {
      navigate('/account');
    } else {
      setError(res.error || 'Registration failed. Please check form values.');
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 border border-[#E8E2D9] shadow-sm space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#966355] font-medium block">
            Private Client Membership
          </span>
          <h1 className="font-serif text-3xl text-[#1A1817] font-normal">
            Create an Account
          </h1>
          <p className="text-xs font-sans text-[#766F68]">
            Receive private preview privileges, address book saving, and order tracking.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-[#A43E38]/10 border border-[#A43E38]/20 text-[#A43E38] text-xs font-sans flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full border border-[#E8E2D9] p-2.5 text-sm focus:outline-none focus:border-[#1A1817]"
              />
            </div>
            <div>
              <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full border border-[#E8E2D9] p-2.5 text-sm focus:outline-none focus:border-[#1A1817]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-[#E8E2D9] p-2.5 text-sm focus:outline-none focus:border-[#1A1817]"
            />
          </div>

          <div>
            <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-[#E8E2D9] p-2.5 text-sm focus:outline-none focus:border-[#1A1817]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Min 8 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-[#E8E2D9] p-2.5 text-sm focus:outline-none focus:border-[#1A1817]"
              />
            </div>
            <div>
              <label className="block text-[#766F68] uppercase tracking-wider text-[10px] mb-1">
                Confirm *
              </label>
              <input
                type="password"
                required
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                className="w-full border border-[#E8E2D9] p-2.5 text-sm focus:outline-none focus:border-[#1A1817]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A1817] text-[#FAF8F5] text-xs font-sans tracking-[0.2em] uppercase py-3.5 hover:bg-[#966355] transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
          >
            <span>{loading ? 'Creating Membership...' : 'Register Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center text-xs font-sans text-[#766F68] pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1A1817] underline font-medium">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};
