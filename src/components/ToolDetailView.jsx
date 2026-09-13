import { motion } from 'framer-motion';
import { ArrowLeft, Check, X, Compass, Star, ExternalLink, Scale, ShieldCheck, Sliders } from 'lucide-react';
import Button3D from './Button3D';

function getSafeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function ToolDetailView({
  tool,
  onBack,
  isInCompare,
  onToggleCompare
}) {
  const safeUrl = getSafeUrl(tool.url);
  const prosList = Array.isArray(tool.pros) && tool.pros.length > 0
    ? tool.pros
    : ["High-speed generative inference", "Intuitive user interface", "Time-saving automation features"];

  const consList = Array.isArray(tool.cons) && tool.cons.length > 0
    ? tool.cons
    : ["May require learning curve for advanced features", "Certain advanced modules require premium plan"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="flex-grow w-full max-w-7xl mx-auto mt-6"
    >
      <div className="mb-8">
        <Button3D
          onClick={onBack}
          variant="glass"
          className="px-6 py-3 text-sm tracking-wide w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Results
        </Button3D>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Hero Card */}
          <div className="bg-[#0a0a12]/80 border border-white/10 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full translate-x-1/4 -translate-y-1/4" />

            <div className="relative z-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-white/10 border border-white/20 text-white px-4 py-1.5 rounded-xl text-[0.7rem] font-extrabold uppercase tracking-widest">
                  {tool.category || "AI Tool"}
                </span>
                {tool.rating && (
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-xl">
                    <Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}
                  </div>
                )}
                <span className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest bg-black/40 border border-white/5 px-3 py-1.5 rounded-xl">
                  {tool.pricing || "Pricing"}
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                {tool.name}
              </h1>

              <p className="text-lg sm:text-xl text-emerald-200/90 font-medium mb-8 leading-relaxed">
                {tool.tagline}
              </p>

              {/* Why For You Block */}
              <div className="bg-emerald-500/[0.09] border-l-4 border-emerald-500 p-6 rounded-r-2xl shadow-inner">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Compass className="w-4 h-4" /> Why For You
                </h4>
                <p className="text-zinc-200 text-base sm:text-lg leading-relaxed font-medium">
                  {tool.why_for_you || tool.description}
                </p>
              </div>
            </div>
          </div>

          {/* Pros & Cons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Pros Card */}
            <div className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2rem] p-7 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
              <h4 className="font-heading text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                Why it excels
              </h4>
              <ul className="space-y-4">
                {prosList.map((pro, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base leading-relaxed font-medium">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons Card */}
            <div className="bg-rose-500/[0.03] border border-rose-500/20 rounded-[2rem] p-7 backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-400" />
              <h4 className="font-heading text-xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                  <X className="w-5 h-5 text-rose-400" />
                </div>
                Limitations
              </h4>
              <ul className="space-y-4">
                {consList.map((con, i) => (
                  <li key={i} className="flex items-start gap-3 text-zinc-300 text-sm sm:text-base leading-relaxed font-medium">
                    <span className="w-1.5 h-1.5 bg-rose-400 rounded-full shrink-0 mt-2 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Specs Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-32">
          <div className="bg-[#0a0a12]/80 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl shadow-2xl">
            <h3 className="font-heading text-xl font-bold text-white border-b border-white/10 pb-5 mb-6 flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-emerald-400" /> Key Specs
            </h3>

            <div className="space-y-4 mb-8">
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                <span className="text-zinc-500 text-[0.65rem] font-extrabold uppercase tracking-widest block mb-1">
                  Pricing Model
                </span>
                <span className="text-white font-bold text-base">
                  {tool.pricing || "Free / Freemium"}
                </span>
              </div>
              <div className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                <span className="text-zinc-500 text-[0.65rem] font-extrabold uppercase tracking-widest block mb-1">
                  Category
                </span>
                <span className="text-white font-bold text-base">
                  {tool.category || "AI Software"}
                </span>
              </div>
            </div>

            {/* Visit Website CTA */}
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.12)] hover:scale-[1.02] active:scale-95 group mb-3 cursor-pointer"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Compare Matrix Toggle Button */}
            <button
              onClick={(e) => onToggleCompare(tool, e)}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs tracking-wide transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                isInCompare
                  ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-transparent border-white/15 text-zinc-300 hover:bg-white/5 hover:border-white/25'
              }`}
            >
              <Scale className="w-4 h-4" />
              {isInCompare ? 'In Comparison Matrix' : 'Add to Compare'}
            </button>

            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-center gap-2 text-zinc-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified AI Source Link</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
