import { Button } from "@/components/ui/button";
import { MessageSquare, ThumbsUp, Eye, Clock } from "lucide-react";

export const CommunityPage = () => {
    const discussions = [
        {
            id: 1,
            title: "How to engage students in online discussions?",
            author: "Sarah J.",
            role: "Instructor",
            replies: 12,
            views: 340,
            likes: 45,
            time: "2 hours ago",
            tag: "Teaching Tips",
            color: "blue"
        },
         {
            id: 2,
            title: "Best microphone for recording lectures under $50?",
            author: "Mike T.",
            role: "New Teacher",
            replies: 24,
            views: 1200,
            likes: 89,
            time: "5 hours ago",
            tag: "Equipment",
            color: "purple"
        },
         {
            id: 3,
            title: "Updates to the Stripe payout schedule for Nigeria",
            author: "TutorMe Admin",
            role: "Admin",
            replies: 5,
            views: 200,
            likes: 12,
            time: "1 day ago",
            tag: "Announcements",
            color: "red"
        }
    ];

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Instructor Community
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Connect with other teachers, share tips, and get help.
            </p>
          </div>
          <Button className="inline-flex items-center gap-2 bg-primary hover:bg-green-700 text-white shadow-lg">
            <MessageSquare className="w-4 h-4" />
            New Discussion
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-4">
                {discussions.map((discussion) => (
                    <div key={discussion.id} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold bg-${discussion.color}-100 text-${discussion.color}-700 dark:bg-${discussion.color}-900/30 dark:text-${discussion.color}-300`}>
                                    {discussion.tag}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {discussion.time}
                                </span>
                            </div>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                            {discussion.title}
                        </h3>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{discussion.author}</span>
                                <span className="text-xs text-slate-400">• {discussion.role}</span>
                            </div>
                             <div className="flex items-center gap-4 text-slate-400 text-sm">
                                <span className="flex items-center gap-1 hover:text-primary">
                                    <MessageSquare className="w-4 h-4" /> {discussion.replies}
                                </span>
                                <span className="flex items-center gap-1 hover:text-blue-500">
                                    <ThumbsUp className="w-4 h-4" /> {discussion.likes}
                                </span>
                                 <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" /> {discussion.views}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Teaching Tips', 'Equipment', 'Marketing', 'Announcements', 'Subject Help', 'Feedback'].map(tag => (
                            <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                 <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Weekly Challenge</h3>
                    <p className="text-sm text-indigo-200 mb-4">Create a 5-minute promo video for your course.</p>
                    <Button variant="secondary" size="sm" className="w-full text-indigo-900 bg-indigo-50 hover:bg-white text-xs">View Details</Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
