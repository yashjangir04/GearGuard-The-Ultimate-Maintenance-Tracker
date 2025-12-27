
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, PlusCircle, AlertCircle } from 'lucide-react';

const CalendarView = ({ requests, onDateClick }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="h-32 border-b border-r border-slate-800 bg-slate-900/20"></div>);
  }

  for (let d = 1; d <= days; d++) {
    const dateStr = new Date(year, month, d).toISOString().split('T')[0];
    const dayRequests = requests.filter(r => r.scheduledDate.startsWith(dateStr));

    calendarCells.push(
      <div 
        key={d} 
        onClick={() => onDateClick(new Date(year, month, d))}
        className="h-32 border-b border-r border-slate-800 p-2 hover:bg-slate-800/40 cursor-pointer group transition-colors overflow-y-auto no-scrollbar relative"
      >
        <div className="flex justify-between items-center mb-1">
          <span className={`text-xs font-bold ${d === new Date().getDate() && month === new Date().getMonth() ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-slate-500'}`}>
            {d}
          </span>
          <PlusCircle size={14} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="space-y-1">
          {dayRequests.map(req => (
            <div 
              key={req.id} 
              className="text-[9px] font-bold p-1 bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30 truncate flex items-center gap-1"
              title={req.subject}
            >
               <AlertCircle size={8} />
               {req.subject}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
        <h3 className="text-xl font-bold flex items-center gap-2">
          {monthName} <span className="text-slate-500">{year}</span>
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1 bg-slate-800 text-xs font-bold text-slate-300 rounded hover:text-white"
          >
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-950/20">
        <div className="grid grid-cols-7 text-center border-b border-slate-800">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
            <div key={day} className="py-2 text-[10px] font-bold text-slate-500 tracking-widest">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-w-[700px]">
          {calendarCells}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

