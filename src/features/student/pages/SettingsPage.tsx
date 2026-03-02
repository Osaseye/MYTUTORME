import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut,
  Camera,
  Mail,
  Lock
} from 'lucide-react';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'billing'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Mock form state
  const [formData, setFormData] = useState({
    name: 'Alex Morgan',
    email: 'alex.morgan@university.edu',
    bio: 'Computer Science Major | AI Enthusiast',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Settings saved successfully!');
    }, 1000);
  };

  const navItems = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'account', label: 'Account Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing & Plans', icon: CreditCard },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-2">
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6 px-2">Settings</h1>
            
            <nav className="space-y-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                            activeTab === item.id 
                            ? 'bg-primary/10 text-primary' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="p-8 max-w-2xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Edit Profile</h2>
                    
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6 mb-8">
                        <div className="relative group cursor-pointer">
                            <img 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzWKEMlFyQL3iGWEyaNiEjPbe6et2EnAqbD9NYZfJNyS3yilfAxLkR1wenCIf84IvBqvnCdDKlcuJ7UZtvXDUWvJzkzy8vzq3exQbxAIp3gcxi-P7oYHkYh_EK9qHs0qd4Q43K3AyzdASDXIhTWP3i62-bDFlIjt3XHZDJFAgmCBDU4qfLpH3HGLVTcm9jjNmuq2qj8Z_h3IBBw-PrD_O_MPai4RbcTYgWDZhzlPYRZYB8GO1A5eW-TcRqrZZUXn-HBy0TeLvteKs" 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-white">Profile Photo</h3>
                            <p className="text-sm text-slate-500 mb-3">Recommended 300x300px</p>
                            <div className="flex gap-3">
                                <Button variant="outline" size="sm">Change</Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                                <Input 
                                    value={formData.name.split(' ')[0]} 
                                    onChange={(e) => setFormData({...formData, name: `${e.target.value} ${formData.name.split(' ')[1]}`})} 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                                <Input 
                                    value={formData.name.split(' ')[1]} 
                                    onChange={(e) => setFormData({...formData, name: `${formData.name.split(' ')[0]} ${e.target.value}`})} 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Headline / Bio</label>
                            <Input 
                                value={formData.bio} 
                                onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                            />
                            <p className="text-xs text-slate-500">Brief description for your profile.</p>
                        </div>
                        
                        <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
                <div className="p-8 max-w-2xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Account Security</h2>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                <Input 
                                    value={formData.email} 
                                    className="pl-10" 
                                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                             <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Change Password</h3>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                        <Input type="password" className="pl-10" placeholder="••••••••" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                                        <Input type="password" className="pl-10" placeholder="••••••••" />
                                    </div>
                                </div>
                             </div>
                        </div>

                         <div className="pt-4 flex justify-end">
                            <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                                {isLoading ? 'Updating...' : 'Update Password'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                 <div className="p-8 max-w-2xl">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-6">
                        {[
                            { title: 'Course Updates', desc: 'Receive emails about new lectures and announcements.', default: true },
                            { title: 'Assignment Deadlines', desc: 'Reminders 24h before assignments are due.', default: true },
                            { title: 'Quiz Results', desc: 'Get notified when your quiz is graded.', default: true },
                            { title: 'Promotional Emails', desc: 'News about discounts and new courses.', default: false }
                        ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div>
                                    <h4 className="font-medium text-slate-900 dark:text-white">{item.title}</h4>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </div>
                                <Switch defaultChecked={item.default} onCheckedChange={() => toast.success('Preference updated')} />
                             </div>
                        ))}
                    </div>
                 </div>
            )}

            {/* Billing Tab (Placeholder) */}
            {activeTab === 'billing' && (
                <div className="p-8 flex flex-col items-center justify-center text-center h-full">
                     <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="w-8 h-8 text-slate-400" />
                     </div>
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Active Subscription</h2>
                     <p className="text-slate-500 max-w-md mb-6">You are currently on the free plan. Upgrade to access premium courses and AI features.</p>
                     <Button className="bg-primary hover:bg-primary/90">Upgrade to Pro</Button>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};
