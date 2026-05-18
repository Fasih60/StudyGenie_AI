'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, AlertTriangle, Loader2, BrainCircuit, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import api from '@/services/api';
import { useRouter } from 'next/navigation';

const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#3B82F6', '#14B8A6', '#F59E0B'];

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


interface CustomPieTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

const CustomPieTooltip = ({ active, payload }: CustomPieTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111111]/95 backdrop-blur-md border border-[#2A2A2A] p-2.5 rounded-xl shadow-xl">
        <p className="text-xs font-semibold text-white truncate max-w-45">{payload[0].name}</p>
        <p className="text-xs text-purple-400 font-bold mt-0.5">{`${payload[0].value}% Average Accuracy`}</p>
      </div>
    );
  }
  return null;
};


export default function AnalyticsPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes] = await Promise.all([
          api.get('/quiz'),
        ]);
        setQuizzes(quizzesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completedQuizzes = quizzes.filter(q => q.score !== null && q.score !== undefined);

  const getTopicMetrics = () => {
    const topicGroups: { [key: string]: { title: string; scores: number[] } } = {};

    quizzes.forEach(q => {
      if (q.score !== null && q.score !== undefined && q.materialId) {
        const matId = q.materialId._id;
        if (!topicGroups[matId]) {
          topicGroups[matId] = {
            title: q.materialId.title,
            scores: [],
          };
        }
        topicGroups[matId].scores.push(q.score);
      }
    });

    return Object.keys(topicGroups).map(matId => {
      const group = topicGroups[matId];
      const avg = Math.round(group.scores.reduce((sum, s) => sum + s, 0) / group.scores.length);
      return {
        id: matId,
        name: group.title,
        value: avg,
      };
    });
  };

  const topicAccuracy = getTopicMetrics();
  const weakTopics = topicAccuracy.filter(t => t.value < 75);
  const strongTopics = topicAccuracy.filter(t => t.value >= 75);

  // Find poorest performing topic for AI Priority Recommend
  const weakestTopic = topicAccuracy.length > 0 
    ? [...topicAccuracy].sort((a, b) => a.value - b.value)[0]
    : null;

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  const hasData = completedQuizzes.length > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Topic Mastery Analysis</h1>
        <p className="text-gray-400 mt-1">Deep-dive cognitive breakdown of your learning strengths and knowledge gaps.</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Pie Chart Card - Topic Mastery */}
            <Card className="bg-[#111111] border-[#2A2A2A] md:col-span-3 flex flex-col justify-between shadow-xl">
              <CardHeader className="border-b border-[#2A2A2A] pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Target size={20} className="text-gray-400" />
                  Topic Mastery Distribution
                </CardTitle>
                <CardDescription className="text-gray-500">Average accuracy per study notes topic</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="h-64 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topicAccuracy}
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                        >
                          {topicAccuracy.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#111111" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-extrabold text-white tracking-tight leading-none">
                        {topicAccuracy.length > 0
                          ? Math.round(topicAccuracy.reduce((acc, t) => acc + t.value, 0) / topicAccuracy.length)
                          : 0}%
                      </span>
                      <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mt-1.5 leading-none">Avg Mastery</span>
                    </div>
                  </div>
                  
                  {/* Styled Legend List */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Assessed Topics</span>
                    {topicAccuracy.map((topic, index) => (
                      <div key={topic.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-[#0A0A0A]/40 border border-[#2A2A2A]/40">
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-gray-300 font-medium truncate" title={topic.name}>{topic.name}</span>
                        </div>
                        <span className="font-mono text-gray-400 font-bold shrink-0">{topic.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Focus Recommendation */}
            <Card className="bg-[#111111] border-[#2A2A2A] md:col-span-2 flex flex-col shadow-xl">
              <CardHeader className="border-b border-[#2A2A2A] pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles size={20} className="text-gray-400" />
                  AI Study Insights
                </CardTitle>
                <CardDescription className="text-gray-500">Real-time learning suggestions and statistics</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col justify-between gap-5">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#2A2A2A]">
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Weak Topics</span>
                    <span className="text-xl font-bold text-red-400 mt-1 block">{weakTopics.length}</span>
                  </div>
                  <div className="bg-[#0A0A0A] p-3 rounded-xl border border-[#2A2A2A]">
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Mastered Topics</span>
                    <span className="text-xl font-bold text-green-400 mt-1 block">{strongTopics.length}</span>
                  </div>
                </div>

                {/* Main recommendation */}
                {weakestTopic ? (
                  <div className="bg-[#0A0A0A] border border-red-500/20 p-4 rounded-xl space-y-3 shadow-inner flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-red-400 mb-1">
                        <AlertTriangle size={15} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Critical Focus Needed</span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate max-w-55" title={weakestTopic.name}>
                        {weakestTopic.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                        Your average accuracy in this topic is currently sitting at <strong>{weakestTopic.value}%</strong>. Let&apos;s fix this together.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/chat?materialId=${weakestTopic.id}`)}
                      className="w-full mt-3 bg-white hover:bg-gray-200 text-black text-xs font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                    >
                      <BookOpen size={13} />
                      Review with StudyGenie AI
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#0A0A0A] border border-green-500/20 p-4 rounded-xl text-center flex-1 flex flex-col justify-center items-center shadow-inner">
                    <CheckCircle size={32} className="text-green-400 mb-2" />
                    <h4 className="text-sm font-bold text-white">Full Mastery Achieved</h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-50 leading-relaxed">
                      Amazing job! Every single one of your study topics averages above the 75% accuracy mark.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weak Topics Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-[#111111] border-[#2A2A2A] h-full flex flex-col shadow-xl">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Weak Topics Identified
                  </CardTitle>
                  <CardDescription className="text-gray-400">AI analysis of your performance metrics (Average &lt; 75%)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-2">
                  {weakTopics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-gray-500 h-full">
                      <CheckCircle size={32} className="text-green-500 mb-2" />
                      <p className="text-sm font-medium">No weak topics! Keep up the excellent work!</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {weakTopics.map(topic => (
                        <li key={topic.id} className="bg-[#0A0A0A] p-4 rounded-lg border border-red-500/20 flex flex-col justify-between shadow-inner">
                          <div className="flex justify-between items-start gap-4 mb-2">
                            <span className="font-medium text-white truncate max-w-[70%]">{topic.name}</span>
                            <span className="text-xs text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-full shrink-0 border border-red-500/10">
                              {topic.value}% Accuracy
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {topic.value < 50 
                              ? "Consistently struggling with questions in this topic. We highly recommend starting a custom study chat with our AI model immediately." 
                              : "Requires targeted revision. Try answering more quiz questions or reviewing explanation notes inside our workspace."
                            }
                          </p>
                          <button
                            onClick={() => router.push(`/chat?materialId=${topic.id}`)}
                            className="mt-3.5 text-xs bg-white text-black font-semibold px-4 py-1.5 rounded-full self-start hover:bg-gray-200 transition-colors shadow-md active:scale-[0.98]"
                          >
                            Review Notes Now
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Strengths Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-[#111111] border-[#2A2A2A] h-full flex flex-col shadow-xl">
                <CardHeader>
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Target size={20} />
                    Cognitive Strengths
                  </CardTitle>
                  <CardDescription className="text-gray-400">Topics you&apos;ve mastered (Average &ge; 75%)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pt-2">
                  {strongTopics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-gray-500 h-full">
                      <Target size={32} className="text-gray-600 mb-2" />
                      <p className="text-sm">No topics mastered yet. Complete quizzes to raise your average scores!</p>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {strongTopics.map(topic => (
                        <li key={topic.id} className="bg-[#0A0A0A] p-4 rounded-lg border border-green-500/20 shadow-inner">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white truncate max-w-[75%]">{topic.name}</span>
                            <span className="text-xs text-green-400 font-semibold bg-green-500/10 px-2.5 py-1 rounded-full shrink-0 border border-green-500/10">
                              {topic.value}% Accuracy
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">
                            {topic.value >= 90
                              ? "Outstanding concept comprehension! You have mastered all major objectives for this material."
                              : "Solid comprehension level. Good grasp of the core concepts for this topic."
                            }
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
