'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, BookOpen, Target, Clock, ArrowRight, Loader2, Calendar, CheckCircle } from 'lucide-react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

interface Material {
  _id: string;
  title: string;
  createdAt: string;
}

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

interface StudyTask {
  time: string;
  activity: string;
}

interface DailySchedule {
  day: string;
  tasks: StudyTask[];
}

interface StudyPlan {
  _id: string;
  subjects: string[];
  examDate?: string;
  hoursPerDay: number;
  durationDays: number;
  weakTopics?: string[];
  schedule: DailySchedule[];
  priorities?: string[];
  revisionPlan?: string;
  isCompleted?: boolean;
}

export default function DashboardPage() {
  const { user } = useStore();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [planners, setPlanners] = useState<StudyPlan[]>([]);
  const [activePlannerId, setActivePlannerId] = useState<string | null>(null);
  const [totalPlannersCount, setTotalPlannersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);

  const handleMarkAsDone = async (id: string) => {
    setMarkingDone(true);
    try {
      await api.put(`/planner/${id}/done`);
      const updated = planners.filter(p => p._id !== id);
      setPlanners(updated);
      if (activePlannerId === id) {
        setActivePlannerId(updated[0]?._id || null);
      }
    } catch (err) {
      console.error('Failed to mark planner as done', err);
    } finally {
      setMarkingDone(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [materialsRes, quizzesRes, plannerRes] = await Promise.all([
          api.get('/materials'),
          api.get('/quiz'),
          api.get('/planner').catch(() => ({ data: [] })), // safely handle missing/empty
        ]);
        setMaterials(materialsRes.data || []);
        setQuizzes(quizzesRes.data || []);
        const loadedPlanners: StudyPlan[] = plannerRes.data || [];
        const activePlanners = loadedPlanners.filter(p => !p.isCompleted);
        setPlanners(activePlanners);
        setTotalPlannersCount(loadedPlanners.length);
        if (activePlanners.length > 0) {
          setActivePlannerId(activePlanners[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute actual stats
  const notesCount = materials.length;
  const quizzesCount = quizzes.filter(q => q.score !== null).length;
  
  const quizzesWithScores = quizzes.filter(q => q.score !== null && q.score !== undefined);
  const avgAccuracy = quizzesWithScores.length > 0
    ? Math.round(quizzesWithScores.reduce((acc, q) => acc + (q.score || 0), 0) / quizzesWithScores.length)
    : 0;

  // Dynamically estimate study hours based on actual content
  const estimatedHours = Math.round(notesCount * 1.5 + quizzesCount * 0.5);

  const stats = [
    { title: 'Notes Uploaded', value: notesCount.toString(), icon: BookOpen },
    { title: 'Quizzes Taken', value: quizzesCount.toString(), icon: BrainCircuit },
    { title: 'Avg. Accuracy', value: `${avgAccuracy}%`, icon: Target },
    { title: 'Study Plans', value: totalPlannersCount.toString(), icon: Calendar },
    { title: 'Study Hours', value: `${estimatedHours}h`, icon: Clock },
  ];

  // Helper to format timestamps to readable strings
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // Determine recommendations dynamically
  const getRecommendations = () => {
    const recs: { title: string; materialId: string; type: 'review' | 'fresh' }[] = [];
    
    // Check for low-score quizzes first
    quizzes.forEach(q => {
      if (q.score !== null && q.score < 80 && q.materialId && !recs.some(r => r.materialId === q.materialId?._id)) {
        recs.push({
          title: `${q.materialId.title} (Score: ${q.score}%)`,
          materialId: q.materialId._id,
          type: 'review'
        });
      }
    });

    // Check for unquizzed materials
    materials.forEach(m => {
      const isQuizzed = quizzes.some(q => q.materialId?._id === m._id);
      if (!isQuizzed && !recs.some(r => r.materialId === m._id) && recs.length < 3) {
        recs.push({
          title: `${m.title} (No Quiz Taken)`,
          materialId: m._id,
          type: 'fresh'
        });
      }
    });

    // Fallback if nothing matches
    if (recs.length === 0 && materials.length > 0) {
      materials.slice(0, 3).forEach(m => {
        recs.push({
          title: m.title,
          materialId: m._id,
          type: 'review'
        });
      });
    }

    return recs.slice(0, 3);
  };

  const recommendations = getRecommendations();

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}</h1>
        <p className="text-gray-400 mt-1">Here&apos;s an overview of your learning progress.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="bg-[#111111] border-[#2A2A2A] hover:border-gray-500 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Study Plan Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {planners.length === 0 ? (
          <Card className="bg-[#111111] border-[#2A2A2A] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left flex-col sm:flex-row">
              <div className="bg-[#1E1E1E] p-3 rounded-full border border-[#2A2A2A]">
                <Calendar size={28} className="text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-200">Need structure? Try the AI Study Planner</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Design detailed schedules matching exam periods, target study hours, and weaknesses.
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/planner')}
              className="bg-white text-black font-semibold px-5 py-2.5 rounded-full hover:bg-gray-200 transition-colors text-sm shrink-0 flex items-center gap-1.5"
            >
              Generate Plan <ArrowRight size={14} />
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Active Study Planners</h3>
                <p className="text-xs text-gray-500">Track and review your generated revision plans</p>
              </div>
              <button 
                onClick={() => router.push('/planner')}
                className="text-xs text-gray-400 hover:text-white bg-[#1E1E1E]/55 hover:bg-[#1E1E1E] border border-[#2A2A2A] px-3.5 py-2 rounded-full transition-colors flex items-center gap-1"
              >
                + Create New Plan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {planners.map((p) => (
                <Card 
                  key={p._id}
                  onClick={() => router.push(`/planner?id=${p._id}`)}
                  className="bg-[#111111] border-[#2A2A2A] hover:border-gray-500 hover:scale-[1.01] transition-all duration-300 p-5 flex flex-col justify-between gap-4 shadow-md hover:shadow-lg relative overflow-hidden cursor-pointer group"
                >
                  <div>
                    <span className="text-[9px] font-bold text-gray-500 bg-[#1E1E1E]/60 border border-[#2A2A2A] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Study Plan
                    </span>
                    <h4 className="text-base font-bold text-white mt-2 truncate group-hover:text-[#8B5CF6] transition-colors" title={p.subjects.join(', ')}>
                      {p.subjects.join(', ')}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Targeting {p.durationDays} Days • {p.hoursPerDay} hrs / Day
                    </p>
                  </div>

                  <div className="flex gap-2.5 border-t border-[#2A2A2A]/40 pt-3.5 mt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/planner?id=${p._id}`);
                      }}
                      className="bg-white hover:bg-gray-200 text-black text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1 active:scale-[0.98]"
                    >
                      View Details
                      <ArrowRight size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsDone(p._id);
                      }}
                      disabled={markingDone}
                      className="bg-transparent hover:bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]"
                    >
                      {markingDone ? <Loader2 size={12} className="animate-spin text-emerald-400" /> : <CheckCircle size={12} />}
                      Mark Done
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Split section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-[#111111] border-[#2A2A2A] h-full flex flex-col">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Your latest assessment results</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {quizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-gray-500 h-full">
                  <BrainCircuit className="h-10 w-10 mb-2 text-gray-600" />
                  <p className="text-sm">No quizzes completed yet.</p>
                  <button 
                    onClick={() => router.push('/quiz')}
                    className="mt-4 text-xs bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    Take your first Quiz <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.slice(0, 3).map((quiz) => (
                    <div key={quiz._id} className="flex items-center gap-4 p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                      <div className="bg-[#1E1E1E] p-2 rounded-md">
                        <BrainCircuit size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Completed {quiz.materialId?.title || 'Study Material'} Quiz
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(quiz.createdAt)} • {quiz.difficulty.toUpperCase()}
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${quiz.score !== null && quiz.score >= 80 ? 'text-white' : 'text-gray-400'}`}>
                        {quiz.score !== null ? `${quiz.score}%` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Topics Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-[#111111] border-[#2A2A2A] h-full flex flex-col">
            <CardHeader>
              <CardTitle>Topics to Review</CardTitle>
              <CardDescription className="text-gray-400">Personalized AI recommendations based on performance</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {recommendations.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-gray-500 h-full">
                  <BookOpen className="h-10 w-10 mb-2 text-gray-600" />
                  <p className="text-sm">No study materials uploaded yet.</p>
                  <button 
                    onClick={() => router.push('/upload')}
                    className="mt-4 text-xs bg-white text-black px-4 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    Upload study notes <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div key={rec.materialId} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
                      <div className="flex-1 min-w-0 pr-4">
                        <span className="text-sm font-medium text-gray-300 truncate block">
                          {rec.title}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block mt-0.5">
                          {rec.type === 'review' ? 'Needs Revision' : 'New Topic'}
                        </span>
                      </div>
                      <button 
                        onClick={() => router.push(`/chat?materialId=${rec.materialId}`)}
                        className="text-xs bg-white text-black px-3 py-1.5 rounded-full font-medium hover:bg-gray-200 transition-colors shrink-0"
                      >
                        Review Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
