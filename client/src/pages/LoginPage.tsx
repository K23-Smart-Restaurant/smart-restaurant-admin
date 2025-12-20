import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Invalid email or password');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-gradient-primary/30 to-gradient-secondary/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-gradient-warm/30 to-gradient-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-naples/20 to-arylide/20 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <div className="max-w-md w-full mx-4 z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-elevation-3 p-8 border border-white/20 animate-scale-in">
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-block p-3 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-2xl mb-4 shadow-glow-lg animate-bounce-gentle">
              <UtensilsIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gradient-primary via-gradient-secondary to-gradient-accent bg-clip-text text-transparent">
              Smart Restaurant
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Admin Dashboard Login</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg animate-fade-in-up">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-gradient-primary/50"
                placeholder="admin@restaurant.com"
              />
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gradient-primary focus:border-gradient-primary transition-all duration-300 bg-white/50 backdrop-blur-sm hover:border-gradient-primary/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gradient-primary to-gradient-secondary text-white py-3.5 rounded-xl font-bold hover:shadow-glow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 relative overflow-hidden group animate-fade-in-up"
              style={{ animationDelay: '300ms' }}
            >
              <span className="relative z-10">
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-shine opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </form>
          
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-xs text-gray-500">
              Secure admin access • Powered by Smart Restaurant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
