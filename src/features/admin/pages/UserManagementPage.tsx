import { 
  Check, 
  X, 
  FileText, 
  Download, 
  Eye, 
  AlertTriangle,
  Mail,
  Phone
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export const UserManagementPage = () => {
    // Mock data for a selected teacher application
    const application = {
        id: '123',
        name: 'Dr. Sarah Connor',
        email: 'sarah.connor@university.edu',
        phone: '+1 (555) 000-1234',
        role: 'Teacher',
        appliedDate: 'March 1, 2024',
        subjects: ['Physics', 'Quantum Mechanics'],
        bio: 'Ph.D. in Theoretical Physics with 10 years of teaching experience at MIT. Passionate about making complex concepts accessible.',
        documents: [
            { name: 'PhD_Certificate.pdf', size: '2.4 MB', type: 'Education' },
            { name: 'ID_Passport_Scan.jpg', size: '1.1 MB', type: 'Identity' },
            { name: 'Teaching_License.pdf', size: '0.8 MB', type: 'Certification' },
        ],
        status: 'Pending Review'
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Verification</h1>
                    <p className="text-slate-500 dark:text-slate-400">Review and approve teacher applications.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Back to List</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: User Profile */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader className="text-center">
                        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-slate-100 dark:border-slate-800">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                        <div className="flex justify-center gap-2 mt-4">
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                {application.role} Applicant
                            </Badge>
                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
                                {application.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4 pt-6">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span>{application.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-slate-400" />
                            <span>{application.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span>Applied: {application.appliedDate}</span>
                        </div>
                        
                        <div className="pt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {application.subjects.map(sub => (
                                    <Badge key={sub} variant="secondary">{sub}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Bio</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                {application.bio}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Right Column: Documents & Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Documents Review */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Submitted Documents</CardTitle>
                            <CardDescription>Verify the authenticity of the uploaded credentials.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {application.documents.map((doc, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg flex items-center justify-center">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{doc.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{doc.size}</span>
                                                <span>•</span>
                                                <Badge variant="outline" className="text-[10px] h-5">{doc.type}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="gap-2">
                                            <Eye className="h-4 w-4" /> View
                                        </Button>
                                        <Button size="sm" variant="ghost" className="gap-2">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                <span>Please verify all documents match the applicant's profile details.</span>
                            </div>
                        </CardFooter>
                    </Card>

                    {/* Action Panel */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader>
                            <CardTitle>Application Decision</CardTitle>
                            <CardDescription>Approve or reject this teacher application. This action cannot be undone efficiently.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col sm:flex-row gap-4">
                             <div className="flex-1 space-y-2">
                                <label className="text-sm font-medium">Rejection Reason (Optional)</label>
                                <textarea 
                                    className="w-full min-h-[80px] p-3 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-slate-200 outline-none resize-none"
                                    placeholder="If rejecting, please specify why..."
                                />
                             </div>
                        </CardContent>
                        <CardFooter className="flex justify-between gap-4 pt-0">
                            <Button variant="destructive" className="flex-1 gap-2">
                                <X className="h-4 w-4" /> Reject Application
                            </Button>
                            <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
                                <Check className="h-4 w-4" /> Approve Teacher
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};
