export const CTASection = () => {
    return (
      <section className="py-24 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700">
        <div className="absolute inset-0 opacity-10 pattern-dots">
            {/* Simple dot pattern replacement for the svg for simplicity */}
           <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to transform your grades?
          </h2>
          <p className="text-emerald-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
            Join over 50,000 students already using MyTutorMe to secure their future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#"
              className="px-8 py-4 bg-white text-emerald-700 font-bold rounded-full hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Join for Free
            </a>
            <a
              href="#"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-colors"
            >
              Schedule Demo
            </a>
          </div>
        </div>
      </section>
    );
  };
