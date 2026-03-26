import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, ArrowRight,Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/useAuth';

/**
 * login.jsx
 * -----------------------
 * This component renders the login page for the TimeSync application. It provides a form for users 
 * to enter their email and password to authenticate. The component uses React's useState hook to 
 * manage form input and error state, and useAuth context to handle the login process. Upon successful 
 * login, users are redirected to the dashboard. The page is styled using Tailwind CSS for a modern and 
 * responsive design. 
 *    
 * @returns 
 */


// Define the Login component that renders the login page and handles user authentication.
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();


  // Handle form submission to authenticate the user and navigate to the dashboard on success.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render the login form with email and password fields, error messages, and a submit button. 
  // Also includes links for account creation and password recovery.
  return (
    <section className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <main className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <header className="p-8 pb-0 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 mb-4">
            <Clock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome to FarTech TimeSync
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to manage your time and earnings
          </p>
        </header>

        <div className="p-8">
          {error && (
            <div role="alert" className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-center">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/*Login form with email and password inputs, and a submit button that shows a loading 
          state when the login process is in progress.*/}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" size="sm" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-none active:transform active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                Create account
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </section>
  );
}