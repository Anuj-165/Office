import { useEffect, useState, ChangeEvent } from 'react';
import axios from '../pages/services/axiosInstance';  // adjust the relative path accordingly

import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Settings,
  Bell,
  Shield,
  Palette,
  Upload,
  LucideIcon,
} from 'lucide-react';

interface ProfileData {
  name: string;
  email: string;
  position: string;
  age: number;
}

interface SettingItem {
  label: string;
  enabled: boolean;
}

interface SettingSection {
  title: string;
  icon: LucideIcon;
  items: SettingItem[];
}

const settingsSections: SettingSection[] = [
  {
    title: 'Notifications',
    icon: Bell,
    items: [
      { label: 'Email notifications', enabled: true },
      { label: 'Push notifications', enabled: false },
      { label: 'SMS alerts', enabled: true },
    ],
  },
  {
    title: 'Privacy',
    icon: Shield,
    items: [
      { label: 'Profile visibility', enabled: true },
      { label: 'Location sharing', enabled: true },
      { label: 'Activity status', enabled: false },
    ],
  },
  {
    title: 'Appearance',
    icon: Palette,
    items: [
      { label: 'Dark mode', enabled: false },
      { label: 'Reduced animations', enabled: false },
      { label: 'Compact layout', enabled: true },
    ],
  },
];

export default function Profile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get<ProfileData>('/dashboard/user-info');
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      alert('You can only upload 3 images');
      return;
    }
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length !== 3) {
      alert('Please upload exactly 3 images');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      await axios.post('/dashboard/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Images uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload images');
    }
  };

  if (!profileData) return <div>Loading profile...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile</h1>
        <p className="text-slate-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Basic Information</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <InfoRow icon={<User />} label="Full Name" value={profileData.name} />
                <InfoRow icon={<Mail />} label="Email" value={profileData.email} />
                <InfoRow icon={<Phone />} label="Phone" value="+91 00000-00000" />
              </div>
              <div className="space-y-4">
                <InfoRow icon={<MapPin />} label="Location" value="N/A" />
                <InfoRow icon={<Settings />} label="Position" value={profileData.position} />
                <InfoRow icon={<Calendar />} label="Age" value={`${profileData.age} years`} />
              </div>
            </div>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Settings</h2>
            <div className="space-y-6">
              {settingsSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <section.icon className="h-5 w-5 text-slate-600" />
                    <h3 className="font-medium text-slate-900">{section.title}</h3>
                  </div>
                  <div className="pl-8 space-y-3">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            item.enabled ? 'bg-cyan-500' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              item.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upload Facial Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Upload Facial Images</h2>
            <div className="space-y-3">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:border file:rounded-md file:border-slate-200 file:text-sm file:bg-white hover:file:bg-slate-100"
              />
              <motion.button
                onClick={handleUpload}
                whileTap={{ scale: 0.95 }}
                className="bg-cyan-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-cyan-700 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload 3 Images</span>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Picture</h3>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profileData.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg border border-slate-200"
                >
                  <Camera className="h-4 w-4 text-slate-600" />
                </motion.button>
              </div>
              <div className="text-center">
                <p className="font-semibold text-slate-900">{profileData.name}</p>
                <p className="text-sm text-slate-600">{profileData.position}</p>
                <p className="text-sm text-slate-500">Employee</p>
              </div>
            </div>
          </motion.div>

          {/* Dummy Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <Stat label="This Month" value="160h 20m" />
              <Stat label="Goals Completed" value="9/12" color="green" />
              <Stat label="Team Rank" value="#4" color="cyan" />
              <Stat label="Growth Score" value="88/100" color="purple" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Reusable Components
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center space-x-3">
      <div className="text-slate-400">{icon}</div>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color = 'slate',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`font-semibold text-${color}-600`}>{value}</span>
    </div>
  );
}
