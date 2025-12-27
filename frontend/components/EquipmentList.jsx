
import React, { useState } from 'react';
import { EquipmentStatus } from '../types';
import { Box, Search, Filter, Wrench, Shield, Calendar, MapPin, Briefcase, User, MoreVertical } from 'lucide-react';

const EquipmentList = ({ equipment, requests, onAddMaintenance }) => {
  const [search, setSearch] = useState('');
  const [selectedEq, setSelectedEq] = useState(null);

  const filteredEquipment = equipment.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.serialNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search equipment by name or serial..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-400 hover:text-slate-200">
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table/List side */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
           <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Equipment</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {filteredEquipment.map(eq => (
                <tr 
                  key={eq.id} 
                  className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${selectedEq?.id === eq.id ? 'bg-indigo-500/5' : ''}`}
                  onClick={() => setSelectedEq(eq)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
                        <Box size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100">{eq.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{eq.serialNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{eq.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                         {eq.employee.charAt(0)}
                       </div>
                       <span>{eq.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      eq.status === EquipmentStatus.OPERATIONAL ? 'bg-emerald-500/20 text-emerald-400' :
                      eq.status === EquipmentStatus.UNDER_REPAIR ? 'bg-amber-500/20 text-amber-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddMaintenance(eq); }}
                      className="text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Maintenance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail/Smart Button Area */}
        <div className="space-y-6">
          {selectedEq ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 sticky top-0">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-bold text-slate-100">Asset Record</h3>
                 <button className="text-slate-500 hover:text-slate-300">
                   <MoreVertical size={20} />
                 </button>
               </div>

               <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                    <Box size={40} />
                  </div>
                  <div className="text-center">
                    <h4 className="text-lg font-bold">{selectedEq.name}</h4>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">{selectedEq.serialNumber}</p>
                  </div>
               </div>

               {/* Smart Button */}
               <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => onAddMaintenance(selectedEq)}
                    className="flex items-center justify-between bg-slate-800 hover:bg-slate-750 p-4 rounded-xl border border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                        <Wrench size={20} />
                      </div>
                      <span className="font-semibold">Maintenance</span>
                    </div>
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {requests.filter(r => r.equipmentId === selectedEq.id).length}
                    </span>
                  </button>
               </div>

               <div className="space-y-4 pt-4 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Purchase Date</p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Calendar size={14} className="text-indigo-400" />
                          {selectedEq.purchaseDate}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Warranty</p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Shield size={14} className="text-indigo-400" />
                          {selectedEq.warrantyInfo}
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Location</p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <MapPin size={14} className="text-indigo-400" />
                          {selectedEq.location}
                        </div>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Employee</p>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <User size={14} className="text-indigo-400" />
                          {selectedEq.employee}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Health Indicator */}
               <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Health Meter</span>
                    <span className={`text-xs font-bold ${selectedEq.health < 40 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {selectedEq.health}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-1000 ${selectedEq.health < 40 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${selectedEq.health}%` }}
                    ></div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl text-slate-500">
              <Box size={48} className="mb-4 opacity-20" />
              <p>Select an asset to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;

