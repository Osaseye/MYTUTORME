import { useState } from 'react';
import { 
  Save, 
  ChevronLeft, 
  LayoutList, 
  Settings, 
  Video, 
  FileText, 
  HelpCircle, 
  Plus, 
  GripVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export const CourseCreationPage = () => {
    const [activeTab, setActiveTab] = useState('basic');

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-4 z-10 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Course</h1>
                        <p className="text-sm text-slate-500">Draft - Last saved 2 mins ago</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Preview</Button>
                    <Button className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Course
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-lg inline-flex">
                    <TabsTrigger value="basic" className="px-6 gap-2">Basic Info</TabsTrigger>
                    <TabsTrigger value="curriculum" className="px-6 gap-2">Curriculum</TabsTrigger>
                    <TabsTrigger value="settings" className="px-6 gap-2">Settings</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-6 animate-in slide-in-from-left-4 fade-in duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>
                                Provide the basic information about your course.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title</Label>
                                <Input id="title" placeholder="e.g. Advanced Web Development 2024" className="text-lg font-medium" />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea 
                                    id="description" 
                                    placeholder="What will students learn in this course?" 
                                    className="min-h-[150px]" 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300">
                                        <option>Choose a category</option>
                                        <option>Development</option>
                                        <option>Business</option>
                                        <option>Design</option>
                                        <option>Marketing</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level</Label>
                                    <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                        <option>All Levels</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label>Thumbnail</Label>
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                        <Video className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <Card>
                         <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Curriculum Builder</CardTitle>
                                <CardDescription>
                                    Organize your course into sections and lessons.
                                </CardDescription>
                            </div>
                            <Button size="sm" className="gap-2">
                                <Plus className="h-4 w-4" /> Add Section
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Section Item */}
                            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
                                    <GripVertical className="h-5 w-5 text-slate-400 cursor-move" />
                                    <span className="font-semibold text-sm">Section 1: Introduction</span>
                                    <div className="ml-auto flex gap-2">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Settings className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2 bg-white dark:bg-slate-950">
                                     {/* Lesson Item */}
                                     <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group transition-all">
                                         <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                                         <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded text-blue-600 dark:text-blue-400">
                                            <Video className="h-4 w-4" />
                                         </div>
                                         <span className="text-sm">Welcome to the course</span>
                                         <Button size="sm" variant="ghost" className="ml-auto opacity-0 group-hover:opacity-100">Edit Content</Button>
                                     </div>
                                     
                                     {/* Another Lesson */}
                                     <div className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-md border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group transition-all">
                                         <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                                         <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded text-orange-600 dark:text-orange-400">
                                            <FileText className="h-4 w-4" />
                                         </div>
                                         <span className="text-sm">Course Prerequisites PDF</span>
                                         <Button size="sm" variant="ghost" className="ml-auto opacity-0 group-hover:opacity-100">Edit Content</Button>
                                     </div>

                                     <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-primary gap-2 mt-2 h-9 text-sm">
                                         <Plus className="h-4 w-4" /> Add Lesson via Upload
                                     </Button>
                                </div>
                            </div>
                            
                            {/* Section 2 */}
                             <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
                                <div className="bg-slate-50 dark:bg-slate-900 p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
                                    <GripVertical className="h-5 w-5 text-slate-400" />
                                    <span className="font-semibold text-sm">Section 2: Core Concepts</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-950 flex justify-center py-8">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Plus className="h-4 w-4" /> Add Lesson
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Settings Tab */}
                <TabsContent value="settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">Public Visibility</p>
                                        <p className="text-sm text-slate-500">Make this course visible to all students.</p>
                                    </div>
                                    <div className="bg-slate-200 w-12 h-6 rounded-full relative cursor-pointer">
                                        <div className="bg-white w-5 h-5 rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                                    </div>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
