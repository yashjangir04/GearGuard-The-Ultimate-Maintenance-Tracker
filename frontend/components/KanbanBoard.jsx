
import React from 'react';
import { RequestStage } from '../types';
import { Clock, User, ArrowRight, MoreHorizontal, AlertCircle } from 'lucide-react';

const KanbanBoard = ({ 
  requests, 
  technicians, 
  equipment, 
  onUpdateStage,
  onEditRequest 
}) => {
  const stages = Object.values(RequestStage);

  const getRequestsForStage = (stage) => 
    requests.filter(req => req.stage === stage);

  return (
    <div className="flex h-full gap-6 min-w-max pb-8 overflow-x-auto">
      {stages.map(stage => (
        <div key={stage} className="w-80 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-300 uppercase tracking-wider text-xs">{stage}</h3>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full text-[10px]">
                {getRequestsForStage(stage).length}
              </span>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/40 rounded-2xl p-3 border border-slate-800/50 space-y-3 min-h-[500px]">
            {getRequestsForStage(stage).map(req => {
              const eq = equipment.find(e => e.id === req.equipmentId);
              const tech = technicians.find(t => t.id === req.technicianId);
              const isOverdue = new Date(req.scheduledDate) < new Date() && req.stage !== RequestStage.REPAIRED;

              return (
                <div 
                  key={req.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('requestId', req.id)}
                  onClick={() => onEditRequest(req)}
                  className={`group relative bg-slate-800 border-l-4 p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border-slate-700 hover:bg-slate-750 active:scale-[0.98] ${
                    isOverdue ? 'border-l-red-500' : 
                    stage === RequestStage.NEW ? 'border-l-blue-500' :
                    stage === RequestStage.IN_PROGRESS ? 'border-l-amber-500' :
                    stage === RequestStage.REPAIRED ? 'border-l-emerald-500' :
                    'border-l-slate-600'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData('requestId');
                    if (draggedId !== req.id) onUpdateStage(draggedId, stage);
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      #{req.id.slice(-4)} • {req.type}
                    </span>
                    <button className="text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2 leading-snug">
                    {req.subject}
                  </h4>
                  
                  <div className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                    <span className="bg-slate-700/50 px-1.5 py-0.5 rounded text-slate-300">{eq?.name || 'Unknown Asset'}</span>
                    <span className="opacity-50">•</span>
                    <span>{eq?.department || 'Misc'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                    <div className="flex items-center gap-2">
                      {tech ? (
                        <img src={tech.avatar} alt={tech.name} title={tech.name} className="w-6 h-6 rounded-full border border-slate-700" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                          <User size={12} className="text-slate-500" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <div className={`flex items-center gap-1 text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                          <Clock size={10} />
                          {new Date(req.scheduledDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {isOverdue && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                  </div>
                </div>
              );
            })}
            
            {/* Empty Drop Zone Helper */}
            <div 
              className="h-16 rounded-xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-600 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const requestId = e.dataTransfer.getData('requestId');
                onUpdateStage(requestId, stage);
              }}
            >
              <ArrowRight size={20} className="opacity-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;

