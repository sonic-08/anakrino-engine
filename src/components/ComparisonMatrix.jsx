import { motion } from 'framer-motion';
import { ArrowLeft, Scale, Trash2, Check, X, Star } from 'lucide-react';
import Button3D from './Button3D';

export default function ComparisonMatrix({ tools, onBack, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      className="flex-grow w-full max-w-[1600px] mx-auto mt-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Button3D
          onClick={onBack}
          variant="glass"
          className="px-6 py-3 text-sm tracking-wide w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button3D>

        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600/20 border border-emerald-500/30">
            <Scale className="w-6 h-6 text-emerald-400" />
          </div>
          Comparison Matrix ({tools.length}/3)
        </h2>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-max">
          {/* Label Column */}
          <div className="w-44 shrink-0 flex flex-col gap-6 pt-28">
            <div className="h-16 flex items-center font-bold text-zinc-500 uppercase tracking-widest text-xs border-b border-white/5">
              Pricing
            </div>
            <div className="h-16 flex items-center font-bold text-zinc-500 uppercase tracking-widest text-xs border-b border-white/5">
              Category
            </div>
            <div className="h-16 flex items-center font-bold text-zinc-500 uppercase tracking-widest text-xs border-b border-white/5">
              Rating
            </div>
            <div className="min-h-[140px] font-bold text-emerald-500/80 uppercase tracking-widest text-xs pt-4">
              Strengths
            </div>
            <div className="min-h-[140px] font-bold text-rose-500/80 uppercase tracking-widest text-xs pt-4 border-t border-white/5">
              Limitations
            </div>
          </div>

          {/* Tool Columns */}
          {tools.map((tool) => (
            <div
              key={tool.url || tool.name}
              className="w-[360px] sm:w-[390px] shrink-0 bg-[#0a0a12]/80 border border-white/10 rounded-[2.5rem] backdrop-blur-2xl p-7 flex flex-col relative group shadow-xl"
            >
              <button
                onClick={() => onRemove(tool)}
                className="absolute top-5 right-5 p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-colors cursor-pointer"
                title="Remove tool from comparison"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="h-24 mb-6 pr-8">
                <h3 className="font-heading text-2xl font-bold text-white mb-2 truncate">
                  {tool.name}
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                  {tool.tagline}
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="h-16 flex items-center font-bold text-white text-base border-b border-white/5">
                  <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
                    {tool.pricing || "Freemium"}
                  </span>
                </div>
                <div className="h-16 flex items-center font-bold text-white text-base border-b border-white/5">
                  <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
                    {tool.category || "AI"}
                  </span>
                </div>
                <div className="h-16 flex items-center font-bold text-amber-400 text-base border-b border-white/5 gap-2">
                  <Star className="w-4 h-4 fill-current" /> {tool.rating || "4.8"}
                </div>
                <div className="min-h-[140px] pt-4">
                  <ul className="space-y-3">
                    {(tool.pros || ["Intuitive workflow", "High inference speed"]).map((pro, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-xs sm:text-sm font-medium">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="min-h-[140px] pt-4 border-t border-white/5">
                  <ul className="space-y-3">
                    {(tool.cons || ["Feature limitations on basic tiers"]).map((con, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-zinc-300 text-xs sm:text-sm font-medium">
                        <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Empty Add Slot */}
          {tools.length < 3 && (
            <div className="w-[360px] sm:w-[390px] shrink-0 border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-zinc-500 p-8 text-center bg-white/[0.01]">
              <Scale className="w-10 h-10 mb-3 opacity-40 text-emerald-400" />
              <p className="font-bold text-zinc-300 text-sm mb-1">Add another tool</p>
              <p className="text-xs text-zinc-500 max-w-[220px]">
                Click the scale balance icon on any tool card in results to compare up to 3 tools.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
