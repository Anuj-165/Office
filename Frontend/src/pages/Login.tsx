import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../pages/services/axiosInstance'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/context/Auth'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleLogin = async () => {
  try {
    const response = await axios.post<{
      access_token: string;
      user: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }>('/auth/login', { email, password });

    const { access_token, user } = response.data;

    login({
      token: access_token,
      role: user.role,
      userId: user.id,
      name: user.name,
    });

    if (user.role === 'admin') {
      navigate('/Frontend/src/pages/admin/Company.tsx');
    } else {
      navigate('/Frontend/src/pages/Dashboard.tsx');
    }
  } catch (error: any) {
    const msg = error.response?.data?.detail || 'An unexpected error occurred.';
    toast.error(`Error: ${msg}`);
  }
};



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-slate-200"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Welcome Back</h2>

        {/* Email Field */}
        <div className="mb-4">
          <label className="text-sm text-slate-600 mb-2 block">Email</label>
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
            <Mail className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label className="text-sm text-slate-600 mb-2 block">Password</label>
          <div className="flex items-center border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
            <Lock className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-slate-800"
            />
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          className="w-full bg-cyan-500 text-white py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors shadow-md shadow-cyan-500/25"
        >
          Sign In
        </motion.button>

        {/* Extra */}
        <p className="text-sm text-center text-slate-500 mt-4">
          Don't have an account? <span className="text-cyan-600 cursor-pointer hover:underline">Contact admin</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
