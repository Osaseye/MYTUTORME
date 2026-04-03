import { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Globe,
  Loader2,
  Upload,
  Smartphone
} from 'lucide-react';
import { PWAInstallPopup } from '@/components/shared/PWAInstallPopup';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

export const SettingsPage = () => {
    const { user, setUser, signOut } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    // Auth User Settings
    const [formData, setFormData] = useState({
        displayName: user?.displayName || '',
        email: user?.email || '',
    });

    // Platform Level Settings
    const [systemSettings, setSystemSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        courseAlerts: false,
        maintenanceMode: false,
        publicRegistration: true,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch System Settings from Firestore on load
    useEffect(() => {
        const fetchSystemSettings = async () => {
            try {
                const settingsRef = doc(db, 'platform_settings', 'global');
                const docSnap = await getDoc(settingsRef);
                if (docSnap.exists()) {
                    setSystemSettings(prev => ({
                        ...prev,
                        ...docSnap.data()
                    }));
                }
            } catch (error) {
                console.error("Failed to load platform settings:", error);
            }
        };
        fetchSystemSettings();
    }, []);

    // Also resync local user data if it changes
    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                email: user.email || '',
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSystemSwitchChange = (key: keyof typeof systemSettings, checked: boolean) => {
        setSystemSettings({ ...systemSettings, [key]: checked });
    };

    const handleSaveAccount = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                displayName: formData.displayName
            });

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: formData.displayName });
            }

            // Sync with local state
            setUser({
                ...user,
                displayName: formData.displayName
            });

            toast.success("Account profile updated successfully!");
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveSystemSettings = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const settingsRef = doc(db, 'platform_settings', 'global');
            // Using setDoc with merge so it creates the doc if it doesn't exist
            await setDoc(settingsRef, {
                emailNotifications: systemSettings.emailNotifications,
                pushNotifications: systemSettings.pushNotifications,
                courseAlerts: systemSettings.courseAlerts,
                maintenanceMode: systemSettings.maintenanceMode,
                publicRegistration: systemSettings.publicRegistration,
                updatedAt: Date.now(),
                updatedBy: user.uid
            }, { merge: true });

            toast.success("Platform settings updated successfully!");
        } catch (error) {
            console.error('Error updating platform settings:', error);
            toast.error("Failed to update platform settings. Ensure you have admin privileges.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;
        const file = e.target.files[0];
        
        setIsUploading(true);
        const uploadId = toast.loading('Uploading admin picture...');
        
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
                    
                    if (setUser) setUser({ ...user, photoURL: downloadURL });
                    
                    setIsUploading(false);
                    toast.success('Admin avatar updated!', { id: uploadId });
                }
            );
        } catch (error) {
            setIsUploading(false);
            toast.error('Error during upload.', { id: uploadId });
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your account and platform preferences.</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="app">App</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your admin profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20 border-2 border-slate-100 dark:border-slate-800">
                                    <AvatarImage src={user?.photoURL || ''} alt="Admin Profile" />
                                    <AvatarFallback className="text-2xl font-bold">{user?.displayName?.charAt(0) || 'A'}</AvatarFallback>
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
                                        {isUploading ? 'Uploading...' : 'Change Avatar'}
                                    </Button>
                                </div>
                            </div>
                            <div className="grid gap-4 py-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="displayName" className="text-right">Name</Label>
                                    <Input 
                                        id="displayName" 
                                        value={formData.displayName} 
                                        onChange={handleInputChange} 
                                        className="col-span-3" 
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input 
                                        id="email" 
                                        value={formData.email} 
                                        disabled 
                                        className="col-span-3 bg-slate-50 dark:bg-slate-900" 
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveAccount} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Profile
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Configure how you receive alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-slate-500">Receive emails about new registrations.</p>
                                </div>
                                <Switch 
                                    checked={systemSettings.emailNotifications} 
                                    onCheckedChange={(c) => handleSystemSwitchChange('emailNotifications', c)} 
                                />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-sm text-slate-500">Receive push notifications on mobile.</p>
                                </div>
                                <Switch 
                                    checked={systemSettings.pushNotifications} 
                                    onCheckedChange={(c) => handleSystemSwitchChange('pushNotifications', c)} 
                                />
                            </div>
                            <Separator />
                             <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Course Approval Alerts</Label>
                                    <p className="text-sm text-slate-500">Get notified when a new course is submitted by a teacher.</p>
                                </div>
                                <Switch 
                                    checked={systemSettings.courseAlerts} 
                                    onCheckedChange={(c) => handleSystemSwitchChange('courseAlerts', c)} 
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSystemSettings} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Preferences
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                     <Card>
                        <CardHeader>
                            <CardTitle>System Configuration</CardTitle>
                            <CardDescription>Manage platform-wide settings affecting all users.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className={`p-4 rounded-lg border flex items-center justify-between ${
                                systemSettings.maintenanceMode ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Shield className={`h-4 w-4 ${systemSettings.maintenanceMode ? 'text-red-600' : 'text-slate-500'}`} />
                                        <Label className={`text-base ${systemSettings.maintenanceMode ? 'text-red-900 dark:text-red-200' : ''}`}>Maintenance Mode</Label>
                                    </div>
                                    <p className={`text-sm ${systemSettings.maintenanceMode ? 'text-red-700 dark:text-red-300' : 'text-slate-500'}`}>Disable platform access for all non-admin users.</p>
                                </div>
                                <Switch 
                                    checked={systemSettings.maintenanceMode} 
                                    onCheckedChange={(c) => handleSystemSwitchChange('maintenanceMode', c)} 
                                />
                            </div>
                             <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 p-4 rounded-lg">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-slate-500" />
                                        <Label className="text-base">Public Registration</Label>
                                    </div>
                                    <p className="text-sm text-slate-500">Allow new students and teachers to sign up.</p>
                                </div>
                                <Switch 
                                    checked={systemSettings.publicRegistration} 
                                    onCheckedChange={(c) => handleSystemSwitchChange('publicRegistration', c)} 
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSaveSystemSettings} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save System Configuration
                            </Button>
                        </CardFooter>
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
                                    <h4 className="font-semibold text-slate-900 dark:text-white">MyTutorMe Admin Portal</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Maintain full administrative controls securely directly from your homescreen.</p>
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
                        await signOut();
                        window.location.href = '/login';
                    }}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};
