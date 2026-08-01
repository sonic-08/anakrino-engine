import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Search, Sparkles, ExternalLink, Check, 
  GitMerge, Bookmark, X, AlertCircle, 
  ArrowLeft, Star, Globe, MessageSquare, Send, ChevronRight, Zap, 
  Layers, LayoutGrid, List, Scale, Trash2, ArrowRight,
  Code2, Image as ImageIcon, Video, PenTool, Mic, Bot, Briefcase, Menu
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
// DIRECTORY TAXONOMY (AIxploria Style)
// ==========================================
const CATEGORIES = [
  { id: 'all', label: 'Discover All', icon: LayoutGrid },
  { id: 'coding', label: 'Coding & Dev', icon: Code2 },
  { id: 'design', label: 'Image Generators', icon: ImageIcon },
  { id: 'video', label: 'Video Creation', icon: Video },
  { id: 'writing', label: 'Writing & SEO', icon: PenTool },
  { id: 'audio', label: 'Audio & Music', icon: Mic },
  { id: 'agents', label: 'AI Agents', icon: Bot },
  { id: 'business', label: 'Business Tools', icon: Briefcase },
];

const THEMES = {
  default: { c1: [79, 70, 229], c2: [168, 85, 247], c3: [14, 165, 233] },
  coding: { c1: [16, 185, 129], c2: [20, 184, 166], c3: [6, 182, 212] },
  design: { c1: [217, 70, 239], c2: [249, 115, 22], c3: [139, 92, 246] },
  video: { c1: [239, 68, 68], c2: [245, 158, 11], c3: [244, 63, 94] }
};

// ==========================================
// BACKGROUND: GENERATIVE MESH GRADIENT
// ==========================================
function InteractiveMeshBackground({ theme = 'default' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const colors = THEMES[theme] || THEMES.default;

    let time = 0;
    const render = () => {
      time += 0.0015;
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#020204');
      bgGradient.addColorStop(1, '#080812');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const drawOrb = (xBase, yBase, radius, r, g, b, a, speedX, speedY) => {
        const x = xBase + Math.sin(time * speedX) * (width * 0.3);
        const y = yBase + Math.cos(time * speedY) * (height * 0.3);
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      };

      drawOrb(width * 0.3, height * 0.3, width * 0.4, colors.c1[0], colors.c1[1], colors.c1[2], 0.15, 0.3, 0.4); 
      drawOrb(width * 0.7, height * 0.6, width * 0.5, colors.c2[0], colors.c2[1], colors.c2[2], 0.12, 0.2, 0.3);
      drawOrb(width * 0.5, height * 0.5, width * 0.6, colors.c3[0], colors.c3[1], colors.c3[2], 0.08, 0.4, 0.2); 

      ctx.fillStyle = 'rgba(255,255,255,0.015)'; ctx.fillRect(0, 0, width, height);
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', handleResize); };
  }, [theme]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000" />;
}

// ==========================================
// 3D UI COMPONENTS
// ==========================================
function Button3D({ children, onClick, type = "button", className = "", variant = "primary", disabled = false }) {
  const baseStyle = "relative font-bold transition-all duration-200 outline-none select-none flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl";
  let variantStyle = variant === "primary" 
    ? "bg-indigo-600 text-white shadow-[0_8px_0_#3730a3,0_15px_20px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-indigo-500 hover:shadow-[0_6px_0_#3730a3,0_12px_15px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.4)] active:shadow-[0_0px_0_#3730a3,0_0px_0px_rgba(0,0,0,0.5),inset_0_4px_8px_rgba(0,0,0,0.4)]"
    : variant === "glass" 
    ? "bg-white/5 backdrop-blur-xl border border-white/10 text-zinc-200 shadow-[0_8px_0_rgba(0,0,0,0.4),0_15px_20px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)] hover:bg-white/10 hover:text-white hover:border-white/20 hover:shadow-[0_6px_0_rgba(0,0,0,0.4),0_12px_15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:shadow-[0_0px_0_rgba(0,0,0,0.4),0_0px_0px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(0,0,0,0.3)]"
    : "bg-zinc-100 text-black shadow-[0_8px_0_#a1a1aa,0_15px_20px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,1)] hover:bg-white hover:shadow-[0_6px_0_#a1a1aa,0_12px_15px_rgba(0,0,0,0.4),inset_0_2px_4px_rgba(255,255,255,1)] active:shadow-[0_0px_0_#a1a1aa,0_0px_0px_rgba(0,0,0,0.4),inset_0_4px_8px_rgba(0,0,0,0.2)]";

  return (
    <motion.button type={type} onClick={onClick} disabled={disabled} whileHover={!disabled ? { y: 2 } : {}} whileTap={!disabled ? { y: 8 } : {}} className={`${baseStyle} ${variantStyle} ${className}`}>
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-2xl pointer-events-none opacity-50" />
      <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-sm">{children}</span>
    </motion.button>
  );
}

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
      <div style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }} className="w-full h-full rounded-3xl bg-[#0a0a10]/80 backdrop-blur-xl border border-white/5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] overflow-hidden group transition-all duration-300 hover:bg-[#0f0f18]/90 hover:border-indigo-500/30 flex flex-col">
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: useTransform([mouseXSpring, mouseYSpring], ([mx, my]) => `radial-gradient(400px circle at ${(mx + 0.5) * 100}% ${(my + 0.5) * 100}%, rgba(99,102,241,0.08), transparent 50%)`) }}
        />
        <div style={{ transform: "translateZ(20px)" }} className="relative z-10 p-6 sm:p-8 flex flex-col flex-grow h-full">
          {children}
        </div>
      </div>
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
  
  const [searchMode, setSearchMode] = useState('standard'); 
  const [activeCategory, setActiveCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appTheme, setAppTheme] = useState('default'); 
  
  const [userBookmarks, setUserBookmarks] = useState(new Set());
  const [bookmarkedToolsData, setBookmarkedToolsData] = useState([]);

  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: "Welcome to Anakrino AI. Describe your project or the problem you are trying to solve, and I'll find the perfect tools." }]);
  const chatEndRef = useRef(null);

  useEffect(() => { if (copilotOpen && chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, copilotOpen]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) fetchUserBookmarks(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchUserBookmarks(session.user.id);
      else { setUserBookmarks(new Set()); setBookmarkedToolsData([]); }
    });
    return () => subscription?.unsubscribe();
  }, []);

  const triggerToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); };
  const handleLogin = async () => { if (!supabase) return triggerToast("Unable to connect to Supabase."); await supabase.auth.signInWithOAuth({ provider: 'google' }); };
  const handleLogout = async () => { if (!supabase) return; await supabase.auth.signOut(); triggerToast("You have successfully signed out."); };

  const fetchUserBookmarks = async (userId) => {
    if (!supabase) return;
    const { data } = await supabase.from('bookmarks').select(`tool_id, tools(url, *)`).eq('user_id', userId);
    if (data) { setUserBookmarks(new Set(data.map(b => b.tools.url))); setBookmarkedToolsData(data.map(b => b.tools)); }
  };

  const toggleBookmark = async (tool, e) => {
    e.stopPropagation(); 
    if (!user) return triggerToast("Please sign in to save tools to your collection.");
    try {
      const { data: dbRecord, error: toolErr } = await supabase.from('tools').upsert({ 
        url: tool.url, name: tool.name, tagline: tool.tagline, category: tool.category, pricing: tool.pricing, description: tool.description, pros: tool.pros || [], cons: tool.cons || []
      }, { onConflict: 'url' }).select().single();
      if (toolErr || !dbRecord) throw new Error("Failed to sync tool.");

      if (userBookmarks.has(tool.url)) {
        await supabase.from('bookmarks').delete().match({ user_id: user.id, tool_id: dbRecord.id });
        setUserBookmarks(prev => { const next = new Set(prev); next.delete(tool.url); return next; });
        setBookmarkedToolsData(prev => prev.filter(t => t.url !== tool.url));
        triggerToast("Removed from collection.");
      } else {
        await supabase.from('bookmarks').insert({ user_id: user.id, tool_id: dbRecord.id });
        setUserBookmarks(prev => new Set([...prev, tool.url]));
        setBookmarkedToolsData(prev => [...prev, dbRecord]);
        triggerToast("Saved to collection!");
      }
    } catch (err) { triggerToast("Couldn't save tool. Check console."); }
  };

  const executeSearch = async (e, forcedQuery = null) => {
    if(e) e.preventDefault();
    const q = forcedQuery || query;
    if (!q.trim()) return;
    
    setLoading(true); setViewState('results'); setTools([]); setAppTheme('default'); 
    
    try {
      const finalQuery = searchMode === 'workflow' 
        ? `I need a step-by-step workflow plan for: ${q}. Please provide exactly 3 tools in sequential order. Extract exact pricing into pros/cons.`
        : `I am looking for: ${q}. Find the top 6 tools. Extract exact pricing into pros/cons.`;
      
      const finalData = await searchWithAnakrino(finalQuery);
      setTools(finalData || []);

      const firstCat = (finalData?.[0]?.category || '').toLowerCase();
      if (firstCat.includes('code') || firstCat.includes('dev')) setAppTheme('coding');
      else if (firstCat.includes('design') || firstCat.includes('art') || firstCat.includes('image')) setAppTheme('design');
      else if (firstCat.includes('video') || firstCat.includes('audio')) setAppTheme('video');
    } catch (err) { 
      triggerToast(err.message || "An error occurred during search."); setViewState('home'); 
    } finally { setLoading(false); }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    setMobileMenuOpen(false);
    if (cat.id === 'all') {
      setViewState('home');
      setQuery('');
      setAppTheme('default');
    } else {
      setQuery(`Top AI tools for ${cat.label}`);
      setSearchMode('standard');
      executeSearch(null, `Top AI tools for ${cat.label}`);
    }
  };

  const handleCopilotSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatInput(''); setChatLoading(true);
    
    try {
      const contents = chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      contents.push({ role: 'user', parts: [{ text: userText }] });
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if(!envApiKey) throw new Error("Missing Gemini API Key");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${envApiKey}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents })
      });
      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I had trouble generating an answer.";
      setChatMessages(prev => [...prev, { role: 'model', text: reply }]);
    } catch (err) { setChatMessages(prev => [...prev, { role: 'model', text: "Network connection failed." }]); } 
    finally { setChatLoading(false); }
  };

  return (
    <div className="font-body min-h-screen bg-[#020204] text-zinc-200 overflow-x-hidden relative selection:bg-indigo-500/40 selection:text-white">
      <InteractiveMeshBackground theme={appTheme} />
      
      {/* ==========================================
          TOP NAVIGATION BAR (AIxploria Style)
          ========================================== */}
      <nav className="sticky top-0 w-full bg-[#0a0a10]/80 backdrop-blur-2xl border-b border-white/5 z-50 px-4 lg:px-8 py-4 shadow-lg">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 bg-white/5 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Menu className="w-5 h-5 text-white" /></button>
            <div onClick={() => handleCategoryClick(CATEGORIES[0])} className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 bg-black/40 border border-white/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-all">
                <PrismIcon className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Anakrino</h1>
            </div>
          </div>
          
          {/* Quick Nav Search (Hidden on Mobile) */}
          {viewState !== 'home' && (
             <form onSubmit={(e) => executeSearch(e)} className="hidden md:flex flex-1 max-w-xl mx-8 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-400" />
                <input 
                  value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search thousands of AI tools..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                />
             </form>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4 bg-black/40 p-1.5 pl-4 rounded-xl border border-white/5">
                <button onClick={() => { setTools(bookmarkedToolsData); setViewState('results'); }} className="text-sm font-bold text-zinc-300 hover:text-white transition-colors flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-indigo-400" /> <span className="hidden sm:inline">Collection</span>
                  <span className="bg-indigo-600 text-white text-[10px] py-0.5 px-2 rounded-full">{userBookmarks.size}</span>
                </button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={handleLogout} className="text-sm font-bold text-zinc-500 hover:text-rose-400 transition-colors pr-2 hidden sm:block">Sign Out</button>
              </div>
            ) : (
              <button onClick={handleLogin} className="px-5 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-colors shadow-sm">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      {/* ==========================================
          MAIN LAYOUT GRID (Sidebar + Content)
          ========================================== */}
      <div className="max-w-[1800px] mx-auto w-full flex relative z-10 px-4 lg:px-8 py-8 gap-8 items-start">
        
        {/* LEFT SIDEBAR TAXONOMY */}
        <aside className={`w-64 shrink-0 lg:sticky lg:top-28 lg:flex flex-col gap-2 ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 bg-[#0a0a10] border-r border-white/10 p-6 pt-24 shadow-2xl flex' : 'hidden'}`}>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-2 px-3">Browse Directory</h3>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[0.95rem] ${activeCategory === cat.id ? 'bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
            >
              <cat.icon className={`w-5 h-5 ${activeCategory === cat.id ? 'text-indigo-400' : 'text-zinc-500'}`} />
              {cat.label}
            </button>
          ))}
        </aside>

        {/* RIGHT CONTENT AREA */}
        <main className="flex-1 min-w-0 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* HERO SEARCH VIEW */}
            {viewState === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-col justify-center items-center w-full py-10 lg:py-20 flex">
                <div className="max-w-4xl w-full text-center mb-12">
                  <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 mb-6 tracking-tight leading-[1.1]">
                    Find the perfect <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">AI Tool.</span>
                  </h2>
                  <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">Search thousands of top-rated AI tools or let our intelligence engine plan your entire workflow stack.</p>
                </div>

                <div className="w-full max-w-3xl">
                  <div className="flex justify-center mb-8">
                    <div className="bg-black/40 border border-white/10 p-1.5 rounded-2xl flex items-center backdrop-blur-xl">
                      <button onClick={() => setSearchMode('standard')} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${searchMode === 'standard' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'}`}>Find Tools</button>
                      <button onClick={() => setSearchMode('workflow')} className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${searchMode === 'workflow' ? 'bg-indigo-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}><GitMerge className="w-4 h-4" /> Plan Project</button>
                    </div>
                  </div>

                  <form onSubmit={(e) => executeSearch(e)} className="relative w-full">
                    <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-[2rem] p-2.5 shadow-2xl backdrop-blur-3xl focus-within:border-indigo-500/40 focus-within:bg-white/[0.04] transition-all group">
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ml-2 group-focus-within:bg-indigo-500/10 transition-colors">
                        <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400" />
                      </div>
                      <input 
                        value={query} onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent px-5 py-4 text-lg text-white placeholder-zinc-500 outline-none font-medium"
                        placeholder={searchMode === 'workflow' ? "E.g. Automate my YouTube channel..." : "Search 'Audio generation'..."}
                      />
                      <Button3D type="submit" variant="white" className="px-8 py-4 rounded-2xl text-base shrink-0">{searchMode === 'workflow' ? 'Architect' : 'Search'}</Button3D>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* RESULTS DIRECTORY GRID (AIxploria Style High-Density) */}
            {viewState === 'results' && (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full pb-20">
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight capitalize">{query || activeCategory}</h2>
                    <p className="text-zinc-500 font-medium text-sm mt-1">{loading ? 'Scanning intelligence directory...' : `Showing ${tools.length} results`}</p>
                  </div>
                </div>

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-full h-64 rounded-3xl bg-white/[0.02] border border-white/5 p-6 flex flex-col animate-pulse overflow-hidden relative">
                         <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                         <div className="w-full h-[40%] bg-white/10 rounded-2xl mb-4" />
                         <div className="h-5 w-3/4 bg-white/10 rounded-full mb-3" />
                         <div className="h-4 w-1/2 bg-white/10 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {tools.map((tool, idx) => (
                      <Card3D key={idx} onClick={() => { setSelectedTool(tool); setViewState('details'); }} className="cursor-pointer">
                        
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-2">
                             {/* Pricing Badge */}
                             <span className={`px-3 py-1 rounded-lg text-[0.7rem] font-extrabold uppercase tracking-widest ${tool.pricing?.toLowerCase().includes('free') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                               {tool.pricing || "Paid"}
                             </span>
                             {searchMode === 'workflow' && (
                               <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-[0.7rem] font-extrabold uppercase tracking-widest">Step {idx + 1}</span>
                             )}
                          </div>
                          <button onClick={(e) => toggleBookmark(tool, e)} className={`p-2 rounded-xl transition-colors ${userBookmarks.has(tool.url) ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10 text-zinc-500'}`}>
                            <Bookmark className={`w-5 h-5 ${userBookmarks.has(tool.url) ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 truncate leading-tight pr-4">{tool.name}</h3>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-white/5 border border-white/10 text-zinc-300 px-2.5 py-1 rounded-md text-[0.7rem] font-bold uppercase tracking-wider truncate max-w-[120px]">{tool.category || 'Tool'}</span>
                          {tool.rating && <span className="text-[0.75rem] font-bold text-amber-400 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}</span>}
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed font-medium line-clamp-3 mb-6">
                          {tool.description || tool.tagline}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between group/link">
                          <span className="text-sm font-bold text-indigo-400 group-hover/link:text-indigo-300 transition-colors">Details</span>
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover/link:bg-indigo-600 transition-colors">
                             <ArrowRight className="w-4 h-4 text-white" />
                          </div>
                        </div>

                      </Card3D>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* DETAILS MODAL VIEW */}
            {viewState === 'details' && selectedTool && (
              <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full pb-20">
                <button onClick={() => setViewState(query || activeCategory !== 'all' ? 'results' : 'home')} className="mb-8 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors bg-white/5 px-5 py-2.5 rounded-xl border border-white/10 w-fit">
                  <ArrowLeft className="w-4 h-4" /> Back to List
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 sm:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                       <div className="flex flex-wrap gap-3 mb-6">
                         <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest">{selectedTool.category}</span>
                         {selectedTool.rating && <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1.5 rounded-lg"><Star className="w-3.5 h-3.5 fill-current" /> {selectedTool.rating}</div>}
                       </div>
                       <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">{selectedTool.name}</h1>
                       <p className="text-lg text-indigo-200 font-medium mb-6">{selectedTool.tagline}</p>
                       <p className="text-zinc-300 text-base leading-relaxed">{selectedTool.description}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-emerald-500/[0.03] border border-emerald-500/10 rounded-[2rem] p-8">
                        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> Strengths</h4>
                        <ul className="space-y-4">{(selectedTool.pros || ["Highly intuitive", "Great community"]).map((pro, i) => (<li key={i} className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><span className="text-emerald-400 mt-0.5">•</span><span>{pro}</span></li>))}</ul>
                      </div>
                      <div className="bg-rose-500/[0.03] border border-rose-500/10 rounded-[2rem] p-8">
                        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-3"><X className="w-5 h-5 text-rose-400" /> Limitations</h4>
                        <ul className="space-y-4">{(selectedTool.cons || ["Learning curve", "Premium limits"]).map((con, i) => (<li key={i} className="flex items-start gap-3 text-zinc-300 text-sm font-medium"><span className="text-rose-400 mt-0.5">•</span><span>{con}</span></li>))}</ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 lg:sticky lg:top-32">
                    <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 backdrop-blur-xl">
                      <h3 className="text-sm font-bold text-white border-b border-white/10 pb-4 mb-6 uppercase tracking-wider">Details</h3>
                      <div className="space-y-4 mb-8">
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest block mb-1">Pricing Model</span>
                          <span className="text-white font-bold">{selectedTool.pricing || "Freemium"}</span>
                        </div>
                      </div>
                      <a href={selectedTool.url || '#'} target="_blank" rel="noopener noreferrer" className="w-full bg-white hover:bg-zinc-200 text-black text-sm font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg mb-3">
                        Visit Website <ExternalLink className="w-4 h-4" />
                      </a>
                      <button onClick={(e) => toggleBookmark(selectedTool, e)} className={`w-full py-4 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-2 ${userBookmarks.has(selectedTool.url) ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' : 'bg-transparent border-white/20 text-zinc-300 hover:bg-white/5'}`}>
                        <Bookmark className={`w-4 h-4 ${userBookmarks.has(selectedTool.url) ? 'fill-current' : ''}`} /> {userBookmarks.has(selectedTool.url) ? 'Saved to Collection' : 'Save Tool'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ==========================================
          FLOATING AI COPILOT
          ========================================== */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCopilotOpen(!copilotOpen)} className={`fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-[150] transition-colors duration-300 ${copilotOpen ? 'bg-white text-black' : 'bg-indigo-600 text-white'}`}>
        {copilotOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {copilotOpen && (
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: "bottom right" }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.9 }} className="fixed bottom-28 right-8 w-[360px] bg-[#0a0a10]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-3xl z-[150] overflow-hidden flex flex-col h-[550px]">
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
               <div><span className="font-bold text-white block text-sm">Anakrino AI</span><span className="text-xs text-emerald-400 font-bold block flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> Online</span></div>
            </div>
            <div className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-hide flex flex-col">
               {chatMessages.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed font-medium ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white/5 border border-white/5 text-zinc-200 rounded-bl-sm'}`}>{msg.text}</div>
                 </div>
               ))}
               {chatLoading && <div className="flex justify-start"><div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm p-4 text-sm text-zinc-400 flex items-center gap-2"><span className="flex gap-1 animate-pulse">Thinking...</span></div></div>}
               <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleCopilotSubmit} className="p-4 border-t border-white/5 bg-black/40 flex gap-2 backdrop-blur-xl">
               <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Message AI..." className="flex-grow bg-white/5 border border-white/10 rounded-xl text-sm text-white px-4 py-3 outline-none focus:border-indigo-500/50" />
               <button type="submit" disabled={chatLoading || !chatInput.trim()} className="w-12 h-12 shrink-0 flex items-center justify-center bg-white hover:bg-zinc-200 rounded-xl text-black transition-all disabled:opacity-50"><Send className="w-4 h-4 ml-1" /></button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 text-white px-6 py-4 rounded-xl text-sm font-bold backdrop-blur-xl shadow-2xl flex items-center gap-3 z-[200]">
            <AlertCircle className="w-4 h-4 text-indigo-400" /> <p>{toastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}