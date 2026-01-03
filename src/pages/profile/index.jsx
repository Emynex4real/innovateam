import React, { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  User, Mail, Phone, MapPin, Edit2, Save, Camera, 
  Shield, Key, Lock, CheckCircle 
} from 'lucide-react';
import supabase from '../../config/supabase';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // --- Logic: Load User Data ---
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.user_metadata?.full_name || user?.email || '',
        email: user.email || '',
        phone: user?.user_metadata?.phone || '',
        address: user?.user_metadata?.address || '',
        newPassword: '',
        confirmPassword: '',
      });
      setAvatarUrl(user?.user_metadata?.avatar_url || '');
    }
  }, [user]);

  // --- Logic: Handlers (Same functionality, preserved) ---
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('profiles').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
      const { error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      toast.success('Avatar updated successfully!');
    } catch (error) { toast.error('Failed to upload avatar: ' + error.message); } 
    finally { setUploading(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) { toast.error('Name and email are required'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.name, phone: formData.phone, address: formData.address }
      });
      if (error) throw error;

      await supabase.from('user_profiles').upsert({
        id: user.id,
        full_name: formData.name,
        phone: formData.phone,
        address: formData.address,
        updated_at: new Date().toISOString()
      });

      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) { toast.error('Failed to update profile: ' + err.message); } 
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!formData.newPassword) { toast.error('Please enter new password'); return; }
    if (formData.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (formData.newPassword !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.newPassword });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
      setShowChangePassword(false);
    } catch (err) { toast.error('Failed to change password: ' + err.message); } 
    finally { setLoading(false); }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 h-48 shadow-lg">
           <div className="absolute inset-0 bg-black/10"></div>
           <div className="absolute bottom-4 left-8 text-white">
              <h1 className="text-3xl font-bold">My Profile</h1>
              <p className="text-green-100 opacity-90">Manage your personal information</p>
           </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-16 relative z-10 px-4">
           
           {/* Left Column: Avatar & Basic Info */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-lg overflow-visible">
                 <CardContent className="pt-0 pb-6 px-6 flex flex-col items-center">
                    {/* Avatar with Upload */}
                    <div className="relative -mt-16 mb-4 group">
                       <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-800 shadow-md flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="h-12 w-12 text-gray-300" />
                          )}
                       </div>
                       <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition-colors">
                          {uploading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
                       </label>
                       <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploading} />
                    </div>

                    <h2 className="text-xl font-bold text-center">{formData.name || 'User'}</h2>
                    <p className="text-sm text-gray-500 mb-6">{formData.email}</p>

                    <div className="w-full space-y-3">
                       <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <Shield className="w-4 h-4 text-green-500" />
                          <span>Student Account</span>
                          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Active</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Email Verified</span>
                       </div>
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Right Column: Edit Forms */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Personal Information Card */}
              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                 <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                       <User className="w-5 h-5 text-green-500" /> Personal Details
                    </h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditing(!isEditing)}
                      className={isEditing ? 'text-green-600 bg-green-50' : 'text-gray-500'}
                    >
                       {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                       {isEditing ? 'Save Changes' : 'Edit Profile'}
                    </Button>
                 </div>
                 
                 <CardContent className="p-6">
                    <form onSubmit={handleSubmit}>
                       <fieldset disabled={!isEditing} className="space-y-4 group-disabled:opacity-70">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                   <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                   <Input id="name" name="name" value={formData.name} onChange={handleChange} className="pl-10 focus-visible:ring-green-500" placeholder="John Doe" />
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                   <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                   <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className="pl-10 focus-visible:ring-green-500" placeholder="+234..." />
                                </div>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <Label htmlFor="email">Email Address</Label>
                             <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input id="email" name="email" type="email" value={formData.email} disabled className="pl-10 bg-gray-50 dark:bg-gray-900 cursor-not-allowed" />
                             </div>
                             <p className="text-[10px] text-gray-400">Email cannot be changed.</p>
                          </div>

                          <div className="space-y-2">
                             <Label htmlFor="address">Address</Label>
                             <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Textarea id="address" name="address" value={formData.address} onChange={handleChange} className="pl-10 focus-visible:ring-green-500 min-h-[80px]" placeholder="Your address..." />
                             </div>
                          </div>

                          {isEditing && (
                             <div className="pt-2 flex justify-end">
                                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                                   {loading ? 'Saving...' : 'Save Changes'}
                                </Button>
                             </div>
                          )}
                       </fieldset>
                    </form>
                 </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="border border-gray-100 dark:border-gray-800 shadow-sm">
                 <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                       <Lock className="w-5 h-5 text-orange-500" /> Security
                    </h3>
                 </div>
                 <CardContent className="p-6">
                    {!showChangePassword ? (
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="font-medium">Password</p>
                             <p className="text-sm text-gray-500">Last changed recently</p>
                          </div>
                          <Button variant="outline" onClick={() => setShowChangePassword(true)} className="border-gray-200">
                             Change Password
                          </Button>
                       </div>
                    ) : (
                       <form onSubmit={handlePasswordChange} className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                          <div className="space-y-2">
                             <Label htmlFor="newPassword">New Password</Label>
                             <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} className="pl-10 focus-visible:ring-green-500" placeholder="••••••••" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label htmlFor="confirmPassword">Confirm Password</Label>
                             <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="pl-10 focus-visible:ring-green-500" placeholder="••••••••" />
                             </div>
                          </div>
                          <div className="flex gap-3 pt-2">
                             <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white flex-1">
                                {loading ? 'Updating...' : 'Update Password'}
                             </Button>
                             <Button type="button" variant="ghost" onClick={() => setShowChangePassword(false)} className="flex-1">
                                Cancel
                             </Button>
                          </div>
                       </form>
                    )}
                 </CardContent>
              </Card>

           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;