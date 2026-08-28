"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import { Upload, X, ArrowRight, Minus, Plus, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ResultsView from '@/components/ResultsView';

import axios from 'axios';

// Mock types based on backend
type Question = { id: string, number: string, text: string, marks: number };
type Region = { page: number, bbox: number[] };
type Answer = { id: string, text: string, regions: Region[] };
type Grade = { question_id: string, marks: number, max_marks: number, status: string, feedback: string };

export default function Home() {
  const [step, setStep] = useState<'upload' | 'loading' | 'results'>('upload');
  const [resultsData, setResultsData] = useState<any>(null);
  
  // State for files
  const [qpFile, setQpFile] = useState<File | null>(null);
  const [asFile, setAsFile] = useState<File | null>(null);

  // Upload Handlers
  const handleQpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setQpFile(e.target.files[0]);
  };
  
  const handleAsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setAsFile(e.target.files[0]);
  };

  const startMapping = async () => {
    if (!qpFile || !asFile) return;
    setStep('loading');
    
    try {
      const formData = new FormData();
      formData.append('question_paper', qpFile);
      formData.append('answer_sheet', asFile);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/assess` 
        : `http://${window.location.hostname}:8000/api/assess`;
        
      const response = await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResultsData(response.data);
      setStep('results');
    } catch (error: any) {
      console.error(error);
      const serverMsg = error.response?.data?.detail || error.message;
      alert('Error from server:\n\n' + serverMsg);
      setStep('upload');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="hidden md:block"><Header /></div>
      <MobileHeader />

      <div className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-6 flex flex-col">
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-2">
              Upload <span className="text-[#f26644]">Question Paper & Answer Sheets</span>
            </h1>
            <p className="text-gray-500 mb-12">Upload both files to get started</p>
            
            <div className="relative mb-12">
              <div className="w-32 h-32 rounded-full bg-orange-100 flex items-center justify-center border-[8px] border-orange-50 overflow-hidden relative shadow-inner">
                <img src="/teacher.png" alt="Teacher" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full justify-center max-w-3xl">
              <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 transition">
                <input type="file" className="hidden" id="qp-upload" onChange={handleQpUpload} accept="application/pdf,image/*" />
                <label htmlFor="qp-upload" className="flex flex-col items-center w-full h-full cursor-pointer">
                  {qpFile ? (
                    <div className="flex items-center gap-3 w-full bg-gray-50 p-4 rounded-xl relative">
                      <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">PDF</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{qpFile.name}</p>
                        <p className="text-xs text-gray-400">{(qpFile.size / 1024 / 1024).toFixed(1)}MB</p>
                      </div>
                      <button onClick={(e) => { e.preventDefault(); setQpFile(null); }} className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1"><X size={14}/></button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 text-gray-600">
                        <Upload size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Upload <span className="text-[#f26644]">Question Paper</span></h3>
                      <p className="text-gray-400 text-sm">Max 10MB</p>
                    </>
                  )}
                </label>
              </div>

              <div className="flex-1 bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center cursor-pointer hover:border-orange-300 transition">
                <input type="file" className="hidden" id="as-upload" onChange={handleAsUpload} accept="application/pdf,image/*" />
                <label htmlFor="as-upload" className="flex flex-col items-center w-full h-full cursor-pointer">
                  {asFile ? (
                     <div className="flex items-center gap-3 w-full bg-gray-50 p-4 rounded-xl relative">
                     <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">PDF</div>
                     <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-bold text-gray-800 truncate">{asFile.name}</p>
                       <p className="text-xs text-gray-400">{(asFile.size / 1024 / 1024).toFixed(1)}MB</p>
                     </div>
                     <button onClick={(e) => { e.preventDefault(); setAsFile(null); }} className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1"><X size={14}/></button>
                   </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 text-gray-600">
                        <Upload size={24} />
                      </div>
                      <h3 className="font-bold text-lg">Upload <span className="text-[#f26644]">Answer Sheet</span></h3>
                      <p className="text-gray-400 text-sm">Max 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <button 
                onClick={startMapping}
                disabled={!qpFile || !asFile}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition ${qpFile && asFile ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Start Mapping <ArrowRight size={18} />
              </button>
              <p className="text-gray-400 text-sm mt-4 text-center">Once both files are uploaded, you'll able to map answers with questions</p>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center flex-1 w-full">
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6 relative"
            >
              <div className="text-[#f26644]">
                <Sparkles size={80} fill="#f26644" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800">Extracting...</h2>
            <p className="text-gray-500">This may take a while</p>
          </div>
        )}

        {step === 'results' && (
          <ResultsView data={resultsData} answerSheetFile={asFile} />
        )}

      </div>
    </div>
  );
}
