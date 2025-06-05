import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCalendar, FiEye, FiEyeOff, FiCamera, FiCheck, FiX, FiEdit2, FiSave } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { debounce } from 'lodash';
import { useDarkMode } from '../../contexts/DarkModeContext';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import Label from "../../components/ui/label";
import Textarea from "../../components/ui/textarea";
import Separator from "../../components/ui/separator";

const Profile = memo(() => {
  const { user, updateProfile, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthdate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Validate password strength
  const validatePassword = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email) errors.email = 'Please enter an email';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email';
    if (formData.phone && !/^[\d\s-+()]+$/.test(formData.phone)) errors.phone = 'Invalid phone';
    if (showChangePassword) {
      if (!formData.currentPassword) errors.currentPassword = 'Current password is required';
      if (!formData.newPassword) errors.newPassword = 'New password is required';
      else if (formData.newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters';
      if (formData.newPassword !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  // Calculate progress
  useEffect(() => {
    const calculateProgress = () => {
      let filledFields = 0;
      const totalFields = 5; // name, email, phone, address, birthdate
      if (formData.name.trim()) filledFields++;
      if (formData.email) filledFields++;
      if (formData.phone) filledFields++;
      if (formData.address) filledFields++;
      if (formData.birthdate) filledFields++;
      setProgress(Math.round((filledFields / totalFields) * 100));
    };
    calculateProgress();
  }, [formData]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        birthdate: user.birthdate || '',
        avatar: user.avatar || '',
      }));
    }
  }, [user]);

  // Update password strength
  useEffect(() => {
    if (formData.newPassword) {
      setPasswordStrength(validatePassword(formData.newPassword));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.newPassword]);

  // Autosave to localStorage
  useEffect(() => {
    const debouncedSave = debounce(() => {
      localStorage.setItem('profileFormData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        birthdate: formData.birthdate,
      }));
    }, 500);
    debouncedSave();
    return () => debouncedSave.cancel();
  }, [formData.name, formData.email, formData.phone, formData.address, formData.birthdate]);

  // Load saved form data
  useEffect(() => {
    const savedData = localStorage.getItem('profileFormData');
    if (savedData) {
      setFormData((prev) => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  // Debounced input handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  // Avatar handling
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatar(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processAvatar(file);
    }
  };

  const processAvatar = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or GIF image.');
      return;
    }
    if (file.size > maxSize) {
      toast.error('Image size must be less than 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, avatar: reader.result }));
      toast.success('Avatar updated locally. Save changes to confirm.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Are you sure you want to remove your avatar?')) {
      setFormData((prev) => ({ ...prev, avatar: '' }));
      toast.success('Avatar removed locally.');
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }
    setLoading(true);
    try {
      if (typeof updateProfile !== 'function') {
        console.warn('updateProfile is not a function. Check AuthContext implementation.');
        toast.error('Profile update is not available. Please try again later.');
        return;
      }
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        birthdate: formData.birthdate,
        avatar: formData.avatar,
      });
      toast.success('Profile updated successfully!');
      localStorage.removeItem('profileFormData');
      setIsEditing(false);
    } catch (err) {
      const errorMsg = err.message || 'Failed to update profile. Please try again.';
      toast.error(errorMsg);
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
      setFormErrors(errors);
      Object.values(errors).forEach((err) => toast.error(err));
      return;
    }
    if (!window.confirm('Are you sure you want to change your password?')) return;
    setLoading(true);
    try {
      if (typeof updateProfile !== 'function') {
        console.warn('updateProfile is not a function. Check AuthContext implementation.');
        toast.error('Password change is not available. Please try again later.');
        return;
      }
      await updateProfile({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setShowChangePassword(false);
    } catch (err) {
      const errorMsg = err.message || 'Failed to change password. Please try again.';
      toast.error(errorMsg);
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all changes?')) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        birthdate: user?.birthdate || '',
        avatar: user?.avatar || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setFormErrors({});
      localStorage.removeItem('profileFormData');
      toast.success('Form reset successfully.');
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      toast.success('Logged out successfully.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-surface">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-t-green-500 border-gray-200 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-200 ${
      isDarkMode ? 'bg-dark-surface text-dark-text-primary' : 'bg-gray-50 text-gray-800'
    }`}>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Card className={isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className={`text-2xl font-bold ${
              isDarkMode ? 'text-dark-text-primary' : 'text-gray-800'
            }`}>Profile Settings</CardTitle>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isDarkMode ? "secondary" : "outline"}
              className="flex items-center gap-2"
            >
              {isEditing ? (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>Save</span>
                </>
              ) : (
                <>
                  <FiEdit2 className="w-4 h-4" />
                  <span>Edit</span>
                </>
              )}
            </Button>
          </CardHeader>
          <Separator className={isDarkMode ? 'bg-dark-border' : ''} />
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'cursor-not-allowed opacity-75' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'cursor-not-allowed opacity-75' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={!isEditing ? 'cursor-not-allowed opacity-75' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={3}
                    className={!isEditing ? 'cursor-not-allowed opacity-75' : ''}
                  />
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              Logout
            </Button>
            {showChangePassword ? (
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel Password Change
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
            )}
          </CardFooter>
        </Card>

        {showChangePassword && (
          <Card className={`mt-6 ${isDarkMode ? 'bg-dark-surface-secondary border-dark-border' : ''}`}>
            <CardHeader>
              <CardTitle className={isDarkMode ? 'text-dark-text-primary' : ''}>
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <div className="mt-2 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < passwordStrength
                            ? 'bg-green-500'
                            : isDarkMode
                            ? 'bg-dark-border'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="default"
                className="bg-green-500 hover:bg-green-600"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </motion.div>
    </div>
  );
});

export default Profile; 