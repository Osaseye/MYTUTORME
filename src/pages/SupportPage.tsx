import { useState } from 'react';
import { Mail, MessageCircle, Send, Plus, Minus, BookOpen, GraduationCap, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/features/auth/hooks/useAuth';

type FaqCategory = 'student' | 'teacher' | 'general';

interface FaqItem {
  question: string;
  answer: string;
  category: FaqCategory;
}

const faqs: FaqItem[] = [
  {
    category: 'student',
    question: 'How do I enroll in a course?',
    answer: 'Browse our course catalog and click on a course you find interesting. Course enrollment is now open to all students—you do not need a Pro account to purchase standard courses. Once purchased, the course will immediately appear in your Dashboard under My Courses.'
  },
  {
    category: 'student',
    question: 'How does the AI Tutor work?',
    answer: 'The AI Tutor provides 24/7 on-demand help with concepts you are struggling with. It uses advanced language models to offer contextual answers, coding help, equation solving, and document summarization. Your usage may be tied to your subscription plan (Free vs Pro) as Pro grants more premium queries.'
  },
  {
    category: 'student',
    question: 'Can I track my GPA through MyTutorMe?',
    answer: 'Yes! We have a built-in GPA tracker. Navigate to your GPA Tracker under the student dashboard, input your courses, credits, and grades, and the system will automatically calculate and graph your semester and cumulative GPA.'
  },
  {
    category: 'teacher',
    question: 'When and how do I get paid?',
    answer: 'Earnings from course sales are accumulated in your Earnings dashboard. Payouts are made automatically to your linked bank account or wallet every week. Standard teachers keep 70% of course revenue unless you are on a premium partnership tier.'
  },
  {
    category: 'teacher',
    question: 'How do I publish a new course?',
    answer: 'From your Teacher Dashboard, navigate to the "Courses" tab and click "Create Course". You will need to upload your video content, course materials, fill out the course details, and set a price. Once submitted, it may take a brief moment for our moderation team to approve the content.'
  },
  {
    category: 'teacher',
    question: 'What is the Premium Tools plan?',
    answer: 'The Premium Tools plan is a teacher subscription that unlocks advanced analytics, priority placement in search rankings, bulk importing for course modules, and lower platform fees on sales. You can upgrade from your Settings page.'
  },
  {
    category: 'general',
    question: 'I forgot my password, how can I reset it?',
    answer: 'On the login page, click the "Forgot Password?" link. Enter your registered email address, and we will send you a secure link to create a new password.'
  },
  {
    category: 'general',
    question: 'How can I report a technical issue?',
    answer: 'You can use the contact form on this page to send a direct support ticket. Alternatively, email us at support@mytutorme.org with details of your issue, and our team will get back to you.'
  }
];

export const SupportPage = () => {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<FaqCategory>('general');
  const [ticketStatus, setTicketStatus] = useState<"" | "sending" | "sent">("");

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('sending');
    // Simulate API call
    setTimeout(() => {
      setTicketStatus('sent');
      setTimeout(() => setTicketStatus(""), 3000);
    }, 1500);
  };

  const filteredFaqs = faqs.filter(faq => faq.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Navbar />``
      
      <main className="flex-grow pt-28 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Need Help? We've got you covered.</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Find answers to commonly asked questions, learn how to navigate your dashboard, or reach out to our support team directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Contact Form & Info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Contact Support</CardTitle>
                  <CardDescription>Send us a message and we'll reply as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleTicketSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input placeholder="John Doe" defaultValue={user ? user.displayName : ''} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <Input type="email" placeholder="john@example.com" defaultValue={user?.email || ''} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input placeholder="e.g., Course upload issue" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <Textarea placeholder="Describe your issue in detail..." rows={5} required />
                    </div>
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" disabled={ticketStatus === 'sending'}>
                      {ticketStatus === 'sending' ? (
                        <>Sending...</>
                      ) : ticketStatus === 'sent' ? (
                        <>Sent Successfully!</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-indigo-600 text-white">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-200" /> Official Email
                    </h3>
                    <p className="text-indigo-100 flex items-center gap-2">
                      <a href="mailto:support@mytutorme.org" className="hover:text-white underline underline-offset-4 decoration-indigo-300">support@mytutorme.org</a>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-indigo-200" /> Live Chat
                    </h3>
                    <p className="text-indigo-100">
                      Available Mon-Fri, 9am - 6pm (WAT) from your dashboard.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* FAQs */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
                  <CardDescription>Everything you need to know about navigating MyTutorMe.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button 
                      variant={activeTab === 'general' ? 'default' : 'outline'} 
                      onClick={() => setActiveTab('general')}
                      className={activeTab === 'general' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : ''}
                    >
                      <BookOpen className="w-4 h-4 mr-2" /> General
                    </Button>
                    <Button 
                      variant={activeTab === 'student' ? 'default' : 'outline'} 
                      onClick={() => setActiveTab('student')}
                      className={activeTab === 'student' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}
                    >
                      <GraduationCap className="w-4 h-4 mr-2" /> For Students
                    </Button>
                    <Button 
                      variant={activeTab === 'teacher' ? 'default' : 'outline'} 
                      onClick={() => setActiveTab('teacher')}
                      className={activeTab === 'teacher' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                    >
                      <MonitorPlay className="w-4 h-4 mr-2" /> For Teachers
                    </Button>
                  </div>

                  {/* Accordion list */}
                  <div className="space-y-3">
                    {filteredFaqs.map((faq, index) => {
                      const isActive = activeFaq === index;
                      return (
                        <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-all duration-200 bg-white dark:bg-slate-900">
                          <button
                            onClick={() => setActiveFaq(isActive ? null : index)}
                            className="w-full flex items-center justify-between p-4 text-left font-medium text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <span>{faq.question}</span>
                            {isActive ? (
                              <Minus className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            ) : (
                              <Plus className="w-4 h-4 text-slate-500 flex-shrink-0" />
                            )}
                          </button>
                          
                          {/* Animated Answer height */}
                          <div 
                            className={`px-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out ${isActive ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                          >
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              {faq.answer}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {filteredFaqs.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No FAQs found for this category.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};
