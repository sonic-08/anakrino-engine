import { motion } from 'framer-motion';
import { Search, ChevronRight, Sparkles, Compass } from 'lucide-react';
import Button3D from './Button3D';

const DISCOVERY_TAGS = [
  { label: "Best AI coding assistant", category: "coding" },
  { label: "Free AI video generator", category: "video" },
  { label: "Midjourney alternatives", category: "design" },
  { label: "AI voice cloning & dubbing", category: "video" },
  { label: "Local LLM desktop tools", category: "coding" },
  { label: "SEO & automated blog writer", category: "default" }
];

export default function HeroSearch({
  query,
  onQueryChange,
  onSubmit,
  onTagSelect
}) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 0.45 }}
      className="flex-grow flex flex-col justify-center items-center w-full min-h-[75vh] py-12"
    >
      {/* Hero Header */}
      <div className="max-w-5xl w-full text-center mb-10 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, type: "spring" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-bold tracking-widest uppercase mb-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <Compass className="w-4 h-4 text-indigo-400" /> The Intelligent AI Directory
          </div>
        </motion.div>

        <h1 className="font-heading text-5xl sm:text-7xl lg:text-[7.5rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 mb-6 tracking-[-0.035em] leading-[1.05] py-2 drop-shadow-2xl">
          Discover the perfect <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
            AI stack.
          </span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-medium">
          Stop searching endlessly across generic lists. Describe what you want to build or automate, and our platform will construct the exact stack of tools you need.
        </p>
      </div>

      {/* Main Search Input Form */}
      <div className="w-full max-w-3xl relative z-20 mb-8">
        <form onSubmit={onSubmit} className="relative w-full">
          <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-[2.2rem] p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.05)] backdrop-blur-3xl focus-within:bg-white/[0.06] focus-within:border-indigo-500/50 focus-within:shadow-[0_0_50px_rgba(99,102,241,0.25)] transition-all duration-400 group">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ml-2 border border-white/5 group-focus-within:bg-indigo-500/10 group-focus-within:border-indigo-500/30 transition-colors shrink-0">
              <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>

            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="w-full bg-transparent px-4 py-4 text-base sm:text-xl text-white placeholder-zinc-500 outline-none font-semibold tracking-wide"
              placeholder="E.g. Generate high quality 3D game assets..."
            />

            <Button3D
              type="submit"
              variant="white"
              className="px-7 sm:px-9 py-4 rounded-2xl text-sm sm:text-base flex-shrink-0 tracking-wide"
            >
              <span>Search</span>
              <ChevronRight className="w-5 h-5 -mr-1 opacity-70" />
            </Button3D>
          </div>
        </form>
      </div>

      {/* Discovery Prompt Tags */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500 font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Popular Searches</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {DISCOVERY_TAGS.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => onTagSelect(tag.label)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/[0.03] hover:bg-indigo-600/20 text-zinc-300 hover:text-white border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
