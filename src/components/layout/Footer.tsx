// ─── Link data ────────────────────────────────────────────────────────────────

const PLATFORM_LINKS = [
  { name: 'Home',              href: '/' },
  { name: 'Courses',           href: '/#courses' },
  { name: 'AI Tutor',          href: '/#platform' },
  { name: 'Exam Prep',         href: '/#platform' },
  { name: 'Pricing',           href: '/#pricing' },
];

const COMPANY_LINKS = [
  { name: 'About',              href: '/#hero' },
  { name: 'Support & FAQ',      href: '/support' },
  { name: 'Verify Certificate', href: '/verify' },
  { name: 'Privacy Policy',     href: '/privacy' },
  { name: 'Terms & Conditions', href: '/terms' },
];

// ─── Stripe clip-path data (precomputed, module-level) ─────────────────────
//
//  Each stripe is a diagonal parallelogram that clips one horizontal band of
//  the SVG text.  The "\" direction slant (SLANT px of vertical offset across
//  the full SVG width) produces the architectural, glass-panel look.
//  Opacity follows a bell-curve so the middle stripes are most visible.

const NUM_STRIPES = 13;
const VM_H        = 240;   // SVG viewBox height
const SLANT       = 78;    // diagonal offset in SVG user units

const STRIPE_CLIPS = Array.from({ length: NUM_STRIPES }, (_, i) => {
  const step = VM_H / NUM_STRIPES;
  const gap  = 4.2;
  const y1   = i * step;
  const y2   = y1 + step - gap;
  const t    = i / (NUM_STRIPES - 1);            // 0 → 1
  const bell = Math.sin(t * Math.PI);             // 0 → 1 → 0
  return {
    id:  `wm${i}`,
    // Extend well beyond the 0-1200 viewBox on both sides so the slanted
    // edge never leaves a gap at the extreme left or right.
    pts: `-350,${+y1.toFixed(2)} 1550,${+(y1 + SLANT).toFixed(2)} 1550,${+(y2 + SLANT).toFixed(2)} -350,${+y2.toFixed(2)}`,
    op:  +(0.036 + bell * 0.11).toFixed(4),      // 0.036 – 0.146
  };
});

// ─── Component ────────────────────────────────────────────────────────────────

export const Footer = () => (
  <footer className="relative bg-[#0A0A0A] overflow-hidden rounded-t-[2.5rem]">

    {/* ── Giant striped wordmark watermark ───────────────────────────────── */}
    {/*
        Positioning: absolute bottom-0 so it sits at the footer's lower edge.
        3-D treatment: perspective + rotateX makes the text appear to recede
        inward (like text on a floor), plus a micro skewX for an architectural tilt.
        The SVG uses 13 diagonal clipPath stripes, each revealing a thin band of
        the text at varying opacities — producing a segmented glass / vector-mask look.
    */}
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute bottom-0 left-0 right-0"
    >
      <div
        style={{
          transform: 'perspective(900px) rotateX(7deg) skewX(-0.8deg)',
          transformOrigin: 'bottom center',
        }}
      >
        <svg
          viewBox="0 0 1200 240"
          width="100%"
          preserveAspectRatio="xMidYMax meet"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          <defs>
            {STRIPE_CLIPS.map(({ id, pts }) => (
              <clipPath key={id} id={id}>
                <polygon points={pts} />
              </clipPath>
            ))}
          </defs>

          {/* One <text> per stripe — each clipped to its diagonal band */}
          {STRIPE_CLIPS.map(({ id, op }) => (
            <text
              key={id}
              clipPath={`url(#${id})`}
              x="600"
              y="218"
              textAnchor="middle"
              textLength="1185"
              lengthAdjust="spacingAndGlyphs"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="224"
              fontWeight="900"
              fill="white"
              fillOpacity={op}
            >
              MyTutorMe
            </text>
          ))}

          {/* Faint depth shadow: very slightly offset duplicate for cinematic glow */}
          <text
            x="603"
            y="221"
            textAnchor="middle"
            textLength="1185"
            lengthAdjust="spacingAndGlyphs"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="224"
            fontWeight="900"
            fill="white"
            fillOpacity="0.012"
          >
            MyTutorMe
          </text>
        </svg>
      </div>
    </div>

    {/* ── Footer content ─────────────────────────────────────────────────── */}
    <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-14">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

        {/* Brand + tagline + socials */}
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <img src="/icon.png" alt="MyTutorMe" className="w-7 h-7" />
            <span className="font-bold text-xl text-white tracking-tight">
              MyTutor<span className="text-emerald-400">Me</span>
            </span>
          </div>
          <p className="text-[#777] text-sm leading-relaxed max-w-[215px]">
            Stay connected, explore courses, and study smarter. Your academic success starts here.
          </p>
          <div className="flex items-center gap-5 mt-7">
            <a href="#" aria-label="Facebook" className="text-[#4a4a4a] hover:text-white transition-colors duration-200">
              <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Instagram" className="text-[#4a4a4a] hover:text-white transition-colors duration-200">
              <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="X / Twitter" className="text-[#4a4a4a] hover:text-white transition-colors duration-200">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="text-[#4a4a4a] hover:text-white transition-colors duration-200">
              <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>

        {/* Platform links */}
        <div>
          <p className="text-white text-[10px] font-semibold uppercase tracking-[0.22em] mb-6">
            Platform
          </p>
          <ul className="space-y-3.5">
            {PLATFORM_LINKS.map((link) => (
              <li key={link.name} className="group flex items-center">
                {/* Emerald dash slides in on hover */}
                <span className="inline-block w-0 group-hover:w-3 h-px bg-emerald-400 mr-0 group-hover:mr-2.5 transition-all duration-200 flex-shrink-0" />
                <a
                  href={link.href}
                  className="text-[#767676] text-sm hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Company links */}
        <div>
          <p className="text-white text-[10px] font-semibold uppercase tracking-[0.22em] mb-6">
            Company
          </p>
          <ul className="space-y-3.5">
            {COMPANY_LINKS.map((link) => (
              <li key={link.name} className="group flex items-center">
                <span className="inline-block w-0 group-hover:w-3 h-px bg-emerald-400 mr-0 group-hover:mr-2.5 transition-all duration-200 flex-shrink-0" />
                <a
                  href={link.href}
                  className="text-[#767676] text-sm hover:text-white transition-colors duration-200"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Divider + copyright — padding-bottom clears the watermark at all viewport widths */}
      <div
        className="border-t border-white/[0.07] pt-5"
        style={{ paddingBottom: 'max(148px, 18vw)' }}
      >
        <p className="text-[#333] text-[11px] tracking-[0.28em] uppercase text-center">
          All Rights Reserved {new Date().getFullYear()} &nbsp;&middot;&nbsp; MyTutorMe
        </p>
      </div>

    </div>
  </footer>
);
