import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const { token, login, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect to admin dashboard
  useEffect(() => {
    if (!loading && token) {
      navigate('/admin');
    }
  }, [token, loading, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!username.trim() || !password.trim()) {
      return setErrorMsg('Please enter both username and password.');
    }

    setSubmitting(true);
    const result = await login(username.trim(), password);
    setSubmitting(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setErrorMsg(result.error || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 select-none">
      <div className="w-full max-w-md bg-white border border-cream-dark/30 rounded-lg shadow-xl overflow-hidden gold-border-glow">
        
        {/* Header decoration */}
        <div className="bg-primary text-white text-center py-8 border-b border-gold/30 relative">
          <span className="text-[10px] text-gold font-bold tracking-[0.25em] uppercase block mb-1">
            Bani Thani Textiles
          </span>
          <h2 className="font-serif text-2xl font-bold tracking-wide">Admin Portal Access</h2>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gold p-1.5 rounded-full border border-primary text-primary shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-10">
          
          {errorMsg && (
            <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded text-xs flex items-start gap-2 mb-6 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-charcoal">
            
            {/* Username */}
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-username">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="admin-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  className="w-full pl-9 pr-3 py-2.5 border border-cream-dark/45 rounded bg-cream-light text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label htmlFor="admin-password">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-9 pr-3 py-2.5 border border-cream-dark/45 rounded bg-cream-light text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-normal italic pt-2">
              * Secure area. Only authorized staff may enter. Changes affect the live saree catalog website configurations.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-white border border-gold hover:bg-primary-dark py-3.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Accessing...
                </>
              ) : (
                'Access Portal'
              )}
            </button>

          </form>

          {/* Go Back to Home Page link */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
            >
              ← Return to public website
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
