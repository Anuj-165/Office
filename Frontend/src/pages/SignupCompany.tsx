import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Briefcase, AtSign, Shield, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from '../pages/services/axiosInstance';
interface FormData {
  company_name: string;
  email_domain: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  position: string;
  age: string; // Will convert to number before sending
}

interface FieldProps {
  icon: React.ReactNode;
  type?: string;
  name: keyof FormData;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function CompanySignup() {
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    email_domain: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    position: '',
    age: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    const values = Object.values(formData);
    if (values.some((val) => val === '')) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        age: Number(formData.age) // convert age from string to number
      };

      const response = await axios.post('/auth/register-company', payload);

      toast.success('Company Registered!');
      console.log('Form Submitted:', payload);
      console.log('API Response:', response.data);

      // Optionally reset form
      setFormData({
        company_name: '',
        email_domain: '',
        admin_name: '',
        admin_email: '',
        admin_password: '',
        position: '',
        age: ''
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error?.response?.data?.detail || 'Registration failed');
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
        className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-md border border-slate-200"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Register Your Company</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            icon={<Briefcase className="w-5 h-5 text-slate-400 mr-2" />}
            name="company_name"
            placeholder="Company Name"
            value={formData.company_name}
            onChange={handleChange}
          />
          <Field
            icon={<AtSign className="w-5 h-5 text-slate-400 mr-2" />}
            name="email_domain"
            placeholder="Email Domain"
            value={formData.email_domain}
            onChange={handleChange}
          />
          <Field
            icon={<User className="w-5 h-5 text-slate-400 mr-2" />}
            name="admin_name"
            placeholder="Admin Name"
            value={formData.admin_name}
            onChange={handleChange}
          />
          <Field
            icon={<Mail className="w-5 h-5 text-slate-400 mr-2" />}
            type="email"
            name="admin_email"
            placeholder="Admin Email"
            value={formData.admin_email}
            onChange={handleChange}
          />
          <Field
            icon={<Lock className="w-5 h-5 text-slate-400 mr-2" />}
            type="password"
            name="admin_password"
            placeholder="Admin Password"
            value={formData.admin_password}
            onChange={handleChange}
          />
          <Field
            icon={<Shield className="w-5 h-5 text-slate-400 mr-2" />}
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
          />
          <Field
            icon={<Calendar className="w-5 h-5 text-slate-400 mr-2" />}
            name="age"
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          className="mt-6 w-full bg-cyan-500 text-white py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors shadow-md shadow-cyan-500/25"
        >
          Register Company
        </motion.button>

        <p className="text-sm text-center text-slate-500 mt-4">
          Already registered?{' '}
          <span className="text-cyan-600 cursor-pointer hover:underline">Sign in</span>
        </p>
      </motion.div>
    </motion.div>
  );
}

function Field({ icon, type = 'text', name, placeholder, value, onChange }: FieldProps) {
  return (
    <div>
      <label className="text-sm text-slate-600 mb-1 block capitalize">{name.replace(/_/g, ' ')}</label>
      <div className="flex items-center border border-slate-200 rounded-xl px-4 py-2 bg-slate-50">
        {icon}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent focus:outline-none text-slate-800"
        />
      </div>
    </div>
  );
}
