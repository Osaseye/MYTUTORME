// @ts-nocheck
import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import type { StudentProfile } from '@/types/user';
import { db, storage, auth } from '@/lib/firebase';

import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Lock, GraduationCap, Upload, ShieldCheck, Loader2, CreditCard, Smartphone, ChevronRight, Moon, MessageSquare, ArrowLeft, LogOut } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PaymentModal } from '@/components/shared/PaymentModal';
import { PWAInstallPopup } from '@/components/shared/PWAInstallPopup';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/app/routes/paths';

  export const SettingsPage = () => {
    const { user, setUser, signOut } = useAuthStore();
    const studentProfile = user as StudentProfile;
    const navigate = useNavigate();

    // Normalize legacy plans from earlier webhook payload
      const normalizedPlan = studentProfile?.plan === 'monthly' ? 'pro_monthly' : studentProfile?.plan === 'yearly' ? 'pro_yearly' : (studentProfile?.plan || 'free');

  const [isSaving, setIsSaving] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<'pro_monthly' | 'pro_yearly' | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  // @ts-ignore: used eventually or just tracking loading state locally
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    timezone: '',
    educationLevel: 'secondary',
    institution: '',
    major: '',
    gradingSystem: '5.0',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const storageRef = ref(storage, `profiles/${user?.uid}/photo_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          console.error(error);
          toast.error("Failed to upload image");
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
          }
          if (user?.uid) {
            await updateDoc(doc(db, 'users', user.uid), { photoURL: downloadURL });
          }
          setUser({ ...user!, photoURL: downloadURL });
          toast.success("Profile photo updated");
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile photo");
      setIsUploading(false);
    }
  };

  // Mobile specific state
  const [mobileView, setMobileView] = useState<'menu' | 'profile' | 'academic' | 'security' | 'notifications' | 'subscription' | 'app'>('menu');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      setIsDarkMode(false);
      localStorage.theme = 'light';
    } else {
      html.classList.add('dark');
      setIsDarkMode(true);
      localStorage.theme = 'dark';
    }
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || '',
        phone: (user as any).phone || '',
        timezone: (user as any).timezone || '',
        educationLevel: (user as any).educationLevel || 'secondary',
        institution: (user as any).institution || '',
        major: (user as any).major || '',
        gradingSystem: (user as any).gradingSystem || '5.0',
      }));
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user || (!auth.currentUser)) return;
    setIsSaving(true);
    try {
      if (formData.displayName !== user.displayName) {
         await updateProfile(auth.currentUser, { displayName: formData.displayName });
      }
      await updateDoc(doc(db, 'users', user.uid), { ...formData });
      setUser({ ...user, ...formData, displayName: formData.displayName });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || !user?.email) return;
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update password. Please check your current password.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePlan = (plan: string) => {
    if (plan === 'free') {
       executePlanChange('free', 'none');
    } else {
       setSelectedPlanForPayment(plan as 'pro_monthly' | 'pro_yearly');
       setIsPaymentModalOpen(true);
    }
  };

  const executePlanChange = async (plan: string, provider: string) => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
       await updateDoc(doc(db, 'users', user.uid), { plan, provider });
       setUser({ ...user, plan } as any);
       toast.success(`Plan updated to ${plan}`);
    } catch (e) {
       console.error(e);
       toast.error('Failed to update subscription');
    } finally {
       setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-4 md:py-8 px-4 md:px-8">
      {/* Mobile Menu View */}
      {mobileView === 'menu' && (
        <div className="block md:hidden space-y-6 pb-20">
          <div className="flex items-center gap-4 mb-6">
             <Button variant="ghost" size="icon" onClick={() => window.history.back()}><ArrowLeft className="h-5 w-5" /></Button>
             <h1 className="text-xl font-bold">Settings</h1>
          </div>
          
          <div 
            onClick={() => setMobileView('profile')}
            className="flex items-center justify-between p-4 bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-slate-800 rounded-[20px] cursor-pointer shadow-sm mb-6"
          >
             <div className="flex items-center gap-4">
                 <Avatar className="h-12 w-12 border-2 border-slate-50 dark:border-slate-800">
                    <AvatarImage src={studentProfile?.photoURL || ''} alt="Profile" />
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">{studentProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                 </Avatar>
                 <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">{studentProfile?.displayName || 'Student'}</h3>
                    <p className="text-sm text-slate-500 font-medium">Student</p>
                 </div>
             </div>
             <ChevronRight className="h-5 w-5 text-slate-400" />
          </div>
          
          <div className="mb-2">
             <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider ml-1 mb-2">Other settings</p>
             <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                 {[
                   { icon: Lock, label: "Password", view: 'security' },
                   { icon: Bell, label: "Notifications", view: 'notifications' },
                 ].map((item, idx) => (
                   <div 
                     key={idx} 
                     onClick={() => setMobileView(item.view as any)}
                     className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${idx !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
                   >
                     <div className="flex items-center gap-3">
                       <item.icon className="h-[18px] w-[18px] text-slate-700 dark:text-slate-300" />
                       <span className="text-slate-900 dark:text-slate-100 text-[15px] font-medium">{item.label}</span>
                     </div>
                     <ChevronRight className="h-5 w-5 text-slate-400" />
                   </div>
                 ))}
                 <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex items-center gap-3">
                       <Moon className="h-[18px] w-[18px] text-slate-700 dark:text-slate-300" />
                       <span className="text-slate-900 dark:text-slate-100 text-[15px] font-medium">Dark mode</span>
                     </div>
                     <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                 </div>
             </div>
          </div>
          
          <div className="mt-6 mb-2">
             <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                 {[
                   { icon: GraduationCap, label: "Academic", onClick: () => setMobileView('academic') },
                   { icon: CreditCard, label: "Subscription", onClick: () => setMobileView('subscription') },
                   { icon: Smartphone, label: "App installation", onClick: () => setMobileView('app') },
                   { icon: MessageSquare, label: "Help/FAQ", onClick: () => navigate(paths.support) },
                 ].map((item, idx) => (
                   <div 
                     key={idx} 
                     onClick={item.onClick}
                     className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${idx !== 0 ? 'border-t border-slate-100 dark:border-slate-800' : ''}`}
                   >
                     <div className="flex items-center gap-3">
                       <item.icon className="h-[18px] w-[18px] text-slate-700 dark:text-slate-300" />
                       <span className="text-slate-900 dark:text-slate-100 text-[15px] font-medium">{item.label}</span>
                     </div>
                     <ChevronRight className="h-5 w-5 text-slate-400" />
                   </div>
                 ))}
                 <div 
                   onClick={async () => {
                     await signOut();
                     navigate(paths.auth.login);
                   }}
                   className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 group"
                 >
                     <div className="flex items-center gap-3">
                       <LogOut className="h-[18px] w-[18px] text-red-500 group-hover:text-red-600 transition-colors" />
                       <span className="text-red-500 group-hover:text-red-600 text-[15px] font-medium transition-colors">Logout</span>
                     </div>
                     <ChevronRight className="h-5 w-5 text-red-300 group-hover:text-red-400 transition-colors" />
                 </div>
             </div>
          </div>
        </div>
      )}

      {/* Desktop View & Mobile detailed views */}
      <div className={`md:block ${mobileView === 'menu' ? 'hidden' : 'block'}`}>
        
        {/* Mobile Detail Header */}
        <div className="md:hidden flex items-center gap-4 mb-6">
           <Button variant="ghost" size="icon" onClick={() => setMobileView('menu')} className="-ml-2">
             <ArrowLeft className="h-5 w-5" />
           </Button>
           <h1 className="text-xl font-bold capitalize">{mobileView === 'security' ? 'Password' : mobileView}</h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account preferences and academic details.</p>
        </div>

        <Tabs 
          value={mobileView !== 'menu' ? mobileView : 'profile'}
          onValueChange={(val) => setMobileView(val as any)}
          className="space-y-6"
        >
          <TabsList className="hidden md:grid w-full grid-cols-2 md:grid-flow-col max-w-2xl bg-slate-100 dark:bg-slate-800/50 p-1 mb-8 gap-y-2 h-auto">
            <TabsTrigger value="profile" className="flex gap-2">
              <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex gap-2">
            <GraduationCap className="h-4 w-4" /> Academic
          </TabsTrigger>
          <TabsTrigger value="security" className="flex gap-2">
            <Lock className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex gap-2">
            <CreditCard className="h-4 w-4" /> Subscription
          </TabsTrigger>            <TabsTrigger value="app" className="flex gap-2">
              <Smartphone className="h-4 w-4" /> App
            </TabsTrigger>        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-slate-50 dark:border-slate-800 shadow-sm">
                  <AvatarImage src={studentProfile?.photoURL || ''} alt="Profile" />
                  <AvatarFallback className="text-2xl">{studentProfile?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Change Picture'}
                  </Button>
                  <p className="text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input 
                    id="displayName" 
                    name="displayName" 
                    value={formData.displayName} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    value={studentProfile?.email || ''} 
                    disabled 
                    className="bg-slate-50 dark:bg-slate-900/50"
                  />
                  <p className="text-[10px] text-slate-400">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="+234 800 000 0000"
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select 
                    id="timezone" 
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                  >
                    <option>West Africa Time (WAT)</option>
                    <option>Central Africa Time (CAT)</option>
                    <option>East Africa Time (EAT)</option>
                    <option>Greenwich Mean Time (GMT)</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="ml-auto bg-primary hover:bg-primary/90">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ACADEMIC TAB */}
        <TabsContent value="academic" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Academic Profile</CardTitle>
              <CardDescription>Tailor your learning experience on MyTutorMe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <select
                    id="educationLevel"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                  >
                    <option value="secondary">Secondary School (Year 10-12)</option>
                    <option value="tertiary">Tertiary Institution</option>
                    <option value="postgraduate">Postgraduate</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution Name</Label>
                  <Input 
                    id="institution" 
                    name="institution" 
                    placeholder="e.g. University of Lagos"
                    value={formData.institution} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="major">Major / Field of Study</Label>
                  <Input 
                    id="major" 
                    name="major" 
                    placeholder="e.g. Computer Science"
                    value={formData.major} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Label>Preferred Grading System</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {['4.0', '5.0', '100'].map((val) => (
                    <label key={val} className={`relative flex cursor-pointer rounded-xl border ${formData.gradingSystem === val ? 'border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary ring-offset-2' : 'border-slate-200 dark:border-slate-700 bg-card'} p-4 shadow-sm focus:outline-none transition-all`}>
                      <input
                        className="sr-only"
                        name="gradingSystem"
                        type="radio"
                        value={val}
                        checked={formData.gradingSystem === val}
                        onChange={handleInputChange}
                      />
                      <span className="flex flex-1 flex-col">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">
                          {val === '100' ? 'Percentage' : `${val} Scale`}
                        </span>
                        <span className="mt-1 flex items-center text-xs text-slate-500">
                          {val === '100' ? '0 - 100%' : (val === '4.0' ? 'GPA System' : 'CGPA System')}
                        </span>
                      </span>
                      {formData.gradingSystem === val && (
                         <ShieldCheck className="h-5 w-5 text-primary" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <Button onClick={handleSaveProfile} disabled={isSaving} className="ml-auto bg-primary hover:bg-primary/90">
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Academic Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>Update your password and secure your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    name="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    name="newPassword" 
                    type="password" 
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <Button onClick={handleUpdatePassword} disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what alerts you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Course Announcements</Label>
                    <p className="text-sm text-slate-500">Receive updates from your instructors.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">AI Usage Limits</Label>
                    <p className="text-sm text-slate-500">Alerts when you are running low on AI queries.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing & Offers</Label>
                    <p className="text-sm text-slate-500">Emails about new features or discounts.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
              <Button variant="outline" className="ml-auto">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* SUBSCRIPTION TAB */}
        <TabsContent value="subscription" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Manage your current plan and billing details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!showPlans ? (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        {normalizedPlan === 'pro_monthly' ? 'Pro Monthly Plan' : normalizedPlan === 'pro_yearly' ? 'Pro Yearly Plan' : 'Free Basic Plan'}
                      </h3>
                      <p className="text-slate-500 mt-1">
                        {normalizedPlan?.includes('pro') 
                          ? 'You have access to all premium features including GPA Simulator, Unlimited AI, and Priority Support.'
                          : 'Upgrade to a Pro plan to unlock advanced features and boost your academic performance.'}
                      </p>
                    </div>
                    <div>
                      <Button onClick={() => setShowPlans(true)}>
                        Manage Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Select a Plan</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowPlans(false)}>Cancel</Button>
                  </div>
                  
                  {/* 3 Columns for Pricing Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free Plan */}
                    <div className={`border rounded-xl p-4 flex flex-col ${normalizedPlan === 'free' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                      <h4 className="font-bold">Free Basic</h4>
                      <span className="text-2xl font-black my-2">₦0</span>
                      <p className="text-sm text-slate-500 flex-1">Basic access to limited AI queries and free courses.</p>
                      <Button className="mt-4 w-full" variant={normalizedPlan === 'free' ? 'secondary' : 'outline'} onClick={() => handleChangePlan('free')} disabled={isSaving || normalizedPlan === 'free'}>
                        {normalizedPlan === 'free' ? 'Current Plan' : 'Downgrade'}
                      </Button>
                    </div>

                    {/* Pro Monthly */}
                    <div className={`border rounded-xl p-4 flex flex-col ${normalizedPlan === 'pro_monthly' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                      <h4 className="font-bold text-primary">Pro Monthly</h4>
                      <span className="text-2xl font-black my-2">₦4,000<span className="text-sm font-normal text-slate-500">/mo</span></span>
                      <p className="text-sm text-slate-500 flex-1">Unlimited AI, GPA Simulator, offline downloads, and more.</p>
                      <Button className="mt-4 w-full" onClick={() => handleChangePlan('pro_monthly')} disabled={isSaving || normalizedPlan === 'pro_monthly'}>
                        {normalizedPlan === 'pro_monthly' ? 'Current Plan' : 'Select Monthly'}
                      </Button>
                    </div>

                    {/* Pro Yearly */}
                    <div className={`border rounded-xl p-4 flex flex-col ${normalizedPlan === 'pro_yearly' ? 'border-primary bg-primary/5' : 'border-slate-200 shadow-md relative overflow-hidden'}`}>
                      <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">BEST VALUE</div>
                      <h4 className="font-bold text-primary">Pro Yearly</h4>
                      <span className="text-2xl font-black my-2">₦40,000<span className="text-sm font-normal text-slate-500">/yr</span></span>
                      <p className="text-sm text-slate-500 flex-1">Save ₦8,000 annually. Includes priority support.</p>
                      <Button className="mt-4 w-full" onClick={() => handleChangePlan('pro_yearly')} disabled={isSaving || normalizedPlan === 'pro_yearly'}>
                        {normalizedPlan === 'pro_yearly' ? 'Current Plan' : 'Select Yearly'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="app" className="animate-in fade-in duration-300">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-xl flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                App Installation
              </CardTitle>
              <CardDescription>Install MyTutorMe on your device for the best offline and instant loading experience.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-4 border border-slate-100 dark:border-slate-800 rounded-lg p-6 bg-white dark:bg-slate-900/50">
                <div className="w-16 h-16 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center p-3 shadow-inner">
                  <img src="/icon.png" alt="MyTutorMe App" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 text-center md:text-left space-y-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">MyTutorMe Web App</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Takes up barely any storage. Connects you to the learning platform smoothly.</p>
                </div>
                <div className="shrink-0 w-full md:w-auto flex flex-col md:items-end justify-center">
                  <PWAInstallPopup asMenuItem={true} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 md:hidden pb-10">
        <Button 
          variant="destructive" 
          className="w-full"
          onClick={async () => {
            const { signOut } = useAuthStore.getState();
            await signOut();
            window.location.href = '/login';
          }}
        >
          Logout
        </Button>
      </div>

      {isPaymentModalOpen && selectedPlanForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onConfirm={async (provider) => {
            setIsPaymentModalOpen(false);
            await executePlanChange(selectedPlanForPayment, provider);
          }}
          planName={selectedPlanForPayment === 'pro_yearly' ? 'Pro Yearly' : 'Pro Monthly'}
        />
      )}
      </div>
    </div>
  );
};
