import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, ShoppingCart, Tag, Image,
  Layers, Users, ShieldAlert, ArrowLeft, LogOut, FolderTree, Sliders, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="flex items-center space-x-3 text-xs font-sans tracking-widest uppercase text-[#766F68]">
          <RefreshCw className="animate-spin text-[#966355]" size={18} />
          <span>Verifying Atelier Access...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4">
        <div className="bg-white p-8 border border-[#E8E2D9] text-center space-y-4 max-w-md">
          <ShieldAlert size={36} className="text-[#A43E38] mx-auto" />
          <h2 className="font-serif text-2xl text-[#1A1817]">Atelier Admin Access Restricted</h2>
          <p className="text-xs font-sans text-[#766F68]">
            This portal is restricted to Saajnika atelier directors and administrative staff.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/login" className="bg-[#1A1817] text-white px-5 py-2.5 text-xs font-sans tracking-widest uppercase">
              Sign In as Admin
            </Link>
            <Link to="/" className="border border-[#E8E2D9] px-4 py-2.5 text-xs font-sans tracking-widest uppercase">
              Boutique Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    { to: '/admin/products', label: 'Silhouettes & Products', icon: ShoppingBag },
    { to: '/admin/categories', label: 'Categories & Chapters', icon: FolderTree },
    { to: '/admin/orders', label: 'Order Fulfillment', icon: ShoppingCart },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Layers },
    { to: '/admin/customers', label: 'Patrons & Customers', icon: Users },
    { to: '/admin/coupons', label: 'Coupons & Privileges', icon: Tag },
    { to: '/admin/cms', label: 'Banners & CMS', icon: Image },
    { to: '/admin/settings', label: 'Store Settings & Policies', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#231F1D] flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1A1817] text-[#FAF8F5] p-6 flex flex-col justify-between border-r border-[#2C2826]">
        <div className="space-y-8">
          
          <div>
            <span className="font-serif text-2xl tracking-[0.2em] text-white block">SAAJNIKA</span>
            <span className="text-[9px] font-sans tracking-[0.25em] uppercase text-[#C5A880] block">
              Atelier Control Center
            </span>
          </div>

          <nav className="space-y-1 text-xs font-sans tracking-wider">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-none transition-colors ${
                    isActive
                      ? 'bg-[#2C2826] text-[#C5A880] border-l-2 border-[#C5A880]'
                      : 'text-[#A8A199] hover:bg-[#2C2826] hover:text-white'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

        </div>

        <div className="pt-6 border-t border-[#2C2826] space-y-3 text-xs font-sans text-[#A8A199]">
          <Link to="/" className="flex items-center space-x-2 hover:text-white transition-colors">
            <ArrowLeft size={14} />
            <span>Return to Boutique</span>
          </Link>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex items-center space-x-2 text-[#A43E38] hover:underline"
          >
            <LogOut size={14} />
            <span>Sign Out ({user?.email})</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
};
