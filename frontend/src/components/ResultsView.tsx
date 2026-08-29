import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ResultsView({ data, answerSheetFile }: { data: any, answerSheetFile: File | null }) {
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>('questions');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(data?.questions?.[0]?.id || null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  const answerSheetImages = data?.answer_sheet_images_base64 || [];
  const totalPages = Math.max(1, answerSheetImages.length);

  useEffect(() => {
    if (answerSheetImages.length > 0) {
      setImageUrl(answerSheetImages[currentPage - 1]);
    } else if (answerSheetFile && answerSheetFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(answerSheetFile);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [answerSheetFile, answerSheetImages, currentPage]);

  const questions = data?.questions || [];
  const answers = data?.answers || [];
  const mappings = data?.mappings || [];
  const grades = data?.grades || [];
  const unmatchedAnswers = data?.unmatched_answers || [];

  const getGrade = (qid: string) => grades.find((g: any) => g.question_id === qid);
  const getMappedAnswer = (qid: string) => {
    const mapping = mappings.find((m: any) => m.question_id === qid);
    if (!mapping || !mapping.answer_id) return null;
    return answers.find((a: any) => a.id === mapping.answer_id);
  };

  const selectedAnswer = selectedQuestionId 
    ? getMappedAnswer(selectedQuestionId) || unmatchedAnswers.find((a: any) => a.id === selectedQuestionId)
    : null;
  const regions = selectedAnswer?.regions || [];

  const totalEarned = grades.reduce((sum: number, g: any) => sum + (g.marks || 0), 0);
  const totalMax = questions.reduce((sum: number, q: any) => {
    const g = getGrade(q.id);
    return sum + (g?.max_marks || q.marks || 0);
  }, 0);

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full h-[calc(100vh-140px)]">
      
      {/* MOBILE TABS */}
      <div className="flex md:hidden bg-gray-200 rounded-full p-1 mb-4">
        <button 
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2 text-sm font-bold rounded-full ${activeTab === 'questions' ? 'bg-gray-800 text-white shadow' : 'text-gray-500'}`}
        >
          Questions
        </button>
        <button 
          onClick={() => setActiveTab('answers')}
          className={`flex-1 py-2 text-sm font-bold rounded-full ${activeTab === 'answers' ? 'bg-gray-800 text-white shadow' : 'text-gray-500'}`}
        >
          Answer Sheet
        </button>
      </div>

      {/* QUESTIONS PANEL */}
      <div className={`w-full md:w-1/2 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${activeTab === 'answers' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 className="font-bold text-gray-800">Extracted Questions <span className="text-gray-500 font-normal">(from question paper)</span></h2>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm shadow-sm border border-orange-200">
              Score: {totalEarned}/{totalMax}
            </div>
            <button onClick={() => setIsAllExpanded(!isAllExpanded)} className="bg-white px-3 py-1 text-sm font-medium border border-gray-200 rounded-full shadow-sm hover:bg-gray-50">
              {isAllExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {questions.map((q: any) => {
            const isSelected = selectedQuestionId === q.id;
            const isExpanded = isSelected || isAllExpanded;
            const grade = getGrade(q.id);
            const scoreColor = grade?.marks === grade?.max_marks ? 'text-green-600' : 'text-red-500';
            
            return (
              <div 
                key={q.id} 
                onClick={() => {
                  setSelectedQuestionId(q.id);
                  const ans = getMappedAnswer(q.id);
                  if (ans && ans.regions && ans.regions.length > 0) {
                    const ansPage = ans.regions[0].page;
                    if (ansPage >= 1 && ansPage <= totalPages) {
                      setCurrentPage(ansPage);
                    }
                  }
                }}
                className={`border rounded-xl cursor-pointer transition ${isSelected ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div className="p-4 flex gap-4 items-start">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-white ${isSelected ? 'bg-orange-500' : 'bg-gray-600'}`}>
                    {q.number}
                  </div>
                  <div className="flex-1 text-sm text-gray-700 leading-relaxed pt-1">
                    {q.text}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 pt-1">
                    {getMappedAnswer(q.id) ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold shadow-sm border border-green-200">Answered</span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-bold shadow-sm border border-red-200">Unanswered</span>
                    )}
                    <div className={`font-bold ${scoreColor} whitespace-nowrap w-8 text-right`}>
                      {grade?.marks || 0}/{grade?.max_marks || q.marks}
                    </div>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {isExpanded && grade?.feedback && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-gray-50 rounded-lg p-4 ml-12">
                      <h4 className="font-bold text-gray-800 text-sm mb-1">AI Feedback</h4>
                      <p className="text-gray-600 text-sm">{grade.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {unmatchedAnswers.length > 0 && (
            <div className="mt-8 mb-4 border-t border-gray-100 pt-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                Unmatched Answers 
                <span className="text-gray-500 font-normal text-xs bg-gray-100 px-2 py-1 rounded-md">Not in Question Paper</span>
              </h3>
              <div className="space-y-4">
                {unmatchedAnswers.map((ans: any) => {
                  const isSelected = selectedQuestionId === ans.id;
                  return (
                    <div 
                      key={ans.id} 
                      onClick={() => {
                        setSelectedQuestionId(ans.id);
                        if (ans && ans.regions && ans.regions.length > 0) {
                          const ansPage = ans.regions[0].page;
                          if (ansPage >= 1 && ansPage <= totalPages) {
                            setCurrentPage(ansPage);
                          }
                        }
                      }}
                      className={`border rounded-xl cursor-pointer transition ${isSelected ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="p-4 flex gap-4 items-start">
                        <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-white ${isSelected ? 'bg-orange-500' : 'bg-gray-600'}`}>
                          {ans.question_number || '?'}
                        </div>
                        <div className="flex-1 text-sm text-gray-700 leading-relaxed pt-1">
                          {ans.text}
                        </div>
                        <div className="flex items-center gap-4 shrink-0 pt-1">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-bold shadow-sm border border-gray-200">Extra Answer</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ANSWER SHEET PANEL */}
      <div className={`w-full md:w-1/2 flex flex-col bg-[#2d2d2d] rounded-2xl shadow-sm overflow-hidden relative ${activeTab === 'questions' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-3 bg-[#2d2d2d] flex items-center justify-between text-white border-b border-gray-700">
          <span className="text-sm font-medium ml-2">Answer Sheet</span>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden text-sm">
              <button onClick={() => setZoomLevel(p => Math.max(50, p - 25))} className="px-3 py-1.5 hover:bg-gray-600 transition"><Minus size={16}/></button>
              <span className="px-2 font-medium w-14 text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(p => Math.min(200, p + 25))} className="px-3 py-1.5 hover:bg-gray-600 transition"><Plus size={16}/></button>
            </div>
            
            <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden text-sm">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                ><ChevronLeft size={16}/></button>
                <span className="px-2 font-medium">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 transition ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                ><ChevronRight size={16}/></button>
              </div>
          </div>
        </div>
        
        <div className="flex-1 bg-gray-300 relative overflow-auto flex justify-center items-start p-4">
           <div className="relative bg-white shadow-xl max-w-full inline-block transition-transform duration-200 origin-top" style={{ transform: `scale(${zoomLevel / 100})` }}>
              {imageUrl ? (
                <img src={imageUrl} alt="Answer Sheet" className="block max-w-full h-auto" />
              ) : (
                <div className="flex items-center justify-center p-20 text-gray-400">No Image Available</div>
              )}

              {/* Draw Bounding Boxes dynamically based on normalized coordinates */}
              {regions.filter((r: any) => r.page === currentPage).map((region: any, idx: number) => {
                const [ymin, xmin, ymax, xmax] = region.bbox;
                const top = `${(ymin / 1000) * 100}%`;
                const left = `${(xmin / 1000) * 100}%`;
                const width = `${((xmax - xmin) / 1000) * 100}%`;
                const height = `${((ymax - ymin) / 1000) * 100}%`;
                const qNum = questions.find((q: any) => q.id === selectedQuestionId)?.number || unmatchedAnswers.find((a: any) => a.id === selectedQuestionId)?.question_number || '?';

                return (
                  <div 
                    key={idx}
                    className="absolute border-2 border-green-500 bg-green-500/10 rounded-br-lg rounded-bl-lg rounded-tr-lg"
                    style={{ top, left, width, height }}
                  >
                     <div className="absolute -top-7 -left-0.5 bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-t-lg">
                        Q{qNum}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
}
