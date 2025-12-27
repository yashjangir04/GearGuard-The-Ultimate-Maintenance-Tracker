import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { User, UserRole, Team } from '../types';

interface SignupProps {
  onLogin: (user: User) => void;
}

const Signup: React.FC<SignupProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.Employee,
    teamId: ''
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    mockBackend.getTeams().then(setTeams);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const newUser = await mockBackend.signup({
            id: '',
            name: formData.name,
            email: formData.email,
            role: formData.role,
            teamId: formData.role === UserRole.Technician ? formData.teamId : undefined
        }, formData.password);

        onLogin(newUser);
        if (newUser.role === 'Manager') navigate('/dashboard');
        else if (newUser.role === 'Technician') navigate('/technician-dashboard');
        else navigate('/employee-dashboard');
    } catch (err: any) {
        setError(err.message || "Signup failed");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100 mb-6 text-center">Create Account</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
            <input 
              required
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input 
              type="email"
              required
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
            <input 
              type="password"
              required
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
             <p className="text-[10px] text-slate-500 mt-1">Min 8 chars, 1 uppercase, 1 lowercase, 1 special char.</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
            <select 
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
            >
              <option value={UserRole.Employee}>Employee</option>
              <option value={UserRole.Technician}>Technician</option>
              <option value={UserRole.Manager}>Manager</option>
            </select>
          </div>

          {formData.role === UserRole.Technician && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Assign to Team</label>
              <select 
                required
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.teamId}
                onChange={(e) => setFormData({...formData, teamId: e.target.value})}
              >
                <option value="">Select a team...</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all"
          >
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;