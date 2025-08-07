import React, { useState } from 'react';
import axios from '../services/axiosInstance';
import { motion } from 'framer-motion';
import { UserPlus, Trash2, Search, ShieldCheck, UserCog } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id?: string;
  name: string;
  email: string;
  role: string;
  position: string;
  age: number;
}

export default function User() {
  const [user, setUser] = useState<User>({
    name: '',
    email: '',
    role: '',
    position: '',
    age: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [searchName, setSearchName] = useState('');

  // Add User Handler
  const handleAddUser = async () => {
    const { name, email, role, position, age } = user;
    if (!name || !email || !role || !position || age <= 0) {
      toast.warning('Please fill all fields correctly');
      return;
    }

    try {
      await axios.post('http://localhost:8000/auth/signup-user', { ...user, password: 'default123' });
      toast.success('User added');
      setUsers([...users, user]);
      setUser({ name: '', email: '', role: '', position: '', age: 0 });
    } catch (error) {
      toast.error('Error adding user');
    }
  };

  
  const handleRemoveUser = async (name: string) => {
    try {
      await axios.post('http://localhost:8000/dashboard/remove-user', { name });
      toast.success('User removed');
      setUsers(users.filter((u) => u.name !== name));
    } catch {
      toast.error('Failed to remove user');
    }
  };

  // Search User Handler
 const handleSearchUser = async () => {
  if (!searchName.trim()) {
    toast.warning('Enter a name to search');
    return;
  }

  try {
    const res = await axios.post<User>('http://localhost:8000/dashboard/search-user', { name: searchName });
    const foundUser = res.data;
    toast.success('User found');
    setUsers([foundUser]);
  } catch {
    toast.error('User not found');
  }
};


  return (
    <div className="p-6 space-y-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">User Management</h1>
        <p className="text-slate-600">Create, search, and remove users from the platform</p>
      </div>

      {/* Add User Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Add User
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="email"
            placeholder="Email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Role"
            value={user.role}
            onChange={(e) => setUser({ ...user, role: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Position"
            value={user.position}
            onChange={(e) => setUser({ ...user, position: e.target.value })}
            className="border px-3 py-2 rounded-md"
          />
          <input
            type="number"
            placeholder="Age"
            min={1}
            value={user.age}
            onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) })}
            className="border px-3 py-2 rounded-md"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddUser}
          className="mt-4 flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-cyan-700 transition"
        >
          <UserPlus className="w-5 h-5" />
          Add User
        </motion.button>
      </div>

      {/* Search User */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <Search className="w-5 h-5" /> Search User
        </h2>

        <div className="flex gap-4 flex-col sm:flex-row">
          <input
            type="text"
            placeholder="Enter name to search"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="border px-3 py-2 rounded-md w-full"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearchUser}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition"
          >
            <Search className="w-5 h-5" />
            Search
          </motion.button>
        </div>
      </div>

      {/* User List */}
      {users.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            User List
          </h2>

          {users.map((u, index) => (
            <motion.div
              key={u.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-cyan-500 border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{u.name}</h3>
                  <p className="text-sm text-slate-600">{u.email} • {u.position}</p>
                  <p className="text-sm text-slate-500">{u.role}, Age: {u.age}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleRemoveUser(u.name)}
                  className="text-red-600 hover:text-red-800 bg-red-100 px-3 py-1 rounded-md flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
