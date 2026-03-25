import { Button } from "@/components/ui/button";
import { Download, UploadCloud, FileText, Video, Image as ImageIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState, useEffect, useRef } from "react";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";

export const ResourcesPage = () => {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmResource, setDeleteConfirmResource] = useState<{id: string, fileName: string, title?: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPremium = user?.teacherSubscriptionPlan === 'premium_tools';

  const fetchResources = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, "resources"), where("teacherId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `resources/${user.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      let sizeText = "";
      if (file.size < 1024 * 1024) {
        sizeText = (file.size / 1024).toFixed(2) + " KB";
      } else {
        sizeText = (file.size / 1024 / 1024).toFixed(2) + " MB";
      }

      await addDoc(collection(db, "resources"), {
        teacherId: user.uid,
        title: file.name,
        type: file.type || "unknown",
        size: sizeText,
        url,
        fileName: `${Date.now()}_${file.name}`,
        createdAt: new Date().toISOString()
      });
      
      toast.success("File uploaded successfully");
      fetchResources();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!user?.uid || !deleteConfirmResource) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "resources", deleteConfirmResource.id));
      if (deleteConfirmResource.fileName) {
        const fileRef = ref(storage, `resources/${user.uid}/${deleteConfirmResource.fileName}`);
        await deleteObject(fileRef).catch(console.error);
      }
      toast.success("Resource deleted");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Failed to delete resource");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmResource(null);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("video")) return Video;
    if (type.includes("image")) return ImageIcon;
    return FileText;
  };

  const totalSizeMB = resources.reduce((acc, curr) => {
    let sizeValue = 0;
    if (typeof curr.size === 'number') {
      sizeValue = isNaN(curr.size) ? 0 : curr.size;
    } else if (typeof curr.size === 'string' && !curr.size.includes('NaN')) {
      const sizeMatch = curr.size.match(/(\d+(\.\d+)?)/);
      if (sizeMatch) {
         let value = parseFloat(sizeMatch[0]) || 0;
         if (curr.size.includes('KB')) {
             value = value / 1024;
         }
         sizeValue = value;
      }
    }
    return acc + sizeValue;
  }, 0);

  const MAX_STORAGE_MB = isPremium ? 50000 : 5000;
  const storagePercentage = Math.min((totalSizeMB / MAX_STORAGE_MB) * 100, 100);

  const formattedTotalSize = totalSizeMB > 0 && totalSizeMB < 1 
    ? `${(totalSizeMB * 1024).toFixed(2)} KB`
    : `${totalSizeMB.toFixed(2)} MB`;

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Instructor Resources
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Manage your personal media library and shared assets.
            </p>
          </div>
          
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
               {uploading ? "Uploading..." : <><UploadCloud className="w-4 h-4" /> Upload New Asset</>}
            </Button>
          </div>
        </div>

        {/* Resources Grid (Storage Manager) */}
        {loading ? (
          <div className="text-center text-slate-500 py-8">Loading resources...</div>
        ) : resources.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No resources uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {resources.map((resource) => {
              const Icon = getIcon(resource.type);
              return (
              <div
                key={resource.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-slate-100 dark:bg-slate-800" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-rose-100 dark:hover:bg-rose-900/30" onClick={() => setDeleteConfirmResource({id: resource.id, fileName: resource.fileName, title: resource.title})}>
                      <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    </Button>
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1 line-clamp-2">
                    {resource.title}
                  </h3>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center">
                   <span className="text-xs font-medium text-slate-500 truncate max-w-[100px]">{resource.type}</span>
                     <span className="text-xs text-slate-400">
                       {typeof resource.size === 'number' && !isNaN(resource.size) 
                         ? `${resource.size.toFixed(2)} MB` 
                         : (resource.size?.includes('NaN') ? 'Unknown Size' : (resource.size || '0 MB'))}
                     </span>
                </div>
              </div>
            )})}
          </div>
        )}
        
        {/* Storage Progress Wrapper (Free feature) */}
        <div className="mt-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex-grow w-full max-w-md">
              <div className="flex justify-between text-sm mb-2">
                 <span className="font-bold text-slate-700 dark:text-slate-300">Storage Used</span>
                 <span className="text-slate-500">{formattedTotalSize} / {isPremium ? "50" : "5"} GB</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                 <div className="bg-primary h-2.5 rounded-full" style={{ width: `${storagePercentage}%` }}></div>
              </div>
           </div>
           {!isPremium ? (
             <Button variant="outline" className="shrink-0 w-full sm:w-auto text-primary border-primary hover:bg-primary/10">Upgrade Storage</Button>
           ) : (
             <Button variant="outline" className="shrink-0 w-full sm:w-auto">Manage Storage</Button>
           )}
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Delete Resource?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-300">"{deleteConfirmResource.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button disabled={isDeleting} variant="outline" onClick={() => setDeleteConfirmResource(null)}>Cancel</Button>
              <Button disabled={isDeleting} variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white" onClick={handleDelete}>
                {isDeleting ? "Deleting..." : "Delete Resource"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
