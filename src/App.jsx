import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Search, Sparkles, ExternalLink, Check, 
  X, AlertCircle, ArrowLeft, Star, Globe, 
  MessageSquare, Send, ChevronRight, Zap, 
  Layers, Scale, Trash2, ArrowRight, ThumbsUp, ThumbsDown, MessageCircle, User
} from 'lucide-react';

// Connect your local backend modules
import { searchWithAnakrino } from './lib/gemini';
import { supabase } from './lib/supabase';

// ==========================================
// CUSTOM PRISM LOGO SVG
// ==========================================
const PrismIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 50 L35 50" stroke="white" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
    <polygon points="50,15 85,75 15,75" fill="rgba(255,255,255,0.05)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <polygon points="50,15 35,50 15,75" fill="rgba(255,255,255,0.2)" />
    <path d="M65 40 L100 25" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
    <path d="M72 55 L100 55" stroke="#c084fc" strokeWidth="3" strokeLinecap="round" />
    <path d="M65 70 L100 85" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ==========================================
// BACKGROUND: GENERATIVE THEMED MESH
// ==========================================
const THEMES = {
  default: { c1: [79, 70, 229], c2: [168, 85, 247], c3: [14, 165, 233] }, // Indigo, Purple, Cyan
  coding: { c1: [16, 185, 129], c2: [20, 184, 166], c3: [6, 182, 212] },  // Emerald, Teal, Cyan
  design: { c1: [217, 70, 239], c2: [249, 115, 22], c3: [139, 92, 246] }, // Fuchsia, Orange, Violet
  video: { c1: [239, 68, 68], c2: [245, 158, 11], c3: [244, 63, 94] }     // Red, Amber, Rose
};

function InteractiveMeshBackground({ theme = 'default' }) {
  const canvasRef = useRef(null);
  let mousePos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  let idleTimer = useRef(null);
  let isIdle = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const colors = THEMES[theme] || THEMES.default;

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#020204');
    bgGradient.addColorStop(1, '#080812');

    let time = 0;
    const render = () => {
      if (isIdle.current) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      time += 0.0015;
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const drawOrb = (xBase, yBase, radius, r, g, b, a, speedX, speedY) => {
        const x = xBase + Math.sin(time * speedX) * (width * 0.3);
        const y = yBase + Math.cos(time * speedY) * (height * 0.3);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      };

      drawOrb(width * 0.3, height * 0.3, width * 0.4, colors.c1[0], colors.c1[1], colors.c1[2], 0.15, 0.3, 0.4); 
      drawOrb(width * 0.7, height * 0.6, width * 0.5, colors.c2[0], colors.c2[1], colors.c2[2], 0.12, 0.2, 0.3);
      drawOrb(width * 0.5, height * 0.5, width * 0.6, colors.c3[0], colors.c3[1], colors.c3[2], 0.08, 0.4, 0.2); 

      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      isIdle.current = false;
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => { isIdle.current = true; }, 5000); // 5 sec idle drop GPU
    };

    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => { 
      cancelAnimationFrame(animationFrameId); 
      window.removeEventListener('resize', handleResize); 
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer.current);
    };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000" />;
}

// ==========================================
// 3D BUTTON: TACTILE PRESS
// ==========================================
function Button3D({ children, onClick, type = "button", className = "", variant = "primary", disabled = false }) {
  const baseStyle = "relative font-bold transition-all duration-200 outline-none select-none flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl";
  let variantStyle = "";
  if (variant === "primary") variantStyle = "bg-indigo-600 text-white shadow-[0_8px_0_#3730a3,0_15px_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-indigo-500 hover:shadow-[0_6px_0_#3730a3,0_12px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] active:shadow-[0_0px_0_#3730a3,0_0px_0px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.4)]";
  else if (variant === "glass") variantStyle = "bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-200 shadow-[0_8px_0_rgba(0,0,0,0.4),0_15px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_6px_0_rgba(0,0,0,0.4),0_12px_15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:shadow-[0_0px_0_rgba(0,0,0,0.4),0_0px_0px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(0,0,0,0.3)]";
  else if (variant === "white") variantStyle = "bg-zinc-100 text-black shadow-[0_8px_0_#a1a1aa,0_15px_20px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,1)] hover:bg-white hover:shadow-[0_6px_0_#a1a1aa,0_12px_15px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,1)] active:shadow-[0_0px_0_#a1a1aa,0_0px_0px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(0,0,0,0.2)]";

  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} whileHover={!disabled ? { y: 2 } : {}} whileTap={!disabled ? { y: 8 } : {}} className={`${baseStyle} ${variantStyle} ${className}`}>
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl pointer-events-none opacity-50" />
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">{children}</span>
    </motion.button>
  );
}

// ==========================================
// 3D CARD: HOVER TILT & BORDER BEAM GLARE
// ==========================================
function Card3D({ children, className, onClick }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["3deg", "-3deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-3deg", "3deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove} onMouseLeave={() => { x.set(0); y.set(0); }} onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative perspective-[2000px] w-full h-full ${className}`}
    >
      <div 
        style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }} 
        // Forced portrait aspect ratio matching image design (3/4 shape)
        className="w-full aspect-[3/4] rounded-[2rem] bg-[#0a0a10]/80 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] overflow-hidden group transition-all duration-300 hover:bg-[#0f0f18]/90 relative flex flex-col"
      >
        <motion.div
           className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"
           style={{
              background: useTransform([mouseXSpring, mouseYSpring], ([mx, my]) => `radial-gradient(400px circle at ${(mx + 0.5) * 100}% ${(my + 0.5) * 100}%, rgba(99, 102, 241, 0.8), transparent 50%)`),
              border: '2px solid transparent', WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude",
           }}
        />
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: useTransform([mouseXSpring, mouseYSpring], ([mx, my]) => `radial-gradient(600px circle at ${(mx + 0.5) * 100}% ${(my + 0.5) * 100}%, rgba(99,102,241,0.08), transparent 50%)`) }}
        />
        
        <div style={{ transform: "translateZ(30px)" }} className="relative z-10 p-8 sm:p-10 flex flex-col flex-grow h-full">
          {children}
        </div>
        <div className="absolute inset-0 border border-white/5 rounded-[2rem] pointer-events-none group-hover:border-transparent transition-colors" />
      </div>
    </motion.div>
  );
}

// ==========================================
// TACTILE SKELETON SHIMMER (Matching Image Layout)
// ==========================================
function SkeletonCard() {
  return (
    <div className="w-full aspect-[3/4] rounded-[2rem] bg-[#0a0a10]/80 border border-white/5 p-8 sm:p-10 flex flex-col animate-pulse relative overflow-hidden">
       <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.5s_infinite] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-indigo-500/10 before:to-transparent" />
       
       {/* Top Block (Why For You) - 40% height */}
       <div className="w-full h-[40%] bg-white/10 rounded-3xl mb-8 shrink-0" />
       
       {/* Middle Lines 1 (Title/Tags) */}
       <div className="space-y-4 mb-8">
         <div className="h-8 w-3/4 bg-white/10 rounded-lg" />
         <div className="flex gap-4">
           <div className="h-8 w-24 bg-white/10 rounded-lg" />
           <div className="h-8 w-20 bg-white/10 rounded-lg" />
         </div>
       </div>
       
       {/* Middle Lines 2 (Description) */}
       <div className="space-y-4 mb-auto">
          <div className="h-4 w-full bg-white/10 rounded-md" />
          <div className="h-4 w-5/6 bg-white/10 rounded-md" />
          <div className="h-4 w-4/6 bg-white/10 rounded-md" />
       </div>
       
       {/* Bottom Action Block */}
       <div className="w-full h-16 bg-white/10 rounded-2xl shrink-0 mt-8" />
    </div>
  );
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } } };

// ==========================================
// COMPARISON MATRIX VIEW
// ==========================================
function ComparisonMatrix({ tools, onBack, onRemove }) {
  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="flex-grow w-full max-w-[1600px] mx-auto mt-8">
      <div className="flex items-center justify-between mb-12">
        <Button3D onClick={onBack} variant="glass" className="px-8 py-3.5 text-[0.95rem] tracking-wide"><ArrowLeft className="w-4 h-4" /> Back to Dashboard</Button3D>
        <h2 className="font-heading text-3xl font-bold text-white flex items-center gap-3"><Scale className="w-8 h-8 text-indigo-400" /> Comparison Matrix</h2>
      </div>
      <div className="overflow-x-auto pb-8">
        <div className="flex gap-6 min-w-max">
          <div className="w-48 shrink-0 flex flex-col gap-6 pt-32">
            <div className="h-20 flex items-center font-bold text-zinc-500 uppercase tracking-widest text-sm border-b border-white/5">Pricing</div>
            <div className="h-20 flex items-center font-bold text-zinc-500 uppercase tracking-widest text-sm border-b border-white/5">Category</div>
            <div className="h-20 flex items-center font-bold text-zinc-500 uppercase tracking-widest text-sm border-b border-white/5">Rating</div>
            <div className="flex-grow font-bold text-emerald-500/70 uppercase tracking-widest text-sm pt-4">Strengths</div>
            <div className="flex-grow font-bold text-rose-500/70 uppercase tracking-widest text-sm pt-4 border-t border-white/5 mt-4">Limitations</div>
          </div>
          {tools.map(tool => (
            <div key={tool.url} className="w-[400px] shrink-0 bg-white/[0.02] border border-white/10 rounded-[2rem] backdrop-blur-2xl p-8 flex flex-col relative group">
              <button onClick={() => onRemove(tool)} className="absolute top-6 right-6 p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
              <div className="h-24 mb-8"><h3 className="font-heading text-2xl font-bold text-white mb-2 truncate">{tool.name}</h3><p className="text-zinc-400 text-sm line-clamp-2">{tool.tagline}</p></div>
              <div className="flex flex-col gap-6">
                <div className="h-20 flex items-center font-bold text-white text-lg border-b border-white/5">{tool.pricing}</div>
                <div className="h-20 flex items-center font-bold text-white text-lg border-b border-white/5">{tool.category}</div>
                <div className="h-20 flex items-center font-bold text-amber-400 text-lg border-b border-white/5 gap-2"><Star className="w-5 h-5 fill-current" /> {tool.rating}</div>
                <div className="flex-grow pt-4"><ul className="space-y-4">{tool.pros?.map((pro, i) => (<li key={i} className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <span>{pro}</span></li>))}</ul></div>
                <div className="flex-grow pt-4 border-t border-white/5 mt-4"><ul className="space-y-4">{tool.cons?.map((con, i) => (<li key={i} className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" /> <span>{con}</span></li>))}</ul></div>
              </div>
            </div>
          ))}
          {tools.length < 3 && (
            <div className="w-[400px] shrink-0 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-zinc-500 p-8">
              <Scale className="w-12 h-12 mb-4 opacity-50" />
              <p className="font-bold">Add another tool</p>
              <p className="text-sm">Click the scale icon on a tool card</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ==========================================
// COMMENTS MODAL
// ==========================================
function CommentsModal({ tool, onClose, user, onAddComment }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(tool.url, commentText);
    setCommentText('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#0a0a10] border border-white/10 w-full max-w-lg rounded-[2rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden relative">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-bold text-white font-heading">Discussion</h3>
            <p className="text-sm text-zinc-400">{tool.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          {!tool.comments || tool.comments.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 flex flex-col items-center">
              <MessageCircle className="w-10 h-10 mb-3 opacity-50" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            tool.comments.map((c, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 text-indigo-400">
                  <User className="w-5 h-5" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 text-sm text-zinc-200 leading-relaxed border border-white/5 flex-grow">
                  <span className="block text-xs font-bold text-zinc-500 mb-1">{c.author || 'User'}</span>
                  {c.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white/[0.02] border-t border-white/5">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment..." className="flex-grow bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-colors" />
              <button type="submit" disabled={!commentText.trim()} className="bg-indigo-600 text-white px-5 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50 transition-colors">Post</button>
            </form>
          ) : (
            <div className="text-center p-3 text-sm text-zinc-500 font-medium bg-black/40 rounded-xl border border-white/5">
              Please sign in to join the discussion.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}


// ==========================================
// MAIN APPLICATION
// ==========================================
export default function App() {
  const [viewState, setViewState] = useState('home'); 
  const [query, setQuery] = useState('');
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  
  const [compareList, setCompareList] = useState([]); 
  const [appTheme, setAppTheme] = useState('default'); 
  
  // Social Interactions State
  // Format: { 'tool-url': { likes: number, dislikes: number, userAction: 'like'|'dislike'|null, comments: [] } }
  const [interactions, setInteractions] = useState({});
  const [activeCommentTool, setActiveCommentTool] = useState(null);

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: "Welcome to Anakrino AI. Describe your project or the problem you are trying to solve." }]);
  const chatEndRef = useRef(null);

  useEffect(() => { if (copilotOpen && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, copilotOpen]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user || null); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user || null); });
    return () => subscription?.unsubscribe();
  }, []);

  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); };
  
  const handleLogin = async () => { if (!supabase) return triggerToast("Unable to connect to Supabase."); await supabase.auth.signInWithOAuth({ provider: 'google' }); };
  const handleLogout = async () => { if (!supabase) return; await supabase.auth.signOut(); triggerToast("You have successfully signed out."); };

  // ==========================================
  // INTERACTION HANDLERS (Like/Dislike/Comment)
  // ==========================================
  const initInteractionState = (url) => {
    if (!interactions[url]) {
      setInteractions(prev => ({ ...prev, [url]: { likes: Math.floor(Math.random() * 50) + 10, dislikes: 0, userAction: null, comments: [] } }));
    }
  };

  const handleVote = async (tool, actionType, e) => {
    e.stopPropagation();
    if (!user) return triggerToast("Please sign in to rate this tool.");
    
    initInteractionState(tool.url);
    
    setInteractions(prev => {
      const current = prev[tool.url] || { likes: 0, dislikes: 0, userAction: null, comments: [] };
      let newLikes = current.likes;
      let newDislikes = current.dislikes;
      let newUserAction = actionType;

      if (current.userAction === actionType) {
        // Undo vote
        newUserAction = null;
        if (actionType === 'like') newLikes--;
        if (actionType === 'dislike') newDislikes--;
      } else {
        // Switch or new vote
        if (actionType === 'like') { newLikes++; if (current.userAction === 'dislike') newDislikes--; }
        if (actionType === 'dislike') { newDislikes++; if (current.userAction === 'like') newLikes--; }
      }

      // Optimistic UI Update
      return { ...prev, [tool.url]: { ...current, likes: newLikes, dislikes: newDislikes, userAction: newUserAction } };
    });

    // Note: To make this persistent, you would add logic here to upsert the tool to Supabase, 
    // and then insert/update a record in a `user_votes` table. 
    // Example: await supabase.from('tool_votes').upsert({ user_id: user.id, tool_id: toolId, vote_type: actionType });
  };

  const handleAddComment = (url, text) => {
    if (!user) return;
    setInteractions(prev => {
      const current = prev[url] || { likes: 0, dislikes: 0, userAction: null, comments: [] };
      const newComment = { author: user.user_metadata?.full_name || 'You', text, date: new Date().toISOString() };
      return { ...prev, [url]: { ...current, comments: [...current.comments, newComment] } };
    });
    triggerToast("Comment posted!");
    
    // Note: Persistent logic would go here to insert into a `tool_comments` Supabase table.
  };

  const toggleCompare = (tool, e) => {
    e.stopPropagation();
    if (compareList.find(t => t.url === tool.url)) { setCompareList(prev => prev.filter(t => t.url !== tool.url)); triggerToast("Removed from comparison."); }
    else if (compareList.length < 3) { setCompareList(prev => [...prev, tool]); triggerToast("Added to comparison matrix."); }
    else triggerToast("You can only compare up to 3 tools at once.");
  };

  // ==========================================
  // SEARCH LOGIC
  // ==========================================
  const executeSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true); 
    setViewState('results'); 
    setTools([]);
    setAppTheme('default'); 
    
    try {
      const finalQuery = `I am looking for: ${query}. IMPORTANT: Extract exact pricing/limitations into pros/cons. Make descriptions explain exactly why it fits my request.`;
      
      const finalData = await searchWithAnakrino(finalQuery);
      
      // Initialize interaction state for new tools
      if (finalData) {
        finalData.forEach(t => initInteractionState(t.url));
      }
      
      setTools(finalData || []);

      const firstCat = (finalData?.[0]?.category || '').toLowerCase();
      if (firstCat.includes('code') || firstCat.includes('dev')) setAppTheme('coding');
      else if (firstCat.includes('design') || firstCat.includes('art') || firstCat.includes('image')) setAppTheme('design');
      else if (firstCat.includes('video') || firstCat.includes('audio')) setAppTheme('video');
      else setAppTheme('default');
    } catch (err) { 
      triggerToast(err.message || "An error occurred during search."); 
      setViewState('home'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput(''); 
    setChatLoading(true);
    
    try {
      const contents = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      let systemContext = `[System Context: The user is currently on the ${viewState} screen. `;
      if (viewState === 'details' && selectedTool) systemContext += `They are viewing details for ${selectedTool.name}. `;
      if (compareList.length > 0) systemContext += `They are comparing: ${compareList.map(t=>t.name).join(', ')}.`;
      systemContext += `] `;
      
      contents.push({ role: 'user', parts: [{ text: systemContext + userText }] });

      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if(!envApiKey) throw new Error("Missing Gemini API Key");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${envApiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents })
      });
      if (!response.ok) throw new Error("API responded with error.");
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I had trouble generating an answer.";
      setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="font-body min-h-screen bg-[#020204] text-zinc-200 overflow-x-hidden pb-32 relative selection:bg-indigo-500/40 selection:text-white">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
          .font-heading { font-family: 'Outfit', sans-serif; }
          .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
          @keyframes shimmer { 100% { transform: translateX(100%); } }
        `}
      </style>

      <InteractiveMeshBackground theme={appTheme} />
      
      <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 py-6 relative z-10 flex flex-col min-h-screen">
        
        <nav className="flex justify-between items-center bg-white/[0.02] backdrop-blur-[30px] border border-white/[0.05] rounded-3xl px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] sticky top-6 z-50">
          <div onClick={() => { setViewState('home'); setQuery(''); setAppTheme('default'); }} className="flex items-center gap-4 cursor-pointer group">
            <div className="w-10 h-10 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] group-hover:bg-white/5 transition-all duration-300">
              <PrismIcon className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow-sm">Anakrino</h1>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-5 bg-black/40 p-1.5 pl-6 rounded-2xl border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                <span className="text-[0.9rem] font-bold text-zinc-300 tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" /> {user.user_metadata?.full_name || 'User'}
                </span>
                <div className="w-px h-5 bg-white/10" />
                <button onClick={handleLogout} className="text-[0.9rem] font-bold text-zinc-500 hover:text-rose-400 transition-colors pr-4 tracking-wide">Sign Out</button>
              </div>
            ) : (
              <Button3D onClick={handleLogin} variant="white" className="px-8 py-3 text-[0.9rem] tracking-wide">Sign In</Button3D>
            )}
          </div>
        </nav>

        <AnimatePresence mode="wait">
          {viewState === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }} transition={{ duration: 0.5 }} className="flex-grow flex flex-col justify-center items-center w-full min-h-[75vh]">
              <div className="max-w-5xl w-full text-center mb-16 relative">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.7, type: "spring" }}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-bold tracking-widest uppercase mb-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <PrismIcon className="w-4 h-4" /> The Intelligent Directory
                  </div>
                </motion.div>
                <h2 className="font-heading text-6xl sm:text-[6.5rem] lg:text-[7rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 mb-8 tracking-[-0.03em] leading-[1.05] py-2 drop-shadow-2xl">
                  Discover the perfect <br/>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">AI stack.</span>
                </h2>
                <p className="text-zinc-400 text-lg sm:text-[1.35rem] max-w-3xl mx-auto leading-[1.8] font-medium">
                  Stop searching endlessly. Describe what you want to build, automate, or create, and our engine will construct the exact stack of tools you need.
                </p>
              </div>

              <div className="w-full max-w-4xl relative z-20">
                <form onSubmit={executeSearch} className="relative w-full perspective-[1000px]">
                  <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_2px_10px_rgba(255,255,255,0.05)] backdrop-blur-3xl focus-within:bg-white/[0.05] focus-within:border-indigo-500/40 focus-within:shadow-[0_0_60px_rgba(99,102,241,0.2),inset_0_2px_10px_rgba(255,255,255,0.05)] transition-all duration-500 group">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ml-2 border border-white/5 group-focus-within:bg-indigo-500/10 group-focus-within:border-indigo-500/20 transition-colors">
                      <Search className="w-6 h-6 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                    </div>
                    <input 
                      value={query} onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent px-6 py-6 text-xl sm:text-2xl text-white placeholder-zinc-600 outline-none font-semibold tracking-wide"
                      placeholder="E.g. Generate high quality 3D assets..."
                    />
                    <Button3D type="submit" variant="white" className="px-10 py-6 rounded-[1.5rem] text-[1.1rem] flex-shrink-0 tracking-wide">
                      Search <ChevronRight className="w-6 h-6 ml-1 -mr-2 opacity-50" />
                    </Button3D>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {viewState === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, filter: 'blur(10px)' }} transition={{ duration: 0.5 }} className="flex-grow flex flex-col w-full mt-10 relative">
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
                 <form onSubmit={executeSearch} className="max-w-3xl w-full relative">
                  <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-[2rem] p-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl focus-within:border-indigo-500/40 transition-all duration-500 group">
                    <Search className="w-6 h-6 text-zinc-500 ml-5 shrink-0 group-focus-within:text-indigo-400" />
                    <input 
                      value={query} onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent px-5 py-4 text-lg text-white placeholder-zinc-600 outline-none font-semibold tracking-wide"
                      placeholder="Refine your search..."
                    />
                    <Button3D type="submit" variant="glass" className="px-8 py-3.5 text-[1rem] tracking-wide">Search</Button3D>
                  </div>
                </form>
              </div>

              {!loading && tools.length > 0 && (
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-8 mb-12">
                  <h2 className="font-heading text-4xl sm:text-[2.5rem] font-bold text-white tracking-tight flex items-center gap-5 drop-shadow-md">
                    <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl"><Layers className="text-purple-400 w-7 h-7" /></div> Recommended Stack
                  </h2>
                </div>
              )}

              {loading ? (
                // Enforced larger sizing (2x) by limiting columns
                <div className="grid gap-12 sm:gap-16 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show"
                  // Enforced larger sizing (2x) by limiting columns
                  className="grid gap-12 sm:gap-16 items-stretch grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                >
                  {tools.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center text-zinc-500 text-xl font-bold tracking-wide">No results matched your query.</div>
                  )}
                  
                  {tools.map((tool, idx) => {
                    const interact = interactions[tool.url] || { likes: 0, dislikes: 0, userAction: null, comments: [] };
                    return (
                      <motion.div variants={itemVariants} key={idx} className="flex">
                        <Card3D onClick={() => { setSelectedTool(tool); setViewState('details'); }} className="cursor-pointer">
                          
                          {/* Top Actions: Compare & Social */}
                          <div className="absolute top-6 right-6 flex gap-2 z-20" onClick={(e) => e.stopPropagation()}>
                             {/* Compare */}
                             <button onClick={(e) => toggleCompare(tool, e)} className={`p-3 rounded-xl border transition-all hover:scale-110 active:scale-95 ${compareList.find(t => t.url === tool.url) ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 backdrop-blur-md'}`} title="Add to Compare">
                               <Scale className="w-5 h-5" />
                             </button>
                             {/* Like */}
                             <button onClick={(e) => handleVote(tool, 'like', e)} className={`px-3 py-2 flex items-center gap-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${interact.userAction === 'like' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 backdrop-blur-md'}`} title="Like">
                               <ThumbsUp className={`w-4 h-4 ${interact.userAction === 'like' ? 'fill-current' : ''}`} />
                               <span className="text-xs font-bold">{interact.likes}</span>
                             </button>
                             {/* Dislike */}
                             <button onClick={(e) => handleVote(tool, 'dislike', e)} className={`p-3 rounded-xl border transition-all hover:scale-110 active:scale-95 ${interact.userAction === 'dislike' ? 'bg-rose-500/20 border-rose-500/50 text-rose-400' : 'bg-black/60 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 backdrop-blur-md'}`} title="Dislike">
                               <ThumbsDown className={`w-4 h-4 ${interact.userAction === 'dislike' ? 'fill-current' : ''}`} />
                             </button>
                          </div>
                          
                          {/* 4-Tier Image Layout Design */}
                          {/* SECTION 1: Top Block (Why For You) - 40% height */}
                          <div className="w-full h-[40%] bg-indigo-500/10 border border-indigo-500/20 p-8 sm:p-10 rounded-3xl mb-8 flex flex-col justify-center relative overflow-hidden group-hover:bg-indigo-500/20 transition-colors shrink-0">
                            <h4 className="text-[0.8rem] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap className="w-5 h-5" /> Why For You</h4>
                            <p className="text-lg sm:text-xl text-indigo-100/90 font-medium leading-[1.6] line-clamp-4">{tool.why_for_you || tool.description || tool.tagline}</p>
                          </div>

                          {/* SECTION 2: Middle Lines 1 (Title & Tags) */}
                          <div className="mb-8 pr-16">
                            <h3 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-5 tracking-tight leading-[1.2] line-clamp-2">{tool.name}</h3>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="bg-white/5 border border-white/10 text-zinc-300 px-4 py-2 rounded-lg text-sm font-extrabold uppercase tracking-widest">{tool.category || 'Tool'}</div>
                              {tool.rating && <div className="flex items-center gap-1.5 text-sm font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-lg"><Star className="w-4 h-4 fill-current" /> {tool.rating}</div>}
                              <span className="text-sm text-zinc-400 font-extrabold uppercase tracking-widest bg-black/40 border border-white/5 px-4 py-2 rounded-lg">{tool.pricing || "Pricing"}</span>
                            </div>
                          </div>
                          
                          {/* SECTION 3: Middle Lines 2 (Tagline/Desc) */}
                          <div className="mb-auto">
                            <p className="text-zinc-400 text-base sm:text-lg leading-[1.7] font-medium line-clamp-3">{tool.tagline || tool.description}</p>
                          </div>
                          
                          {/* SECTION 4: Bottom Action Block */}
                          <div className="w-full flex items-center gap-4 mt-8 shrink-0">
                            <div className="w-full h-16 sm:h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[1.1rem] font-bold text-indigo-400 group-hover:bg-indigo-600 group-hover:border-indigo-500 group-hover:text-white transition-all duration-300">
                              Explore Details <ArrowRight className="w-6 h-6 ml-2" />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); setActiveCommentTool({ ...tool, comments: interact.comments }); }} className="h-16 sm:h-20 px-6 sm:px-8 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-300 flex-shrink-0" title="Comments">
                              <MessageCircle className="w-6 h-6" />
                              <span className="ml-2 font-bold">{interact.comments.length}</span>
                            </button>
                          </div>
                        </Card3D>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </motion.div>
          )}

          {viewState === 'compare' && <ComparisonMatrix tools={compareList} onBack={() => setViewState('results')} onRemove={(tool) => setCompareList(prev => prev.filter(t => t.url !== tool.url))} />}

          {viewState === 'details' && selectedTool && (
            <motion.div key="details" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }} className="flex-grow w-full max-w-7xl mx-auto mt-8">
              <Button3D onClick={() => setViewState(query ? 'results' : 'home')} variant="glass" className="mb-12 px-8 py-3.5 text-[0.95rem] tracking-wide w-fit"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Results</Button3D>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-2 space-y-12">
                  <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 sm:p-16 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full translate-x-1/3 -translate-y-1/3" />
                     <div className="relative z-10">
                       <div className="flex flex-wrap items-center gap-4 mb-10">
                         <span className="bg-white/10 border border-white/20 text-white px-5 py-2 rounded-xl text-[0.75rem] font-extrabold uppercase tracking-widest shadow-sm">Overview</span>
                         {selectedTool.rating && <div className="flex items-center gap-2 text-[0.85rem] font-extrabold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-4 py-2 rounded-xl shadow-sm"><Star className="w-4 h-4 fill-current" /> {selectedTool.rating}</div>}
                       </div>
                       <h1 className="font-heading text-5xl sm:text-6xl lg:text-[4.5rem] font-extrabold text-white mb-8 tracking-tight leading-[1.1] drop-shadow-xl">{selectedTool.name}</h1>
                       <p className="text-xl sm:text-2xl text-indigo-200 font-semibold mb-8 leading-[1.6] tracking-tight">{selectedTool.tagline}</p>
                       <div className="bg-indigo-500/10 border-l-2 border-indigo-500 p-6 rounded-r-2xl mb-8 shadow-inner">
                         <h4 className="text-[0.75rem] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Why For You</h4>
                         <p className="text-zinc-200 text-base sm:text-[1.1rem] leading-[1.85] font-medium">{selectedTool.why_for_you || selectedTool.description}</p>
                       </div>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-emerald-500/[0.03] border border-emerald-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-400" />
                      <h4 className="font-heading text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-4 tracking-tight"><div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><Check className="w-6 h-6 text-emerald-400" /></div>Why it excels</h4>
                      <ul className="space-y-6">{(selectedTool.pros || ["Extremely intuitive to use", "Saves significant time"]).map((pro, i) => (<li key={i} className="flex items-start gap-4 text-zinc-300 text-[0.95rem] sm:text-base leading-[1.7] font-medium"><span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-2.5 shadow-[0_0_10px_rgba(52,211,153,0.8)]" /><span>{pro}</span></li>))}</ul>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-rose-500/[0.03] border border-rose-500/20 rounded-[2.5rem] p-10 backdrop-blur-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-pink-400" />
                      <h4 className="font-heading text-xl sm:text-2xl font-bold text-white mb-8 flex items-center gap-4 tracking-tight"><div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/30"><X className="w-6 h-6 text-rose-400" /></div>Limitations</h4>
                      <ul className="space-y-6">{(selectedTool.cons || ["Might take time to learn", "Some features require premium"]).map((con, i) => (<li key={i} className="flex items-start gap-4 text-zinc-300 text-[0.95rem] sm:text-base leading-[1.7] font-medium"><span className="w-2 h-2 bg-rose-400 rounded-full shrink-0 mt-2.5 shadow-[0_0_10px_rgba(251,113,133,0.8)]" /><span>{con}</span></li>))}</ul>
                    </motion.div>
                  </div>
                </div>
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-8 lg:sticky lg:top-32">
                  <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 backdrop-blur-3xl shadow-2xl">
                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-white border-b border-white/10 pb-6 mb-8 flex items-center gap-3 tracking-tight"><Zap className="w-6 h-6 text-indigo-400" /> Key Specs</h3>
                    <div className="space-y-5 mb-10">
                      <div className="bg-black/30 border border-white/5 p-6 rounded-2xl"><span className="text-zinc-500 text-[0.7rem] font-extrabold uppercase tracking-widest block mb-2">Pricing Model</span><span className="text-white font-bold text-[1.15rem]">{selectedTool.pricing || "Various"}</span></div>
                      <div className="bg-black/30 border border-white/5 p-6 rounded-2xl"><span className="text-zinc-500 text-[0.7rem] font-extrabold uppercase tracking-widest block mb-2">Primary Category</span><span className="text-white font-bold text-[1.15rem]">{selectedTool.category || "Tool"}</span></div>
                    </div>
                    <a href={selectedTool.url || '#'} target="_blank" rel="noopener noreferrer" className="w-full bg-white hover:bg-zinc-200 text-black text-[1.05rem] font-bold tracking-wide py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 group mb-4"><span>Visit Website</span><ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></a>
                    <button onClick={(e) => toggleCompare(selectedTool, e)} className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all border flex items-center justify-center gap-2 ${compareList.find(t => t.url === selectedTool.url) ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-transparent border-white/20 text-zinc-300 hover:bg-white/5'}`}><Scale className="w-4 h-4" /> {compareList.find(t => t.url === selectedTool.url) ? 'In Comparison Matrix' : 'Add to Compare'}</button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {compareList.length > 0 && viewState !== 'compare' && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 rounded-[2rem] px-8 py-4 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[140] flex items-center gap-8">
            <div className="flex items-center gap-3"><Scale className="w-6 h-6 text-indigo-400" /><span className="font-bold text-white tracking-wide">Comparing {compareList.length} / 3</span></div>
            <div className="flex gap-4"><button onClick={() => setCompareList([])} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Clear</button><button onClick={() => setViewState('compare')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_5px_15px_rgba(79,70,229,0.4)] transition-all">View Matrix</button></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCopilotOpen(!copilotOpen)} className={`fixed bottom-10 right-10 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(79,70,229,0.4)] z-[150] transition-colors duration-300 ${copilotOpen ? 'bg-white border border-white/20 shadow-none' : 'bg-indigo-600'}`}>
        {copilotOpen ? <X className="w-6 h-6 text-black" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </motion.button>

      {/* COPILOT CHAT INTERFACE */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: "bottom right" }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(5px)' }} transition={{ type: "spring", stiffness: 250, damping: 25 }} className="fixed bottom-32 right-10 w-[380px] sm:w-[440px] bg-[#0a0a10]/95 border border-white/10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-3xl z-[150] overflow-hidden flex flex-col h-[650px]">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
               <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-[14px] bg-indigo-600 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"><Sparkles className="w-6 h-6 text-white" /></div><div><span className="font-heading text-[1.1rem] font-bold text-white block tracking-tight">Anakrino AI</span><span className="text-xs text-emerald-400 font-bold block flex items-center gap-1.5 mt-0.5 tracking-wide"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]"></span> Online</span></div></div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-hide flex flex-col">
               {chatMessages.map((msg, idx) => (
                 <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && idx !== 0 && <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mr-3 mt-auto shrink-0"><Sparkles className="w-4 h-4 text-indigo-400" /></div>}
                    <div className={`max-w-[85%] rounded-2xl p-4 text-[0.95rem] leading-[1.6] font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white shadow-lg rounded-br-sm' : 'bg-white/[0.05] border border-white/10 text-zinc-200 rounded-bl-sm shadow-sm'}`}>{msg.text}</div>
                 </motion.div>
               ))}
               {chatLoading && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end"><div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mr-3 shrink-0"><Sparkles className="w-4 h-4 text-indigo-400" /></div><div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-sm p-4 text-sm text-zinc-400 flex items-center gap-3"><span className="flex gap-1"><motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" /><motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" /><motion.span animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-400 rounded-full" /></span></div></motion.div>
               )}
               <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleCopilotSubmit} className="p-5 border-t border-white/5 bg-black/40 flex items-center gap-3 backdrop-blur-xl">
               <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Message AI..." className="flex-grow bg-white/5 border border-white/10 rounded-xl text-[0.95rem] text-white px-5 py-4 outline-none focus:border-indigo-500/50 transition-colors font-medium placeholder-zinc-500 tracking-wide" />
               <button type="submit" disabled={chatLoading || !chatInput.trim()} className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-white hover:bg-zinc-200 rounded-xl text-black transition-all disabled:opacity-50 active:scale-95"><Send className="w-5 h-5 ml-1" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMMENTS MODAL */}
      <AnimatePresence>
        {activeCommentTool && (
          <CommentsModal 
            tool={activeCommentTool} 
            onClose={() => setActiveCommentTool(null)} 
            user={user} 
            onAddComment={handleAddComment} 
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATIONS */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-10 bg-[#12121a]/90 border border-white/10 text-white px-6 py-4 rounded-2xl text-[0.95rem] font-bold tracking-wide backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-4 z-[200] max-w-sm w-max">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30"><AlertCircle className="w-4 h-4 text-indigo-400" /></div>
            <p className="leading-tight">{toastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}