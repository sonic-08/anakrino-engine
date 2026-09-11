export default function PrismIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 50 L35 50" stroke="white" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
      <polygon points="50,15 85,75 15,75" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <polygon points="50,15 35,50 15,75" fill="rgba(255,255,255,0.2)" />
      <path d="M65 40 L100 25" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
      <path d="M72 55 L100 55" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
      <path d="M65 70 L100 85" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
