import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from '../pages/services/axiosInstance'; 
import toast from 'react-hot-toast';
import {
  Clock,
  Target,
  TrendingUp,
  Award,
  Camera
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import DashboardCard from '../components/DashboardCard';
import ProgressBar from '../components/ProgressBar';
import WebcamModal from '../components/WebcamModal';


export default function Dashboard() {
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [attendance, setAttendance] = useState<any | null>(null);
  const [goalSummary, setGoalSummary] = useState<any | null>(null);
  const [skillSummary, setSkillSummary] = useState<any | null>(null);
  const [growth, setGrowth] = useState<number | null>(null);

  const handleWebcamCapture = (imageSrc: string) => {
    console.log('Captured image:', imageSrc);
    toast.success('Attendance recorded with facial recognition!');
  };

  interface AttendanceData {
  Present: number;
  Absent: number;
  Pending: number;
  Total: number;
  'Present Rate': number;
  'Absent Rate': number;
}

interface GoalSummary {
  totalGoals: number;
  completedGoals: number;
  pendingGoals: number;
}

interface SkillSummary {
  id: string;
  name: string;
  status: 'Pending' | 'Complete';
}

interface GrowthData {
  'growth_percentage': number;
}



  const fetchDashboardData = async () => {
    try {
      const [
        attendanceRes,
        goalsRes,
        skillsRes,
        growthRes
      ] = await Promise.all([
        axios.get<AttendanceData>('/dashboard/attendance-record'),
        axios.get<GoalSummary>('/dashboard/Goal-stats'),
        axios.get<SkillSummary[]>('/growth/skill-summary'),
        axios.get<GrowthData>('/growth/growth-per')
      ]);

      setAttendance(attendanceRes.data);
      setGoalSummary(goalsRes.data);
      setSkillSummary(skillsRes.data);
      setGrowth(growthRes.data['growth_percentage']);
      console.log(growthRes.data)
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const goalData = goalSummary
    ? [
        { name: 'Completed', value: goalSummary['Completed Goals'], color: '#06b6d4' },
        { name: 'Pending', value: goalSummary['Pending Goals'], color: '#f59e0b' }
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Track your daily progress and achievements</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setWebcamOpen(true)}
          className="mt-4 lg:mt-0 flex items-center space-x-2 bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/25"
        >
          <Camera className="h-5 w-5" />
          <span>Check In</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Attendance"
          value={attendance?.Present ?? '—'}
          subtitle={`${attendance?.['Present Rate'] ?? 0}% Present`}
          icon={Clock}
          iconColor="text-cyan-600"
          bgColor="bg-cyan-100"
          trend={{ value: attendance?.['Present Rate'] ?? 0, isPositive: true }}
        />
        <DashboardCard
          title="Goals"
          value={`${goalSummary?.['Completed Goals'] ?? 0}/${goalSummary?.['Total Goals'] ?? 0}`}
          subtitle={`${goalSummary?.['Pending Goals'] ?? 0} Pending`}
          icon={Target}
          iconColor="text-green-600"
          bgColor="bg-green-100"
          trend={{ value: goalSummary?.['Completed Goals'] ?? 0, isPositive: true }}
        />
        <DashboardCard
          title="Growth Score"
          value={growth ?? '—'}
          subtitle="This month"
          icon={TrendingUp}
          iconColor="text-purple-600"
          bgColor="bg-purple-100"
          trend={{ value: growth ?? 0, isPositive: true }}
        />
        <DashboardCard
          title="Skill Progress"
          value={`${skillSummary?.['Completed Skills'] ?? 0}/${skillSummary?.['Total Skills'] ?? 0}`}
          subtitle={`${skillSummary?.['Pending Skills'] ?? 0} Pending`}
          icon={Award}
          iconColor="text-orange-600"
          bgColor="bg-orange-100"
          trend={{ value: skillSummary?.['Completed Skills'] ?? 0, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Attendance Summary</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { name: 'Present', hours: attendance?.Present ?? 0 },
              { name: 'Absent', hours: attendance?.Absent ?? 0 },
              { name: 'Pending', hours: attendance?.Pending ?? 0 },
            ]}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="hours" stroke="#06b6d4" fillOpacity={1} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Goals Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={goalData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {goalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {goalData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Webcam Modal */}
      <WebcamModal
        isOpen={webcamOpen}
        onClose={() => setWebcamOpen(false)}
        onCapture={handleWebcamCapture}
      />
    </div>
  );
}
