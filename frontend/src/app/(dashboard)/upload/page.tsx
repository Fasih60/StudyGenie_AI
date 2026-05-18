'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, X, CheckCircle, Trash2, FileText, BookOpen, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import api from '@/services/api';

interface Material {
  _id: string;
  title: string;
  fileName: string;
  createdAt: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(true);

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/materials');
      setMaterials(res.data || []);
    } catch (err) {
      console.error('Failed to fetch materials', err);
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.type === 'text/plain') {
        setFile(droppedFile);
        setSuccess(false);
      } else {
        alert('Please upload PDF or TXT files only.');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);

    try {
      await api.post('/materials/upload', formData);
      setSuccess(true);
      setFile(null);
      // Refresh the uploaded notes list
      fetchMaterials();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this study material? This will permanently delete the material and all quizzes associated with it.')) {
      return;
    }

    try {
      await api.delete(`/materials/${id}`);
      localStorage.removeItem(`chat_history_${id}`);
      fetchMaterials();
    } catch (err) {
      console.error('Failed to delete material', err);
      alert('Failed to delete study notes. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Study Materials</h1>
        <p className="text-gray-400 mt-1">Upload and manage your study notes for AI chat processing and quiz generation.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
            <CardDescription className="text-gray-400">Drag and drop your PDF or TXT files here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 flex flex-col items-center justify-center
                ${isDragging ? 'border-white bg-[#1E1E1E]' : 'border-[#2A2A2A] hover:border-gray-500 bg-[#0A0A0A]'}
                ${file ? 'border-green-500/50 bg-green-500/5' : ''}
              `}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {!file ? (
                <>
                  <div className="bg-[#1E1E1E] p-4 rounded-full mb-4">
                    <UploadCloud size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Drag & Drop files here</h3>
                  <p className="text-sm text-gray-500 mb-6">Supported formats: PDF, TXT</p>
                  
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".pdf,.txt" 
                    onChange={handleFileChange}
                  />
                  <Label 
                    htmlFor="file-upload" 
                    className="cursor-pointer bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                  >
                    Browse Files
                  </Label>
                </>
              ) : (
                <div className="w-full max-w-md">
                  <div className="flex items-center justify-between bg-[#1E1E1E] border border-[#2A2A2A] rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <File size={24} className="text-white shrink-0" />
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading}
                    className="w-full bg-white text-black hover:bg-gray-200"
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Processing with AI...</span>
                      </div>
                    ) : (
                      'Upload & Process'
                    )}
                  </Button>
                </div>
              )}
            </div>

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex items-center justify-center gap-2 text-green-400 bg-green-500/10 py-3 rounded-lg border border-green-500/20"
              >
                <CheckCircle size={20} />
                <span className="text-sm font-medium">Successfully processed! Your notes are ready for chat and quizzes.</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Uploaded Materials List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen size={20} className="text-gray-400" />
          Your Uploaded Notes
        </h2>

        {loadingMaterials ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : materials.length === 0 ? (
          <Card className="bg-[#111111] border-[#2A2A2A] text-center p-8 text-gray-500">
            <p className="text-sm">No notes uploaded yet. Upload a PDF or TXT file above to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence initial={false}>
              {materials.map((m) => (
                <motion.div
                  key={m._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-4 bg-[#111111] border border-[#2A2A2A] rounded-xl hover:border-gray-500 transition-colors"
                >
                  <div className="flex items-center gap-4 overflow-hidden pr-4">
                    <div className="bg-[#1E1E1E] p-2.5 rounded-lg border border-[#2A2A2A] shrink-0">
                      {m.fileName.endsWith('.txt') ? (
                        <FileText size={20} className="text-gray-300" />
                      ) : (
                        <File size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="truncate">
                      <h3 className="text-sm font-medium text-white truncate">{m.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{m.fileName}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatDate(m.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(m._id)}
                    className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors shrink-0"
                    title="Remove study material"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
