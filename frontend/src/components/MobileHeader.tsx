import React from 'react';
import { ArrowLeft, Bell, Menu } from 'lucide-react';

export default function MobileHeader() {
  return (
    <div className="h-16 flex items-center justify-between px-4 bg-white md:hidden rounded-b-xl shadow-sm mb-4">
      <div className="flex items-center gap-3">
        <ArrowLeft 
          size={24} 
          className="text-gray-800 cursor-pointer" 
          onClick={() => window.location.reload()} 
        />
        <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
          <div className="bg-gray-800 text-white p-1 rounded-md px-1.5 text-sm">V</div>
          VedaAI
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer">
          <Bell size={20} className="text-gray-500" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></div>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
           <img src="/suman_avatar.jpg" alt="Profile" className="w-full h-full object-cover object-top" />
        </div>
        <Menu size={24} className="text-gray-600 cursor-pointer" />
      </div>
    </div>
  );
}
