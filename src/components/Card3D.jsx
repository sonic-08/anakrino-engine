import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function Card3D({ children, className = "", onClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 260, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 260, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3.5deg", "-3.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3.5deg", "3.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative perspective-[2000px] w-full h-full ${className}`}
    >
      <div
        style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}
        className="w-full rounded-[2rem] bg-[#0a0a12]/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden group transition-all duration-300 hover:bg-[#0c140f]/90 hover:border-emerald-500/30 relative flex flex-col h-full"
      >
        {/* Border beam spotlight glare */}
        <motion.div
          className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
          style={{
            background: useTransform(
              [mouseXSpring, mouseYSpring],
              ([mx, my]) =>
                `radial-gradient(450px circle at ${(mx + 0.5) * 100}% ${(my + 0.5) * 100}%, rgba(16, 185, 129, 0.7), transparent 60%)`
            ),
            border: '2px solid transparent',
            WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* Ambient inner card glow */}
        <motion.div
          className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [mouseXSpring, mouseYSpring],
              ([mx, my]) =>
                `radial-gradient(600px circle at ${(mx + 0.5) * 100}% ${(my + 0.5) * 100}%, rgba(16, 185, 129, 0.08), transparent 50%)`
            ),
          }}
        />

        <div
          style={{ transform: "translateZ(30px)" }}
          className="relative z-10 p-7 sm:p-9 flex flex-col flex-grow h-full"
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
