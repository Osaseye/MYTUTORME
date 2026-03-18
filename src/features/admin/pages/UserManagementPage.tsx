import { 
  Check, 
  X, 
  Download, 
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export const UserManagementPage = () => {
    
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
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">NA</AvatarFallback>
                        </Avatar>
                        <CardTitle>No User Selected</CardTitle>
                        <CardDescription>Please select a user to view details</CardDescription>
                    </CardHeader>
                    <Separator />
                    <CardContent className="space-y-4 pt-6 text-center text-slate-500 py-12">
                        Select a user from the list to view their application details.
                    </CardContent>
                    <CardFooter className="flex gap-2 pt-2 pb-6 px-6">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled>
                            <Check className="w-4 h-4 mr-2" /> Approve
                        </Button>
                        <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" disabled>
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
                                <div className="col-span-full p-8 text-center text-slate-500 border border-dashed rounded-lg">
                                    <span className="material-symbols-outlined text-3xl mb-2 text-slate-300">description</span>
                                    <p>No documents to display.</p>
                                </div>
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
