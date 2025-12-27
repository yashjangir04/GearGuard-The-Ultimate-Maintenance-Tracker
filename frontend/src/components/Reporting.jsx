
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
} from 'recharts';

const Reporting = ({ requests, equipment, teams }) => {
  // Data for Requests per Team
  const teamData = teams.map(team => ({
    name: team.name,
    count: requests.filter(r => r.teamId === team.id).length
  }));

  // Data for Requests per Category
  const categories = Array.from(new Set(equipment.map(e => e.category)));
  const categoryData = categories.map(cat => ({
    name: cat,
    value: requests.filter(r => {
      const eq = equipment.find(e => e.id === r.equipmentId);
      return eq?.category === cat;
    }).length
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Requests per Team */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-200">Workload by Maintenance Team</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests per Category */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-200">Requests by Asset Category</h3>
          <div className="h-80 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-slate-200">Request Progression Over Time</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { date: 'Jan 1', corrective: 4, preventive: 10 },
                { date: 'Jan 8', corrective: 8, preventive: 12 },
                { date: 'Jan 15', corrective: 5, preventive: 9 },
                { date: 'Jan 22', corrective: 12, preventive: 15 },
                { date: 'Jan 29', corrective: 7, preventive: 8 },
              ]}>
                <defs>
                  <linearGradient id="colorCorr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="corrective" stroke="#ef4444" fillOpacity={1} fill="url(#colorCorr)" />
                <Area type="monotone" dataKey="preventive" stroke="#10b981" fillOpacity={1} fill="url(#colorPrev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
    </div>
  );
};

export default Reporting;

