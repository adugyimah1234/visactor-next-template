/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon, ArrowRightIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Import your useAuth hook
import { Loader } from '@/components/ui/loader'; // Import Loader component
import Image from "next/image";

export default function ProfessionalLogin() {
  const { signIn, loading, error: authError } = useAuth(); // Use signIn and states from the hook
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); // Local error state
  const [socialLoading, setSocialLoading] = useState<string | null>(null); // Social loading state
  const router = useRouter(); // Initialize the router

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSocialLoading('true');

    try {
      await signIn(email, password); // Call the signIn function from useAuth
      // Redirection is handled in AuthContext
    } catch (err: any) {
      setLocalError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSocialLoading('false');
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Left panel with illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="text-4xl font-bold mb-6">Welcome back</div>
          <p className="text-indigo-200 text-lg mb-8">
            Access your dashboard and manage your business analytics with ease.
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <div className="text-xl font-medium mb-4">Why people love our platform</div>
            <ul className="space-y-3">
              {["Real-time analytics", "Secure cloud access", "24/7 technical support", "Mobile-friendly interface"].map((item, i) => (
                <li key={i} className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-300 mr-2"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right panel with login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="h-10 w-16 rounded-xl  flex items-center justify-center mx-auto mb-8">
              <div className="font-bold  text-white">
              <Image src="/logo.png" alt="Logo" width={55} height={48} className='w-28 h-20'/>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign in to Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Enter your credentials to access your account</p>
          </div>

          {(localError || authError) && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              <p className="text-sm font-medium">{localError || authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <Loader className="h-5 w-5" />
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {['Google', 'Microsoft', 'Apple'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  disabled={socialLoading === provider}
                  onClick={() => {
                    setSocialLoading(provider);
                    // Your social login logic here
                  }}
                  className="w-full flex items-center justify-center py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {socialLoading === provider ? (
                    <Loader className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{provider}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Create a free account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
