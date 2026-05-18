'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, AlertCircle, Trash2, Loader2, 
  Plus, MessageSquare, BookOpen, Search, Menu, X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Material {
  _id: string;
  title: string;
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: 'Hello! I am your StudyGenie AI assistant. Ask me anything about your uploaded notes and I will help you learn, summarize, or quiz you on the topics!',
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [activeChatIds, setActiveChatIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all study materials and active chat sessions on mount
  useEffect(() => {
    const fetchMaterialsAndChats = async () => {
      try {
        const [materialsRes, activeChatsRes] = await Promise.all([
          api.get('/materials'),
          api.get('/ai/chat/active')
        ]);
        setMaterials(materialsRes.data || []);
        setActiveChatIds(activeChatsRes.data || []);
        
        // Handle pre-selected material query param if present
        const urlParams = new URLSearchParams(window.location.search);
        const materialIdParam = urlParams.get('materialId');
        if (materialIdParam && materialsRes.data.some((m: Material) => m._id === materialIdParam)) {
          setSelectedMaterial(materialIdParam);
        }
      } catch (err) {
        console.error('Failed to fetch materials or active chats', err);
      }
    };
    fetchMaterialsAndChats();
  }, []);

  // Load chat history from DB whenever selected material changes
  useEffect(() => {
    if (!selectedMaterial) {
      const timer = setTimeout(() => {
        setMessages(prev => {
          if (prev.length === 1 && prev[0].content === WELCOME_MESSAGE.content) {
            return prev;
          }
          return [WELCOME_MESSAGE];
        });
      }, 0);
      return () => clearTimeout(timer);
    }

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get(`/ai/chat/${selectedMaterial}`);
        const dbMessages: Message[] = res.data?.messages || [];
        if (dbMessages.length > 0) {
          setMessages(dbMessages);
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
        setMessages([WELCOME_MESSAGE]);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [selectedMaterial]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !selectedMaterial || loading) return;

    const userMsg: Message = { role: 'user', content: input.trim() };
    const optimisticMessages = [...messages, userMsg];
    setMessages(optimisticMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        materialId: selectedMaterial,
        question: userMsg.content,
      });

      const assistantMsg: Message = { role: 'assistant', content: res.data.answer };
      setMessages([...optimisticMessages, assistantMsg]);

      // Add to active chat list if not already present
      if (!activeChatIds.includes(selectedMaterial)) {
        setActiveChatIds(prev => [...prev, selectedMaterial]);
      }
    } catch (err) {
      console.error('Chat generation error:', err);
      setMessages([...optimisticMessages, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async (materialIdToClear?: string) => {
    const targetMaterial = materialIdToClear || selectedMaterial;
    if (!targetMaterial || clearing) return;
    
    setClearing(true);
    try {
      await api.delete(`/ai/chat/${targetMaterial}`);
      if (targetMaterial === selectedMaterial) {
        setMessages([WELCOME_MESSAGE]);
      }
      // Remove from activeChatIds so it is taken out of the sidebar list
      setActiveChatIds(prev => prev.filter(id => id !== targetMaterial));
    } catch (err) {
      console.error('Failed to clear chat history', err);
    } finally {
      setClearing(false);
    }
  };

  const activeMaterial = materials.find(m => m._id === selectedMaterial);
  
  // Filter materials to show only those with an active chat session
  const activeChatsList = materials.filter(m => activeChatIds.includes(m._id));
  
  const filteredActiveChats = activeChatsList.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)] relative overflow-hidden bg-transparent">
      
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden transition-all duration-300"
        />
      )}

      {/* LEFT SIDEBAR: Prev Chats / Notes */}
      <aside className={`
        absolute md:relative z-40 md:z-0 left-0 top-0 h-full w-72.5 shrink-0 
        bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col 
        transition-transform duration-300 md:transform-none shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#2A2A2A] flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold bg-linear-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent uppercase tracking-wider">
              StudyGenie AI
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={18} />
            </Button>
          </div>

          {/* New Chat Button */}
          <Button
            onClick={() => {
              setSelectedMaterial('');
              setMessages([WELCOME_MESSAGE]);
              setSidebarOpen(false);
            }}
            className="w-full bg-linaer-to-r from-[#7C3AED] to-[#3B82F6] hover:opacity-95 text-white font-bold h-11 shadow-[0_0_20px_rgba(124,58,237,0.25)] border-transparent rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </Button>

          {/* Search bar inside Sidebar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <Input
              type="text"
              placeholder="Search study notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-[#7C3AED] rounded-lg placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Sidebar Previous Chats List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#22222a] [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
            Your Notes & Conversations
          </div>
          
          {filteredActiveChats.length > 0 ? (
            filteredActiveChats.map((m) => {
              const isSelected = m._id === selectedMaterial;
              return (
                <div
                  key={m._id}
                  onClick={() => {
                    setSelectedMaterial(m._id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    group p-3 rounded-xl flex items-center justify-between gap-3.5 cursor-pointer 
                    transition-all duration-200 border text-left
                    ${isSelected 
                      ? 'bg-white text-black border-gray-100 shadow-sm' 
                      : 'bg-transparent hover:bg-[#111111]/10 border-transparent text-gray-500 hover:text-[#7C3AED]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare size={15} className={isSelected ? 'text-white' : 'text-slate-500'} />
                    <span className="text-xs font-semibold truncate leading-none">{m.title}</span>
                  </div>
                  
                  {/* Quick clear history button in sidebar on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to clear chat history for "${m.title}"?`)) {
                        handleClear(m._id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500 transition-opacity p-1 hover:bg-red-500/10 rounded-sm"
                    title="Clear history"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-xs text-slate-500 px-2 leading-relaxed">
              {searchQuery ? 'No matching notes found.' : 'No active chats yet. Choose a document below to start!'}
            </div>
          )}
        </div>

        {/* Sidebar Footer Link */}
        <div className="p-3 border-t border-[#2A2A2A] bg-[#0A0A0A]">
          <Link href="/upload" className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-[#7C3AED] hover:text-[#9F67FF] hover:bg-[#7C3AED]/10 py-2.5 rounded-lg border border-dashed border-[#7C3AED]/30 transition-all">
            <BookOpen size={13} />
            <span>Manage Study Notes</span>
          </Link>
        </div>
      </aside>

      {/* RIGHT CHAT AREA */}
      <main className="flex-1 flex flex-col h-full bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-2xl relative">
        
        {/* RIGHT AREA HEADER */}
        <header className="p-4 border-b border-[#2A2A2A] bg-transparent flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar toggle button (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-400 hover:text-white shrink-0"
            >
              <Menu size={20} />
            </Button>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5 truncate">
                {activeMaterial ? (
                  <>
                    <BookOpen size={14} className="text-[#7C3AED] shrink-0" />
                    <span>{activeMaterial.title}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
                    <span>StudyGenie AI Companion</span>
                  </>
                )}
              </h1>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate leading-none">
                {activeMaterial ? 'Direct QA with extracted knowledge context' : 'Personal AI Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Clear history button */}
            {selectedMaterial && messages.length > 1 && (
              <Button
                variant="ghost"
                onClick={() => handleClear()}
                disabled={clearing}
                className="text-xs font-semibold h-9 px-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-400 border border-red-500/20 hover:border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {clearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span className="hidden sm:inline">Clear Chat</span>
              </Button>
            )}
          </div>
        </header>

        {/* MESSAGES & CHAT ENGINE CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#22222a] [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {selectedMaterial ? (
            historyLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500">
                <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
                <p className="text-xs font-medium tracking-wide uppercase">Reading note contents...</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                        isUser
                          ? 'bg-white text-black border-slate-200'
                          : 'bg-[#1E1E1E] text-slate-500 border-slate-200'
                      }`}>
                        {isUser ? <User size={14} /> : <Bot size={14} />}
                      </div>

                      {/* Content Bubble */}
                      <div className={`max-w-[78%] rounded-2xl px-4.5 py-3 ${
                        isUser
                          ? 'bg-white text-black rounded-2xl shadow-md'
                          : 'bg-[#1E1E1E] text-gray-200 border rounded-2xl'
                      }`}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed tracking-wide select-text">{msg.content}</p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Shimmer Response Loader */}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-slate-500 border border-slate-200 flex items-center justify-center shadow-sm">
                      <Sparkles size={14} className="text-[#7C3AED] animate-pulse" />
                    </div>
                    <div className="bg-[#1E1E1E] border border-slate-200 rounded-2xl px-5 py-3 flex items-center gap-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )
          ) : (
            
            /* GORGEOUS LANDING VIEW WHEN NO CHAT IS SELECTED */
            <div className="flex flex-col items-center justify-center h-full max-w-xl mx-auto space-y-6.5 text-center px-4 relative">
              <div className="absolute inset-0 -top-12 bg-radial-at-t from-[#7C3AED]/5 to-transparent blur-[120px] pointer-events-none" />

              <div className="bg-linear-to-br from-[#7C3AED]/20 to-[#3B82F6]/20 p-4 rounded-3xl border border-[#7C3AED]/25 w-fit shadow-[0_0_40px_rgba(124,58,237,0.15)] select-none">
                <Bot size={54} className="text-[#8B5CF6]" />
              </div>

              <div className="space-y-2.5">
                <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
                  StudyGenie AI Companion
                </h2>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                  Select a document from the left list to load a study chat, or quickly launch one of your notes below to begin!
                </p>
              </div>

              {materials.length > 0 ? (
                <div className="space-y-3 pt-5 w-full">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest select-none">
                    Launch a study note
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-55 overflow-y-auto p-1 text-left [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#22222a] [&::-webkit-scrollbar-thumb]:rounded-full">
                    {materials.map((m) => (
                      <button
                        key={m._id}
                        onClick={() => setSelectedMaterial(m._id)}
                        className="p-4 bg-white hover:bg-gray-50 border border-gray-100 rounded-xl text-left transition-all duration-200 group flex items-start gap-3 cursor-pointer shadow-sm active:scale-[0.98]"
                      >
                        <BookOpen size={16} className="text-gray-500 group-hover:text-[#7C3AED] shrink-0 mt-0.5" />
                        <div className="text-sm font-semibold text-[#0F172A] group-hover:text-[#7C3AED] truncate flex-1 leading-tight">{m.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-[#111111] border border-[#2A2A2A] p-5 rounded-2xl flex flex-col items-center gap-3 w-full shadow-lg">
                  <AlertCircle className="text-[#7C3AED]" size={26} />
                  <div className="space-y-1">
                    <p className="text-sm font-bold">No Notes Found</p>
                    <p className="text-xs text-slate-500">Please upload a document to begin using the AI Chat.</p>
                  </div>
                  <Link href="/upload" className="mt-1">
                    <Button className="bg-white text-black text-xs font-semibold px-5 h-9.5 rounded-xl shadow-md cursor-pointer">
                      Upload Study Notes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* BOTTOM MESSAGE INPUT BAR */}
        <div className="p-4 border-t border-[#2A2A2A] bg-[#0A0A0A] backdrop-blur-md">
          {materials.length === 0 ? (
            <div className="flex items-center justify-center gap-2.5 text-amber-400/90 bg-amber-400/5 p-3.5 rounded-xl border border-amber-400/10 text-xs font-semibold shadow-sm">
              <AlertCircle size={15} />
              <span>Please upload notes in the Upload Center first to start chatting.</span>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedMaterial 
                      ? `Ask questions about "${activeMaterial?.title}"...` 
                      : 'Choose a study document to start chatting...'
                  }
                  disabled={loading || !selectedMaterial || historyLoading}
                  className="w-full bg-[#0A0A0A] border-[#2A2A2A] text-white focus-visible:ring-1 focus-visible:ring-[#7C3AED]/40 focus:border-[#7C3AED] rounded-xl pl-5 pr-11 h-12 transition-all placeholder:text-slate-500 shadow-inner"
                />
                
                {/* Decorative spark status inside input when notes is active */}
                {selectedMaterial && !loading && (
                  <Sparkles size={14} className="absolute right-4.5 top-1/2 -translate-y-1/2 text-slate-600 animate-pulse pointer-events-none" />
                )}
              </div>
              <Button
                type="submit"
                disabled={!input.trim() || loading || !selectedMaterial || historyLoading}
                className="w-12 h-12 rounded-xl p-0 bg-white text-black hover:bg-slate-200 disabled:bg-[#1E1E24] disabled:text-slate-600 shrink-0 transition-all active:scale-[0.94] cursor-pointer shadow-md"
              >
                <Send size={16} className={input.trim() ? 'translate-x-0.5' : ''} />
              </Button>
            </form>
          )}
        </div>

      </main>
    </div>
  );
}
