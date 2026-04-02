import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageCircle, HelpCircle, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, BookOpen, GraduationCap } from 'lucide-react';

const FAQs = {
  general: [
    {
      q: "How does MyTutorMe work?",
      a: "MyTutorMe connects students with expert tutors across various subjects. You can purchase courses, schedule tailored live sessions, and track your GPA/progress using our AI-driven tools."
    },
    {
      q: "What payment methods are supported?",
      a: "We support major credit cards and mobile money options through Paystack."
    }
  ],
  students: [
    {
      q: "Do I need a Pro account to buy courses?",
      a: "No! Course purchases are available to all students dynamically. The Pro plan provides extra AI capabilities, flashcards, advanced grading, and analytics."
    },
    {
      q: "How do I access materials after buying a course?",
      a: "Once purchased, courses are instantly available in your 'My Courses' dashboard."
    },
    {
      q: "Can I get a refund if I'm not satisfied?",
      a: "If you interact with less than 20% of a course and request a refund within 3 days, we review it on a case-by-case basis. Email us at support@mytutorme.org."
    }
  ],
  teachers: [
    {
      q: "When do I get paid?",
      a: "Teacher payouts are processed automatically at the end of every week for all successful course sales and subscriptions."
    },
    {
      q: "What is the platform's cut?",
      a: "Our standard commission is 30% of course sales to cover platform resources and payment gateways, but this may differ based on your teacher subscription plan."
    },
    {
      q: "How do I communicate with my students?",
      a: "You can utilize the platform's Community and messaging features to connect directly with enrolled students."
    }
  ]
};

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900/50 transition-all duration-200">
      <button 
        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-800/50"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-slate-800 dark:text-slate-200">{q}</span>
        {open ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
};

export const SupportPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const form = e.target as HTMLFormElement;
      await addDoc(collection(db, 'support_tickets'), {
        name: (form.elements.namedItem('name') as HTMLInputElement).value,
        email: (form.elements.namedItem('email') as HTMLInputElement).value,
        role: (form.elements.namedItem('role') as HTMLSelectElement).value,
        subject: (form.elements.namedItem('subject') as HTMLInputElement).value,
        message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
        status: 'open',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      form.reset();
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to drop ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B1120] font-body text-slate-800 dark:text-slate-100 selection:bg-primary/20 transition-colors duration-300 antialiased">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          
          {/* Hero Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-6">
              <MessageCircle className="h-4 w-4" />
              Help & Support Center
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
              How can we help you today?
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Find fast answers below or send our support team a message. We're here to ensure your educational journey runs smoothly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Content Column - FAQ & Info */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-10">
              
              {/* Need to Know Section */}
              <section>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                  <AlertCircle className="h-6 w-6 text-indigo-500" />
                  Need to Know Before Getting Started
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-emerald-500" />
                        For Students
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                      <p className="flex items-start gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                         Ensure your profile is complete to get tailored AI recommendations.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                         Check out course previews before purchasing to ensure it meets your requirements.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                         Upgrading to Pro unlocks the exam simulator, infinite flashcards, and priority AI assignment help.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-amber-500" />
                        For Teachers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                      <p className="flex items-start gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                         All teacher accounts must undergo a verification process before deploying paid courses to the marketplace.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                         You must input valid payout account details to receive your automated weekly compensations.
                      </p>
                      <p className="flex items-start gap-2">
                         <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                         Maintaining high ratings ensures greater visibility on the community boards.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* FAQ Section */}
              <section>
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
                  <HelpCircle className="h-6 w-6 text-indigo-500" />
                  Frequently Asked Questions
                </h2>
                
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800/80 p-1 flex">
                    <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
                    <TabsTrigger value="students" className="flex-1">Students</TabsTrigger>
                    <TabsTrigger value="teachers" className="flex-1">Teachers</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-3 mt-0">
                    {FAQs.general.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                  </TabsContent>
                  
                  <TabsContent value="students" className="space-y-3 mt-0">
                    {FAQs.students.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                  </TabsContent>
                  
                  <TabsContent value="teachers" className="space-y-3 mt-0">
                    {FAQs.teachers.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                  </TabsContent>
                </Tabs>
              </section>

            </div>

            {/* Right Content Column - Contact Form */}
            <div className="lg:col-span-5 xl:col-span-4 sticky top-28">
              <Card className="shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 pb-6 rounded-t-xl">
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-900 dark:text-white">
                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Drop a Support Ticket
                  </CardTitle>
                  <CardDescription>
                    Fill out the form below. Our response time is usually under 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {submitted ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Ticket Submitted!</h3>
                      <p className="text-sm text-slate-500">We've received your request and will get back to you shortly at the provided email address.</p>
                      <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                        Submit Another
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleTicketSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" required placeholder="John Doe" className="bg-slate-50 dark:bg-slate-900" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" required placeholder="you@example.com" className="bg-slate-50 dark:bg-slate-900" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="role">I am a...</Label>
                        <select 
                          id="role" 
                          name="role"
                          required 
                          className="flex h-10 w-full rounded-md border border-input bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher / Tutor</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" name="subject" required placeholder="What do you need help with?" className="bg-slate-50 dark:bg-slate-900" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message">Message Details</Label>
                        <Textarea 
                          id="message" 
                          name="message"
                          required 
                          placeholder="Describe the issue or question in detail..." 
                          className="min-h-[120px] bg-slate-50 dark:bg-slate-900 resize-none" 
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending Request...' : 'Submit Ticket'}
                      </Button>
                    </form>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 rounded-b-xl py-4 flex-col gap-2 text-center text-sm text-slate-500">
                  <p>Or email us directly at:</p>
                  <a href="mailto:support@mytutorme.org" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                    support@mytutorme.org
                  </a>
                </CardFooter>
              </Card>
            </div>
            
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SupportPage;
