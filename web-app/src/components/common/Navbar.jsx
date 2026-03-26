import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Clock, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/useAuth";

/**
 * Navbar Component
 * -----------------
 * Displays the main navigation menu of the application.
 *
 * Features:
 * - Navigation links
 * - User logout button
 * - Role-based menu options
 *
 * This component appears across all authenticated pages.
 */


// Define the Navbar component
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
// Render the Navbar with navigation links and user info
  return (
    <header className="w-full px-4 pt-3">

      <div className="bg-black text-white shadow-xl rounded-2xl border border-gray-800 max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clock className="text-white" size={22} />
          </div>

          <h1 className="text-xl font-bold tracking-wide">
            FarTech TimeSync
          </h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-8 text-sm font-medium">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/time-entry"
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Time Entry
          </NavLink>

          
          <NavLink
            to="/approvals"
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Approvals
          </NavLink>

      
          <NavLink
            to="/subscription"
            className={({ isActive }) =>
              isActive
                ? "text-blue-400 font-semibold"
                : "text-gray-300 hover:text-white transition"
            }
          >
            Subscription
          </NavLink>

       {/* Admin Links - Only visible to users with the "admin" role */}
          {user?.role === "admin" && (
            <>
              <NavLink
                to="/admin/payroll"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-white transition"
                }
              >
                Payroll
              </NavLink>

              <NavLink
                to="/manage-teams"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-white transition"
                }
              >
                Teams
              </NavLink>

              <NavLink
                to="/admin-analytics"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-400 font-semibold"
                    : "text-gray-300 hover:text-white transition"
                }
              >
                Analytics
              </NavLink>
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-4">

          <div className="bg-white text-black px-4 py-2 rounded-full text-sm">
            {user?.firstName} {user?.lastName}
          </div>

          <button
            onClick={handleLogout}
            className="hover:text-red-400 transition"
          >
            <LogOut size={20} />
          </button>

        </div>

      </div>

    </header>
  );
}