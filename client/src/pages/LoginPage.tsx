import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { UtensilsIcon } from "lucide-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Invalid email or password");
      } else {
        setError("An unexpected error occurred");
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
          style={{ animationDelay: "1s" }}
        ></div>
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
            <p className="text-gray-600 mt-2 font-medium">
              Admin Dashboard Login
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  Email <span className="text-red-600">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none border-antiflash"
                  placeholder="admin@restaurant.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-charcoal mb-1"
                >
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-200 text-black px-4 py-2 border rounded-md focus:ring-2 focus:ring-naples focus:ring-offset-2 focus:outline-none border-antiflash"
                  placeholder="••••••••"
                />
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
                Remember me for 7 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-naples text-charcoal py-2 rounded-md font-medium hover:bg-arylide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
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
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div
            className="mt-6 text-center animate-fade-in"
            style={{ animationDelay: "400ms" }}
          >
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
