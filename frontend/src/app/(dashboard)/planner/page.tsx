'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';

interface StudyTask {
  time: string;
  activity: string;
}

interface DailySchedule {
  day: string;
  tasks: StudyTask[];
}

interface StudyPlan {
  _id?: string;
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

function PlannerContent() {
  const searchParams = useSearchParams();
  const plannerId = searchParams.get('id');

  const [subjects, setSubjects] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');
  const [durationDays, setDurationDays] = useState('7'); // Default to 7 days
  const [weakTopics, setWeakTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  const [allPlanners, setAllPlanners] = useState<StudyPlan[]>([]);
  const [expandedPlannerId, setExpandedPlannerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestPlan = async () => {
      try {
        const res = await api.get('/planner');
        const plannersList: StudyPlan[] = res.data || [];
        setAllPlanners(plannersList);
        
        if (plannerId && plannersList.length > 0) {
          const activePlan = plannersList.find(p => p._id === plannerId);
          if (activePlan) {
            setPlan(activePlan);
            setExpandedPlannerId(activePlan._id || null);
            // Populate fields for easy adjustments
            setSubjects(activePlan.subjects?.join(', ') || '');
            setHoursPerDay(activePlan.hoursPerDay?.toString() || '');
            setDurationDays(activePlan.durationDays?.toString() || '7');
            setWeakTopics(activePlan.weakTopics?.join(', ') || '');
            if (activePlan.examDate) {
              setExamDate(new Date(activePlan.examDate).toISOString().split('T')[0]);
            }
            return;
          }
        }

        // If no plannerId was provided, clear all input fields and empty the detailed plan panel
        setPlan(null);
        setSubjects('');
        setHoursPerDay('');
        setDurationDays('7');
        setWeakTopics('');
        setExamDate('');
      } catch (err) {
        console.error('Failed to fetch latest planner', err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLatestPlan();
  }, [plannerId]);

  const generatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/planner/generate', {
        subjects: subjects.split(',').map(s => s.trim()).filter(Boolean),
        examDate: examDate || undefined,
        hoursPerDay: parseInt(hoursPerDay) || 4,
        durationDays: parseInt(durationDays) || 7,
        weakTopics: weakTopics ? weakTopics.split(',').map(s => s.trim()).filter(Boolean) : [],
      });
      setPlan(res.data);
      // Refresh the planner history list
      const updatedRes = await api.get('/planner');
      setAllPlanners(updatedRes.data || []);
    } catch (err) {
      console.error('Failed to generate plan', err);
      alert('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">AI Study Planner</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">Draft structured, AI-optimized revision plans aligned with your exams and weak subjects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Plan Configurations Form */}
        <div className="lg:col-span-1">
          <Card className="bg-[#111111] border-[#2A2A2A] shadow-xl overflow-hidden rounded-xl">
            <CardHeader className="pb-3 border-b border-[#2A2A2A]/40">
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <GraduationCap className="text-gray-400 w-5 h-5" />
                Plan Configurations
              </CardTitle>
              <CardDescription className="text-gray-500 text-xs">Set up your dynamic study calendar</CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <form onSubmit={generatePlan} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="subjects" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Subjects</Label>
                  <Input 
                    id="subjects"
                    placeholder="e.g. Operating Systems, Databases" 
                    value={subjects}
                    onChange={(e) => setSubjects(e.target.value)}
                    className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="duration" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Planner Duration (Days)</Label>
                  <Input 
                    id="duration"
                    type="number"
                    min="1" max="60"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="hours" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Study Hours / Day</Label>
                  <Input 
                    id="hours"
                    type="number" 
                    min="1" max="16"
                    placeholder="e.g. 4" 
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(e.target.value)}
                    className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="examDate" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Exam Date (Optional)</Label>
                  <Input 
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="weakTopics" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Weak Topics (Optional)</Label>
                  <Input 
                    id="weakTopics"
                    placeholder="e.g. Normalization, Deadlocks" 
                    value={weakTopics}
                    onChange={(e) => setWeakTopics(e.target.value)}
                    className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold h-11 rounded-lg transition-all duration-200 shadow-md active:scale-[0.99] mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-black" />
                      Generating Plan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Generate Smart Plan <Sparkles size={16} />
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Planner History (col-span-2) */}
        <div className="lg:col-span-2">
          <Card className="bg-[#111111] border-[#2A2A2A] shadow-xl overflow-hidden rounded-xl">
            <CardHeader className="pb-3 border-b border-[#2A2A2A]/60">
              <CardTitle className="text-lg font-bold text-white uppercase tracking-wider">Planner History</CardTitle>
              <CardDescription className="text-gray-500 text-xs">View all previous and active study plans</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {allPlanners.length === 0 ? (
                <p className="text-sm text-gray-500 italic p-6 text-center">No study planners generated yet.</p>
              ) : (
                <div className="divide-y divide-[#2A2A2A]/40">
                  {allPlanners.map((p) => {
                    const isExpanded = expandedPlannerId === p._id;
                    const isPlanActive = p._id === plan?._id;
                    const isActive = !p.isCompleted;
                    return (
                      <div 
                        key={p._id} 
                        className={`transition-all duration-300 overflow-hidden ${
                          isPlanActive ? 'bg-[#1E1E1E]/20 border-l-2 border-[#7C3AED]' : 'hover:bg-[#0A0A0A]/20'
                        }`}
                      >
                        {/* Compact Clickable Card Header */}
                        <div 
                          className="p-5 cursor-pointer space-y-3"
                          onClick={() => {
                            setExpandedPlannerId(isExpanded ? null : p._id || null);
                            // Populate input fields for easy adjustments
                            setSubjects(p.subjects?.join(', ') || '');
                            setHoursPerDay(p.hoursPerDay?.toString() || '');
                            setDurationDays(p.durationDays?.toString() || '7');
                            setWeakTopics(p.weakTopics?.join(', ') || '');
                            if (p.examDate) {
                              setExamDate(new Date(p.examDate).toISOString().split('T')[0]);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-[#1E1E1E] p-2 rounded-xl border border-[#2A2A2A] shadow-sm flex items-center justify-center shrink-0">
                                <GraduationCap className="text-gray-400 w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-white leading-snug" title={p.subjects.join(', ')}>
                                  {p.subjects.join(', ')}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] font-medium text-gray-400 bg-[#1E1E1E]/60 border border-[#2A2A2A] px-2.5 py-0.5 rounded-full">
                                    {p.durationDays} Days
                                  </span>
                                  <span className="text-[10px] font-medium text-gray-400 bg-[#1E1E1E]/60 border border-[#2A2A2A] px-2.5 py-0.5 rounded-full">
                                    {p.hoursPerDay} hrs/day
                                  </span>
                                  {p.weakTopics && p.weakTopics.length > 0 && (
                                    <span className="text-[10px] font-medium text-[#7C3AED] bg-[#7C3AED]/5 border border-[#7C3AED]/10 px-2.5 py-0.5 rounded-full">
                                      Focus: {p.weakTopics.slice(0, 2).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                                isActive 
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-gray-800 text-gray-400 border-gray-700/50'
                              }`}>
                                {isActive ? 'Active' : 'Completed'}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPlannerId(isExpanded ? null : p._id || null);
                                }}
                                className="bg-[#1E1E1E] hover:bg-[#2A2A2A] border border-[#2A2A2A] p-2 rounded-md text-gray-400 hover:text-white transition-all flex items-center justify-center shrink-0"
                              >
                                <span 
                                  className="text-[10px] font-bold block transform transition-transform duration-200" 
                                  style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                >
                                  ▼
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Highly Polished Dropdown Details inside the lg:col-span-2 column */}
                        {isExpanded && (
                          <div className="border-t border-purple-200/60 bg-[#F9F8FC] p-5 space-y-6">
                            {/* AI Strategic Guide */}
                            {p.revisionPlan && (
                              <div className="bg-[#F5F3FF] border border-purple-200 p-4 rounded-xl space-y-2 relative overflow-hidden shadow-sm">
                                <span className="text-[10px] font-extrabold text-[#6D28D9] uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles size={12} className="text-[#3B82F6]" />
                                  Strategic Guide
                                </span>
                                <p className="text-xs text-[#4C1D95] font-medium leading-relaxed mt-0.5">{p.revisionPlan}</p>
                              </div>
                            )}

                            {/* Schedule dropdown view */}
                            <div className="space-y-3.5">
                              <span className="text-[10px] font-extrabold text-[#6D28D9] uppercase tracking-wider block border-b border-purple-200 pb-1.5">
                                Day-By-Day Revision Schedule
                              </span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-120 overflow-y-auto pr-1 scrollbar-thin">
                                {p.schedule?.map((day, dIdx) => (
                                  <div 
                                    key={dIdx} 
                                    className="bg-white border border-purple-100 hover:border-purple-300 rounded-xl p-4 space-y-3 shadow-xs transition-colors"
                                  >
                                    <div className="flex justify-between items-center border-b border-purple-100 pb-2">
                                      <span className="font-bold text-[#1E1B4B] text-xs">{day.day}</span>
                                      <span className="text-[9px] font-semibold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
                                        {p.hoursPerDay} hrs
                                      </span>
                                    </div>
                                    <div className="space-y-2.5 overflow-y-auto max-h-40 pr-1">
                                      {day.tasks && day.tasks.length > 0 ? (
                                        day.tasks.map((t, tIdx) => (
                                          <div key={tIdx} className="text-[11px] text-[#312E81] font-medium flex items-start gap-2 leading-relaxed">
                                            <div className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-[#8B5CF6] to-[#3B82F6] shrink-0 mt-1.5" />
                                            <span>
                                              <strong className="text-[#7C3AED] font-mono font-semibold text-[10px]">{t.time}</strong> - {t.activity}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <span className="text-[10px] text-[#9333EA]/40 italic block py-1">No tasks defined.</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
