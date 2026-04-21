import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  MessageSquare, 
  Star, 
  Truck, 
  HelpCircle,
  LogOut,
  Settings,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, isAuthReady, logout } = useAuth();
  const [storeName, setStoreName] = React.useState('Kalakriti');

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'public');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().storeName) {
          setStoreName(docSnap.data().storeName);
        }
      } catch (error) {
        console.error("Error fetching admin settings:", error);
      }
    };
    fetchSettings();
  }, []);

  React.useEffect(() => {
    if (isAuthReady && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthReady, navigate]);

  if (!isAuthReady || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-4 border-maroon/30 border-t-maroon rounded-full animate-spin"></div>
      </div>
    );
  }

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/orders', icon: <Package size={20} />, label: 'Orders' },
    { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/reviews', icon: <Star size={20} />, label: 'Ratings & Reviews' },
    { path: '/admin/shipments', icon: <Truck size={20} />, label: 'Shipments' },
    { path: '/admin/faqs', icon: <HelpCircle size={20} />, label: 'FAQs' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Store Content' },
    { path: '/admin/newsletter', icon: <Mail size={20} />, label: 'Newsletter' },
  ];

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-gold/20 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gold/20">
          <Link to="/" className="font-serif text-[24px] font-bold text-maroon tracking-[2px] uppercase">
            {storeName}
          </Link>
          <p className="text-[11px] uppercase tracking-widest text-text-light mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-[12px] transition-colors ${
                  isActive 
                    ? 'bg-maroon text-white shadow-md' 
                    : 'text-text-light hover:bg-accent-soft hover:text-maroon'
                }`}
              >
                {item.icon}
                <span className="text-[14px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gold/20">
          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-[12px] text-text-light hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-[14px] font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};
