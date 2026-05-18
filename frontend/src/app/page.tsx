'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  BrainCircuit, 
  BarChart3, 
  Calendar, 
  ArrowRight, 
  UploadCloud, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';

export default function WelcomePage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleStart = () => {
    router.push('/register');
  };

  const features = [
    {
      icon: <UploadCloud className="h-6 text-purple-400" />,
      title: "Smart Notes Processing",
      description: "Drag-and-drop your PDF or TXT textbooks. Our system instantly parses and indexes the text for AI access."
    },
    {
      icon: <MessageSquare className="h-6 text-indigo-400" />,
      title: "AI Study Chat",
      description: "Chat with a virtual tutor bound exclusively to your notes. Get exact quotes and zero hallucinated answers."
    },
    {
      icon: <BrainCircuit className="h-6 text-pink-400" />,
      title: "Dynamic Quiz Generator",
      description: "Test your retention! Instantly generate multiple-choice assessments (easy, medium, or hard) based on your notes."
    },
    {
      icon: <BarChart3 className="h-6 text-blue-400" />,
      title: "Chronological Analytics",
      description: "Track your scores and accuracy over time. Isolate weak topics, and directly link back to AI revision chats."
    },
    {
      icon: <Calendar className="h-6 text-green-400" />,
      title: "Interactive Study Planner",
      description: "Set your exam dates and let Llama 3.3 compile an intensive day-by-day weekly schedule to keep you on track."
    },
    {
      icon: <Sparkles className="h-6 text-amber-400" />,
      title: "Cascade File Management",
      description: "Easily delete and maintain study notes. Cleans up all orphaned quizzes and browser cache items instantly."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-purple-500/30 selection:text-purple-200">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-150 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] rounded-full bg-pink-900/10 blur-[150px]" />
      </div>

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-size-[4rem_4rem] pointer-events-none opacity-20 z-0" />

      {/* Header / Navbar */}
      <header className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight bg-linear-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              StudyGenie AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Log In
            </button>
            <Button 
              onClick={() => router.push('/register')} 
              className="bg-white hover:bg-gray-200 text-black font-medium px-5 rounded-full text-sm transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles size={12} />
            <span>Powering Next-Gen Study Habits</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Supercharge Your Learning With{' '}
            <span className="bg-linear-to-r from-purple-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
              StudyGenie AI
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Upload your lecture notes and textbooks. StudyGenie turns them into interactive quiz reviews, personalized AI tutoring sessions, and intensive study planners.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Button
              onClick={handleStart}
              className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-8 py-6 rounded-full text-base transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 group w-full sm:w-auto"
            >
              <span>Get Started for Free</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <a
              href="#features"
              className="flex items-center justify-center gap-1.5 px-6 py-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-all text-sm font-medium w-full sm:w-auto"
            >
              Explore Features
            </a>
          </div>
        </motion.div>
      </section>

      {/* Visual Mockup Dashboard representation */}
      <section className="relative max-w-5xl mx-auto px-6 pb-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl shadow-purple-500/5 overflow-hidden"
        >
          {/* Glass header representation */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2 font-mono">studygenie-dashboard.app</span>
            </div>
            <div className="w-32 h-1.5 rounded-full bg-white/10" />
          </div>

          {/* Grid Layout representing the app */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Sidebar Representation */}
            <div className="hidden md:block bg-[#121212] border border-white/5 rounded-xl p-4 space-y-4">
              <div className="h-6 bg-white/5 rounded-lg w-[70%]" />
              <div className="space-y-2 pt-4">
                <div className="h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-4 h-4 bg-purple-400 rounded" />
                  <div className="h-3 bg-purple-300/30 rounded w-16" />
                </div>
                <div className="h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded" />
                  <div className="h-3 bg-white/20 rounded w-20" />
                </div>
                <div className="h-8 bg-white/5 rounded-lg flex items-center px-3 gap-2">
                  <div className="w-4 h-4 bg-white/10 rounded" />
                  <div className="h-3 bg-white/20 rounded w-14" />
                </div>
              </div>
            </div>

            {/* Main Section Representation */}
            <div className="md:col-span-2 space-y-4">
              {/* Dynamic Stats Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-gray-500">Average Quiz Score</span>
                  <div className="text-2xl font-bold bg-linear-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">88.5%</div>
                </div>
                <div className="bg-[#121212] border border-white/5 rounded-xl p-4 space-y-2">
                  <span className="text-xs text-gray-500">Active Study Hours</span>
                  <div className="text-2xl font-bold bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">14.2 hrs</div>
                </div>
              </div>

              {/* Chat Interface Representation */}
              <div className="bg-[#121212] border border-white/5 rounded-xl p-4 space-y-3">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px]">AI</div>
                  <div className="bg-white/5 rounded-lg p-2.5 max-w-[80%]">
                    <p className="text-xs text-gray-300 leading-normal">According to page 4, the primary complexity is O(N log N) due to heap sorting algorithms.</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-white text-black rounded-lg p-2.5 max-w-[80%]">
                    <p className="text-xs font-medium">Explain why it is not linear.</p>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[10px] text-black font-semibold">ME</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Section Grid */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            Designed for Hardworking Students
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Everything you need to turn raw documents into active, testable knowledge. No fluff, just results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#0b0b0b] border border-white/5 hover:border-purple-500/25 hover:shadow-[0_0_20px_rgba(147,51,234,0.05)] rounded-2xl p-6 space-y-4 transition-all duration-300"
            >
              <div className="bg-[#121212] p-3 rounded-xl border border-white/5 w-fit">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works / Steps */}
      <section className="relative max-w-7xl mx-auto px-6 py-24 border-t border-white/5 z-10 bg-[#070707]/30">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">How It Works</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Master any subject in three quick, active steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          <div className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-lg mx-auto md:mx-0">
              1
            </div>
            <h3 className="text-xl font-bold">Upload Your Notes</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Drag textbooks, syllabus guides, or lecture slides into the dashboard. We handle parsed PDFs and plain text.
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-lg mx-auto md:mx-0">
              2
            </div>
            <h3 className="text-xl font-bold">Generate Study Guides</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Generate customizable quizzes to test your knowledge or outline weekly day-by-day exam prep schedules with Llama 3.3.
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-300 font-bold text-lg mx-auto md:mx-0">
              3
            </div>
            <h3 className="text-xl font-bold">Master Your Exams</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Chat with AI bounded strictly to your notes. Analyze weak topics using dashboard metrics and review what needs correction.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative max-w-5xl mx-auto px-6 py-20 z-10 text-center">
        <div className="bg-linear-to-b from-[#0e0e0e] to-[#050505] border border-white/10 rounded-3xl p-12 space-y-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Ready to Ace Your Exams?</h2>
          <p className="text-gray-400 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Join thousands of students boosting their accuracy, optimizing revision hours, and master complex curriculums.
          </p>
          <div className="pt-4">
            <Button
              onClick={handleStart}
              className="bg-white hover:bg-gray-200 text-black font-semibold px-8 py-6 rounded-full text-base transition-all inline-flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-xs z-10 relative bg-[#050505]">
        <p>© 2026 StudyGenie AI. Created with active learning in mind.</p>
      </footer>
    </div>
  );
}
