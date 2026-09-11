export default function SkeletonCard() {
  return (
    <div className="w-full min-h-[500px] rounded-[2rem] bg-[#0a0a12]/80 border border-white/5 p-7 sm:p-9 flex flex-col relative overflow-hidden animate-pulse">
      {/* Shimmer bar */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.6s_infinite]" />

      {/* Top block (Why For You) */}
      <div className="w-full h-32 bg-white/[0.04] border border-white/5 rounded-2xl mb-7 shrink-0" />

      {/* Title and tags */}
      <div className="space-y-3 mb-6">
        <div className="h-8 w-2/3 bg-white/[0.06] rounded-xl" />
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-white/[0.04] rounded-lg" />
          <div className="h-6 w-16 bg-white/[0.04] rounded-lg" />
        </div>
      </div>

      {/* Description lines */}
      <div className="space-y-3 mb-auto">
        <div className="h-4 w-full bg-white/[0.04] rounded-md" />
        <div className="h-4 w-5/6 bg-white/[0.04] rounded-md" />
        <div className="h-4 w-4/6 bg-white/[0.04] rounded-md" />
      </div>

      {/* Bottom CTA block */}
      <div className="w-full h-14 bg-white/[0.04] rounded-2xl shrink-0 mt-8" />
    </div>
  );
}
