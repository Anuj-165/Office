import React, { useState,ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../pages/context/Auth';
import {
  Home,
  Calendar,
  Target,
  TrendingUp,
  User,
  Users,
  Building2,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authData } = useAuth();
  const { role } = authData;

  const commonLinks = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Growth', href: '/growth', icon: TrendingUp },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Login', href: '/login', icon: LogIn }, // ✅ NEW LINK
    { name: 'Signup Company', href: '/signup-company', icon: UserPlus }, 

  ];

  const adminLinks = [
    { name: 'Users', href: '/Frontend/src/pages/admin/User.tsx', icon: Users },
    { name: 'Companies', href: '/Frontend/src/pages/admin/Company.tsx', icon: Building2 },
  ];

  const navigation = role === 'admin' ? [...commonLinks, ...adminLinks] : commonLinks;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        navigation={navigation}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-20">
        <Navbar setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <Outlet />
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}