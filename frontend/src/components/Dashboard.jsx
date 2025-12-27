import React from "react";
import { RequestStage, EquipmentStatus } from "../types";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Zap,
  ArrowRight,
  Activity,
} from "lucide-react";

const Dashboard = ({ requests, equipment, onViewKanban }) => {
  const criticalEquipmentCount = equipment.filter(
    (e) => e.health < 40 && e.status !== EquipmentStatus.SCRAPPED
  ).length;
  const openRequests = requests.filter(
    (r) => r.stage !== RequestStage.REPAIRED && r.stage !== RequestStage.SCRAP
  );
  const overdueRequests = openRequests.filter(
    (r) => new Date(r.scheduledDate) < new Date()
  );

  // Stats
  const techUtilization = 85; // Simulated percentage

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Critical Equipment Card */}
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:bg-red-500/15 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <AlertTriangle size={80} className="text-red-500" />
          </div>
          <div className="flex items-center gap-3 text-red-400 font-semibold uppercase text-xs tracking-wider">
            <AlertTriangle size={16} />
            <span>Critical Equipment</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-red-500">
              {criticalEquipmentCount} Units
            </h3>
            <p className="text-sm text-red-400/80 mt-1">
              Health &lt; 30% or High Risk
            </p>
          </div>
          <button className="mt-2 text-red-400 text-sm font-medium flex items-center gap-1 hover:underline">
            Identify assets <ArrowRight size={14} />
          </button>
        </div>

        {/* Technician Load Card */}
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:bg-indigo-500/15 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Activity size={80} className="text-indigo-500" />
          </div>
          <div className="flex items-center gap-3 text-indigo-400 font-semibold uppercase text-xs tracking-wider">
            <Zap size={16} />
            <span>Technician Load</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-indigo-500">
              {techUtilization}% Utilized
            </h3>
            <p className="text-sm text-indigo-400/80 mt-1">
              Assign additional tasks carefully
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2">
            <div
              className="bg-indigo-500 h-2 rounded-full"
              style={{ width: `${techUtilization}%` }}
            ></div>
          </div>
        </div>

        {/* Open Requests Card */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl flex flex-col gap-4 relative overflow-hidden group hover:bg-emerald-500/15 transition-all">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Clock size={80} className="text-emerald-500" />
          </div>
          <div className="flex items-center gap-3 text-emerald-400 font-semibold uppercase text-xs tracking-wider">
            <Clock size={16} />
            <span>Open Requests</span>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-emerald-500">
              {openRequests.length} Pending
            </h3>
            <p className="text-sm text-emerald-400/80 mt-1">
              {overdueRequests.length} Overdue tasks
            </p>
          </div>
          <button
            onClick={onViewKanban}
            className="mt-2 text-emerald-400 text-sm font-medium flex items-center gap-1 hover:underline"
          >
            Manage backlog <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Recent Activity / Overview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-semibold text-slate-200">Maintenance Activity</h3>
          <button
            onClick={onViewKanban}
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {requests.slice(0, 5).map((req) => {
                const eq = equipment.find((e) => e.id === req.equipmentId);
                return (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-100">
                      {req.subject}
                    </td>
                    <td className="px-6 py-4">{eq?.employee || "N/A"}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">
                        ?
                      </div>
                      <span>Unassigned</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs">
                        {eq?.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
                          req.stage === RequestStage.NEW
                            ? "bg-blue-500/20 text-blue-400"
                            : req.stage === RequestStage.IN_PROGRESS
                            ? "bg-amber-500/20 text-amber-400"
                            : req.stage === RequestStage.REPAIRED
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {req.stage}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
