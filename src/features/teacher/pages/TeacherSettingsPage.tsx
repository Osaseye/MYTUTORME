/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Lock, User, Globe } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { updateProfile, getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";

export const TeacherSettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    website: "",
    twitter: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      const nameParts = (user?.displayName || "").split(" ");
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        headline: (user as any)?.headline || "",
        bio: (user as any)?.bio || "",
        website: (user as any)?.website || "",
        twitter: (user as any)?.twitter || ""
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    try {
      const updatedData = {
        displayName: `${formData.firstName} ${formData.lastName}`.trim() || "Anonymous",
        headline: formData.headline || "",
        bio: formData.bio || "",
        website: formData.website || "",
        twitter: formData.twitter || ""
      };
      await updateDoc(doc(db, "users", user.uid), updatedData);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      // Update auth profile
      const auth = getAuth();
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
      }
      // Update firestore document
      await updateDoc(doc(db, "users", user.uid), { photoURL });
      
      toast.success("Profile photo updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return "JP";
    const trimmed = name.trim();
    if (!trimmed) return "JP";
    const parts = trimmed.split(" ");
    if (parts.length > 1) {
      return ((parts[0][0] || "") + (parts[1][0] || "")).toUpperCase();
    }
    return (trimmed[0] || "J").toUpperCase() + "P";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold font-display text-slate-900 mb-8">
        Instructor Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 space-y-1">
          <nav className="flex flex-col gap-1">
            <Button 
                variant="ghost" 
                className={`justify-start gap-2 font-medium ${activeTab === 'profile' ? 'bg-secondary/10 text-primary' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4" /> Profile
            </Button>
            <Button 
                variant="ghost" 
                className={`justify-start gap-2 font-medium ${activeTab === 'notifications' ? 'bg-secondary/10 text-primary' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('notifications')}
            >
              <Bell className="h-4 w-4" /> Notifications
            </Button>
            <Button 
                variant="ghost" 
                className={`justify-start gap-2 font-medium ${activeTab === 'security' ? 'bg-secondary/10 text-primary' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('security')}
            >
              <Lock className="h-4 w-4" /> Security
            </Button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-9 space-y-8">

          {activeTab === 'profile' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Public Profile</h2>
              
              <div className="flex items-start gap-6 mb-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.photoURL || "/placeholder-avatar.jpg"} alt={user?.displayName || "Profile"} />
                  <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl">{getInitials(user?.displayName || "")}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div className="flex gap-2">
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                      />
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploadingPhoto}>
                        {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                      </Button>
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
                    <Input name="firstName" value={formData.firstName || ""} onChange={handleChange} placeholder="First Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <Input name="lastName" value={formData.lastName || ""} onChange={handleChange} placeholder="Last Name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Headline</label>
                  <Input name="headline" value={formData.headline || ""} onChange={handleChange} placeholder="e.g. Instructor at University" />
                  <p className="text-xs text-slate-500">Add a professional headline like, "Instructor at Udemy" or "Architect."</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Biography</label>
                  <textarea
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleChange}
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Share a little bit about yourself."
                  />
                  <p className="text-xs text-slate-500">Links and coupon codes are not permitted in this section.</p>
                </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input name="website" value={formData.website || ""} onChange={handleChange} className="pl-9" placeholder="https://" />
                    </div>
                 </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Twitter (X)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">@</span>
                      <Input name="twitter" value={formData.twitter || ""} onChange={handleChange} className="pl-8" placeholder="username" />
                    </div>
                 </div>

              </div>

              <div className="mt-6 flex justify-end">
                   <Button onClick={handleSaveProfile} disabled={isSaving} className="bg-primary hover:bg-green-700 text-white">
                       {isSaving ? "Saving..." : "Save Profile"}
                   </Button>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Notifications Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">Email Notifications</h3>
                    <p className="text-sm text-slate-500">Receive emails about your account activity.</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">Push Notifications</h3>
                    <p className="text-sm text-slate-500">Receive push notifications to your device.</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900">Security Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">Change Password</h3>
                    <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};
