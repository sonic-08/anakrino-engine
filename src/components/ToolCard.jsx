import { Zap, Star, ArrowRight, Scale, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import Card3D from './Card3D';

export default function ToolCard({
  tool,
  isSelectedInCompare,
  interaction = { likes: 0, dislikes: 0, userAction: null, comments: [] },
  onSelect,
  onToggleCompare,
  onVote,
  onOpenComments
}) {
  return (
    <Card3D onClick={() => onSelect(tool)} className="cursor-pointer flex">
      {/* Top Floating Action Badges */}
      <div
        className="absolute top-5 right-5 flex items-center gap-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compare Toggle */}
        <button
          onClick={(e) => onToggleCompare(tool, e)}
          className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
            isSelectedInCompare
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title={isSelectedInCompare ? "Remove from Compare" : "Add to Compare"}
        >
          <Scale className="w-4 h-4" />
        </button>

        {/* Upvote Button */}
        <button
          onClick={(e) => onVote(tool, 'like', e)}
          className={`px-3 py-2 flex items-center gap-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
            interaction.userAction === 'like'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title="Upvote"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${interaction.userAction === 'like' ? 'fill-current' : ''}`} />
          <span className="text-xs font-bold">{interaction.likes}</span>
        </button>

        {/* Downvote Button */}
        <button
          onClick={(e) => onVote(tool, 'dislike', e)}
          className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md ${
            interaction.userAction === 'dislike'
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title="Downvote"
        >
          <ThumbsDown className={`w-3.5 h-3.5 ${interaction.userAction === 'dislike' ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* SECTION 1: "Why For You" Hero Highlight */}
      <div className="w-full bg-indigo-500/[0.08] border border-indigo-500/20 p-5 sm:p-6 rounded-2xl mb-6 flex flex-col justify-center relative overflow-hidden group-hover:bg-indigo-500/[0.14] group-hover:border-indigo-500/30 transition-colors shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <h4 className="text-[0.7rem] font-extrabold text-indigo-400 uppercase tracking-widest">
            Why For You
          </h4>
        </div>
        <p className="text-sm sm:text-base text-indigo-100/90 font-medium leading-relaxed line-clamp-3">
          {tool.why_for_you || tool.description || tool.tagline}
        </p>
      </div>

      {/* SECTION 2: Title & Taxonomy Badges */}
      <div className="mb-4 pr-14">
        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">
          {tool.name}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-white/[0.06] border border-white/10 text-zinc-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            {tool.category || 'AI Tool'}
          </span>
          {tool.rating && (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}
            </span>
          )}
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider bg-black/40 border border-white/5 px-3 py-1 rounded-lg">
            {tool.pricing || "Pricing"}
          </span>
        </div>
      </div>

      {/* SECTION 3: Tagline / Description */}
      <div className="mb-auto">
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed line-clamp-3">
          {tool.tagline || tool.description}
        </p>
      </div>

      {/* SECTION 4: Bottom Action Bar */}
      <div className="w-full flex items-center gap-3 mt-6 pt-4 border-t border-white/[0.06] shrink-0">
        <div className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
          Explore Details <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenComments(tool);
          }}
          className="h-12 px-4 bg-white/[0.04] border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer shrink-0"
          title="Open Discussions"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="ml-1.5 text-xs font-bold">{interaction.comments?.length || 0}</span>
        </button>
      </div>
    </Card3D>
  );
}
