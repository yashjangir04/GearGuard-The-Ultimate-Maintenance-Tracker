import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { MaintenanceRequest, RequestStage, RequestType, User, Team, Equipment } from '../types';
import KanbanBoard from '../components/KanbanBoard';
import { AlertTriangle, CheckCircle, Clock, Activity, Search, PlusCircle, X, MapPin, Box, Wrench } from 'lucide-react';

const ManagerDashboard: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filter, setFilter] = useState('');
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'asset' | 'center'>('asset');
  const [selectedCenter, setSelectedCenter] = useState('');
  
  const [formData, setFormData] = useState({
      subject: '',
      description: '',
      equipmentId: '',
      technicianId: '',
      scheduledDate: '',
      scheduledTime: '',
      type: RequestType.Preventive,
      durationHours: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [reqs, users, teamList, eqList] = await Promise.all([
      mockBackend.getRequests(),
      mockBackend.getUsers(),
      mockBackend.getTeams(),
      mockBackend.getEquipment()
    ]);
    setRequests(reqs);
    setTechnicians(users.filter(u => u.role === 'Technician'));
    setTeams(teamList);
    setEquipment(eqList.filter(e => e.isActive));
  };

  const handleStatusChange = async (reqId: string, newStage: RequestStage) => {
    await mockBackend.updateRequest(reqId, { stage: newStage });
    loadData();
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      let finalDateTime = formData.scheduledDate;
      if (formData.scheduledDate && formData.scheduledTime) {
          finalDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
      }

      const eq = formData.equipmentId ? equipment.find(e => e.id === formData.equipmentId) : null;
      
      const finalTechId = selectionMode === 'center' ? null : (formData.technicianId || null);

      await mockBackend.createRequest({
          subject: formData.subject,
          description: formData.description,
          type: formData.type,
          equipmentId: formData.equipmentId || undefined,
          workCenter: selectionMode === 'center' ? selectedCenter : undefined,
          teamId: eq ? eq.maintenanceTeamId : '', 
          technicianId: finalTechId,
          scheduledDate: finalDateTime,
          durationHours: formData.durationHours,
          createdBy: 'Manager',
      });

      setIsRequestModalOpen(false);
      resetForm();
      loadData();
  };

  const resetForm = () => {
      setFormData({ 
          subject: '', 
          description: '', 
          equipmentId: '', 
          technicianId: '', 
          scheduledDate: '', 
          scheduledTime: '',
          type: RequestType.Preventive,
          durationHours: 1
      });
      setSelectionMode('asset');
      setSelectedCenter('');
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';

  const selectedEquipmentDetails = equipment.find(e => e.id === formData.equipmentId);

  const workCenters = Array.from(new Set(equipment.map(e => e.location)));
  const filteredEquipment = selectionMode === 'center' && selectedCenter 
      ? equipment.filter(e => e.location === selectedCenter)
      : equipment;

  const lowHealthCount = equipment.filter(e => e.health < 30).length;

  const pendingRequests = requests.filter(r => r.stage === RequestStage.New || r.stage === RequestStage.InProgress);
  const overdueCount = requests.filter(r => {
    if (r.stage === RequestStage.Repaired || r.stage === RequestStage.Scrap) return false;
    const dateToCheck = r.scheduledDate ? new Date(r.scheduledDate) : new Date(r.createdAt);
    const now = new Date();
    return now.getTime() > dateToCheck.getTime() + (24 * 60 * 60 * 1000);
  }).length;
  const greenMetric = pendingRequests.length + overdueCount; 

  const today = new Date().toDateString();
  const techsBookedToday = technicians.filter(tech => {
      return requests.some(r => 
          r.technicianId === tech.id && 
          r.scheduledDate && 
          new Date(r.scheduledDate).toDateString() === today
      );
  }).length;
  const techUtilization = technicians.length > 0 ? Math.round((techsBookedToday / technicians.length) * 100) : 0;

  const filteredRequests = requests.filter(r => 
    r.subject.toLowerCase().includes(filter.toLowerCase()) || 
    r.description.toLowerCase().includes(filter.toLowerCase())
  );

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className={`p-6 rounded-xl shadow-sm border border-slate-700 flex items-center justify-between bg-slate-800 border-l-4 ${color.replace('bg-', 'border-')}`}>
      <div>
        <p className="text-sm font-medium text-slate-400 uppercase">{title}</p>
        <h3 className="text-3xl font-bold text-slate-100 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-4 rounded-full ${color} bg-opacity-10 text-slate-300`}>
        <Icon className={`w-8 h-8`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Manager Dashboard</h1>
        <div className="flex gap-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                    type="text" 
                    placeholder="Search requests..."
                    className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>
            <button 
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
                <PlusCircle className="w-5 h-5" /> Create Request
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            title="Critical Equipment (<30% Health)" 
            value={lowHealthCount} 
            icon={AlertTriangle} 
            color="bg-red-500" 
        />
        <StatCard 
            title="Total Active & Overdue" 
            value={greenMetric} 
            subtext={`${overdueCount} Overdue, ${pendingRequests.length} Pending`}
            icon={Activity} 
            color="bg-green-500" 
        />
        <StatCard 
            title="Tech Utilization (Today)" 
            value={`${techUtilization}%`} 
            subtext={`${techsBookedToday} / ${technicians.length} Technicians Booked`}
            icon={CheckCircle} 
            color="bg-blue-500" 
        />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-slate-300 mb-4">Maintenance Workflow (Read Only)</h2>
        <KanbanBoard 
          requests={filteredRequests} 
          onStatusChange={handleStatusChange} 
          technicians={technicians}
          teams={teams}
          readOnly={true} 
        />
      </div>

      {isRequestModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-slate-100">Create Maintenance Request</h2>
                      <button onClick={() => setIsRequestModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  
                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                      
                      <div className="flex gap-4 mb-4 border-b border-slate-800 pb-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="mode" 
                                checked={selectionMode === 'asset'} 
                                onChange={() => { setSelectionMode('asset'); setFormData({...formData, equipmentId: ''}); }}
                              />
                              <span className="text-sm font-medium text-slate-300">By Asset List</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="radio" 
                                name="mode" 
                                checked={selectionMode === 'center'} 
                                onChange={() => { setSelectionMode('center'); setFormData({...formData, equipmentId: ''}); setSelectedCenter(''); }}
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
                            <label className="block text-sm font-medium text-slate-400 mb-1">Equipment</label>
                            <select 
                                required
                                className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                value={formData.equipmentId}
                                onChange={e => setFormData({...formData, equipmentId: e.target.value})}
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
                            className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value as RequestType})}
                          >
                             <option value={RequestType.Preventive}>Preventive</option>
                             <option value={RequestType.Corrective}>Corrective</option>
                          </select>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                          <input 
                            required
                            className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                            placeholder="e.g. Annual Inspection"
                            value={formData.subject}
                            onChange={e => setFormData({...formData, subject: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                          <textarea 
                            required
                            className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                            rows={3}
                            placeholder="Check filters, oil levels..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Date</label>
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
                        {selectionMode === 'asset' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Technician (Optional)</label>
                                <select 
                                    className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                    value={formData.technicianId}
                                    onChange={e => setFormData({...formData, technicianId: e.target.value})}
                                >
                                    <option value="">Auto-Assign to Team</option>
                                    {technicians.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div>
                             <label className="block text-sm font-medium text-slate-400 mb-1">Duration (Hrs)</label>
                             <input 
                                type="number"
                                min="1"
                                className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                value={formData.durationHours}
                                onChange={e => setFormData({...formData, durationHours: parseInt(e.target.value)})}
                             />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                          <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">Submit Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default ManagerDashboard;