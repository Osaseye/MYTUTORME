import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CreditCard, Lock, User, Globe } from "lucide-react";

export const TeacherSettingsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold font-display text-slate-900 mb-8">
        Instructor Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 space-y-1">
          <nav className="flex flex-col gap-1">
            <Button variant="ghost" className="justify-start gap-2 font-medium bg-secondary/10 text-primary">
              <User className="h-4 w-4" /> Profile
            </Button>
            <Button variant="ghost" className="justify-start gap-2 font-medium text-slate-600 hover:text-slate-900">
              <CreditCard className="h-4 w-4" /> Payouts
            </Button>
            <Button variant="ghost" className="justify-start gap-2 font-medium text-slate-600 hover:text-slate-900">
              <Bell className="h-4 w-4" /> Notifications
            </Button>
            <Button variant="ghost" className="justify-start gap-2 font-medium text-slate-600 hover:text-slate-900">
              <Lock className="h-4 w-4" /> Security
            </Button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9 space-y-8">
          
          {/* Public Profile Section */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Public Profile</h2>
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl">JP</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Change Photo</Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Delete</Button>
                </div>
                <p className="text-sm text-slate-500">
                  Acceptable formats: jpg, png. Max size: 2MB.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">First Name</label>
                  <Input defaultValue="Jane" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Last Name</label>
                  <Input defaultValue="Plane" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Headline</label>
                <Input defaultValue="Senior Software Engineer & Instructor" placeholder="e.g. Instructor at University" />
                <p className="text-xs text-slate-500">Add a professional headline like, "Instructor at Udemy" or "Architect."</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Biography</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="I have been teaching programming for over 10 years..."
                />
                <p className="text-xs text-slate-500">Links and coupon codes are not permitted in this section.</p>
              </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input className="pl-9" placeholder="https://" />
                  </div>
               </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Twitter (X)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">@</span>
                    <Input className="pl-8" placeholder="username" />
                  </div>
               </div>

            </div>
            
            <div className="mt-6 flex justify-end">
                 <Button className="bg-primary hover:bg-green-700 text-white">Save Profile</Button>
            </div>
          </section>

          {/* Payout Settings Placeholder */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">Payout Method</h2>
                <Button variant="outline" size="sm">Manage Payouts</Button>
             </div>
             <p className="text-slate-600 text-sm mb-4">
                Connect your bank account or PayPal to receive earnings. Payouts are processed monthly.
             </p>
             <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="p-2 bg-white rounded-full shadow-sm">
                    <CreditCard className="h-6 w-6 text-slate-700" /> 
                </div>
                <div>
                     <p className="font-medium text-slate-900">Stripe Connected Account</p>
                     <p className="text-xs text-slate-500">Connected • ending in 4242</p>
                </div>
                <div className="ml-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                    </span>
                </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
};
