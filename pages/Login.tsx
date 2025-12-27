import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockBackend } from '../services/mockBackend';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await mockBackend.login(email, password);
      if (user) {
        onLogin(user);
        if (user.role === 'Manager') navigate('/dashboard');
        else if (user.role === 'Technician') navigate('/technician-dashboard');
        else navigate('/employee-dashboard');
      } else {
        setError('Invalid credentials. Please use the demo password provided.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-100">Welcome Back</h1>
          <p className="text-slate-400 mt-2">Sign in to GearGuard CMMS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center bg-red-900/20 border border-red-900/50 p-2 rounded">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-400">
          <p>Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline font-medium">Create Account</Link></p>
          <div className="mt-4 text-xs text-left bg-slate-800 p-4 rounded text-slate-400 border border-slate-700">
             <p className="font-bold mb-1 border-b border-slate-700 pb-1">Demo Credentials:</p>
             <p className="mt-2"><span className="font-semibold text-slate-300">Password for all:</span> demo123</p>
             <div className="mt-2 space-y-1">
                <p>Manager: manager@gearguard.com</p>
                <p>Technician: mechanic@gearguard.com</p>
                <p>Employee: employee@gearguard.com</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;