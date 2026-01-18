import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsIcon, Eye, EyeOff, Globe, ChevronDown, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsLanguageMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('login.errors.invalidCredentials'));
      } else {
        setError(t('login.errors.unexpectedError'));
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
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-gradient-warm/30 to-gradient-accent/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-naples/20 to-arylide/20 rounded-full blur-3xl animate-pulse-glow"></div>
      </div>

      <div className="max-w-md w-full mx-4 z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-elevation-3 p-8 border border-white/20 animate-scale-in relative">
          {/* Language Switcher */}
          <div ref={languageMenuRef} className="absolute top-4 right-4">
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100/80 hover:bg-gray-200/80 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-naples focus:ring-offset-2"
              aria-label="Change language"
              aria-expanded={isLanguageMenuOpen}
            >
              <Globe className="w-4 h-4" />
              <span className="text-base">{currentLanguage.flag}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${isLanguageMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-fade-in">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      i18n.language === language.code
                        ? 'bg-naples/10 text-charcoal font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span className="flex-1 text-left">{language.name}</span>
                    {i18n.language === language.code && <Check className="w-4 h-4 text-naples" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="text-center mb-8 animate-fade-in-down">
            <div className="inline-block p-3 bg-gradient-to-r from-gradient-primary to-gradient-secondary rounded-2xl mb-4 shadow-glow-lg animate-bounce-gentle">
              <UtensilsIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gradient-primary via-gradient-secondary to-gradient-accent bg-clip-text text-transparent">
              Smart Restaurant
            </h1>
            <p className="text-gray-600 mt-2 font-medium">{t('login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1">
                  {t('login.email')} <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none border-antiflash"
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-1">
                  {t('login.password')} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-gray-200 text-black px-4 py-2 pr-12 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none border-antiflash"
                    placeholder={t('login.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-charcoal transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-naples focus:ring-offset-1"
                    aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-naples bg-gray-200 border-antiflash rounded focus:ring-naples focus:ring-2 cursor-pointer transition-all"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 text-sm text-charcoal cursor-pointer select-none hover:text-gray-900 transition-colors"
              >
                {t('login.rememberMe')}
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-naples text-charcoal py-2 rounded-md font-medium hover:bg-arylide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t('login.loggingIn')}
                </span>
              ) : (
                t('login.loginButton')
              )}
            </button>
          </form>

          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-xs text-gray-500">{t('login.footer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
