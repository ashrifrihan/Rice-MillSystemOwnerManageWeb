// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Eye, EyeOff, User, Mail, Lock, Building, 
  Phone, MapPin, AlertCircle, CheckCircle,
  Shield, Factory, Truck, Package,
  ArrowRight
} from "lucide-react";
import PopupAlert from "../components/ui/PopupAlert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  const [popupAlert, setPopupAlert] = useState({ isOpen: false, type: 'success', title: '', message: '', details: [] });
  
  const [registrationData, setRegistrationData] = useState({
    // Owner Details
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    
    // Mill Details
    mill_name: "",
    business_name: "",
    address: "",
    mill_phone: "",
    mill_email: "",
    mill_type: "rice_mill",
    capacity: "medium"
  });

  const navigate = useNavigate();
  const { loginOwner, registerOwner } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Login Error',
        message: 'Please enter both email and password.',
        details: []
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginOwner(email, password);
      
      if (result.success) {
        setSuccess(`Welcome, ${result.user.name}! Redirecting to your mill dashboard...`);
        setPopupAlert({
          isOpen: true,
          type: 'success',
          title: 'Login Successful',
          message: `Welcome, ${result.user.name}! Redirecting to your dashboard.`,
          details: []
        });
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(result.message || "Login failed");
        setPopupAlert({
          isOpen: true,
          type: 'error',
          title: 'Login Failed',
          message: result.message || 'Could not log you in.',
          details: []
        });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("System error. Please try again.");
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'System Error',
        message: 'Please try again shortly.',
        details: [err.message || 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (registrationData.password !== registrationData.confirmPassword) {
      setError("Passwords do not match");
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Registration Error',
        message: 'Passwords do not match.',
        details: []
      });
      return;
    }

    if (registrationData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Registration Error',
        message: 'Password must be at least 6 characters.',
        details: []
      });
      return;
    }

    if (!registrationData.mill_name || !registrationData.business_name) {
      setError("Mill name and business name are required");
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'Registration Error',
        message: 'Mill and business names are required.',
        details: []
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerOwner(
        registrationData.email,
        registrationData.password,
        {
          name: registrationData.name,
          phone: registrationData.phone
        },
        {
          mill_name: registrationData.mill_name,
          business_name: registrationData.business_name,
          address: registrationData.address,
          phone: registrationData.mill_phone || registrationData.phone,
          email: registrationData.mill_email || registrationData.email,
          mill_type: registrationData.mill_type,
          capacity: registrationData.capacity
        }
      );

      if (result.success) {
        setSuccess("Mill owner account created successfully! Setting up your dashboard...");
        setPopupAlert({
          isOpen: true,
          type: 'success',
          title: 'Registration Successful',
          message: 'Account created. Redirecting to your dashboard...',
          details: []
        });
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        setError(result.message || "Registration failed");
        setPopupAlert({
          isOpen: true,
          type: 'error',
          title: 'Registration Failed',
          message: result.message || 'Could not create your account.',
          details: []
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("System error. Please try again.");
      setPopupAlert({
        isOpen: true,
        type: 'error',
        title: 'System Error',
        message: 'Please try again shortly.',
        details: [err.message || 'Unknown error']
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (ownerEmail, ownerName) => {
    setEmail(ownerEmail);
    setPassword("password123");
    setShowRegistration(false);
    
    // Auto-submit
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true });
      const form = document.querySelector('form');
      if (form) form.dispatchEvent(event);
    }, 100);
  };

  const prefillOwner = (ownerEmail, ownerName) => {
    setEmail(ownerEmail);
    setPassword("password123");
    setError("");
    setSuccess(`Prefilled ${ownerName}'s credentials`);
    setShowRegistration(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Left Section - Mill Hero */}
      <div className="lg:w-1/2 bg-gradient-to-br from-blue-700 to-cyan-700 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <div className="mb-10">
            <div className="flex justify-center mb-8">
              <div className="h-24 w-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20">
                <Factory className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 text-center">
              Rice Mill Pro
            </h1>
            <p className="text-xl text-blue-100 text-center">
              Premium Management System for Rice Mill Owners
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Mill Owner Features</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  Complete Mill Management Dashboard
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  Inventory & Stock Tracking
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  Order Processing & Billing
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  Dealer & Customer Management
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  Production & Quality Control
                </li>
                <li className="flex items-center text-blue-100">
                  <div className="w-2 h-2 bg-blue-300 rounded-full mr-3"></div>
                  Financial Reports & Analytics
                </li>
              </ul>
            </div>
            
            <div className="text-blue-200 text-sm text-center">
              <p className="font-semibold">Enterprise Grade Solution</p>
              <p>Trusted by rice mills across the country</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login/Registration Form */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10 border border-gray-100">
            {/* Toggle Header */}
            <div className="flex mb-8 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setShowRegistration(false)}
                className={`flex-1 py-3 font-semibold text-center ${!showRegistration ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Shield className="inline h-5 w-5 mr-2" />
                Owner Login
              </button>
              <button
                type="button"
                onClick={() => setShowRegistration(true)}
                className={`flex-1 py-3 font-semibold text-center ${showRegistration ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Building className="inline h-5 w-5 mr-2" />
                Register Mill
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <div className="font-semibold">Error</div>
                </div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <div className="font-semibold">Success</div>
                </div>
                <div className="text-sm mt-1">{success}</div>
              </div>
            )}

            {/* Login Form */}
            {!showRegistration ? (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Mill Owner Portal
                  </h2>
                  <p className="text-gray-600 mt-2">Access your mill management dashboard</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Owner Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                      placeholder="owner@ricemill.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Lock className="inline h-4 w-4 mr-1" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError("");
                        }}
                        className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300"
                        placeholder="Enter password"
                        required
                        minLength="6"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="font-semibold">Default password for demo:</span> password123
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Accessing Mill Dashboard...
                      </>
                    ) : (
                      <>
                        <Factory className="h-5 w-5 mr-2" />
                        Access Mill Dashboard
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Registration Form */
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Register Your Rice Mill
                  </h2>
                  <p className="text-gray-600 mt-2">Setup your mill management system</p>
                </div>

                <form onSubmit={handleRegistrationSubmit} className="space-y-6">
                  {/* Owner Details */}
                  <div className="bg-blue-50 p-4 rounded-2xl">
                    <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Owner Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={registrationData.name}
                          onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="Your full name"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={registrationData.email}
                          onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="owner@yourmill.com"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password *
                          </label>
                          <input
                            type="password"
                            value={registrationData.password}
                            onChange={(e) => setRegistrationData({...registrationData, password: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Min 6 characters"
                            required
                            minLength="6"
                            disabled={isLoading}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm Password *
                          </label>
                          <input
                            type="password"
                            value={registrationData.confirmPassword}
                            onChange={(e) => setRegistrationData({...registrationData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Confirm password"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Phone className="inline h-4 w-4 mr-1" />
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={registrationData.phone}
                          onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                          placeholder="+1234567890"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mill Details */}
                  <div className="bg-cyan-50 p-4 rounded-2xl">
                    <h3 className="font-bold text-cyan-800 mb-3 flex items-center">
                      <Factory className="h-5 w-5 mr-2" />
                      Mill Details
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Mill Name *
                        </label>
                        <input
                          type="text"
                          value={registrationData.mill_name}
                          onChange={(e) => setRegistrationData({...registrationData, mill_name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="Premium Rice Mill"
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          value={registrationData.business_name}
                          onChange={(e) => setRegistrationData({...registrationData, business_name: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="ABC Rice Mills Pvt. Ltd."
                          required
                          disabled={isLoading}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Mill Address
                        </label>
                        <textarea
                          value={registrationData.address}
                          onChange={(e) => setRegistrationData({...registrationData, address: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="Full address of your rice mill"
                          rows="2"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mill Type
                          </label>
                          <select
                            value={registrationData.mill_type}
                            onChange={(e) => setRegistrationData({...registrationData, mill_type: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            disabled={isLoading}
                          >
                            <option value="rice_mill">Rice Mill</option>
                            <option value="flour_mill">Flour Mill</option>
                            <option value="combined">Combined Mill</option>
                            <option value="processing_unit">Processing Unit</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Capacity
                          </label>
                          <select
                            value={registrationData.capacity}
                            onChange={(e) => setRegistrationData({...registrationData, capacity: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            disabled={isLoading}
                          >
                            <option value="small">Small (1-5 tons/day)</option>
                            <option value="medium">Medium (5-20 tons/day)</option>
                            <option value="large">Large (20+ tons/day)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Setting Up Your Mill...
                      </>
                    ) : (
                      <>
                        <Factory className="h-5 w-5 mr-2" />
                        Register & Setup Mill
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Already have a mill account?{' '}
                    <button
                      type="button"
                      onClick={() => setShowRegistration(false)}
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      Login here
                    </button>
                  </p>
                </div>
              </>
            )}

            {/* System Info */}
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-2xl">
              <div className="flex items-center">
                <div className="flex-1">
                  <h4 className="font-bold text-blue-800">Premium Mill Management</h4>
                  <p className="text-sm text-blue-600">
                    Complete system for rice mill owners • Production • Inventory • Sales
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                    ENTERPRISE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PopupAlert
        isOpen={popupAlert.isOpen}
        type={popupAlert.type}
        title={popupAlert.title}
        message={popupAlert.message}
        details={popupAlert.details}
        onClose={() => setPopupAlert(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default Login;