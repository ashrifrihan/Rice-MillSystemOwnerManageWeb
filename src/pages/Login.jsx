import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, KeyIcon, MailIcon } from 'lucide-react';
import { signIn, signInWithGoogle } from '../firebase/auth';
import { useNavigate } from 'react-router-dom';
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (otpEnabled && !otp) {
      newErrors.otp = 'OTP is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      // Check if we should show OTP screen
      if (!otpEnabled && email === 'admin@ricemill.com' && password === 'password123') {
        setOtpEnabled(true);
        setIsLoading(false);
        return;
      }
      // In a real app, this would handle authentication with Firebase
      if (otpEnabled) {
        if (otp === '123456') {
          await signIn(email, password);
          navigate('/');
        } else {
          setErrors({
            otp: 'Invalid OTP code'
          });
        }
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({
        general: 'Failed to sign in. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google sign-in error:', error);
      setErrors({
        general: 'Failed to sign in with Google. Please try again.'
      });
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-[#ef126e] rounded-full flex items-center justify-center text-white text-2xl font-bold">
              RM
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Rice Mill Owner Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>
        {errors.general && <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {!otpEnabled ? <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="email" name="email" type="email" autoComplete="email" required className={`appearance-none block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ef126e] focus:border-[#ef126e] sm:text-sm`} placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required className={`appearance-none block w-full pl-10 pr-10 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ef126e] focus:border-[#ef126e] sm:text-sm`} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#ef126e] focus:ring-[#ef126e] border-gray-300 rounded" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-[#ef126e] hover:text-[#d01060]">
                    Forgot password?
                  </a>
                </div>
              </div>
            </> : <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Two-Factor Authentication Code
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Please enter the 6-digit code sent to your device
              </p>
              <input id="otp" name="otp" type="text" maxLength={6} className={`appearance-none block w-full px-3 py-2 border ${errors.otp ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#ef126e] focus:border-[#ef126e] sm:text-sm`} placeholder="123456" value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} />
              {errors.otp && <p className="mt-1 text-sm text-red-600">{errors.otp}</p>}
            </div>}
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ef126e] hover:bg-[#d01060] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef126e] transition-colors duration-200 disabled:opacity-70">
              {isLoading ? 'Loading...' : otpEnabled ? 'Verify' : 'Sign in'}
            </button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <button type="button" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef126e]">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                </g>
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>;
}