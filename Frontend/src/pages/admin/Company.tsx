import React, { useState } from 'react';
import axios from '../services/axiosInstance';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaSearch, FaTrash, FaMapMarkerAlt, FaCrosshairs } from 'react-icons/fa';

const Company = () => {
  const [location, setLocation] = useState({ latitude: '', longitude: '', radius: '' });
  const [username, setUsername] = useState('');
  const [goalStats, setGoalStats] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);

  // Auto Detect GPS
  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        }));
        toast.success("Location auto-filled!");
      },
      () => toast.error("Unable to retrieve your location")
    );
  };

  const handleSetLocation = async () => {
    try {
      const { latitude, longitude, radius } = location;
      await axios.post('/dashboard/set-office-location', {
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius_meter: Number(radius),
      });
      toast.success('Location set successfully');
    } catch {
      toast.error('Failed to set location');
    }
  };

  const handleSearchGoals = async () => {
    try {
      const res = await axios.post('/dashboard/search-user-goals', { name: username });
      setGoalStats(res.data);
      toast.success('Goals fetched');
    } catch {
      toast.error('Failed to fetch goals');
    }
  };

  const handleSearchAttendance = async () => {
    try {
      const res = await axios.post('/dashboard/search-user-attendance', { name: username });
      setAttendanceStats(res.data);
      toast.success('Attendance fetched');
    } catch {
      toast.error('Failed to fetch attendance');
    }
  };

  const handleRemove = async (type: 'goals' | 'attendance' | 'images') => {
    try {
      const url = `/dashboard/remove-user-${type}`;
      const res = await axios.post<{ message: string }>(url, { name: username });
      toast.success(res.data.message || `${type} removed successfully`);
    } catch {
      toast.error(`Failed to remove ${type}`);
    }
  };

  return (
    <motion.div
      className="p-8 max-w-5xl mx-auto space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl font-bold text-center text-blue-600">🛠️ Dashboard Control Panel</h2>

      {/* Set Office Location */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FaMapMarkerAlt /> Set Office Location (GPS)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="input input-bordered"
            placeholder="Latitude"
            value={location.latitude}
            onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
          />
          <input
            className="input input-bordered"
            placeholder="Longitude"
            value={location.longitude}
            onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
          />
          <input
            className="input input-bordered"
            placeholder="Radius (meters)"
            value={location.radius}
            onChange={(e) => setLocation({ ...location, radius: e.target.value })}
          />
        </div>
        <div className="flex gap-4 mt-4">
          <button className="btn btn-secondary" onClick={detectLocation}>
            <FaCrosshairs className="mr-2" /> Auto Detect Location
          </button>
          <button className="btn btn-primary" onClick={handleSetLocation}>
            📍 Submit Location
          </button>
        </div>
      </div>

      {/* User Input + Action Buttons */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold">🔍 Search User by Name</h3>
        <input
          className="input input-bordered w-full"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
          <button className="btn btn-outline btn-info" onClick={handleSearchGoals}>
            <FaSearch className="mr-2" /> Search Goals
          </button>
          <button className="btn btn-outline btn-success" onClick={handleSearchAttendance}>
            <FaSearch className="mr-2" /> Search Attendance
          </button>
          <button className="btn btn-outline btn-error" onClick={() => handleRemove('goals')}>
            <FaTrash className="mr-2" /> Remove Goals
          </button>
          <button className="btn btn-outline btn-error" onClick={() => handleRemove('attendance')}>
            <FaTrash className="mr-2" /> Remove Attendance
          </button>
          <button className="btn btn-outline btn-error" onClick={() => handleRemove('images')}>
            <FaTrash className="mr-2" /> Remove Images
          </button>
        </div>
      </div>

      {/* Goal Stats */}
      {goalStats && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-purple-600">📊 Goal Stats</h3>
          <p><strong>Total Goals:</strong> {goalStats['Total Goals']}</p>
          <p><strong>Success Goals:</strong> {goalStats['Success Goals']}</p>
          <p><strong>Pending Goals:</strong> {goalStats['Pending Goals']}</p>
          <p><strong>Names:</strong> {goalStats[' Name']?.join(', ')}</p>
        </div>
      )}

      {/* Attendance Stats */}
      {attendanceStats && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4 text-teal-600">📅 Attendance Stats</h3>
          <p><strong>Total Working Days:</strong> {attendanceStats['Total Working Days']}</p>
          <p><strong>Present Days:</strong> {attendanceStats['Present Days']}</p>
          <p><strong>Absent Days:</strong> {attendanceStats['Absent Days']}</p>
          <p><strong>Present Rate:</strong> {attendanceStats['Present Rate']}%</p>
          <p><strong>Absent Rate:</strong> {attendanceStats['Absent Rate']}%</p>
        </div>
      )}
    </motion.div>
  );
};

export default Company;
