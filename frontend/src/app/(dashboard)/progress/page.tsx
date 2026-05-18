'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, BrainCircuit, TrendingUp, BookOpen, Target, Calendar } from 'lucide-react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

interface Quiz {
  _id: string;
  materialId: {
    _id: string;
    title: string;
  } | null;
  difficulty: string;
  score: number | null;
  createdAt: string;
}

interface Material {
  _id: string;
  title: string;
}

interface CustomAreaTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      title: string;
      date: string;
    };
  }>;
}

const CustomAreaTooltip = ({ active, payload }: CustomAreaTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111]/95 backdrop-blur-md border border-[#2A2A2A] p-3 rounded-xl shadow-xl">
        <p className="text-xs font-semibold text-gray-400 mb-1">{`Attempt: ${payload[0].payload.name}`}</p>
        <p className="text-sm font-bold text-white mb-0.5">{`Score: ${payload[0].value}%`}</p>
        <p className="text-[10px] text-purple-400 font-medium truncate max-w-37.5">{`Topic: ${payload[0].payload.title}`}</p>
        <p className="text-[9px] text-gray-500 font-mono mt-1">{`Date: ${payload[0].payload.date}`}</p>
      </div>
    );
  }
  return null;
};

interface CustomBarTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
    };
  }>;
}

const CustomBarTooltip = ({ active, payload }: CustomBarTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111]/95 backdrop-blur-md border border-[#2A2A2A] p-2 rounded-lg shadow-xl text-xs font-semibold text-white">
        {`${payload[0].payload.name}: ${payload[0].value} ${payload[0].value === 1 ? 'quiz' : 'quizzes'}`}
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, materialsRes] = await Promise.all([
          api.get('/quiz'),
          api.get('/materials'),
        ]);
        setQuizzes(quizzesRes.data || []);
        setMaterials(materialsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch progress data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Filter completed quizzes with scores and sort chronologically
  const completedQuizzes = quizzes
    .filter(q => q.score !== null && q.score !== undefined)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const hasData = completedQuizzes.length > 0;

  // Process AreaChart chronological data
  const performanceData = completedQuizzes.map((q, i) => ({
    name: `Quiz ${i + 1}`,
    score: q.score,
    title: q.materialId?.title || 'Study Material',
    date: new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  // Process difficulty breakdown
  const getDifficultyMetrics = () => {
    let easy = 0, medium = 0, hard = 0;
    quizzes.forEach(q => {
      if (q.score !== null && q.score !== undefined) {
        const diff = q.difficulty?.toLowerCase();
        if (diff === 'easy') easy++;
        else if (diff === 'medium') medium++;
        else if (diff === 'hard') hard++;
      }
    });
    return [
      { name: 'Easy', count: easy, fill: '#FFFFFF' },
      { name: 'Medium', count: medium, fill: '#A3A3A3' },
      { name: 'Hard', count: hard, fill: '#404040' },
    ];
  };

  const difficultyData = getDifficultyMetrics();

  // Metrics
  const totalQuizzes = completedQuizzes.length;
  const avgAccuracy = totalQuizzes > 0
    ? Math.round(completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / totalQuizzes)
    : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Progress Tracking</h1>
        <p className="text-gray-400 mt-1">Timeline analyses of your quiz history and concepts mastery over time.</p>
      </div>

      {!hasData ? (
        <Card className="bg-[#111111] border-[#2A2A2A] text-center p-12 flex flex-col items-center justify-center">
          <BrainCircuit size={48} className="text-gray-600 mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">No Performance Insights Yet</h2>
          <p className="text-gray-400 max-w-md mb-6">
            We need you to complete at least one AI-generated quiz to analyze your performance and display your learning metrics.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/upload')}
              className="bg-[#1E1E1E] text-white border border-[#2A2A2A] hover:border-gray-500 px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              Upload Notes
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              Take a Quiz
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="bg-[#111111] border-[#2A2A2A] shadow-lg">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">Average Quiz Score</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{avgAccuracy}%</span>
                </div>
                <div className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2A2A2A]">
                  <Target size={22} className="text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#2A2A2A] shadow-lg">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">Quizzes Answered</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{totalQuizzes}</span>
                </div>
                <div className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2A2A2A]">
                  <BrainCircuit size={22} className="text-white" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#111111] border-[#2A2A2A] shadow-lg">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold block">Study Materials</span>
                  <span className="text-3xl font-extrabold text-white mt-1 block">{materials.length}</span>
                </div>
                <div className="bg-[#1E1E1E] p-3 rounded-xl border border-[#2A2A2A]">
                  <BookOpen size={22} className="text-indigo-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Area Chart - Chronological Learning Curve */}
            <Card className="bg-[#111111] border-[#2A2A2A] md:col-span-2 shadow-xl">
              <CardHeader className="border-b border-[#2A2A2A] pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-gray-400" />
                  Chronological Quiz Performance
                </CardTitle>
                <CardDescription className="text-gray-500">Your score history showing your learning curve over time</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} dx={-8} />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart - Quiz Difficulty Breakdown */}
            <Card className="bg-[#111111] border-[#2A2A2A] shadow-xl">
              <CardHeader className="border-b border-[#2A2A2A] pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit size={20} className="text-gray-400" />
                  Difficulty Distribution
                </CardTitle>
                <CardDescription className="text-gray-500">Quiz attempts separated by cognitive level</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={difficultyData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} dx={-8} />
                    <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#1E1E1E', opacity: 0.4 }} />
                    <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quiz Attempts Log Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-[#111111] border-[#2A2A2A] shadow-xl">
              <CardHeader className="border-b border-[#2A2A2A] pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} className="text-gray-400" />
                  Quiz Attempt History Log
                </CardTitle>
                <CardDescription className="text-gray-500">
                  Full archive of all completed assessment metrics and scores
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#2A2A2A] text-gray-500 font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Attempt</th>
                        <th className="pb-3">Study Topic</th>
                        <th className="pb-3">Difficulty</th>
                        <th className="pb-3">Score</th>
                        <th className="pb-3 pr-2 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2A]/40">
                      {[...completedQuizzes].reverse().map((quiz, index, arr) => {
                        const attemptNum = arr.length - index;
                        const difficulty = quiz.difficulty || 'Medium';
                        const score = quiz.score || 0;
                        const dateStr = new Date(quiz.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <tr key={quiz._id} className="hover:bg-[#0A0A0A]/40 transition-colors">
                            <td className="py-3.5 pl-2 font-mono text-gray-400 font-semibold">#{attemptNum}</td>
                            <td className="py-3.5 font-medium text-white max-w-50 truncate" title={quiz.materialId?.title || 'Study Material'}>
                              {quiz.materialId?.title || 'Study Material'}
                            </td>
                            <td className="py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                difficulty.toLowerCase() === 'easy'
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : difficulty.toLowerCase() === 'hard'
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                  : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                              }`}>
                                {difficulty}
                              </span>
                            </td>
                            <td className="py-3.5 font-bold">
                              <span className={`text-xs ${score >= 90 ? 'text-green-400' : score >= 75 ? 'text-white' : 'text-red-400'}`}>
                                {score}%
                              </span>
                            </td>
                            <td className="py-3.5 pr-2 text-right font-mono text-[10px] text-gray-500">{dateStr}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}
