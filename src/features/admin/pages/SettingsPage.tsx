import { 
  Shield, 
  Globe
} from 'lucide-react';
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

export const SettingsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your account and platform preferences.</p>
                </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your admin profile details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold">
                                    AD
                                </div>
                                <Button variant="outline">Change Avatar</Button>
                            </div>
                            <div className="grid gap-4 py-2">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" defaultValue="Admin User" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" defaultValue="admin@mytutorme.ng" className="col-span-3" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button>Save Changes</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>Configure how you receive alerts.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-slate-500">Receive emails about new registrations.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Push Notifications</Label>
                                    <p className="text-sm text-slate-500">Receive push notifications on mobile.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                             <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Course Approval Alerts</Label>
                                    <p className="text-sm text-slate-500">Get notified when a new course is submitted.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                     <Card>
                        <CardHeader>
                            <CardTitle>System Configuration</CardTitle>
                            <CardDescription>Manage platform-wide settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between border p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-red-600" />
                                        <Label className="text-base text-red-900 dark:text-red-200">Maintenance Mode</Label>
                                    </div>
                                    <p className="text-sm text-red-700 dark:text-red-300">Disable platform access for all users.</p>
                                </div>
                                <Switch />
                            </div>
                             <div className="flex items-center justify-between border p-4 rounded-lg">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-slate-500" />
                                        <Label className="text-base">Public Registration</Label>
                                    </div>
                                    <p className="text-sm text-slate-500">Allow new users to sign up.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
