import { User, Scale, LogOut } from 'lucide-react';
import PrismIcon from './PrismIcon';
import Button3D from './Button3D';

export default function Navbar({
  user,
  onLogin,
  onLogout,
  onResetHome,
  compareCount,
  onOpenCompare
}) {
  return (
    <nav className="flex justify-between items-center bg-white/[0.03] backdrop-blur-[32px] border border-white/[0.08] rounded-3xl px-6 sm:px-8 py-3.5 shadow-[0_20px_40px_rgba(0,0,0,0.5)] sticky top-6 z-50">
      {/* Brand Logo */}
      <div
        onClick={onResetHome}
        className="flex items-center gap-3.5 cursor-pointer group"
      >
        <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10 transition-all duration-300">
          <PrismIcon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading text-xl font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-2">
            Anakrino
            <span className="text-[0.65rem] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Engine
            </span>
          </span>
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Compare Indicator */}
        {compareCount > 0 && (
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-all cursor-pointer text-xs font-bold"
            title="Open Comparison Matrix"
          >
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Compare ({compareCount}/3)</span>
          </button>
        )}

        {/* User Auth */}
        {user ? (
          <div className="flex items-center gap-3 bg-black/50 p-1.5 pl-4 rounded-2xl border border-white/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
            <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="max-w-[120px] sm:max-w-[180px] truncate">
                {user.user_metadata?.full_name || user.email || 'User'}
              </span>
            </span>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={onLogout}
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Button3D
            onClick={onLogin}
            variant="white"
            className="px-6 py-2.5 text-xs sm:text-sm font-bold tracking-wide"
          >
            Sign In
          </Button3D>
        )}
      </div>
    </nav>
  );
}
