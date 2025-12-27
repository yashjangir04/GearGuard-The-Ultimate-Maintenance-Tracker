import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Equipment, Team, RequestType, User, MaintenanceRequest, RequestStage } from '../types';
import { Box, MapPin, Search, Wrench, Plus, X, ArrowLeft, Calendar, FileText, AlertTriangle, Activity, Filter, User as UserIcon, Building2, ClipboardList } from 'lucide-react';

interface EquipmentListProps {
  initialMode?: 'inventory' | 'work-centers';
}

const EquipmentList: React.FC<EquipmentListProps> = ({ initialMode = 'inventory' }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  
  const [viewMode, setViewMode] = useState<'inventory' | 'work-centers'>(initialMode);
  const [groupBy, setGroupBy] = useState<'none' | 'department' | 'employee'>('none');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [showRelatedRequests, setShowRelatedRequests] = useState(false);
  
  const [newEq, setNewEq] = useState({
      name: '', serialNumber: '', category: '', location: '', department: '', assignedEmployeeId: '', maintenanceTeamId: '', purchaseDate: '', warrantyMonths: 12, health: 100
  });
  const [requestForm, setRequestForm] = useState({ 
      subject: '', 
      description: '',
      type: RequestType.Corrective
  });

  useEffect(() => {
    setViewMode(initialMode);
    setSelectedGroup(null);
    setSelectedEquipment(null);
  }, [initialMode]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [eqs, tms, usrs, reqs] = await Promise.all([
        mockBackend.getEquipment(), 
        mockBackend.getTeams(), 
        mockBackend.getUsers(),
        mockBackend.getRequests()
    ]);
    setEquipment(eqs);
    setTeams(tms);
    setUsers(usrs);
    setRequests(reqs);
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
      e.preventDefault();
      await mockBackend.addEquipment({ ...newEq, isActive: true });
      setIsAddModalOpen(false);
      setNewEq({ name: '', serialNumber: '', category: '', location: '', department: '', assignedEmployeeId: '', maintenanceTeamId: '', purchaseDate: '', warrantyMonths: 12, health: 100 });
      loadData();
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;
    
    await mockBackend.createRequest({
        subject: requestForm.subject,
        description: requestForm.description,
        type: requestForm.type,
        equipmentId: selectedEquipment.id,
        teamId: selectedEquipment.maintenanceTeamId,
        createdBy: 'Manager',
    });

    setIsRequestModalOpen(false);
    setRequestForm({ subject: '', description: '', type: RequestType.Corrective });
    loadData();
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Unknown';
  const getUserName = (id?: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  const getGroupedData = () => {
      const groups: Record<string, Equipment[]> = {};
      
      equipment.forEach(item => {
          let key = 'Unassigned';
          if (viewMode === 'work-centers') {
              key = item.location || 'Unassigned';
          } else if (groupBy === 'department') {
              key = item.department || 'No Department';
          } else if (groupBy === 'employee') {
              key = getUserName(item.assignedEmployeeId);
          } else {
              key = 'All';
          }

          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
      });
      return groups;
  };

  const groupedData = getGroupedData();

  const getEquipmentRequests = (eqId: string) => requests.filter(r => r.equipmentId === eqId);
  const getOpenRequestCount = (eqId: string) => getEquipmentRequests(eqId).filter(r => r.stage !== RequestStage.Repaired && r.stage !== RequestStage.Scrap).length;

  const renderInventoryList = (items: Equipment[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map(item => (
        <div 
            key={item.id} 
            onClick={() => { setSelectedEquipment(item); setShowRelatedRequests(false); }}
            className={`bg-slate-800 rounded-xl shadow-sm border p-6 flex flex-col justify-between cursor-pointer hover:shadow-md hover:border-blue-500 transition-all ${item.isActive ? 'border-slate-700' : 'border-red-900 bg-red-900/10'}`}
        >
          <div>
            <div className="flex justify-between items-start">
              <div className="p-3 bg-slate-700 text-blue-400 rounded-lg">
                <Box className="w-6 h-6" />
              </div>
              {!item.isActive && <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/30">SCRAPPED</span>}
            </div>
            
            <h3 className="text-lg font-bold text-slate-100 mt-4">{item.name}</h3>
            <p className="text-sm text-slate-400 mb-2 font-mono">{item.serialNumber}</p>

            <div className="mb-4">
                <div className="flex justify-between items-end text-xs mb-1">
                    <span className="font-semibold text-slate-500">Health</span>
                    <span className={`font-bold ${item.health < 30 ? 'text-red-400' : 'text-green-400'}`}>{item.health}%</span>
                </div>
                <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${item.health < 30 ? 'bg-red-500' : item.health < 70 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                        style={{ width: `${item.health}%` }}
                    />
                </div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span>{item.location}</span>
              </div>
               <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>{item.department || 'No Dept'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-500" />
                <span>{getTeamName(item.maintenanceTeamId)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
              {viewMode === 'work-centers' ? 'Work Centers' : 'Equipment Inventory'}
          </h1>
          <p className="text-slate-400">
             {selectedGroup ? `${selectedGroup}` : 'Manage company assets and report issues'}
          </p>
        </div>
        <div className="flex gap-4 items-center">
            
            {viewMode === 'inventory' && (
                <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-3 py-2 text-sm">
                    <Filter className="w-4 h-4 text-slate-400 mr-2" />
                    <select 
                        className="bg-transparent text-slate-200 outline-none cursor-pointer"
                        value={groupBy}
                        onChange={e => { setGroupBy(e.target.value as any); setSelectedGroup(null); }}
                    >
                        <option value="none" className="bg-slate-800">No Grouping</option>
                        <option value="department" className="bg-slate-800">By Department</option>
                        <option value="employee" className="bg-slate-800">By Employee</option>
                    </select>
                </div>
            )}

            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
            >
                <Plus className="w-5 h-5" /> Add Equipment
            </button>
            
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                <button 
                    onClick={() => { setViewMode('inventory'); setSelectedGroup(null); setSelectedEquipment(null); setGroupBy('none'); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'inventory' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >Inventory</button>
                <button 
                    onClick={() => { setViewMode('work-centers'); setSelectedGroup(null); setSelectedEquipment(null); setGroupBy('none'); }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'work-centers' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >Work Centers</button>
            </div>
        </div>
      </div>

      {(viewMode === 'work-centers' || groupBy !== 'none') && !selectedGroup && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Object.entries(groupedData).map(([groupName, items]) => (
                  <div 
                    key={groupName} 
                    onClick={() => setSelectedGroup(groupName)}
                    className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 hover:shadow-lg cursor-pointer transition-all group"
                  >
                      <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-slate-700 text-blue-400 rounded-lg group-hover:bg-slate-600 transition-colors">
                              {groupBy === 'employee' ? <UserIcon className="w-8 h-8" /> : 
                               groupBy === 'department' ? <Building2 className="w-8 h-8" /> : 
                               <MapPin className="w-8 h-8" />}
                          </div>
                          <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">{items.length} Assets</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">{groupName}</h3>
                      <p className="text-sm text-slate-400 mt-1">Click to view items</p>
                  </div>
              ))}
          </div>
      )}

      {(viewMode === 'work-centers' || groupBy !== 'none') && selectedGroup && (
          <div>
              <button 
                onClick={() => setSelectedGroup(null)}
                className="flex items-center text-slate-400 hover:text-blue-400 mb-6 font-medium transition-colors"
              >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to {viewMode === 'work-centers' ? 'Work Centers' : 'Groups'}
              </button>
              {renderInventoryList(groupedData[selectedGroup] || [])}
          </div>
      )}

      {viewMode === 'inventory' && groupBy === 'none' && (
          renderInventoryList(equipment)
      )}

      {selectedEquipment && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-slate-900 rounded-xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-700">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-800/50">
                      <div className="flex items-center gap-4">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-100">{selectedEquipment.name}</h2>
                            <div className="flex items-center gap-2 mt-1 text-slate-400">
                                <span className="font-mono bg-slate-800 px-2 py-0.5 border border-slate-700 rounded text-xs">{selectedEquipment.serialNumber}</span>
                                <span>•</span>
                                <span className="text-sm">{selectedEquipment.category}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setShowRelatedRequests(!showRelatedRequests)}
                            className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border transition-all ${showRelatedRequests ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700'}`}
                          >
                             <div className="flex items-center gap-2 text-sm font-bold">
                                 <ClipboardList className="w-4 h-4" /> Maintenance
                             </div>
                             <span className="text-xs mt-1 bg-white/20 px-2 py-0.5 rounded-full">{getOpenRequestCount(selectedEquipment.id)} Open</span>
                          </button>

                      </div>
                      <button onClick={() => setSelectedEquipment(null)} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto">
                      
                      {showRelatedRequests ? (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                              <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                                  <ClipboardList className="w-5 h-5 text-blue-500" /> Maintenance History
                              </h3>
                              <div className="space-y-3">
                                  {getEquipmentRequests(selectedEquipment.id).length === 0 && <p className="text-slate-500 italic">No maintenance history found.</p>}
                                  {getEquipmentRequests(selectedEquipment.id).map(req => (
                                      <div key={req.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                                          <div>
                                              <p className="font-bold text-slate-200">{req.subject}</p>
                                              <p className="text-sm text-slate-400">{new Date(req.createdAt).toLocaleDateString()} - {req.type}</p>
                                          </div>
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                                              req.stage === 'New' ? 'bg-blue-900/50 text-blue-300 border border-blue-800' :
                                              req.stage === 'In Progress' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-800' :
                                              req.stage === 'Repaired' ? 'bg-green-900/50 text-green-300 border border-green-800' :
                                              'bg-red-900/50 text-red-300 border border-red-800'
                                          }`}>
                                              {req.stage}
                                          </span>
                                      </div>
                                  ))}
                              </div>
                              <button 
                                onClick={() => setShowRelatedRequests(false)} 
                                className="mt-6 text-sm text-blue-400 hover:underline flex items-center gap-1"
                              >
                                  <ArrowLeft className="w-3 h-3" /> Back to details
                              </button>
                          </div>
                      ) : (
                        <>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
                                        <p className="text-slate-200 font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {selectedEquipment.location}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                                        <p className="text-slate-200 font-medium flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {selectedEquipment.department || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Maintenance Team</label>
                                        <p className="text-slate-200 font-medium flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400" /> {getTeamName(selectedEquipment.maintenanceTeamId)}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Assigned Employee</label>
                                        <p className="text-slate-200 font-medium flex items-center gap-2"><UserIcon className="w-4 h-4 text-slate-400" /> {getUserName(selectedEquipment.assignedEmployeeId)}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Purchase Date</label>
                                        <p className="text-slate-200 font-medium flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /> {new Date(selectedEquipment.purchaseDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                        <div className="flex flex-col gap-2">
                                            <p className={`font-bold inline-block px-2 py-1 rounded text-sm w-max ${selectedEquipment.isActive ? 'bg-green-900/50 text-green-400 border border-green-900' : 'bg-red-900/50 text-red-400 border border-red-900'}`}>
                                                {selectedEquipment.isActive ? 'Active' : 'Scrapped'}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Activity className="w-4 h-4 text-slate-400" />
                                                <span>Health: <span className={selectedEquipment.health < 30 ? 'text-red-400 font-bold' : 'text-green-400'}>{selectedEquipment.health}%</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedEquipment.isActive && (
                                <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
                                    <h3 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Report Issue / Request Maintenance
                                    </h3>
                                    <p className="text-sm text-blue-200 mb-4">
                                        Need maintenance for this specific equipment? Create a request below.
                                    </p>
                                    <button 
                                        onClick={() => setIsRequestModalOpen(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium w-full transition-colors shadow-sm"
                                    >
                                        Create Maintenance Request
                                    </button>
                                </div>
                            )}
                        </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {isRequestModalOpen && selectedEquipment && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
              <div className="bg-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl border border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-100">New Maintenance Request</h2>
                      <button onClick={() => setIsRequestModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  
                  <div className="mb-6 p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                      <p><strong>Asset:</strong> {selectedEquipment.name}</p>
                      <p><strong>Location:</strong> {selectedEquipment.location}</p>
                  </div>

                  <form onSubmit={handleCreateRequest} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Request Type</label>
                          <select 
                            className="w-full bg-slate-800 border border-slate-600 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={requestForm.type}
                            onChange={e => setRequestForm({...requestForm, type: e.target.value as RequestType})}
                          >
                             <option value={RequestType.Corrective}>Corrective (Issue/Repair)</option>
                             <option value={RequestType.Preventive}>Preventive (Maintenance/Check)</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                          <input 
                            required
                            className="w-full bg-slate-800 border border-slate-600 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Hydraulic failure"
                            value={requestForm.subject}
                            onChange={e => setRequestForm({...requestForm, subject: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                          <textarea 
                            required
                            rows={4}
                            className="w-full bg-slate-800 border border-slate-600 text-white p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Describe the problem in detail..."
                            value={requestForm.description}
                            onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                          />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                          <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium">Submit Request</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 rounded-xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-slate-700">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-slate-100">Add New Equipment</h2>
                      <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleAddEquipment} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Equipment Name</label>
                          <input required className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                value={newEq.name} onChange={e => setNewEq({...newEq, name: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Serial Number</label>
                          <input required className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                value={newEq.serialNumber} onChange={e => setNewEq({...newEq, serialNumber: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                            <input required className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                    value={newEq.category} onChange={e => setNewEq({...newEq, category: e.target.value})} placeholder="e.g. Machinery" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Department</label>
                            <input className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                    value={newEq.department} onChange={e => setNewEq({...newEq, department: e.target.value})} placeholder="e.g. Production" />
                        </div>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">Location / Work Center</label>
                          <input required className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                  value={newEq.location} onChange={e => setNewEq({...newEq, location: e.target.value})} placeholder="e.g. Floor B" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Maintenance Team</label>
                            <select required className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                    value={newEq.maintenanceTeamId} onChange={e => setNewEq({...newEq, maintenanceTeamId: e.target.value})}>
                                    <option value="">Select Team...</option>
                                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-400 mb-1">Assigned Employee</label>
                             <select className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                     value={newEq.assignedEmployeeId} onChange={e => setNewEq({...newEq, assignedEmployeeId: e.target.value})}>
                                     <option value="">Unassigned</option>
                                     {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                             </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Purchase Date</label>
                              <input required type="date" className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                    value={newEq.purchaseDate} onChange={e => setNewEq({...newEq, purchaseDate: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-400 mb-1">Health %</label>
                              <input required type="number" min="0" max="100" className="w-full bg-slate-800 border border-slate-600 text-white p-2 rounded outline-none focus:border-blue-500"
                                    value={newEq.health} onChange={e => setNewEq({...newEq, health: parseInt(e.target.value)})} />
                          </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
                          <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded">Add Asset</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default EquipmentList;