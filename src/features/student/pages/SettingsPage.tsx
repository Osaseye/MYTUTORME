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
import { User, Bell, Lock, GraduationCap, Upload, ShieldCheck, Loader2, CreditCard } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const SettingsPage = () => {
  const { user, setUser } = useAuthStore();
  const studentProfile = user as StudentProfile;

  const [isSaving, setIsSaving] = useState(false);
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

  // Initialize form when user data loads
  useEffect(() => {
    if (studentProfile) {
      setFormData({
        displayName: studentProfile.displayName || studentProfile.username || '',
        phone: (studentProfile as any).phone || '',
        timezone: (studentProfile as any).timezone || 'West Africa Time (WAT)',
        educationLevel: studentProfile.level || 'secondary',
        institution: studentProfile.institution || '',
        major: studentProfile.courseOfStudy || '',
        gradingSystem: studentProfile.gradingSystem || '5.0',
      });
    }
  }, [studentProfile]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        phone: formData.phone,
        timezone: formData.timezone,
        level: formData.educationLevel,
        institution: formData.institution,
        courseOfStudy: formData.major,
        gradingSystem: formData.gradingSystem,
      });
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.displayName,
        });
      }
      
      // Update local state
      setUser({
        ...user,
        displayName: formData.displayName,
        phone: formData.phone,
        timezone: formData.timezone,
        level: formData.educationLevel,
        institution: formData.institution,
        courseOfStudy: formData.major,
        gradingSystem: formData.gradingSystem,
      } as StudentProfile);

      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSaving(true);
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) throw new Error("No authenticated user.");

      // Re-authenticate
      const credential = EmailAuthProvider.credential(currentUser.email, passwordData.currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await updatePassword(currentUser, passwordData.newPassword);
      
      toast.success("Password updated successfully!");
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error("Incorrect current password.");
      } else {
        toast.error(error.message || "Failed to update password.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const uploadId = toast.loading('Uploading profile picture...');
    
    try {
      const storageRef = ref(storage, `profile_pictures/${user.uid}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        () => {},
        (error) => {
          console.error(error);
          setIsUploading(false);
          toast.error('Upload failed.', { id: uploadId });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
          }
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { photoURL: downloadURL });
          
          setUser({ ...user, photoURL: downloadURL } as StudentProfile);
          
          setIsUploading(false);
          toast.success('Picture updated!', { id: uploadId });
        }
      );
    } catch (error) {
      setIsUploading(false);
      toast.error('Error during upload.', { id: uploadId });
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        plan: 'pro_monthly' // default upgrade to pro_monthly for demo
      });
      setUser({ ...user, plan: 'pro_monthly' } as StudentProfile);
      toast.success('Successfully upgraded to Pro Monthly!');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to upgrade subscription.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 md:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account preferences and academic details.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-flow-col max-w-2xl bg-slate-100 dark:bg-slate-800/50 p-1">
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
          </TabsTrigger>
        </TabsList>

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
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                      {studentProfile?.plan === 'pro_monthly' ? 'Pro Monthly Plan' : studentProfile?.plan === 'pro_yearly' ? 'Pro Yearly Plan' : 'Free Basic Plan'}
                    </h3>
                    <p className="text-slate-500 mt-1">
                      {studentProfile?.plan?.includes('pro') 
                        ? 'You have access to all premium features including GPA Simulator, Unlimited AI, and Priority Support.'
                        : 'Upgrade to a Pro plan to unlock advanced features and boost your academic performance.'}
                    </p>
                  </div>
                  <div>
                    {studentProfile?.plan?.includes('pro') ? (
                      <Button variant="outline">Manage Subscription</Button>
                    ) : (
                      <Button onClick={handleUpgradeToPro} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Upgrade to Pro
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
