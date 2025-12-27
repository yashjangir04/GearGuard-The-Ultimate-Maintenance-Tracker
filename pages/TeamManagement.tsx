import React, { useEffect, useState } from 'react';
import { mockBackend } from '../services/mockBackend';
import { Team, User, UserRole } from '../types';
import { Users, UserPlus, X, Save, Loader2 } from 'lucide-react';

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [t, u] = await Promise.all([mockBackend.getTeams(), mockBackend.getUsers()]);
    setTeams(t);
    setUsers(u);
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    setIsCreating(true);
    await mockBackend.createTeam(newTeamName, []);
    setNewTeamName('');
    setIsCreating(false);
    
    await loadData();
  };

  const handleOpenAssignModal = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsModalOpen(true);
  };

  const handleAssignUser = async (userId: string) => {
    if (!selectedTeamId) return;
    
    const user = users.find(u => u.id === userId);
    if (!user) return;

    await mockBackend.updateUser(userId, { teamId: selectedTeamId });
    
    const team = teams.find(t => t.id === selectedTeamId);
    if (team) {
       const currentMembers = team.members || [];
       if (!currentMembers.includes(userId)) {
           const newMembers = [...currentMembers, userId];
           await mockBackend.updateTeam(selectedTeamId, { members: newMembers });
       }
    }

    setIsModalOpen(false);
    loadData();
  };

  const technicians = users.filter(u => u.role === UserRole.Technician);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Maintenance Teams</h1>
        <p className="text-slate-400">Organize technicians into specialized groups</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700">
        <h2 className="font-bold mb-4 text-slate-100">Create New Team</h2>
        <form onSubmit={handleCreateTeam} className="flex gap-4 items-center">
           <div className="flex-1">
             <input 
               className="w-full bg-slate-900 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
               placeholder="e.g. Electrical Dept, HVAC Unit..."
               value={newTeamName}
               onChange={e => setNewTeamName(e.target.value)}
               disabled={isCreating}
             />
           </div>
           <button 
             type="submit"
             disabled={isCreating || !newTeamName.trim()}
             className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
           >
             {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
             {isCreating ? 'Creating...' : 'Create Team'}
           </button>
        </form>
      </div>

      <div className="grid gap-6">
        {teams.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-700">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No teams created yet.</p>
            </div>
        )}

        {teams.map(team => (
          <div key={team.id} className="bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-700 transition-all hover:shadow-md hover:border-slate-600">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-900/20 text-purple-400 rounded-full">
                    <Users className="w-6 h-6" />
                    </div>
                    <div>
                    <h3 className="text-lg font-bold text-slate-100">{team.name}</h3>
                    <p className="text-sm text-slate-400">{users.filter(u => u.teamId === team.id).length} Members</p>
                    </div>
                </div>
                <button 
                  onClick={() => handleOpenAssignModal(team.id)}
                  className="text-sm border border-dashed border-slate-600 px-3 py-1.5 rounded hover:bg-slate-700 text-slate-400 flex items-center gap-2 transition-colors"
                >
                    <UserPlus className="w-4 h-4" /> Add Member
                </button>
             </div>
             
             <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Team Members</h4>
               <div className="space-y-2">
                 {users.filter(u => u.teamId === team.id).map(u => (
                   <div key={u.id} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800 p-2 rounded border border-slate-700 shadow-sm">
                     <div className="w-6 h-6 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center text-xs font-bold">{u.name.charAt(0)}</div>
                     <span className="font-medium">{u.name}</span> 
                     <span className="text-slate-500 text-xs">({u.email})</span>
                   </div>
                 ))}
                 {users.filter(u => u.teamId === team.id).length === 0 && (
                   <p className="text-sm text-slate-600 italic">No technicians assigned yet.</p>
                 )}
               </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 rounded-xl w-full max-w-md p-6 shadow-2xl border border-slate-700">
               <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                  <h3 className="font-bold text-lg text-slate-100">Assign Technician</h3>
                  <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-800 p-1 rounded"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                   {technicians.length === 0 && <p className="text-center text-slate-500 py-4">No technicians found in system.</p>}
                   {technicians.map(tech => (
                       <button 
                         key={tech.id} 
                         onClick={() => handleAssignUser(tech.id)}
                         className="w-full text-left p-3 hover:bg-slate-800 rounded flex justify-between items-center border border-transparent hover:border-slate-600 transition-colors group"
                       >
                           <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 group-hover:bg-slate-600 group-hover:shadow-sm">
                                   {tech.name.charAt(0)}
                               </div>
                               <div>
                                   <p className="font-medium text-slate-200">{tech.name}</p>
                                   <p className="text-xs text-slate-500">{tech.email}</p>
                               </div>
                           </div>
                           {tech.teamId ? (
                               <span className="text-xs bg-slate-800 text-slate-500 px-2 py-1 rounded">
                                   {teams.find(t => t.id === tech.teamId)?.name}
                               </span>
                           ) : (
                               <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded font-bold">Available</span>
                           )}
                       </button>
                   ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default TeamManagement;