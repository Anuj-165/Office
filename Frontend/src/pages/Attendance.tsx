import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../pages/services/axiosInstance';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, MapPin, Camera,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';

import WebcamModal from '../components/WebcamModal';

interface SummaryData {
  Present: number;
  Absent: number;
  Pending: number;
  Total: number;
  'Present Rate': number;
  'Absent Rate': number;
}

interface AttendanceRecord {
  id: string;
  date: string;
  time: string;
  status: string;
  latitude: number;
  longitude: number;
  resolved_address: string;
}

export default function Attendance() {
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Get user location via browser geolocation API
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          toast.error("Unable to fetch location");
          console.error(err);
        }
      );
    }
  }, []);

  // Fetch attendance summary stats
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get<SummaryData>('/dashboard/attendance-stats');
        setSummary(res.data);
      } catch (err) {
        toast.error("Failed to load attendance summary");
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  // Fetch attendance records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await axios.get<{ attendance_record: AttendanceRecord[] }>('/dashboard/attendance-record');
        setAttendanceRecords(res.data.attendance_record);
      } catch (err) {
        toast.error("Failed to load attendance records");
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchRecords();
  }, []);

  // Handle webcam capture & attendance POST
  const handleWebcamCapture = async (imageSrc: string) => {
    if (!location) {
      toast.error("Location not available");
      return;
    }

    try {
      await axios.post('/attendance/attendance', {
        image: imageSrc,
        latitude: location.lat,
        longitude: location.lng,
      });

      toast.success("Attendance marked successfully!");

      // Refresh summary and records after marking attendance
      const [summaryRes, recordsRes] = await Promise.all([
        axios.get<SummaryData>('/dashboard/attendance-stats'),
        axios.get<{ attendance_record: AttendanceRecord[] }>('/dashboard/attendance-record'),
      ]);
      setSummary(summaryRes.data);
      setAttendanceRecords(recordsRes.data.attendance_record);
    } catch (err) {
      toast.error("Failed to mark attendance");
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Attendance</h1>
          <p className="text-slate-600">Track your daily attendance and check-in history</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWebcamOpen(true)}
          className="mt-4 lg:mt-0 flex items-center space-x-2 bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/25"
        >
          <Camera className="h-5 w-5" />
          <span>Face Check-In</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Today's Summary</h2>
        {loadingSummary ? (
          <div className="text-center text-slate-500 py-6">
            <Loader2 className="mx-auto animate-spin" />
            <p className="mt-2">Loading attendance data...</p>
          </div>
        ) : summary ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard icon={<CheckCircle />} label="Present" value={summary.Present} color="green" />
            <SummaryCard icon={<XCircle />} label="Absent" value={summary.Absent} color="red" />
            <SummaryCard icon={<Clock />} label="Pending" value={summary.Pending} color="yellow" />
          </div>
        ) : (
          <p className="text-slate-500">No attendance data available.</p>
        )}
      </motion.div>

      {/* Attendance Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Attendance Records</h2>

        {loadingRecords ? (
          <div className="text-center text-slate-500 py-6">
            <Loader2 className="mx-auto animate-spin" />
            <p className="mt-2">Loading attendance records...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <p className="text-slate-500">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Time</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Status</th>
                  <th className="border border-slate-300 px-4 py-2 text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="border border-slate-300 px-4 py-2">{record.date}</td>
                    <td className="border border-slate-300 px-4 py-2">{record.time}</td>
                    <td className={`border border-slate-300 px-4 py-2 font-semibold ${
                      record.status === 'Present' ? 'text-green-600' :
                      record.status === 'Absent' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {record.status}
                    </td>
                    <td className="border border-slate-300 px-4 py-2 flex items-center space-x-1">
                      <MapPin className="w-4 h-4 text-purple-600" />
                      <span>{record.resolved_address || `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Location Info */}
      {location && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Current Location</h2>
          <div className="flex items-center space-x-2 text-slate-700 text-sm">
            <MapPin className="w-5 h-5 text-purple-600" />
            <span>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
          </div>
        </motion.div>
      )}

      {/* Webcam Modal */}
      <WebcamModal
        isOpen={webcamOpen}
        onClose={() => setWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />
    </div>
  );
}

// Helper: Card component
function SummaryCard({ icon, label, value, color }: { icon: JSX.Element, label: string, value: number, color: string }) {
  const bg = {
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-700'
  }[color];

  const Icon = React.cloneElement(icon, { className: 'w-6 h-6' });

  return (
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        {Icon}
      </div>
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
