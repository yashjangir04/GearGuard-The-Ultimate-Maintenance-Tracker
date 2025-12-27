import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { MaintenanceRequest, RequestStage, User, Equipment } from '../types';
import { Calendar, CheckCircle, Play, XOctagon, ChevronLeft, ChevronRight, MapPin, Box, Clock, ArrowLeft } from 'lucide-react';

interface TechnicianDashboardProps {
  user: User;
  initialTab?: 'tasks' | 'calendar';
}

const TechnicianDashboard: React.FC<TechnicianDashboardProps> = ({ user, initialTab = 'tasks' }) => {
  const [availableRequests, setAvailableRequests] = useState<MaintenanceRequest[]>([]);
  const [myTasks, setMyTasks] = useState<MaintenanceRequest[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>(initialTab);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const [allRequests, allEquipment] = await Promise.all([
        mockBackend.getRequests(),
        mockBackend.getEquipment()
    ]);
    
    setEquipmentList(allEquipment);

    setAvailableRequests(allRequests.filter(r => 
      r.teamId === user.teamId && 
      r.stage === RequestStage.New && 
      !r.technicianId
    ));

    setMyTasks(allRequests.filter(r => r.technicianId === user.id));
  };

  const handleAccept = async (reqId: string) => {
    await mockBackend.updateRequest(reqId, { 
      technicianId: user.id, 
      stage: RequestStage.InProgress 
    });
    loadData();
  };

  const handleUpdateStatus = async (reqId: string, stage: RequestStage) => {
    await mockBackend.updateRequest(reqId, { stage });
    loadData();
  };

  const getRequestDetails = (req: MaintenanceRequest) => {
      const eq = equipmentList.find(e => e.id === req.equipmentId);
      return {
          eqName: eq?.name || (req.workCenter ? 'Work Center Request' : 'Unknown Asset'),
          serial: eq?.serialNumber || 'N/A',
          location: eq?.location || req.workCenter || 'Unknown Location'
      };
  };

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDay(clickedDate);
  };

  const renderCalendar = () => {
    const days = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate);
    const cells = [];

    for (let i = 0; i < startDay; i++) {
        cells.push(<div key={`empty-${i}`} className="bg-slate-900 min-h-[100px]" />);
    }

    for (let day = 1; day <= days; day++) {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const isToday = new Date().toDateString() === dateStr;
        
        const dayTasks = myTasks.filter(t => {
            if (!t.scheduledDate) return false;
            const taskDate = new Date(t.scheduledDate);
            return taskDate.getDate() === day && 
                   taskDate.getMonth() === currentDate.getMonth() && 
                   taskDate.getFullYear() === currentDate.getFullYear();
        });

        cells.push(
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              className="bg-slate-800 min-h-[100px] border-t border-r border-slate-700 p-2 hover:bg-slate-700 cursor-pointer transition-colors relative group"
            >
                <span className={`text-sm font-semibold block mb-1 ${
                    isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-300'
                }`}>
                    {day}
                </span>
                <div className="space-y-1">
                    {dayTasks.map(task => (
                        <div key={task.id} className="text-[10px] bg-purple-900/50 text-purple-200 p-1 rounded font-medium border border-purple-800 truncate" title={task.subject}>
                            {new Date(task.scheduledDate!).getHours()}:00 - {task.subject}
                        </div>
                    ))}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[10px] text-slate-500">View Day</div>
            </div>
        );
    }

    return cells;
  };

  const renderDayView = () => {
      if (!selectedDay) return null;
      const hours = Array.from({ length: 24 }, (_, i) => i);
      const dayTasks = myTasks.filter(t => {
          if (!t.scheduledDate) return false;
          const d = new Date(t.scheduledDate);
          return d.toDateString() === selectedDay.toDateString();
      });

      return (
          <div className="flex flex-col h-[600px] overflow-y-auto relative bg-slate-800 border border-slate-700 rounded-lg">
             <div className="sticky top-0 bg-slate-900 p-2 border-b border-slate-700 z-10 font-bold text-slate-300 flex justify-between items-center">
                 <span>Timeline: {selectedDay.toDateString()}</span>
                 <button onClick={() => setSelectedDay(null)} className="text-sm text-blue-400 hover:underline flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back to Month</button>
             </div>
             <div className="relative flex-1">
                 {hours.map(hour => (
                     <div key={hour} className="h-16 border-b border-slate-700 flex relative group">
                         <div className="w-16 border-r border-slate-700 text-xs text-slate-500 p-2 text-right">
                             {hour.toString().padStart(2, '0')}:00
                         </div>
                         <div className="flex-1 bg-slate-700/10 group-hover:bg-slate-700/30 transition-colors"></div>
                     </div>
                 ))}
                 
                 {dayTasks.map(task => {
                     const start = new Date(task.scheduledDate!);
                     const startHour = start.getHours();
                     const startMin = start.getMinutes();
                     const duration = task.durationHours || 1;
                     
                     const top = (startHour * 64) + ((startMin / 60) * 64); 
                     const height = duration * 64;

                     return (
                         <div 
                           key={task.id}
                           className="absolute left-20 right-4 bg-purple-900/80 border-l-4 border-purple-500 rounded p-2 text-xs text-purple-100 shadow-sm opacity-90 hover:opacity-100 hover:shadow-md transition-all z-10"
                           style={{ top: `${top}px`, height: `${height}px`, minHeight: '30px' }}
                         >
                             <div className="font-bold">{task.subject}</div>
                             <div>{startHour}:{startMin.toString().padStart(2, '0')} - {startHour + duration}:{startMin.toString().padStart(2, '0')}</div>
                         </div>
                     );
                 })}
             </div>
          </div>
      );
  };

  const TaskCard: React.FC<{ req: MaintenanceRequest, isAvailable?: boolean }> = ({ req, isAvailable }) => {
      const details = getRequestDetails(req);
      return (
        <div className="border border-slate-700 rounded-lg p-5 hover:shadow-md transition-shadow bg-slate-800 flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-200 text-lg">{req.subject}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-mono ${req.type === 'Preventive' ? 'bg-purple-900/50 text-purple-300' : 'bg-orange-900/50 text-orange-300'}`}>
                    {req.type}
                </span>
            </div>
            
            <div className="space-y-2 text-sm text-slate-400 mb-4 flex-1">
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-300">{details.eqName}</span>
                    {details.serial !== 'N/A' && <span className="text-slate-500 text-xs">({details.serial})</span>}
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{details.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
                {req.scheduledDate && (
                    <div className="flex items-center gap-2 text-purple-400 font-medium">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {new Date(req.scheduledDate).toLocaleString()}</span>
                    </div>
                )}
                <div className="bg-slate-900/50 p-3 rounded border border-slate-700 mt-2 text-slate-400 italic">
                    "{req.description}"
                </div>
            </div>

            {isAvailable ? (
                <button 
                onClick={() => handleAccept(req.id)}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                <Play className="w-4 h-4" /> Accept Task
                </button>
            ) : (
                <div className="mt-auto pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${req.stage === 'In Progress' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}>
                            {req.stage}
                        </span>
                    </div>
                    {req.stage === RequestStage.InProgress && (
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => handleUpdateStatus(req.id, RequestStage.Repaired)}
                                className="bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Repaired
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus(req.id, RequestStage.Scrap)}
                                className="bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                            >
                                <XOctagon className="w-4 h-4" /> Scrap
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Technician Workspace</h1>
        <div className="flex bg-slate-800 rounded-lg p-1 shadow-sm border border-slate-700">
           <button 
             onClick={() => setActiveTab('tasks')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Tasks
           </button>
           <button 
             onClick={() => setActiveTab('calendar')}
             className={`px-4 py-2 rounded text-sm font-medium transition-colors ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
           >
             Calendar
           </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 flex flex-col h-[calc(100vh-180px)]">
             <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center rounded-t-xl">
                <h2 className="font-bold text-slate-300">Available Requests (Team)</h2>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{availableRequests.length}</span>
             </div>
             <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {availableRequests.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No pending requests.</p>
                    </div>
                )}
                {availableRequests.map(req => <TaskCard key={req.id} req={req} isAvailable />)}
             </div>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 flex flex-col h-[calc(100vh-180px)]">
             <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center rounded-t-xl">
                <h2 className="font-bold text-slate-300">My Active Tasks</h2>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">{myTasks.filter(t => t.stage === 'In Progress').length}</span>
             </div>
             <div className="p-4 space-y-4 overflow-y-auto flex-1">
               {myTasks.length === 0 && (
                   <div className="text-center py-12 text-slate-500">
                       <Play className="w-12 h-12 mx-auto mb-2 opacity-20" />
                       <p>You have no active tasks.</p>
                   </div>
               )}
               {myTasks.map(req => <TaskCard key={req.id} req={req} />)}
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
           {!selectedDay ? (
               <>
               <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900">
                    <h2 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                        <Calendar className="w-5 h-5" /> Schedule (Select a date)
                    </h2>
                    <div className="flex items-center gap-4 text-slate-300">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-800 rounded shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
                        <span className="font-bold w-32 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-800 rounded shadow-sm"><ChevronRight className="w-5 h-5" /></button>
                    </div>
               </div>
               
               <div className="grid grid-cols-7 border-b border-slate-700 bg-slate-900">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-2 text-center text-xs font-bold text-slate-500 uppercase">{d}</div>
                    ))}
               </div>
               
               <div className="grid grid-cols-7 border-l border-slate-700">
                    {renderCalendar()}
               </div>
               </>
           ) : (
               renderDayView()
           )}
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;