# MyTutorMe — Product Update & Feature Roadmap
> Generated from brainstorming session — April 2026
> For use with GitHub Copilot as implementation reference

---

## 1. PWA Fixes

### 1.1 Google OAuth Infinite Load (signInWithPopup broken in PWA)
- **Problem:** `signInWithPopup` hangs forever in PWA standalone mode on mobile
- **Fix:** Detect PWA mode and switch to `signInWithRedirect`

```typescript
const isPWA = window.matchMedia("(display-mode: standalone)").matches;

export const signInWithGoogle = async () => {
  if (isPWA) {
    await signInWithRedirect(auth, provider);
  } else {
    await signInWithPopup(auth, provider);
  }
};
```

- Handle redirect result in `App.tsx` on load:

```typescript
useEffect(() => {
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        // handle signed in user
      }
    })
    .catch(console.error);
}, []);
```

---

### 1.2 PWA Opens on Landing Page Instead of Dashboard
- **Fix 1 — manifest.json:** Change `start_url` to `/dashboard`

```json
{
  "start_url": "/dashboard",
  "scope": "/"
}
```

- **Fix 2 — Route guard in App.tsx:**

```typescript
const isPWA = window.matchMedia("(display-mode: standalone)").matches;

useEffect(() => {
  if (isPWA && location.pathname === "/") {
    currentUser ? navigate("/dashboard") : navigate("/login");
  }
}, [isPWA, currentUser]);
```

---

### 1.3 Google OAuth Consent Screen Branding
- Go to Google Cloud Console → APIs & Services → OAuth Consent Screen
- Set **App name** to `MyTutorMe`
- Upload logo (120×120px max, PNG/JPG under 1MB)
- This replaces `mytutorme-1f7cb.firebaseapp.com` with `MyTutorMe` on the account picker

---

## 2. Courses Page

### 2.1 Content Strategy — GED Courses (Babcock)
- Populate courses page with **admin-authored GED course notes** as MyTutorMe-branded content
- Content format: original summaries (not lifted text) to avoid copyright
- Each course ends with a **mock exam simulating the real CHAD exam format**
- Export as **branded PDF** with MyTutorMe logo watermark and color scheme

**Why this works:**
- GEDs are compulsory for all Babcock students = 100% of target market
- Branded PDFs shared via WhatsApp = free distribution/marketing
- Mock exams = strong retention loop

---

### 2.2 Multi-Institution Scaling — Firestore Schema

```typescript
course: {
  title: string,
  institution: "babcock" | "unilag" | "covenant" | "general",
  courseCode: string,           // e.g. "SOS 101"
  category: "ged" | "faculty" | "professional" | "skill",
  level: "100" | "200" | "300" | "400",
  department: "all" | "engineering" | "law" | "sciences",
  createdBy: "admin" | tutorId,
  isPremium: boolean,
  rating: number,
  thumbnail: string,
  createdAt: Timestamp
}
```

- `institution: "general"` = visible to all schools
- Student's school + department set at onboarding → courses page auto-filters

**Courses Page Tabs:**
```
For You | GEDs | Faculty Courses | General | All
```

---

### 2.3 Course Share Links with Rich OG Preview

- Share URL format: `mytutorme.com/courses/sos101?ref=alex`
- OG meta tags on course page:

```typescript
<meta property="og:title" content={`${referrer} invites you to learn ${course.title} on MyTutorMe`} />
<meta property="og:image" content={`https://yourdomain.com/api/og?course=${courseId}&ref=${referrerName}`} />
<meta property="og:description" content="Notes, mock exams and AI tutoring — all in one place." />
```

- `/api/og` = Cloud Function that generates a branded course preview image (course name + MyTutorMe logo + referrer name on brand background)
- Cross-institution smart matching: if a UNILAG student opens a Babcock course link, suggest the closest equivalent for their school

---

### 2.4 Additional Course Features
- **Progress certificate** — branded PDF on course completion, shareable on LinkedIn
- **"Study with a friend"** — invite classmate, see each other's progress on same course
- **Difficulty tags** — Beginner / Intermediate / Advanced
- **Course ratings** — already built ✅

---

## 3. AI Tutor Page

### 3.1 Streaming Responses (Priority #1)

```typescript
const sendMessage = async (userMessage: string) => {
  const model = firebaseAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  setMessages(prev => [...prev, { role: "ai", content: "", id: Date.now() }]);

  const result = await model.generateContentStream(userMessage);

  let fullText = "";
  for await (const chunk of result.stream) {
    fullText += chunk.text();
    setMessages(prev => {
      const updated = [...prev];
      updated[updated.length - 1].content = fullText;
      return updated;
    });
  }
};
```

---

### 3.2 Markdown Rendering (react-markdown)

```bash
npm install react-markdown remark-gfm rehype-highlight highlight.js
```

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const AIMessage = ({ content }: { content: string }) => (
  <div className="ai-bubble">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({ inline, className, children }) {
          return inline ? (
            <code className="inline-code">{children}</code>
          ) : (
            <div className="code-block">
              <button onClick={() => navigator.clipboard.writeText(String(children))}>
                Copy
              </button>
              <code className={className}>{children}</code>
            </div>
          );
        },
        table: ({ children }) => (
          <div className="table-wrapper">
            <table>{children}</table>
          </div>
        ),
      }}
    />
  </div>
);
```

Renders: **bold**, bullet points, headers, syntax-highlighted code blocks, tables, inline code.

---

### 3.3 Typing Indicator

```tsx
const TypingIndicator = () => (
  <div className="typing-indicator">
    <span /><span /><span />
  </div>
);
```

```css
.typing-indicator span {
  width: 8px; height: 8px;
  background: var(--brand-color);
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: bounce 1.2s infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
```

Show between user message and first streaming token.

---

### 3.4 System Prompt — Formatting Rules

```typescript
const TUTOR_SYSTEM_PROMPT = `
You are MyTutorMe AI, a friendly academic tutor for Nigerian university students.

FORMATTING RULES — always follow these:
- Use markdown for ALL responses
- Use headers (##) to break up long explanations
- Use bullet points for lists, never long paragraphs
- Use **bold** for key terms and definitions
- Use code blocks with language tags for any code
- Use tables for comparisons
- Keep responses concise — students are on mobile
- End complex explanations with a one-line summary starting with "💡 In short:"

TONE: Friendly, encouraging, never condescending.
`;
```

---

### 3.5 Additional AI Tutor Features
- **Voice mode** — student speaks question, AI responds (future sprint)
- **"Explain like I'm confused"** button — one-tap re-explanation, simpler
- **Subject personas** — already built ✅
- **Session memory welcome message** — "Last time we covered X, want to continue?"
- **Tutor rating** — after each session, student rates helpfulness

---

## 4. Exam Prep

### 4.1 Existing Features
- Adaptive mock exams ✅
- Study streak ✅
- Timed exam mode ✅ (auto-calculates based on question count)
- Flashcard generation on user command ✅

---

### 4.2 New: User-Chosen Time Limit
- Add override input on exam start screen
- Default = auto-calculated, but student can adjust
- Feed into exam format preview (see 4.5)

---

### 4.3 Theory Questions Support
- Currently MCQ only
- Add `questionType: "mcq" | "theory"` to question schema
- Theory questions include `marks` field and open text answer input
- Manual grading or AI-assisted grading for theory answers

---

### 4.4 Smart Mock Exam Generator — Full Flow

**Upload UI:**
```
[ Upload Notes ]  [ Upload Past Questions ]  →  [ Generate Mock Exam ]
```
Accepts: PDF, PNG/JPG (photos of handwritten papers), TXT, DOCX

---

**Step 1 — Format Detection (Gemini Call 1):**

```typescript
const detectFormat = async (file: File) => {
  const base64 = await fileToBase64(file);

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType: file.type } },
    {
      text: `Analyse this past exam paper and return ONLY valid JSON:
      {
        "examFormat": "mcq" | "theory" | "mixed",
        "totalQuestions": number,
        "timeAllowed": number,
        "sections": [{ "name": string, "questionType": string, "questionCount": number, "marksEach": number }],
        "topicAreas": string[],
        "questionStyle": string
      }`
    }
  ]);

  return JSON.parse(result.response.text());
};
```

---

**Step 2 — Format Preview Screen:**
Show detected format to student before generating:
- Total questions, time allowed, format type
- Detected topic areas as tags
- Allow student to override time limit
- "Looks good — Generate Exam" CTA

---

**Step 3 — Exam Generation (Gemini Call 2):**

```typescript
const prompt = `
  Using the study notes provided, generate a mock exam matching this format: ${JSON.stringify(format)}
  
  Rules:
  - MCQ options must be A, B, C, D with exactly one correct answer
  - Theory questions must specify marks
  - Questions must come ONLY from the notes content
  - Vary difficulty: 40% easy, 40% medium, 20% hard
  - Return ONLY valid JSON:
  
  {
    "title": string,
    "timeAllowed": number,
    "sections": [{
      "name": string,
      "type": "mcq" | "theory",
      "questions": [{
        "id": string,
        "question": string,
        "type": "mcq" | "theory",
        "options": string[] | null,
        "correctAnswer": string | null,
        "marks": number,
        "difficulty": "easy" | "medium" | "hard",
        "topicArea": string,
        "explanation": string
      }]
    }]
  }
`;
```

---

**Step 4 — Save to Firestore:**

```typescript
await addDoc(collection(db, "generatedExams"), {
  ...exam,
  userId,
  createdAt: serverTimestamp(),
  status: "not_started",
  score: null,
  weakTopics: [],
});
```

---

### 4.5 Weak Topic Detector (Post-Exam)

```typescript
const detectWeakTopics = (questions: Question[], answers: Record<string, string>) => {
  const wrong = questions.filter(q => answers[q.id] !== q.correctAnswer);

  const weakMap = wrong.reduce((acc, q) => {
    acc[q.topicArea] = (acc[q.topicArea] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(weakMap)
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => ({ topic, wrongCount: count }));
};
```

Output shown to student:
> *"You struggled most with: Socialization (4/5 wrong) — Review with AI Tutor?"*

**Key:** Direct CTA from Exam Prep → AI Tutor. Links the whole app together.

---

### 4.6 Exam Countdown
- Student sets exam date during onboarding or on exam prep page
- Dashboard widget shows days remaining
- Triggers study plan suggestions as date approaches

---

### 4.7 Collaborative Flashcard Decks
- Student generates a flashcard deck
- Tap "Share Deck" → generates share link
- Friend opens link → imports deck into their account
- Study streak rewards for consistent flashcard review

---

### 4.8 Study Streak Rewards
```
7-day streak    → unlock 1 free mock exam
14-day streak   → unlock bonus flashcard deck
30-day streak   → 1 week Pro free
```

---

## 5. GPA Tracker

### 5.1 Existing Features
- What-if GPA simulator ✅
- Target GPA planner ✅
- First class alert ✅

---

### 5.2 New Features

**Per-course grade history**
- Track grade per course across semesters
- Show how each course impacted overall GPA

**Semester comparison chart**
- GPA graph across all semesters
- Visual improvement tracking

**Retake impact calculator**
> "If I retake GST 212 and score 70, what happens to my GPA?"

**Credit unit visualiser**
- Show which courses carry the most GPA weight
- 4-unit course impact vs 2-unit clearly displayed
- Warn students before they underperform in high-credit courses

**Academic standing alerts**
- Not just first class — warn when GPA drops significantly
- Scholarship risk warning
- Dean's list notification

**End of semester report card**
- Branded MyTutorMe PDF
- Shows GPA, grade per course, improvement from last semester
- Shareable (students will post on Instagram/stories)

**GPA → Exam Prep Handoff**
When what-if simulator shows student needs X score:
> "You need 75 in GST 212 to hit your target — Start Exam Prep for this course →"

---

## 6. Growth & Onboarding

### 6.1 Department-Specific Onboarding
Onboarding flow collects:
```
School → Department → Level → Exam date range (optional)
```

On completion, automatically:
- Pre-loads relevant GED courses for their school
- Pre-loads department-specific courses
- Sets AI Tutor persona to faculty context
- Pre-fills GPA tracker with department's typical course unit structure
- Surfaces relevant mock exams first on exam prep page

---

### 6.2 Referral Rewards — Tiered System

```
Refer 1 friend (signs up)      → 1 week Pro free
Refer 3 friends                → 1 month Pro free
Refer 5 friends                → 2 months Pro free + "Campus Rep" badge
Refer 10+ friends              → Permanent discount or revenue share
```

- Referral code generated on signup
- Stored on referred user's Firestore document
- Campus Rep badge shows on profile — status incentive for influential students
- Share URL: `mytutorme.com/signup?ref={code}`

---

### 6.3 Offline Mode Improvements
Already have basic offline mode. Additions needed:

- **Offline exam taking** — download exam, take offline, sync results on reconnect
- **Offline flashcard review** — downloaded decks work fully offline
- **Offline AI Tutor** — cache last N responses, graceful "you're offline" state
- **Explicit download** — "Save for offline" button on courses and flashcard decks
- **Download indicator** — show storage used, manage downloads

---

### 6.4 WhatsApp Bot
- Future scope 🔮
- Student texts MyTutorMe on WhatsApp → AI tutor responds
- Massive reach in Nigeria

---

## 7. Assignment Helper

### 7.1 Plagiarism-Safe Mode
- AI generates **ideas, outlines and structure only** — not full essays
- Keeps students academically honest and protects MyTutorMe legally
- Label it clearly in UI: *"We help you think, not cheat"*
- Output: structured outline with bullet points the student writes from

---

### 7.2 Citation Generator
- Student pastes a source URL or book reference
- AI returns it formatted in APA and MLA instantly
- Babcock uses APA heavily — this is high daily-use value
- Support: websites, journal articles, books, YouTube videos

---

### 7.3 Submission Checklist
- Before submitting an assignment, student pastes their work
- AI reviews and flags:
  - Missing sections based on the question/brief
  - Weak arguments or unsupported claims
  - Formatting issues (no references, no introduction etc.)
- Output: checklist of what to fix before submitting

---

### 7.4 Past Question Analyser
- Student uploads a past exam paper
- AI breaks down:
  - Recurring question patterns
  - Most tested topics
  - Question styles (analytical, descriptive, calculation-based)
- Output: *"This lecturer loves asking about X — it appeared in 4 of 5 past papers"*
- Connects directly into Exam Prep → smart mock exam generator

---

### 7.5 Assignment Helper → Exam Prep Handoff
When AI detects topics in an assignment the student struggled with:
> *"This topic also appears in your upcoming exam — want to prep for it now?"*

---

## 8. Mobile Navigation Bar Redesign

### 8.1 Problem with Current Nav
- Hamburger menu hides core features (Assignment Helper, GPA Tracker, Exam Prep) behind a floating vertical FAB stack
- Core features should never be more than one tap away
- Active state green circle bubble feels oversized and generic
- No labels make it unclear what each icon does

---

### 8.2 New Nav Structure
```
Home | Courses | [ AI Tutor ] | Exam Prep | More
```

- **5 slots total** — 4 standard tabs + 1 elevated center FAB
- **AI Tutor** is the center FAB — hero feature, always prominent
- **More** opens a proper **bottom sheet** (not a floating stack) containing:
  - Assignment Helper
  - GPA Tracker
  - Achievements
  - Settings
  - Tutors

---

### 8.3 Visual Spec for Copilot

**Nav Bar Container:**
- Floating pill shape, does not stretch edge-to-edge
- White background, soft drop shadow underneath
- Sits just above the bottom safe area with margin on left and right
- Rounded ends (fully circular border-radius)

**Inactive Tab Items:**
- Small clean outline icon (Lucide or Phosphor)
- Short label underneath in 10px font, dark grey
- No background behind them

**Active Tab Items:**
- Icon switches from outline → filled variant
- Icon and label both turn brand green
- Small green rounded pill/capsule sits behind the icon only (not the label)
- Pill is tight to the icon — not oversized like the current circle

**AI Tutor Center FAB:**
- Circular button, slightly larger than other icons
- Fully green background
- White icon inside (brain or bot)
- Elevated above the nav bar with a subtle upward bump
- Soft green glow/shadow beneath it

**More Tab:**
- Three-dot or grid icon
- Tapping opens a bottom sheet from the bottom of the screen
- Bottom sheet lists overflow items with icon + label rows
- Smooth slide-up animation, dismissible by swipe down or tap outside

---

### 8.4 Implementation Notes
- Use `position: fixed; bottom: 0` for the nav bar
- Center FAB uses `margin-top: -20px` or `transform: translateY(-20px)` to create the raised effect
- Active state pill: small `background: rgba(green, 0.15)` rounded div behind icon only
- Bottom sheet: use a library like `vaul` (Drawer) or build with Framer Motion slide animation

---

## 9. UI Design Reference

The following mockup shows the target visual direction for MyTutorMe's core screens — Community Forum, AI Tutor (Nova), Exam Prep Center — and the redesigned navigation bar.

![MyTutorMe UI Reference](./mytutorme-ui-reference.png)

**Key things to note from this reference:**
- Nav bar: dark pill, elevated center FAB, labeled tabs, green active state with dot indicator
- AI Tutor: named persona (Nova), 3D avatar, quick action buttons replacing empty state
- Exam Prep: progress stats card at top, subject grid below, recent activity list
- Community Forum: topic tags, post feed with upvotes, tab filters (Latest, Trending, Unanswered, Following)

---

## 10. Nova — AI Tutor Persona

### 10.1 Why Give the AI a Name and Avatar
- Transforms the AI tutor from a generic chatbox into a **product feature with identity**
- Students build a relationship with Nova — increases daily return rate
- Makes MyTutorMe feel more premium vs competitors

### 10.2 Nova's Personality Spec
```
Name: Nova
Tagline: "Your personal AI tutor"
Avatar: 3D robot character, friendly face, green color scheme matching brand
Status indicator: green "Online" dot when active
```

### 10.3 Nova's Quick Action Buttons (Replaces Empty State)
Instead of a blank input on first open, show 4 quick action cards:

```
[ 📖 Explain a concept     → ]   "I'll break it down simply"
[ ⚙️  Solve a problem       → ]   "Step-by-step solutions"
[ 🧠 Quiz me               → ]   "Test your knowledge"
[ 📅 Study plan            → ]   "Personalized for you"
```

Each button pre-fills the chat with a structured prompt and launches the conversation immediately.

### 10.4 Suggested Prompts Row
Below quick actions, show 3 scrollable tappable example prompts:
```
"Explain recursion in Java"
"How do I solve quadratic equations?"
"Give me 5 practice questions on arrays"
```

### 10.5 Nova System Prompt Update

```typescript
const NOVA_SYSTEM_PROMPT = `
You are Nova, MyTutorMe's personal AI tutor for Nigerian university students.
Introduce yourself as Nova on the first message only.

FORMATTING RULES:
- Use markdown for ALL responses
- Use ## headers to break up long explanations
- Use bullet points, never long paragraphs
- Bold key terms and definitions
- Use code blocks with language tags for any code
- Use tables for comparisons
- Keep responses concise — students are on mobile
- End complex explanations with "💡 In short: ..."

TONE: Friendly, encouraging, never condescending.
`;
```

### 10.6 Nav Bar Update for Nova
- Rename AI Tutor tab → **"Nova"**
- Use Nova's avatar as the nav tab icon
- Animate avatar with subtle pulse while a response is generating

---

## 11. Community Forum (Future Scope 🔮)

### 11.1 What It Is
A structured student Q&A forum inside MyTutorMe. Students post questions, others answer, upvote and follow topics. Think Stack Overflow meets a Babcock WhatsApp study group — but organised and in-app.

### 11.2 Why It's Valuable
- Students already ask each other questions in WhatsApp/Telegram group chats
- Bringing that into MyTutorMe keeps them in the app longer
- User-generated content means the platform grows without admin effort
- Unanswered questions can be routed to Nova automatically

### 11.3 Core Features
```
Post a question → tag by subject → community answers
Upvote best answers
Tab filters: Latest | Trending | Unanswered | Following
Topic tags: per course/subject
Community Guidelines pinned card
```

### 11.4 Nova Integration
When a question goes unanswered for X hours, Nova auto-answers with a bot badge on the response. Or surface a CTA:
> *"No answer yet — Ask Nova directly →"*

### 11.5 Why Not Now
- Needs critical mass of users to feel alive — a dead forum hurts more than no forum
- Requires moderation infrastructure
- **Trigger: add after first 500 active users**

---

## 12. Landing Page

### 7.1 Phone Mockup Hero Section
- Take screenshots of best MyTutorMe screens (dashboard, course page, AI tutor)
- Generate phone mockups at **shots.so** or **deviceframes.com** (free)
- Layer 3 phone mockups in hero section using CSS positioning:

```css
.hero-mockups { position: relative; height: 600px; }
.phone-center { position: absolute; left: 50%; transform: translateX(-50%); z-index: 3; }
.phone-left   { position: absolute; left: 5%; transform: rotate(-15deg); z-index: 2; }
.phone-right  { position: absolute; right: 5%; transform: rotate(15deg); z-index: 2; }
```

---

## 13. Implementation Priority Order

### Immediate (Next Sprint)
1. PWA OAuth fix — `signInWithRedirect`
2. Fix `start_url` in manifest
3. OAuth consent screen branding (Google Cloud Console)
4. AI Tutor — streaming responses + react-markdown renderer
5. AI Tutor — system prompt formatting rules → Nova persona
6. Nav bar redesign — dark pill, elevated Nova FAB, labeled tabs

### Short Term
7. Nova quick action buttons + suggested prompts (replaces empty state)
8. GED course content creation (admin-authored, Babcock)
9. Courses — institution + category Firestore tagging
10. Exam prep — smart mock exam generator (upload flow)
11. Weak topic detector post-exam
12. GPA — retake calculator + credit unit visualiser
13. Assignment Helper — citation generator + submission checklist
14. Assignment Helper — past question analyser

### Medium Term
15. Department-specific onboarding
16. Referral rewards system
17. Course share links with OG preview image
18. Collaborative flashcard decks
19. Exam countdown widget
20. Offline mode improvements
21. Assignment Helper → Exam Prep handoff CTA

### Future
22. Community Forum (trigger: 500+ active users)
23. Progress certificates (PDF)
24. Study with a friend
25. End of semester report card (PDF)
26. WhatsApp bot

---

*This document was generated from a product brainstorming session for MyTutorMe by SIDID Limited.*
