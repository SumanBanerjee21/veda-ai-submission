import React from 'react';
import { ArrowLeft, ClipboardList, HelpCircle, Bell, Sparkles, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <div className="h-16 flex items-center justify-between px-6 bg-transparent">
      <div className="flex items-center gap-4">
        <ArrowLeft 
          size={20} 
          className="text-gray-600 cursor-pointer hover:text-black transition-colors" 
          onClick={() => window.location.reload()}
        />
        <div className="flex items-center gap-2 text-gray-400">
          <ClipboardList size={18} />
          <span className="font-medium text-sm">Exams</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <HelpCircle size={20} className="text-gray-600 cursor-pointer hover:text-gray-900" />
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-600 hover:text-gray-900" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        </div>
        <Sparkles size={20} className="text-gray-600 cursor-pointer hover:text-gray-900" />
        
        <div className="flex items-center gap-2 ml-4 cursor-pointer hover:bg-gray-100 py-1 px-2 rounded-lg transition">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
             <img src="/suman_avatar.jpg" alt="Profile" className="w-full h-full object-cover object-top" />
          </div>
          <span className="font-medium text-sm text-gray-800">Suman Banerjee</span>
          <ChevronDown size={16} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}
