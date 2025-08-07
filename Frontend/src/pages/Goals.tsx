import React, { useEffect, useState } from 'react';
import axios from '../pages/services/axiosInstance'; 
import { motion } from 'framer-motion';
import { Target, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Goal {
  id: string;
  name: string;
  duration: number;
  end_date: string;
  status: 'Pending' | 'Complete';
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'complete':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'complete':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    default:
      return <Target className="h-4 w-4" />;
  }
};

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    name: '',
    duration: 7,
    end_date: '',
  });

  const fetchGoals = async () => {
    try {
      const res = await axios.get<Goal[]>('/goal/active-goals');
      setGoals(res.data);
      console.log("GOALS RESPONSE: ", res.data);
    } catch (err) {
      toast.error('Error fetching goals');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.end_date || newGoal.duration <= 0) {
      toast.warning('Please fill all fields correctly');
      return;
    }

    try {
      await axios.post('/goal/goals', newGoal);
      toast.success('Goal added');
      setNewGoal({ name: '', duration: 7, end_date: '' });
      fetchGoals();
    } catch (err) {
      toast.error('Error adding goal');
    }
  };

  const markAsComplete = async (goal: Goal) => {
    try {
      await axios.put('/goal/update-goal', {
        name: goal.name,
        status: 'Complete',
      });
      toast.success('Goal marked as complete');
      fetchGoals();
    } catch (err) {
      toast.error('Failed to update goal');
    }
  };

  const completedCount = goals.filter((g) => g.status === 'Complete').length;
  const pendingCount = goals.filter((g) => g.status === 'Pending').length;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Goals</h1>
          <p className="text-slate-600">Track your weekly and monthly objectives</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
          <input
            type="text"
            placeholder="Goal Name"
            className="border px-3 py-2 rounded-md"
            value={newGoal.name}
            onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Duration"
            className="border px-3 py-2 rounded-md"
            value={newGoal.duration}
            onChange={(e) => setNewGoal({ ...newGoal, duration: Number(e.target.value) })}
            min={1}
          />
          <input
            type="date"
            className="border px-3 py-2 rounded-md"
            value={newGoal.end_date}
            onChange={(e) => setNewGoal({ ...newGoal, end_date: e.target.value })}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddGoal}
            className="flex items-center space-x-2 bg-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-cyan-600 transition-colors shadow"
          >
            <Plus className="h-5 w-5" />
            <span>Add Goal</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<CheckCircle className="h-6 w-6 text-green-600" />} label="Completed" count={completedCount} color="green" />
        <StatCard icon={<Clock className="h-6 w-6 text-yellow-600" />} label="Pending" count={pendingCount} color="yellow" />
        <StatCard icon={<Target className="h-6 w-6 text-purple-600" />} label="Total Goals" count={goals.length} color="purple" />
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-cyan-500 border-t border-r border-b border-slate-100 cursor-pointer transform-gpu"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{goal.name}</h3>
                <p className="text-sm text-slate-600 mb-2">
                  Duration: {goal.duration} days
                </p>
                <p className="text-sm text-slate-600">Due: {new Date(goal.end_date).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span
                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}
                >
                  {getStatusIcon(goal.status)}
                  <span>{goal.status}</span>
                </span>
                {goal.status === 'Pending' && (
                  <button
                    onClick={() => markAsComplete(goal)}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    Mark Complete
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  count,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  const bg = {
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    purple: 'bg-purple-100',
  }[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center space-x-3">
        <div className={`${bg} p-3 rounded-xl`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{count}</p>
        </div>
      </div>
    </motion.div>
  );
}
