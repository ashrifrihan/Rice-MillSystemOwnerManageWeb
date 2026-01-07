import React, { useState, useEffect } from 'react';
import { rtdb as db } from '../firebase/config';
import { ref, onValue, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { seedDatabase } from '../utils/seedDatabase';
import { checkDatabaseData } from '../utils/checkDatabaseData';
import { 
  SaveIcon, 
  BellIcon, 
  ShieldIcon, 
  UserIcon, 
  BuildingIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  XIcon,
  DatabaseIcon,
  RefreshCwIcon,
  SearchIcon
} from 'lucide-react';

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  
  // State for form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    orderNotifications: true,
    inventoryNotifications: true,
    deliveryNotifications: true,
    loanNotifications: true
  });
  
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [saveStatus, setSaveStatus] = useState({
    message: '',
    type: '' // 'success' or 'error'
  });
  
  const [isSeeding, setIsSeeding] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);
  
  // Check database function
  const handleCheckDatabase = async () => {
    setIsChecking(true);
    toast.loading('Checking database...');
    
    try {
      const result = await checkDatabaseData();
      toast.dismiss();
      
      if (result.error) {
        toast.error('Error checking database');
        setDataStatus(result);
      } else {
        const totalItems = Object.values(result).reduce((sum, item) => sum + (item.count || 0), 0);
        toast.success(`Found ${totalItems} total items across all collections`);
        setDataStatus(result);
        
        // Show detailed results
        console.log('Database Status:', result);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error checking database');
      setDataStatus({ error: error.message });
    } finally {
      setIsChecking(false);
    }
  };
  
  // Seed database function
  const handleSeedDatabase = async () => {
    if (!window.confirm('This will add sample data to your database if it\'s empty. Continue?')) {
      return;
    }
    
    setIsSeeding(true);
    toast.loading('Seeding database...');
    
    try {
      const result = await seedDatabase();
      toast.dismiss();
      
      if (result.success) {
        toast.success(result.message);
        setSaveStatus({
          message: 'Database seeded successfully! Refresh pages to see data.',
          type: 'success'
        });
        setTimeout(() => setSaveStatus({ message: '', type: '' }), 5000);
        
        // Auto-check after seeding
        setTimeout(() => handleCheckDatabase(), 1000);
      } else {
        toast.error(result.error || 'Failed to seed database');
        setSaveStatus({
          message: result.error || 'Failed to seed database',
          type: 'error'
        });
        setTimeout(() => setSaveStatus({ message: '', type: '' }), 5000);
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error seeding database');
      setSaveStatus({
        message: 'Error seeding database: ' + error.message,
        type: 'error'
      });
      setTimeout(() => setSaveStatus({ message: '', type: '' }), 5000);
    } finally {
      setIsSeeding(false);
    }
  };
  
  // Load settings from Firebase
  useEffect(() => {
    if (!user?.uid) return;
    
    setLoading(true);
    const userRef = ref(db, `users/${user.uid}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Parse full name into first and last name
        let firstName = data?.firstName || '';
        let lastName = data?.lastName || '';
        
        if (!firstName || !lastName) {
          const fullName = data?.name || '';
          const nameParts = fullName.trim().split(' ');
          if (!firstName) firstName = nameParts[0] || '';
          if (!lastName) lastName = nameParts.slice(1).join(' ') || '';
        }
        
        // Load profile data
        setProfileData({
          firstName: firstName,
          lastName: lastName,
          email: data?.email || user?.email || '',
          phone: data?.phone || data?.contact || ''
        });
        
        // Load business data
        setBusinessData({
          businessName: data?.businessName || data?.millName || '',
          gstNumber: data?.gstNumber || '',
          panNumber: data?.panNumber || '',
          businessAddress: data?.businessAddress || data?.address || ''
        });
        
        // Load notification settings
        if (data?.notificationSettings) {
          setNotificationSettings(data.notificationSettings);
        }
        
        // Load security settings (except passwords)
        if (data?.securitySettings) {
          setSecurityData(prev => ({
            ...prev,
            twoFactorEnabled: data.securitySettings.twoFactorEnabled || false
          }));
        }
      }
      setLoading(false);
    }, (error) => {
      console.error('Firebase error:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);

  // Handle input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
  };
  
  const toggleTwoFactor = () => {
    setSecurityData(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  };
  
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };
  
  // Save settings
  const saveSettings = async () => {
    if (!user?.uid) return;
    
    try {
      toast.loading('Saving settings...');
      
      const userRef = ref(db, `users/${user.uid}`);
      const updates = {};
      
      // Save profile data
      updates.firstName = profileData.firstName;
      updates.lastName = profileData.lastName;
      updates.email = profileData.email;
      updates.phone = profileData.phone;
      updates.name = `${profileData.firstName} ${profileData.lastName}`;
      updates.contact = profileData.phone;
      
      // Save business data
      updates.businessName = businessData.businessName;
      updates.millName = businessData.businessName;
      updates.gstNumber = businessData.gstNumber;
      updates.panNumber = businessData.panNumber;
      updates.businessAddress = businessData.businessAddress;
      updates.address = businessData.businessAddress;
      
      // Save notification settings
      updates.notificationSettings = notificationSettings;
      
      // Save security settings (two-factor only, passwords are sensitive)
      updates.securitySettings = {
        twoFactorEnabled: securityData.twoFactorEnabled
      };
      
      updates.updatedAt = new Date().toISOString();
      
      await update(userRef, updates);
      
      toast.dismiss();
      setSaveStatus({
        message: 'Settings saved successfully!',
        type: 'success'
      });
      
      // Clear password fields after save
      resetPasswordFields();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.dismiss();
      setSaveStatus({
        message: 'Failed to save settings',
        type: 'error'
      });
      
      setTimeout(() => {
        setSaveStatus({ message: '', type: '' });
      }, 3000);
    }
  };
  
  // Reset password fields
  const resetPasswordFields = () => {
    setSecurityData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-500">Loading settings...</p>
          </div>
        )}
        
        {!loading && (
          <>
            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px">
              <button 
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} 
                onClick={() => setActiveTab('profile')}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </button>
              <button 
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'business' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} 
                onClick={() => setActiveTab('business')}
              >
                <BuildingIcon className="h-4 w-4 mr-2" />
                Business
              </button>
              <button 
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'notifications' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} 
                onClick={() => setActiveTab('notifications')}
              >
                <BellIcon className="h-4 w-4 mr-2" />
                Notifications
              </button>
              <button 
                className={`py-4 px-6 text-sm font-medium flex items-center ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`} 
                onClick={() => setActiveTab('security')}
              >
                <ShieldIcon className="h-4 w-4 mr-2" />
                Security
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Save Status Message */}
            {saveStatus.message && (
              <div className={`mb-6 p-4 rounded-lg ${saveStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <div className="flex items-center">
                  {saveStatus.type === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
                  {saveStatus.message}
                </div>
              </div>
            )}
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-500" />
                    Profile Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your account's profile information.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Business Tab */}
            {activeTab === 'business' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BuildingIcon className="h-5 w-5 mr-2 text-green-500" />
                    Business Information
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your business details.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                  <div className="sm:col-span-4">
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                      Business name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      value={businessData.businessName}
                      onChange={handleBusinessChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      id="gstNumber"
                      name="gstNumber"
                      value={businessData.gstNumber}
                      onChange={handleBusinessChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      id="panNumber"
                      name="panNumber"
                      value={businessData.panNumber}
                      onChange={handleBusinessChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Address
                    </label>
                    <textarea
                      id="businessAddress"
                      name="businessAddress"
                      rows={3}
                      value={businessData.businessAddress}
                      onChange={handleBusinessChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Database Seeding Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-2">
                    <DatabaseIcon className="h-5 w-5 mr-2 text-indigo-500" />
                    Database Management
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Check database status and initialize with sample data if needed.
                  </p>
                  
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={handleCheckDatabase}
                      disabled={isChecking}
                      className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm ${
                        isChecking 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isChecking ? (
                        <>
                          <RefreshCwIcon className="animate-spin h-4 w-4 mr-2" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <SearchIcon className="h-4 w-4 mr-2" />
                          Check Database
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleSeedDatabase}
                      disabled={isSeeding}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${
                        isSeeding 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isSeeding ? (
                        <>
                          <RefreshCwIcon className="animate-spin h-4 w-4 mr-2" />
                          Seeding...
                        </>
                      ) : (
                        <>
                          <DatabaseIcon className="h-4 w-4 mr-2" />
                          Seed Database
                        </>
                      )}
                    </button>
                  </div>
                  
                  {dataStatus && !dataStatus.error && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">Database Status:</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {Object.entries(dataStatus).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                            <span className={`font-semibold ${value.exists ? 'text-green-600' : 'text-red-600'}`}>
                              {value.exists ? `✓ ${value.count} items` : '✗ Empty'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {dataStatus && dataStatus.error && (
                    <div className="bg-red-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-700">Error: {dataStatus.error}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    💡 Click "Check Database" first to see current data status, then "Seed Database" to add sample data if needed.
                  </p>
                </div>
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-yellow-500" />
                    Notification Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Configure how you want to receive notifications.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Notification Channels</h4>
                  
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center h-5">
                      <input
                        id="emailNotifications"
                        name="emailNotifications"
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-gray-500">Receive notifications via email.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center h-5">
                      <input
                        id="smsNotifications"
                        name="smsNotifications"
                        type="checkbox"
                        checked={notificationSettings.smsNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="smsNotifications" className="font-medium text-gray-700">
                        SMS Notifications
                      </label>
                      <p className="text-gray-500">Receive notifications via SMS.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center h-5">
                      <input
                        id="pushNotifications"
                        name="pushNotifications"
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="pushNotifications" className="font-medium text-gray-700">
                        Push Notifications
                      </label>
                      <p className="text-gray-500">Receive push notifications on your device.</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700">Notification Types</h4>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        id="orderNotifications"
                        name="orderNotifications"
                        type="checkbox"
                        checked={notificationSettings.orderNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="orderNotifications" className="ml-3 text-sm font-medium text-gray-700">
                        Order Updates
                      </label>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        id="inventoryNotifications"
                        name="inventoryNotifications"
                        type="checkbox"
                        checked={notificationSettings.inventoryNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="inventoryNotifications" className="ml-3 text-sm font-medium text-gray-700">
                        Inventory Alerts
                      </label>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        id="deliveryNotifications"
                        name="deliveryNotifications"
                        type="checkbox"
                        checked={notificationSettings.deliveryNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="deliveryNotifications" className="ml-3 text-sm font-medium text-gray-700">
                        Delivery Updates
                      </label>
                    </div>
                    
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <input
                        id="loanNotifications"
                        name="loanNotifications"
                        type="checkbox"
                        checked={notificationSettings.loanNotifications}
                        onChange={handleNotificationChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="loanNotifications" className="ml-3 text-sm font-medium text-gray-700">
                        Loan Reminders
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <ShieldIcon className="h-5 w-5 mr-2 text-red-500" />
                    Security Settings
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your security preferences.
                  </p>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Change Password</h4>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? "text" : "password"}
                            id="currentPassword"
                            name="currentPassword"
                            value={securityData.currentPassword}
                            onChange={handleSecurityChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('current')}
                          >
                            {showPassword.current ? (
                              <EyeOffIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? "text" : "password"}
                            id="newPassword"
                            name="newPassword"
                            value={securityData.newPassword}
                            onChange={handleSecurityChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('new')}
                          >
                            {showPassword.new ? (
                              <EyeOffIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? "text" : "password"}
                            id="confirmPassword"
                            name="confirmPassword"
                            value={securityData.confirmPassword}
                            onChange={handleSecurityChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => togglePasswordVisibility('confirm')}
                          >
                            {showPassword.confirm ? (
                              <EyeOffIcon className="h-5 w-5 text-gray-400" />
                            ) : (
                              <EyeIcon className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Two-Factor Authentication</h4>
                    <div className="mt-4 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          securityData.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                        onClick={toggleTwoFactor}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            securityData.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Login Sessions</h4>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Sign Out All Other Sessions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {activeTab === 'security' && securityData.newPassword && (
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700"
                  onClick={resetPasswordFields}
                >
                  Clear password fields
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                onClick={saveSettings}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}