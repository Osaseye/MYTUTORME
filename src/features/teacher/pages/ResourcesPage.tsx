import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export const ResourcesPage = () => {
  const resources: any[] = [];

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Instructor Resources
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Tools and guides to help you succeed as an instructor.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${resource.color}`}
                >
                  <resource.icon className="w-6 h-6" />
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Download className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </Button>
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                {resource.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {resource.type} • {resource.size}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
