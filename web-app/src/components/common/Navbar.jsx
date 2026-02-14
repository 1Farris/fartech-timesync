import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">FarTech TimeSync</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.firstName} {user?.lastName} ({user?.role})
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <Settings size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}