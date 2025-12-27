import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Equipment, MaintenanceRequest, RequestStage, RequestType, User, Team } from '../types';
import { PlusCircle, Search, MapPin, Box, Wrench, X } from 'lucide-react';

interface EmployeeDashboardProps {
  user: User;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myRequests, setMyRequests] = useState<MaintenanceRequest[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'asset' | 'center'>('asset');
  const [selectedCenter, setSelectedCenter] = useState('');

  const [formData, setFormData] = useState({
      selectedEq: '',
      subject: '',
      description: '',
      requestType: RequestType.Corrective,
      scheduledDate: '',
      scheduledTime: ''
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    const eqs = await mockBackend.getEquipment();
    const reqs = await mockBackend.getRequests();
    const tms = await mockBackend.getTeams();
    setEquipmentList(eqs.filter(e => e.isActive)); 
    setMyRequests(reqs.filter(r => r.createdBy === user.id));
    setTeams(tms);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eq = formData.selectedEq ? equipmentList.find(e => e.id === formData.selectedEq) : null;
    let finalDateTime = undefined;
    if (formData.scheduledDate && formData.scheduledTime) {
        finalDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
    }

    await mockBackend.createRequest({
      subject: formData.subject,
      description: formData.description,
      type: formData.requestType,
      equipmentId: formData.selectedEq || undefined,
      workCenter: selectionMode === 'center' ? selectedCenter : undefined,
      teamId: eq ? eq.maintenanceTeamId : '', 
      createdBy: user.id,
      scheduledDate: finalDateTime
    });

    setShowModal(false);
    resetForm();
    loadData();
  };

  const resetForm = () => {
    setFormData({ selectedEq: '', subject: '', description: '', requestType: RequestType.Corrective, scheduledDate: '', scheduledTime: '' });
    setSelectionMode('asset');
    setSelectedCenter('');
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';

  const selectedEquipmentDetails = equipmentList.find(e => e.id === formData.selectedEq);
  const workCenters = Array.from(new Set(equipmentList.map(e => e.location)));
  const filteredEquipment = selectionMode === 'center' && selectedCenter 
      ? equipmentList.filter(e => e.location === selectedCenter)
      : equipmentList;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">My Requests</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> New Request
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-900 border-b border-slate-700 text-slate-400 text-xs uppercase">
            <tr>
              <th className="p-4">Subject</th>
              <th className="p-4">Type</th>
              <th className="p-4">Asset / Location</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
             {myRequests.map(req => {
               const eqName = req.equipmentId 
                ? equipmentList.find(e => e.id === req.equipmentId)?.name 
                : req.workCenter || 'Unknown';
               
               return (
                 <tr key={req.id} className="hover:bg-slate-700/50 transition-colors">
                   <td className="p-4 font-medium text-slate-200">{req.subject}</td>
                   <td className="p-4">
                     <span className={`text-xs font-mono px-2 py-1 rounded ${req.type === RequestType.Preventive ? 'bg-purple-900/50 text-purple-300' : 'bg-orange-900/50 text-orange-300'}`}>
                       {req.type}
                     </span>
                   </td>
                   <td className="p-4 text-slate-400">{eqName}</td>
                   <td className="p-4 text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                   <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs font-bold ${
                       req.stage === 'New' ? 'bg-blue-900/50 text-blue-300' :
                       req.stage === 'In Progress' ? 'bg-yellow-900/50 text-yellow-300' :
                       req.stage === 'Repaired' ? 'bg-green-900/50 text-green-300' :
                       'bg-red-900/50 text-red-300'
                     }`}>
                       {req.stage}
                     </span>
                   </td>
                 </tr>
               );
             })}
             {myRequests.length === 0 && (
               <tr><td colSpan={5} className="p-8 text-center text-slate-500">No requests found. Create one to get started.</td></tr>
             )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold text-slate-100">Report an Issue</h2>
                 <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="flex gap-4 mb-4 border-b border-slate-800 pb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={selectionMode === 'asset'} 
                        onChange={() => { setSelectionMode('asset'); setFormData({...formData, selectedEq: ''}); }}
                      />
                      <span className="text-sm font-medium text-slate-300">By Asset List</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="mode" 
                        checked={selectionMode === 'center'} 
                        onChange={() => { setSelectionMode('center'); setFormData({...formData, selectedEq: ''}); setSelectedCenter(''); }}
                      />
                      <span className="text-sm font-medium text-slate-300">By Work Center</span>
                  </label>
              </div>

              {selectionMode === 'center' && (
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Work Center</label>
                      <select 
                        className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                        value={selectedCenter}
                        onChange={e => setSelectedCenter(e.target.value)}
                      >
                          <option value="">Select Work Center...</option>
                          {workCenters.map(wc => <option key={wc} value={wc}>{wc}</option>)}
                      </select>
                  </div>
              )}

              {selectionMode === 'asset' && (
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Affected Equipment</label>
                    <select 
                    required
                    className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.selectedEq}
                    onChange={e => setFormData({...formData, selectedEq: e.target.value})}
                    >
                    <option value="">Select Equipment...</option>
                    {filteredEquipment.map(e => (
                        <option key={e.id} value={e.id}>{e.name} (SN: {e.serialNumber})</option>
                    ))}
                    </select>
                </div>
              )}

              {selectedEquipmentDetails && selectionMode === 'asset' && (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase">Category</span>
                          <div className="flex items-center gap-1 text-slate-300 font-medium">
                              <Box className="w-3 h-3" /> {selectedEquipmentDetails.category}
                          </div>
                      </div>
                      <div>
                          <span className="block text-xs font-bold text-slate-500 uppercase">Work Center</span>
                          <div className="flex items-center gap-1 text-slate-300 font-medium">
                              <MapPin className="w-3 h-3" /> {selectedEquipmentDetails.location}
                          </div>
                      </div>
                      <div className="col-span-2 border-t border-slate-700 pt-2 mt-1">
                          <span className="block text-xs font-bold text-slate-500 uppercase">Assigned Maintenance Team</span>
                          <div className="flex items-center gap-1 text-blue-400 font-bold">
                              <Wrench className="w-3 h-3" /> {getTeamName(selectedEquipmentDetails.maintenanceTeamId)}
                          </div>
                      </div>
                  </div>
              )}

              <div>
                 <label className="block text-sm font-medium text-slate-400 mb-1">Request Type</label>
                 <select 
                    className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.requestType}
                    onChange={e => setFormData({...formData, requestType: e.target.value as RequestType})}
                 >
                    <option value={RequestType.Corrective}>Corrective (Issue/Repair)</option>
                    <option value={RequestType.Preventive}>Preventive (Maintenance/Check)</option>
                 </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                <input 
                  required
                  className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  placeholder="e.g. Engine Overheating"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the issue in detail..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Preferred Date</label>
                      <input 
                          type="date"
                          className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                          value={formData.scheduledDate}
                          onChange={e => setFormData({...formData, scheduledDate: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Time</label>
                      <input 
                          type="time"
                          className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                          value={formData.scheduledTime}
                          onChange={e => setFormData({...formData, scheduledTime: e.target.value})}
                      />
                  </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-medium"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;