"use client";
import React, { useState } from 'react';
import { LayoutGrid, MonitorPlay, FileText, ClipboardList, BookOpen, Settings, PanelLeftClose, Sparkles, PanelLeftOpen } from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white h-screen flex flex-col border-r border-gray-200 hidden md:flex shrink-0 transition-all duration-300`}>
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-gray-800 text-white p-1 rounded-md px-2">V</div>
            VedaAI
          </div>
        )}
        {isCollapsed && <div className="bg-gray-800 text-white p-1 rounded-md px-2 font-bold text-xl">V</div>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-gray-400 hover:text-gray-600 transition">
          {isCollapsed ? '' : <PanelLeftClose size={20} />}
        </button>
      </div>
      
      {isCollapsed && (
        <div className="flex justify-center mb-4">
           <button onClick={() => setIsCollapsed(false)} className="text-gray-400 hover:text-gray-600 transition"><PanelLeftOpen size={20} /></button>
        </div>
      )}

      <div className={`px-4 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        <div className={`bg-gray-800 text-white rounded-full ${isCollapsed ? 'w-10 h-10 p-0' : 'py-3 px-4'} flex items-center justify-center gap-2 mb-6 cursor-pointer hover:bg-gray-700 transition`}>
          <Sparkles size={18} className="text-orange-400" />
          {!isCollapsed && <span className="font-medium text-sm">AI Teacher's Toolkit</span>}
        </div>

        <nav className={`space-y-1 ${isCollapsed ? 'w-full flex flex-col items-center' : ''}`}>
          <NavItem icon={<LayoutGrid size={20} />} label="Home" isCollapsed={isCollapsed} />
          <NavItem icon={<MonitorPlay size={20} />} label="My Classroom" isCollapsed={isCollapsed} />
          <NavItem icon={<FileText size={20} />} label="Assignments" isCollapsed={isCollapsed} />
          <NavItem icon={<ClipboardList size={20} />} label="Exams" active isCollapsed={isCollapsed} />
          <NavItem icon={<BookOpen size={20} />} label="My Library" isCollapsed={isCollapsed} />
        </nav>
      </div>

      <div className="mt-auto p-4 space-y-4">
        <div className={`flex items-center gap-3 py-2 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-lg ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}>
          <Settings size={20} />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </div>
        
        <div className={`bg-gray-50 rounded-xl flex items-center border border-gray-100 ${isCollapsed ? 'p-2 justify-center' : 'p-4 gap-3'}`}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
            <img src="/dps_logo.jpg" alt="DPS" className="w-full h-full object-cover" />
          </div>
          {!isCollapsed && (
            <div>
              <div className="font-bold text-sm text-gray-800">Delhi Public School</div>
              <div className="text-xs text-gray-500 truncate w-32">Bokaro Steel City</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active = false, isCollapsed = false }: { icon: React.ReactNode, label: string, active?: boolean, isCollapsed?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-3 rounded-lg cursor-pointer transition ${isCollapsed ? 'justify-center px-0 w-10' : 'px-4'} ${active ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`} title={label}>
      <div className={active ? "text-gray-800" : "text-gray-400"}>{icon}</div>
      {!isCollapsed && <span className="text-sm">{label}</span>}
    </div>
  );
}
