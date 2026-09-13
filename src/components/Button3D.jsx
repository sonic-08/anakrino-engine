import { motion } from 'framer-motion';

export default function Button3D({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "primary",
  disabled = false,
  title
}) {
  const baseStyle = "relative font-bold transition-all duration-200 outline-none select-none flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl cursor-pointer";

  let variantStyle = "";
  if (variant === "primary") {
    variantStyle = "bg-emerald-600 text-white shadow-[0_6px_0_#065f46,0_12px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:bg-emerald-500 hover:shadow-[0_4px_0_#065f46,0_8px_15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.4)] active:shadow-[0_0px_0_#065f46,0_0px_0px_rgba(0,0,0,0.5),inset_0_3px_6px_rgba(0,0,0,0.4)]";
  } else if (variant === "glass") {
    variantStyle = "bg-white/[0.06] backdrop-blur-xl border border-white/10 text-zinc-200 shadow-[0_6px_0_rgba(0,0,0,0.4),0_12px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.12)] hover:bg-white/[0.12] hover:text-white hover:border-white/20 hover:shadow-[0_4px_0_rgba(0,0,0,0.4),0_8px_15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:shadow-[0_0px_0_rgba(0,0,0,0.4),0_0px_0px_rgba(0,0,0,0.4),inset_0_3px_6px_rgba(0,0,0,0.3)]";
  } else if (variant === "white") {
    variantStyle = "bg-zinc-100 text-black shadow-[0_6px_0_#a1a1aa,0_12px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:bg-white hover:shadow-[0_4px_0_#a1a1aa,0_8px_15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,1)] active:shadow-[0_0px_0_#a1a1aa,0_0px_0px_rgba(0,0,0,0.4),inset_0_3px_6px_rgba(0,0,0,0.2)]";
  } else if (variant === "danger") {
    variantStyle = "bg-rose-600 text-white shadow-[0_6px_0_#9f1239,0_12px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.35)] hover:bg-rose-500 active:shadow-none";
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { y: 2 } : {}}
      whileTap={!disabled ? { y: 6 } : {}}
      className={`${baseStyle} ${variantStyle} ${className}`}
    >
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent rounded-t-2xl pointer-events-none opacity-60" />
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">
        {children}
      </span>
    </motion.button>
  );
}
