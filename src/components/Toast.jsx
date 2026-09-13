import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Toast({ message, type = "info" }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 320, damping: 25 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-8 bg-[#0e0e18]/95 border border-white/10 text-white px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-bold tracking-wide backdrop-blur-3xl shadow-[0_20px_45px_rgba(0,0,0,0.7)] flex items-center gap-3 z-[220] max-w-md w-max"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
            {type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <p className="leading-snug">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
