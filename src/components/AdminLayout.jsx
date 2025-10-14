import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Video,
  Users,
  CreditCard,
  Settings,
  User,
  LogOut
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black flex relative z-10 admin-layout-active">
      {/* Hide any navbar that might be rendering globally on admin pages */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide any navbar that might be rendering globally */
          body > nav[class*="Navbar"],
          body > nav[class*="navbar"],
          body > .navbar,
          body > [class*="navbar"],
          body > .Navbar,
          body > header[class*="navbar"],
          body > .sticky,
          body > [class*="sticky"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            left: -9999px !important;
          }

          /* Ensure admin layout takes full priority */
          .admin-layout-active,
          .admin-layout-active * {
            z-index: 9999 !important;
          }
        `
      }} />
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col relative z-20">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-white font-bold text-xl">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <SidebarLink to="/admin" icon={Home} label="Dashboard" />
            <SidebarLink to="/admin/movies" icon={Video} label="Manage Videos" />
            <SidebarLink to="/admin/users" icon={Users} label="Manage Users" />
            <SidebarLink to="/admin/subscriptions" icon={CreditCard} label="Subscriptions" />
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin User</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden bg-black w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Manage your OTT platform</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 w-full bg-black">
          {children}
        </div>
      </div>
    </div>
  );
};

// Sidebar Link Component
const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-300 hover:text-white hover:bg-gray-800'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
};

export default AdminLayout;
