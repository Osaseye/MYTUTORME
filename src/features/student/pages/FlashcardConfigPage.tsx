import { useState } from 'react';
import { Layers, Sparkles, BookOpen, ChevronRight, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFlashcardGenerator } from '../hooks/useFlashcardGenerator';
import { Input } from '@/components/ui/input';

export const FlashcardConfigPage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState([10]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('medium');
  const { generateDeck, isGenerating } = useFlashcardGenerator();

  const handleGenerate = async () => {
    if (!subject || !topic) {
      toast.error('Please enter both subject and topic.');
      return;
    }

    const deckId = await generateDeck({
      subject: subject.trim(),
      topic: topic.trim(),
      difficulty,
      count: cardCount[0]
    });

    if (deckId) {
      navigate(`/student/exam-prep/flashcards/${deckId}`);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">

        <div className="text-center">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
              <Layers className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
             AI Flashcard Generator
           </h1>
           <p className="text-slate-600 dark:text-slate-400">
             Create smart flashcard decks powered by global knowledge pool.
           </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-8">
           
           {/* Subject & Topic */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <BookOpen className="w-5 h-5 text-primary" />
                 Topic Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject (e.g. Biology)</label>
                    <Input 
                      placeholder="Enter subject..." 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Specific Topic (e.g. Mitosis)</label>
                    <Input 
                      placeholder="Enter topic..." 
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           {/* Difficulty */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5 text-primary" />
                 Difficulty Level
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {['easy', 'medium', 'hard'].map((level) => (
                    <button
                       key={level}
                       onClick={() => setDifficulty(level as any)}
                       className={`p-3 rounded-xl border-2 transition-all capitalize font-medium
                          ${difficulty === level 
                             ? 'border-primary bg-primary/5 text-primary' 
                             : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-primary/30'}`}
                    >
                       {level}
                    </button>
                 ))}
              </div>
           </div>

           {/* Count */}
           <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Number of Cards
                 </h2>
                 <span className="text-xl font-bold text-primary">{cardCount[0]}</span>
              </div>
              <Slider 
                value={cardCount} 
                onValueChange={setCardCount} 
                max={50} 
                min={5} 
                step={5} 
                className="py-4" 
              />
           </div>

           <Button 
               className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
               onClick={handleGenerate}
               disabled={isGenerating}
           >
              {isGenerating ? (
                 <>
                   <Sparkles className="w-5 h-5 animate-pulse" />
                   Generating Deck from Smart Pool...
                 </>
              ) : (
                 <>
                   Create Flashcards
                   <ChevronRight className="w-5 h-5" />
                 </>
              )}
           </Button>
        </div>
      </div>
    </div>
  );
};