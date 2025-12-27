import React, { useState } from 'react';
import { MaintenanceRequest, RequestStage, User } from '../types';
import { Clock, AlertCircle, CheckCircle, Trash2, User as UserIcon } from 'lucide-react';

interface KanbanBoardProps {
  requests: MaintenanceRequest[];
  onStatusChange: (requestId: string, newStage: RequestStage) => void;
  technicians: User[];
  teams: any[];
  readOnly?: boolean;
}

const STAGES = [RequestStage.New, RequestStage.InProgress, RequestStage.Repaired, RequestStage.Scrap];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ requests, onStatusChange, technicians, readOnly = false }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (readOnly) return;
    e.dataTransfer.setData('requestId', id);
    setDraggingId(id);
  };

  const handleDrop = (e: React.DragEvent, stage: RequestStage) => {
    e.preventDefault();
    if (readOnly) return;
    const id = e.dataTransfer.getData('requestId');
    if (id) {
      onStatusChange(id, stage);
    }
    setDraggingId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (readOnly) return;
    e.preventDefault();
  };

  const getStageColor = (stage: RequestStage) => {
    switch (stage) {
      case RequestStage.New: return 'bg-blue-900/20 border-blue-900/50';
      case RequestStage.InProgress: return 'bg-yellow-900/20 border-yellow-900/50';
      case RequestStage.Repaired: return 'bg-green-900/20 border-green-900/50';
      case RequestStage.Scrap: return 'bg-red-900/20 border-red-900/50';
    }
  };

  const getTechName = (id?: string | null) => {
    if (!id) return 'Unassigned';
    return technicians.find(t => t.id === id)?.name || 'Unknown';
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
      {STAGES.map((stage) => {
        const stageRequests = requests.filter(r => r.stage === stage);
        
        return (
          <div 
            key={stage}
            className={`flex-1 min-w-[300px] flex flex-col rounded-xl border ${getStageColor(stage)} backdrop-blur-sm`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage)}
          >
            <div className="p-3 font-semibold text-slate-300 flex justify-between items-center border-b border-slate-700/50">
              <span>{stage}</span>
              <span className="bg-slate-700/50 px-2 py-0.5 rounded text-sm text-slate-400">{stageRequests.length}</span>
            </div>

            <div className="p-3 flex-1 overflow-y-auto kanban-scroll space-y-3">
              {stageRequests.map(req => (
                <div
                  key={req.id}
                  draggable={!readOnly}
                  onDragStart={(e) => handleDragStart(e, req.id)}
                  className={`bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700 ${readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-600'} transition-all ${draggingId === req.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${req.type === 'Preventive' ? 'bg-purple-900/50 text-purple-300 border border-purple-800' : 'bg-orange-900/50 text-orange-300 border border-orange-800'}`}>
                      {req.type}
                    </span>
                    {req.stage === RequestStage.Scrap && <Trash2 className="w-4 h-4 text-red-500" />}
                    {req.stage === RequestStage.Repaired && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  
                  <h4 className="font-bold text-slate-200 mb-1">{req.subject}</h4>
                  <p className="text-sm text-slate-400 line-clamp-2 mb-3">{req.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700">
                    <div className="flex items-center gap-1" title="Assigned Technician">
                      <UserIcon className="w-3 h-3" />
                      {getTechName(req.technicianId)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {stageRequests.length === 0 && !readOnly && (
                <div className="h-24 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-600 text-sm">
                  Drop here
                </div>
              )}
              {stageRequests.length === 0 && readOnly && (
                <div className="py-8 text-center text-slate-600 text-sm italic">
                  No requests in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;