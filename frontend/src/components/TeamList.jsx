
import React from 'react';
import { Users, UserPlus, ShieldCheck, Mail, Phone, Settings } from 'lucide-react';

const TeamList = ({ teams, technicians }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {teams.map(team => {
        const members = technicians.filter(t => t.teamId === team.id);
        
        return (
          <div key={team.id} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col group hover:border-indigo-500/50 transition-all overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900 group-hover:bg-slate-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-500 ring-1 ring-indigo-500/20">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">{team.name}</h3>
                  <p className="text-xs text-slate-500">{members.length} Active Technicians</p>
                </div>
              </div>
              <button className="p-2 text-slate-600 hover:text-slate-300 transition-colors">
                <Settings size={18} />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Team Members</h4>
              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors group/member">
                    <div className="flex items-center gap-3">
                       <img src={member.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt={member.name} />
                       <div>
                         <p className="text-sm font-semibold text-slate-200">{member.name}</p>
                         <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                           <ShieldCheck size={10} />
                           Certified Lead
                         </div>
                       </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover/member:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-500 hover:text-slate-200 rounded-md hover:bg-slate-700"><Mail size={14}/></button>
                      <button className="p-1.5 text-slate-500 hover:text-slate-200 rounded-md hover:bg-slate-700"><Phone size={14}/></button>
                    </div>
                  </div>
                ))}
                
                <button className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all text-xs font-bold">
                  <UserPlus size={16} />
                  Add New Specialist
                </button>
              </div>
            </div>

            <div className="p-6 bg-slate-800/20 mt-auto border-t border-slate-800/50">
               <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                 <span>Operational Capacity</span>
                 <span className="text-indigo-400 font-bold">92%</span>
               </div>
               <div className="w-full bg-slate-800 h-1.5 rounded-full">
                 <div className="w-[92%] h-1.5 bg-indigo-500 rounded-full"></div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TeamList;

