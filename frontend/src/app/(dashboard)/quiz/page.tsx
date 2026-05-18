'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, XCircle, Timer, Award, ArrowRight, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import api from '@/services/api';

interface Material {
  _id: string;
  title: string;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function QuizPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [limit, setLimit] = useState(10); // default to 10 as requested
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get('/materials');
        setMaterials(res.data);
      } catch (err) {
        console.error('Failed to fetch materials', err);
      }
    };
    fetchMaterials();
  }, []);

  const generateQuiz = async () => {
    if (!selectedMaterial) return;
    setLoading(true);
    try {
      const res = await api.post('/quiz/generate', { 
        materialId: selectedMaterial, 
        difficulty,
        limit
      });
      setQuizId(res.data.quiz._id);
      setQuestions(res.data.questions);
      setCurrentQIndex(0);
      setScore(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuizFinished(false);
      setUserAnswers([]);
      setReviewMode(false);
    } catch (err) {
      console.error('Failed to generate quiz', err);
      alert('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const submitAnswer = () => {
    if (!selectedAnswer) return;
    
    setIsAnswered(true);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQIndex] = selectedAnswer;
    setUserAnswers(updatedAnswers);

    if (selectedAnswer === questions[currentQIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Finish Quiz
      setQuizFinished(true);
      try {
        const finalScore = score + (selectedAnswer === questions[currentQIndex].correctAnswer ? 1 : 0);
        const percentage = Math.round((finalScore / questions.length) * 100);
        await api.post('/quiz/submit', { quizId, score: percentage });
      } catch (err) {
        console.error('Failed to save score', err);
      }
    }
  };

  const resetQuizGenerator = () => {
    setQuestions([]);
    setQuizFinished(false);
    setReviewMode(false);
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setUserAnswers([]);
  };

  // 1. Detailed Answer Review screen
  if (reviewMode) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border border-border p-5 rounded-2xl shadow-lg"
        >
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A]">Quiz Performance Review</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Go through your choices and master the subject details</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setReviewMode(false)}
              className="border-border text-[#0F172A] hover:bg-muted transition-colors"
            >
              Back to Score
            </Button>
            <Button 
              onClick={resetQuizGenerator}
              className="bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white font-semibold shadow-md"
            >
              Take Another Quiz
            </Button>
          </div>
        </motion.div>

        <div className="space-y-6">
          {questions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.correctAnswer;
            return (
              <motion.div
                key={q._id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="bg-white/65 backdrop-blur-xl border-border shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <div className={`h-1.5 ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Question {idx + 1} of {questions.length}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCorrect 
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-700 border border-rose-500/20'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-[#0F172A] leading-relaxed font-bold">{q.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    {q.options.map((option, oIdx) => {
                      const isSelected = userAnswers[idx] === option;
                      const isCorrectOption = q.correctAnswer === option;
                      
                      let optClass = "flex items-center justify-between p-3.5 rounded-xl border text-sm transition-all ";
                      if (isCorrectOption) {
                        optClass += "bg-emerald-50/80 border-emerald-300 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        optClass += "bg-rose-50/80 border-rose-300 text-rose-900 font-semibold";
                      } else {
                        optClass += "bg-[#F8FAFC]/55 border-[#D6DEE8] text-[#475569] hover:bg-[#F8FAFC]/90";
                      }

                      return (
                        <div key={oIdx} className={optClass}>
                          <span>{option}</span>
                          {isCorrectOption && <CheckCircle2 size={18} className="text-emerald-600 shrink-0 ml-2" />}
                          {isSelected && !isCorrectOption && <XCircle size={18} className="text-rose-500 shrink-0 ml-2" />}
                        </div>
                      );
                    })}

                    <div className="mt-4 p-4 rounded-xl bg-linear-to-br from-[#7C3AED]/5 to-secondary/5 border border-[#7C3AED]/10 shadow-inner">
                      <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-1">AI Explanation Details</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{q.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            onClick={resetQuizGenerator}
            className="bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white font-semibold shadow-lg hover:shadow-xl transition-all px-8 py-6 rounded-xl text-base"
          >
            Take Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  // 2. Score Summary View
  if (quizFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto pt-12">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Card className="bg-white/65 backdrop-blur-xl border-border text-center p-8 shadow-2xl overflow-hidden relative">
            <div className="h-2 bg-linear-to-r from-[#7C3AED] to-secondary absolute top-0 left-0 right-0" />
            <div className="flex justify-center mb-6 mt-4">
              <div className="w-24 h-24 rounded-full bg-linear-to-br from-[#7C3AED]/10 to-secondary/10 flex items-center justify-center border-2 border-[#7C3AED]/35 shadow-md">
                <Award size={48} className="text-[#7C3AED]" />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2">Quiz Completed!</h2>
            <p className="text-muted-foreground text-base mb-8">
              You scored <span className="font-bold text-[#7C3AED]">{score}</span> out of <span className="font-bold text-[#0F172A]">{questions.length}</span> ({percentage}%)
            </p>
            
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>Progress Score</span>
                <span>{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3.5 bg-background shadow-inner rounded-full overflow-hidden" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setReviewMode(true)} 
                className="border-border text-[#0F172A] hover:bg-muted h-12 px-6 rounded-xl font-semibold transition-all shadow-sm"
              >
                Review Answers
              </Button>
              <Button 
                onClick={resetQuizGenerator} 
                className="bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white h-12 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Take Another Quiz
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // 3. Question Flow View
  if (questions.length > 0) {
    const currentQ = questions[currentQIndex];
    
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BrainCircuit size={22} className="text-[#7C3AED]" />
            <span className="font-bold text-sm">AI Generated Companion Quiz</span>
          </div>
          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm">
            <Timer size={16} className="text-secondary" />
            <span className="text-sm font-semibold text-[#0F172A]">Question {currentQIndex + 1}/{questions.length}</span>
          </div>
        </div>

        <div className="mb-8">
          <Progress value={((currentQIndex) / questions.length) * 100} className="h-2 bg-background rounded-full overflow-hidden" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQIndex}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/65 backdrop-blur-xl border-border shadow-xl overflow-hidden">
              <div className="h-1 bg-linear-to-r from-[#7C3AED] to-secondary" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl leading-relaxed text-[#0F172A] font-bold">{currentQ.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  let btnClass = "w-full justify-between text-left h-auto py-4 px-6 rounded-xl border transition-all text-sm font-medium flex items-center ";
                  
                  if (!isAnswered) {
                    btnClass += selectedAnswer === option 
                      ? "bg-linear-to-r from-[#7C3AED]/10 to-secondary/10 border-[#7C3AED] text-[#7C3AED] shadow-sm" 
                      : "bg-[#F8FAFC]/65 border-[#D6DEE8] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#7C3AED]/40";
                  } else {
                    if (option === currentQ.correctAnswer) {
                      btnClass += "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"; // Highlight correct
                    } else if (selectedAnswer === option) {
                      btnClass += "bg-rose-50 border-rose-300 text-rose-900 opacity-90"; // Highlight wrong choice
                    } else {
                      btnClass += "bg-[#F8FAFC]/40 border-[#D6DEE8] text-[#475569]/60 opacity-60"; // Others faded
                    }
                  }

                  return (
                    <button 
                      key={idx} 
                      className={btnClass}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered}
                    >
                      <span className="text-left pr-4">{option}</span>
                      {isAnswered && option === currentQ.correctAnswer && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
                      {isAnswered && selectedAnswer === option && option !== currentQ.correctAnswer && <XCircle size={18} className="text-rose-500 shrink-0" />}
                    </button>
                  );
                })}

                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 rounded-xl bg-linear-to-br from-[#7C3AED]/5 to-secondary/5 border border-[#7C3AED]/10 shadow-inner"
                  >
                    <p className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider mb-1">Explanation</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t border-border bg-muted/40 py-4 px-6 gap-3">
                <Button
                  onClick={resetQuizGenerator}
                  variant="ghost"
                  className="text-muted-foreground hover:text-[#0F172A] font-semibold"
                >
                  Quit Quiz
                </Button>
                {!isAnswered ? (
                  <Button 
                    onClick={submitAnswer} 
                    disabled={!selectedAnswer}
                    className="bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white min-w-28 font-semibold shadow-md"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion}
                    className="bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white min-w-28 font-semibold shadow-md flex items-center gap-1.5"
                  >
                    {currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                    <ChevronRight size={16} />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 4. Initial Configure Panel
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">AI Quiz Companion</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Test your comprehension with smart, custom multiple choice tests</p>
        </div>
      </div>
 
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-white/65 backdrop-blur-xl border-border md:col-span-3 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-linear-to-r from-[#7C3AED] to-secondary" />
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#0F172A]">Configure Quiz Parameters</CardTitle>
            <CardDescription className="text-muted-foreground">Select your source material, difficulty, and size</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Notes Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Study Material Source</label>
              <select 
                className="w-full bg-white border border-border text-[#0F172A] text-sm rounded-xl p-3 focus:ring-2 focus:ring-[#7C3AED]/40 outline-none transition-all"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
              >
                <option value="" disabled>Select Notes / Source Document</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`capitalize py-2.5 rounded-xl text-sm font-semibold transition-all border
                      ${difficulty === level 
                        ? 'bg-linear-to-r from-[#7C3AED] to-secondary text-white border-transparent shadow-md' 
                        : 'bg-white text-muted-foreground border-border hover:border-[#7C3AED]/50 hover:bg-muted'}
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* MCQ Question Limit Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">Number of MCQs</label>
              <div className="grid grid-cols-2 gap-2">
                {[5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLimit(num)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all border
                      ${limit === num 
                        ? 'bg-linear-to-r from-[#7C3AED] to-secondary text-white border-transparent shadow-md' 
                        : 'bg-white text-muted-foreground border-border hover:border-[#7C3AED]/50 hover:bg-muted'}
                    `}
                  >
                    {num} Questions
                  </button>
                ))}
              </div>
            </div>

            <Button 
              onClick={generateQuiz} 
              disabled={loading || !selectedMaterial}
              className="w-full bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all rounded-xl mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Generating Smart Quiz...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Generate Quiz <ArrowRight size={18} />
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
 
        <Card className="bg-white/65 backdrop-blur-xl border-border md:col-span-2 overflow-hidden relative shadow-xl min-h-75">
          <div className="absolute inset-0 bg-linear-to-br from-[#7C3AED]/5 to-secondary/5 opacity-60"></div>
          <CardContent className="relative h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="bg-linear-to-br from-[#7C3AED]/15 to-secondary/15 p-4 rounded-full border border-[#7C3AED]/20 shadow-sm">
              <BrainCircuit size={44} className="text-[#7C3AED]" />
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">AI-Powered Review</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              StudyGenie AI reads through your study notes and extracts core definitions, principles, and scenarios. Your quizzes are completely personalized to optimize retention.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-wider pt-2">
              <BookOpen size={14} />
              <span>Personalized Learning</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
