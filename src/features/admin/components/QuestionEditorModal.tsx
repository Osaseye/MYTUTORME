import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, CheckCircle2 } from 'lucide-react';

export interface QuestionDraft {
  id?: string;
  question: string;
  type: 'mcq' | 'theory';
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  marks: number;
  topicArea: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Props {
  initial: QuestionDraft | null;
  isNew: boolean;
  onSave: (q: QuestionDraft) => void;
  onClose: () => void;
}

const EMPTY: QuestionDraft = {
  question: '',
  type: 'mcq',
  options: ['', '', '', ''],
  correctAnswer: 0,
  explanation: '',
  marks: 1,
  topicArea: '',
  difficulty: 'medium',
};

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const QuestionEditorModal = ({ initial, isNew, onSave, onClose }: Props) => {
  const [draft, setDraft] = useState<QuestionDraft>(EMPTY);

  useEffect(() => {
    if (initial) {
      setDraft({
        ...EMPTY,
        ...initial,
        options: initial.options?.length === 4
          ? initial.options
          : ['', '', '', ''].map((_, i) => initial.options?.[i] ?? ''),
        correctAnswer: initial.correctAnswer ?? 0,
      });
    } else {
      setDraft({ ...EMPTY });
    }
  }, [initial]);

  const set = <K extends keyof QuestionDraft>(key: K, val: QuestionDraft[K]) =>
    setDraft(prev => ({ ...prev, [key]: val }));

  const setOption = (idx: number, val: string) =>
    setDraft(prev => {
      const opts = [...prev.options];
      opts[idx] = val;
      return { ...prev, options: opts };
    });

  const handleSave = () => {
    if (!draft.question.trim()) return;
    const payload: QuestionDraft = {
      ...draft,
      question: draft.question.trim(),
      explanation: draft.explanation.trim(),
      topicArea: draft.topicArea.trim(),
      marks: Number(draft.marks) || 1,
    };
    if (payload.type === 'theory') {
      payload.options = [];
      payload.correctAnswer = '';
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="font-bold text-slate-900 dark:text-white text-lg">
            {isNew ? 'Add New Question' : 'Edit Question'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Question Type Toggle */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Question Type</label>
            <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden w-fit">
              {(['mcq', 'theory'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => set('type', t)}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${
                    draft.type === t
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {t === 'mcq' ? 'Multiple Choice' : 'Theory / Short Answer'}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Question Text <span className="text-rose-500">*</span></label>
            <Textarea
              value={draft.question}
              onChange={e => set('question', e.target.value)}
              rows={3}
              placeholder="Enter the question..."
              className="bg-white dark:bg-slate-950 resize-none"
            />
          </div>

          {/* MCQ Options */}
          {draft.type === 'mcq' && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Answer Options</label>
              <div className="space-y-2">
                {draft.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button
                      onClick={() => set('correctAnswer', i)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                        draft.correctAnswer === i
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:border-emerald-400'
                      }`}
                      title="Set as correct answer"
                    >
                      {draft.correctAnswer === i
                        ? <CheckCircle2 className="h-4 w-4" />
                        : OPTION_LABELS[i]}
                    </button>
                    <Input
                      value={opt}
                      onChange={e => setOption(i, e.target.value)}
                      placeholder={`Option ${OPTION_LABELS[i]}`}
                      className="bg-white dark:bg-slate-950"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Click the circle to mark the correct answer.</p>
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Explanation / Model Answer</label>
            <Textarea
              value={draft.explanation}
              onChange={e => set('explanation', e.target.value)}
              rows={2}
              placeholder="Explain the correct answer or provide a model answer for theory..."
              className="bg-white dark:bg-slate-950 resize-none"
            />
          </div>

          {/* Row: Marks + Difficulty + Topic */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Marks</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={draft.marks}
                onChange={e => set('marks', Number(e.target.value))}
                className="bg-white dark:bg-slate-950"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</label>
              <select
                value={draft.difficulty}
                onChange={e => set('difficulty', e.target.value as QuestionDraft['difficulty'])}
                className="w-full h-10 rounded-md border border-input bg-white dark:bg-slate-950 px-3 text-sm text-slate-900 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Topic Area</label>
              <Input
                value={draft.topicArea}
                onChange={e => set('topicArea', e.target.value)}
                placeholder="e.g. PHP Variables"
                className="bg-white dark:bg-slate-950"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 sticky bottom-0 bg-white dark:bg-slate-900">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSave}
            disabled={!draft.question.trim()}
          >
            {isNew ? 'Add Question' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};
