import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { Mail, Lock, Phone, User, ArrowRight, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

const CustomerAuth = () => {
  const { customerUser, customerLogin, customerSignup } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (customerUser) {
      const from = location.state?.from?.pathname || '/profile';
      navigate(from, { replace: true });
    }
  }, [customerUser, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        if (!email.trim() || !password) {
          throw new Error('Please fill in all fields.');
        }
        const res = await customerLogin(email.trim(), password);
        if (!res.success) {
          throw new Error(res.error || 'Incorrect email or password.');
        }
      } else {
        if (!name.trim() || !email.trim() || !phone.trim() || !password) {
          throw new Error('Please fill in all fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const res = await customerSignup(name.trim(), email.trim(), phone.trim(), password);
        if (!res.success) {
          throw new Error(res.error || 'Registration failed.');
        }
      }
      
      // Redirect on success
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-light select-none">
      <div className="max-w-md w-full space-y-8 bg-white border border-cream-dark/30 rounded-xl p-8 sm:p-10 shadow-lg gold-border-glow">
        
        {/* Header Title */}
        <div className="text-center">
          <span className="font-serif text-xs text-gold font-bold tracking-[0.25em] uppercase block mb-2">
            Bani Thani Shopper
          </span>
          <h2 className="font-serif text-3xl font-bold text-primary tracking-wide">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[11px] text-charcoal-light uppercase tracking-wider mt-1.5 leading-relaxed">
            {isLogin ? 'Sign in to access your inquiry history & details' : 'Register to easily track inquiries & checkout sarees'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 text-rose-800 border border-rose-200 p-3.5 rounded-lg flex items-start gap-2 text-xs font-semibold">
            <AlertCircle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-4 text-xs font-semibold text-charcoal">
          
          {/* Sign Up Fields */}
          {!isLogin && (
            <>
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="customer-name">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="customer-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                    className="w-full pl-9 pr-3 py-2.5 border border-cream-dark/45 rounded bg-cream-light focus:outline-none focus:border-gold font-medium text-xs text-charcoal"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label htmlFor="customer-phone">WhatsApp / Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="customer-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 border border-cream-dark/45 rounded bg-cream-light focus:outline-none focus:border-gold font-medium text-xs text-charcoal"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label htmlFor="customer-email">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="customer-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-cream-dark/45 rounded bg-cream-light focus:outline-none focus:border-gold font-medium text-xs text-charcoal"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label htmlFor="customer-pass">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="customer-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-cream-dark/45 rounded bg-cream-light focus:outline-none focus:border-gold font-medium text-xs text-charcoal"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 bg-primary text-white border border-gold hover:bg-primary-dark py-3.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase shadow-md transition-all hover:scale-[1.01]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Loading...
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Separator / Switch Toggle */}
        <div className="border-t border-cream-dark/20 pt-6 text-center text-xs font-semibold text-charcoal-light">
          <span>{isLogin ? "Don't have a customer account?" : 'Already have an account?'}</span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-primary hover:text-gold uppercase tracking-wider font-bold ml-1.5 focus:outline-none"
          >
            {isLogin ? 'Sign Up Now' : 'Login Here'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerAuth;
