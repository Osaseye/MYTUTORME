// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, BrainCircuit, ChevronLeft, ChevronRight, Lightbulb, CheckCircle2, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalLoader } from '@/components/ui/global-loader';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

export const FlashcardPlayerPage = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
   const { user } = useAuth();
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      if (!deckId) return;
      try {
        const deckDoc = await getDoc(doc(db, 'flashcard_decks', deckId));
        if (deckDoc.exists()) {
          const deckData = deckDoc.data();
          setDeck(deckData);
          
          const cardPromises = deckData.flashcardIds.map((id: string) => 
            getDoc(doc(db, 'flashcards', id))
          );
          
          const cardDocs = await Promise.all(cardPromises);
          const loadedCards = cardDocs.map(c => ({ id: c.id, ...c.data() } as Flashcard));
          setCards(loadedCards);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [deckId]);

  if (loading) return <GlobalLoader />;
  if (!deck || cards.length === 0) return <div>Deck not found</div>;

  const handleNext = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex(0);
  };

   const handleShareDeck = async () => {
      if (!deckId) return;
      const shareUrl = `${window.location.origin}/student/exam-prep/flashcards/${deckId}${user?.uid ? `?ref=${user.uid}` : ''}`;

      try {
         if (navigator.share) {
            await navigator.share({
               title: deck?.title || 'Flashcard Deck',
               text: 'Practice this flashcard deck on MyTutorMe',
               url: shareUrl,
            });
         } else {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Flashcard share link copied!');
         }
      } catch (error) {
         if ((error as Error)?.name !== 'AbortError') {
            console.error('Failed to share deck:', error);
            toast.error('Could not share deck link right now.');
         }
      }
   };

  const isCompleted = currentIndex === cards.length;
  const currentCard = cards[currentIndex];

  

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <Button variant="ghost" onClick={() => navigate('/student/exam-prep')} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Prep
           </Button>
           <div className="text-center">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{deck.title}</h1>
              <p className="text-sm text-slate-500 capitalize">{deck.difficulty} Difficulty</p>
           </div>
           <Button variant="outline" onClick={handleShareDeck} className="gap-2">
              <Share2 className="w-4 h-4" /> Share
           </Button>
        </div>

        {/* Progress */}
        {!isCompleted && (
          <div className="mb-8">
             <div className="flex justify-between text-sm font-medium text-slate-500 mb-2">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span>{Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
             </div>
             <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-primary transition-all duration-300"
                   style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                />
             </div>
          </div>
        )}

        {isCompleted ? (
           <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/40 text-green-600 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Deck Completed!</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">You went through all {cards.length} flashcards.</p>
              <div className="flex justify-center gap-4">
                 <Button variant="outline" onClick={handleRestart} className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Restart Deck
                 </Button>
                 <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => navigate('/student/exam-prep')}>
                    Finish Session
                 </Button>
              </div>
           </div>
        ) : (
           <div className="space-y-6">
              {/* Flashcard Component */}
              <div
                 className="relative w-full h-80 perspective-1000 cursor-pointer"
                 onClick={() => setIsFlipped(!isFlipped)}
              >
                 <div className={`w-full h-full transform-style-3d transition-transform duration-500 relative ${isFlipped ? 'rotate-x-180' : ''}`}>
                    
                    {/* Front */}
                    <div className={`absolute w-full h-full backface-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center ${isFlipped ? 'hidden' : ''}`}>
                       <h3 className="text-2xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">
                          {currentCard?.front}
                       </h3>
                       <div className="absolute bottom-6 text-sm text-slate-400 flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4" /> Click to flip
                       </div>
                    </div>

                    {/* Back */}
                    <div className={`absolute w-full h-full backface-hidden bg-primary/5 dark:bg-primary/10 rounded-3xl shadow-xl border-2 border-primary/20 flex flex-col items-center justify-center p-8 text-center rotate-x-180 ${!isFlipped ? 'hidden' : ''}`}>
                       <p className="text-xl md:text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
                          {currentCard?.back}
                       </p>
                    </div>

                 </div>
              </div>

              {/* Hint Logic */}
              <div className="flex justify-center h-12">
                 {!isFlipped && currentCard?.hint && (
                    showHint ? (
                       <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center animate-fade-in gap-2">
                          <Lightbulb className="w-4 h-4" /> {currentCard.hint}
                       </p>
                    ) : (
                       <Button variant="ghost" size="sm" className="text-slate-500 hover:text-amber-500 gap-2" onClick={(e) => { e.stopPropagation(); setShowHint(true); }}>
                          <Lightbulb className="w-4 h-4" /> Show Hint
                       </Button>
                    )
                 )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between mt-8">
                 <Button 
                    variant="outline" 
                    size="lg" 
                    className="gap-2" 
                    onClick={handlePrev} 
                    disabled={currentIndex === 0}
                 >
                    <ChevronLeft className="w-5 h-5" /> Previous
                 </Button>
                 
                 <Button 
                    size="lg" 
                    className="gap-2 bg-primary hover:bg-primary/90" 
                    onClick={() => {
                        if(currentIndex === cards.length - 1) {
                           setCurrentIndex(cards.length); // trigger complete
                        } else {
                           handleNext();
                        }
                    }}
                 >
                    {currentIndex === cards.length - 1 ? 'Complete' : 'Next'} <ChevronRight className="w-5 h-5" />
                 </Button>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};
