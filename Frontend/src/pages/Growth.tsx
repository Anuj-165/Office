import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, BookOpen, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import ProgressBar from '../components/ProgressBar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from '../pages/services/axiosInstance'; // Adjust path if needed

type GrowthData = {
  growth_percentage: number;
  message: string;
  user_id: number;
};

type SkillItem = {
  name: string;
  description: string;
  status: string;
  id: string;
};

export default function Growth() {
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDesc, setNewSkillDesc] = useState('');

  useEffect(() => {
    fetchGrowth();
    fetchSkills();
  }, []);

  async function fetchGrowth() {
    try {
      const res = await axios.get<GrowthData>('/growth/growth-per');
      
      console.log("Fetched growth data:", res.data);
      setGrowthData([res.data]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load growth performance');
    }
  }

  async function fetchSkills() {
    try {
      const res = await axios.get<SkillItem[]>('/growth/active-skills');
      setSkills(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load skills');
    }
  }

  const handleAddSkill = async (e: FormEvent) => {
  e.preventDefault();
  try {
    await axios.post('/growth/skills', {
      name: newSkillName,
      description: newSkillDesc
    });
    toast.success('Skill added');
    setNewSkillName('');
    setNewSkillDesc('');
    fetchSkills();
    fetchGrowth(); 
  } catch (err: any) {
    console.error(err);
    toast.error(err?.response?.data?.message ?? 'Failed to add skill');
  }
};
const updateSkillStatus = async (skillName: string, newStatus: string) => {
  try {
    await axios.put('/growth/update-skill', {
      name: skillName,
      status: newStatus,
    });

    toast.success('Skill status updated');
    fetchSkills();  
    fetchGrowth();  
  } catch (err: any) {
    console.error(err);
    toast.error(err?.response?.data?.detail ?? 'Failed to update skill');
  }
};



  const latest = growthData.length > 0 ? growthData[growthData.length - 1] : null;

  // Map skills to radar chart format with numeric value
  const radarSkillData = skills.map(skill => ({
    name: skill.name,
    value: skill.status === 'completed' ? 100 : 50
  }));

  return (
    <div className="space-y-8">
      <ToastContainer />
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Growth Tracking</h1>
        <p className="text-slate-600">Monitor your professional development and achievements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-100 p-3 rounded-xl"><TrendingUp className="h-6 w-6 text-cyan-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Growth Score</p>
              <p className="text-2xl font-bold text-slate-900">{latest?.growth_percentage ?? '—'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-xl"><Award className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Skills Tracked</p>
              <p className="text-2xl font-bold text-slate-900">{skills.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-xl"><BookOpen className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Strong Skills (Completed)</p>
              <p className="text-2xl font-bold text-slate-900">{skills.filter(s => s.status === "completed").length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-xl"><Users className="h-6 w-6 text-purple-600" /></div>
            <div>
              <p className="text-sm text-slate-600">Team Rank</p>
              <p className="text-2xl font-bold text-slate-900">#{skills.length ? skills[0].id : '-'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Performance Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={Array.isArray(growthData) ? growthData : []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f1f5f9' }} />
            <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 6, strokeWidth: 2 }} activeDot={{ r: 8, stroke: '#06b6d4', strokeWidth: 2, fill: '#fff' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Skills Assessment</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={Array.isArray(radarSkillData) ? radarSkillData : []}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Radar name="Skill Level" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Skill Development</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map(s => (
            <div key={s.id} className="space-y-2">
              <ProgressBar
              label={s.name}
              value={s.status === "completed" ? 100 : 50}
              max={100}
              color={
              s.status === "completed"
              ? "bg-gradient-to-r from-green-400 to-green-600"
              : "bg-gradient-to-r from-yellow-400 to-yellow-600"}
              />
              {s.status !== "completed" && (
                <button
                 onClick={() => updateSkillStatus(s.name, "completed")}
                 className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                   Mark as Completed
                   </button>
                  )}
                  </div>
                ))}

        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Add a New Skill</h3>
        <form onSubmit={handleAddSkill} className="space-y-4">
          <input
            type="text"
            placeholder="Skill name"
            value={newSkillName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewSkillName(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Description"
            value={newSkillDesc}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewSkillDesc(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">Add Skill</button>
        </form>
      </motion.div>
    </div>
  );
}
