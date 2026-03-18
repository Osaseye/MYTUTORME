import { 
  Check, 
  X, 
  FileText, 
  Download, 
  Eye, 
  AlertTriangle,
  Mail,
  Phone,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    // Mock data for a selected teacher application (Nigerian context)
    const application = {
        id: '123',
        name: 'Dr. Chike Obi',
        email: 'chike.obi@uni-lagos.edu.ng',
        phone: '+234 803 555 1234',
        role: 'Teacher',
        appliedDate: 'March 1, 2026',
        subjects: ['Mathematics', 'Further Maths'],
        bio: 'Senior Lecturer at UNILAG with 15 years experience preparing students for WAEC and JAMB. Specialized in Calculus and Algebra.',
        documents: [
            { name: 'PhD_Certificate.pdf', size: '2.4 MB', type: 'Education' },
            { name: 'NIN_Slip.jpg', size: '1.1 MB', type: 'Identity' },
            { name: 'TRCN_License.pdf', size: '0.8 MB', type: 'Certification' },
        ],
        status: 'Pending Review'
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">User Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Verify identities and manage permissions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Export CSV
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Profile Detail */}
                <Card className="lg:col-span-1 h-fit shadow-md border-t-4 border-t-slate-500">
                    <CardHeader className="text-center pb-2">
                        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-slate-100 dark:border-slate-800">
                            <AvatarImage src="/placeholder-avatar.jpg" />
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">CO</AvatarFallback>
                        </Avatar>
                        <CardTitle>{application.name}</CardTitle>
                        <CardDescription>{application.email}</CardDescription>
                        <div className="flex justify-center gap-2 mt-4">
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                                {application.role} Applicant
                            </Badge>
                            <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                                {application.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4 pt-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded transition-colors">
                                <Mail className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">{application.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded transition-colors">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">{application.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm p-2 hover:bg-slate-50 rounded transition-colors">
                                <FileText className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-700">Applied: {application.appliedDate}</span>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Teaching Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {application.subjects.map(sub => (
                                    <Badge key={sub} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">{sub}</Badge>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Bio</p>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-slate-200 pl-3">
                                "{application.bio}"
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-2 pb-6 px-6">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            <Check className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200">
                            <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                    </CardFooter>
                </Card>

                {/* Right Column: Document Verification & List */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Documents Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Submitted Documents</CardTitle>
                            <CardDescription>Verify the user's credentials for compliance.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid gap-4 sm:grid-cols-2">
                                {application.documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center p-3 border border-slate-200 rounded-lg hover:border-primary/50 transition-colors group cursor-pointer bg-slate-50">
                                        <div className="h-10 w-10 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3 flex-1 overflow-hidden">
                                            <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{doc.type}</span>
                                                <span>•</span>
                                                <span>{doc.size}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                             </div>
                             <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-sm text-amber-800">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                                <p>Ensure the <strong>NIN Slip</strong> matches the name on the application exactly. Check TRCN database for license validity.</p>
                             </div>
                        </CardContent>
                    </Card>

                    {/* User List Table Placeholder */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Recent Registrations</CardTitle>
                                <div className="flex w-full max-w-sm items-center space-x-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                        <Input type="search" placeholder="Search name, email or NIN..." className="pl-9 h-9" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                        <tr>
                                            <th className="h-10 px-4">Name</th>
                                            <th className="h-10 px-4">Role</th>
                                            <th className="h-10 px-4">State</th>
                                            <th className="h-10 px-4">Status</th>
                                            <th className="h-10 px-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                                <span className="material-symbols-outlined text-3xl mb-2 text-slate-300">recent_actors</span>
                                                <p>No recent registrations.</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
