import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Layers, Scale, Filter, 
  ArrowUpDown, RefreshCw 
} from 'lucide-react';

import { searchWithAnakrino } from './lib/gemini';
import { supabase } from './lib/supabase';

import InteractiveMeshBackground from './components/InteractiveMeshBackground';
import Navbar from './components/Navbar';
import HeroSearch from './components/HeroSearch';
import ToolCard from './components/ToolCard';
import SkeletonCard from './components/SkeletonCard';
import ToolDetailView from './components/ToolDetailView';
import ComparisonMatrix from './components/ComparisonMatrix';
import CommentsModal from './components/CommentsModal';
import CopilotDrawer from './components/CopilotDrawer';
import Toast from './components/Toast';
import Button3D from './components/Button3D';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 16 }
  }
};

export default function App() {
  const [viewState, setViewState] = useState('home'); // 'home' | 'results' | 'details' | 'compare'
  const [query, setQuery] = useState('');
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: null, type: 'info' });

  // Filtering & Sorting on Results
  const [pricingFilter, setPricingFilter] = useState('all'); // 'all' | 'free' | 'paid'
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'rating'

  // Comparison Matrix List
  const [compareList, setCompareList] = useState([]);

  // Mesh Canvas Theme
  const [appTheme, setAppTheme] = useState('default');

  // Social Interactions (Upvotes, Downvotes, Comments)
  const [interactions, setInteractions] = useState({});
  const [activeCommentTool, setActiveCommentTool] = useState(null);

  // Copilot Assistant State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'model',
      text: "Welcome to **Anakrino Engine**! Describe a project or problem, and I'll find or compare the best AI platforms for you."
    }
  ]);

  // Supabase Auth Listener
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: null, type: 'info' });
    }, 4000);
  };

  const handleLogin = async () => {
    if (!supabase) {
      return triggerToast("Supabase credentials are not configured in your .env file.");
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) {
        triggerToast(error.message || "Sign in failed.", "info");
      }
    } catch (err) {
      triggerToast(err.message || "Failed to initiate authentication.", "info");
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    triggerToast("You have been signed out.", "success");
  };

  const initInteractionState = (url) => {
    if (!url) return;
    setInteractions((prev) => {
      if (prev[url]) return prev;
      return {
        ...prev,
        [url]: {
          likes: Math.floor(Math.random() * 45) + 12,
          dislikes: Math.floor(Math.random() * 3),
          userAction: null,
          comments: []
        }
      };
    });
  };

  const handleVote = (tool, actionType, e) => {
    e.stopPropagation();
    if (!user) {
      return triggerToast("Please sign in to rate AI tools.");
    }

    initInteractionState(tool.url);

    setInteractions((prev) => {
      const current = prev[tool.url] || { likes: 10, dislikes: 0, userAction: null, comments: [] };
      let newLikes = current.likes;
      let newDislikes = current.dislikes;
      let newUserAction = actionType;

      if (current.userAction === actionType) {
        newUserAction = null;
        if (actionType === 'like') newLikes--;
        if (actionType === 'dislike') newDislikes--;
      } else {
        if (actionType === 'like') {
          newLikes++;
          if (current.userAction === 'dislike') newDislikes--;
        }
        if (actionType === 'dislike') {
          newDislikes++;
          if (current.userAction === 'like') newLikes--;
        }
      }

      return {
        ...prev,
        [tool.url]: {
          ...current,
          likes: newLikes,
          dislikes: newDislikes,
          userAction: newUserAction
        }
      };
    });
  };

  const handleAddComment = (url, text) => {
    if (!user) return;
    setInteractions((prev) => {
      const current = prev[url] || { likes: 0, dislikes: 0, userAction: null, comments: [] };
      const newComment = {
        author: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
        text,
        date: new Date().toISOString()
      };
      return {
        ...prev,
        [url]: {
          ...current,
          comments: [newComment, ...current.comments]
        }
      };
    });
    triggerToast("Your comment has been posted!", "success");
  };

  const toggleCompare = (tool, e) => {
    if (e) e.stopPropagation();
    if (compareList.find((t) => t.url === tool.url)) {
      setCompareList((prev) => prev.filter((t) => t.url !== tool.url));
      triggerToast(`Removed ${tool.name} from comparison.`);
    } else if (compareList.length < 3) {
      setCompareList((prev) => [...prev, tool]);
      triggerToast(`Added ${tool.name} to comparison matrix.`, "success");
    } else {
      triggerToast("You can compare up to 3 tools at once.");
    }
  };

  // Search Engine Logic
  const executeSearch = async (searchQuery) => {
    const activeQuery = (typeof searchQuery === 'string' ? searchQuery : query).trim();
    if (!activeQuery) return;

    setLoading(true);
    setViewState('results');
    setTools([]);
    setAppTheme('default');

    try {
      const promptQuery = `I am looking for: ${activeQuery}. IMPORTANT: Extract exact pricing and limitations into pros/cons. Make descriptions explain exactly why it fits my request.`;
      const finalData = await searchWithAnakrino(promptQuery);

      if (Array.isArray(finalData)) {
        finalData.forEach((t) => initInteractionState(t.url));
        setTools(finalData);

        const firstCat = (finalData[0]?.category || '').toLowerCase();
        if (firstCat.includes('code') || firstCat.includes('dev')) setAppTheme('coding');
        else if (firstCat.includes('design') || firstCat.includes('art') || firstCat.includes('image')) setAppTheme('design');
        else if (firstCat.includes('video') || firstCat.includes('audio')) setAppTheme('video');
        else setAppTheme('default');
      } else {
        setTools([]);
      }
    } catch (err) {
      triggerToast(err.message || "An error occurred during AI search.", "info");
      setViewState('home');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSearch = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  const handleTagSelect = (tagText) => {
    setQuery(tagText);
    executeSearch(tagText);
  };

  // Copilot Assistant Logic
  const handleCopilotSend = async (userText) => {
    setChatMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const contents = chatMessages.map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      let systemContext = `[System Context: The user is on the '${viewState}' view. `;
      if (viewState === 'details' && selectedTool) {
        systemContext += `Currently inspecting tool: ${selectedTool.name} (${selectedTool.url}) with category ${selectedTool.category}. `;
      }
      if (compareList.length > 0) {
        systemContext += `Currently comparing tools: ${compareList.map((t) => t.name).join(', ')}. `;
      }
      if (tools.length > 0) {
        systemContext += `Current search results include: ${tools.map((t) => t.name).join(', ')}. `;
      }
      systemContext += `] `;

      contents.push({ role: 'user', parts: [{ text: systemContext + userText }] });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        let errText = "API error occurred.";
        try {
          const errData = await response.json();
          if (errData?.error) errText = errData.error;
        } catch {
          // ignore
        }
        throw new Error(errText);
      }

      const data = await response.json();
      const reply = data.reply || "Sorry, I had trouble formulating an answer.";
      setChatMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      console.error("Chat generation failed:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: 'model', text: "I'm having trouble connecting right now. Please try again in a moment." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Filtered & Sorted Tools
  const filteredTools = tools
    .filter((tool) => {
      if (pricingFilter === 'all') return true;
      const pricing = (tool.pricing || '').toLowerCase();
      if (pricingFilter === 'free') {
        return pricing.includes('free') || pricing.includes('open source');
      }
      if (pricingFilter === 'paid') {
        return pricing.includes('paid') || pricing.includes('commercial');
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        const rA = parseFloat(a.rating) || 4.5;
        const rB = parseFloat(b.rating) || 4.5;
        return rB - rA;
      }
      return 0;
    });

  return (
    <div className="font-body min-h-screen bg-[#020204] text-zinc-200 overflow-x-hidden pb-32 relative selection:bg-indigo-500/40 selection:text-white">
      {/* Dynamic Animated Mesh Canvas */}
      <InteractiveMeshBackground theme={appTheme} />

      {/* Main Page Layout Container */}
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 py-6 relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onResetHome={() => {
            setViewState('home');
            setQuery('');
            setAppTheme('default');
          }}
          compareCount={compareList.length}
          onOpenCompare={() => setViewState('compare')}
        />

        {/* View Transition Area */}
        <AnimatePresence mode="wait">
          {/* 1. HOME VIEW */}
          {viewState === 'home' && (
            <HeroSearch
              query={query}
              onQueryChange={setQuery}
              onSubmit={handleFormSearch}
              onTagSelect={handleTagSelect}
            />
          )}

          {/* 2. RESULTS VIEW */}
          {viewState === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
              transition={{ duration: 0.4 }}
              className="flex-grow flex flex-col w-full mt-8 relative"
            >
              {/* Results Search Bar & Filter Controls */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8">
                {/* Search Input */}
                <form onSubmit={handleFormSearch} className="max-w-2xl w-full relative">
                  <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-2xl p-1.5 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl focus-within:border-indigo-500/40 transition-all duration-300">
                    <Search className="w-5 h-5 text-zinc-500 ml-4 shrink-0 group-focus-within:text-indigo-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="w-full bg-transparent px-4 py-2.5 text-sm sm:text-base text-white placeholder-zinc-500 outline-none font-semibold"
                      placeholder="Refine search or ask for another tool..."
                    />
                    <Button3D
                      type="submit"
                      variant="glass"
                      className="px-6 py-2.5 text-xs sm:text-sm font-bold tracking-wide"
                    >
                      Search
                    </Button3D>
                  </div>
                </form>

                {/* Filter and Sort Pills */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-400">
                      <Filter className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Pricing:</span>
                    </div>
                    {['all', 'free', 'paid'].map((filterVal) => (
                      <button
                        key={filterVal}
                        onClick={() => setPricingFilter(filterVal)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                          pricingFilter === filterVal
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {filterVal}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 p-1 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-400">
                      <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Sort:</span>
                    </div>
                    {[
                      { key: 'recommended', label: 'Recommended' },
                      { key: 'rating', label: 'Top Rated' }
                    ].map((sortOption) => (
                      <button
                        key={sortOption.key}
                        onClick={() => setSortBy(sortOption.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          sortBy === sortOption.key
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {sortOption.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Title Section */}
              {!loading && tools.length > 0 && (
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-6 mb-8">
                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/30 rounded-2xl">
                      <Layers className="text-indigo-400 w-6 h-6" />
                    </div>
                    <span>Recommended AI Stack</span>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                      {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
                    </span>
                  </h2>
                </div>
              )}

              {/* Grid Content */}
              {loading ? (
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid gap-8 items-stretch grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                >
                  {filteredTools.length === 0 && (
                    <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
                        <RefreshCw className="w-6 h-6 text-zinc-500" />
                      </div>
                      <p className="text-xl font-bold text-white mb-2">No matching tools found</p>
                      <p className="text-zinc-400 text-sm max-w-md">
                        Try modifying your filters or searching for a broader term like &quot;coding assistant&quot; or &quot;image generator&quot;.
                      </p>
                    </div>
                  )}

                  {filteredTools.map((tool, idx) => (
                    <motion.div variants={itemVariants} key={tool.url || idx} className="flex">
                      <ToolCard
                        tool={tool}
                        isSelectedInCompare={Boolean(compareList.find((t) => t.url === tool.url))}
                        interaction={interactions[tool.url]}
                        onSelect={(selected) => {
                          setSelectedTool(selected);
                          setViewState('details');
                        }}
                        onToggleCompare={toggleCompare}
                        onVote={handleVote}
                        onOpenComments={(active) => {
                          setActiveCommentTool({
                            ...active,
                            comments: interactions[active.url]?.comments || []
                          });
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* 3. DETAILS VIEW */}
          {viewState === 'details' && selectedTool && (
            <ToolDetailView
              tool={selectedTool}
              onBack={() => setViewState(tools.length > 0 ? 'results' : 'home')}
              isInCompare={Boolean(compareList.find((t) => t.url === selectedTool.url))}
              onToggleCompare={toggleCompare}
            />
          )}

          {/* 4. COMPARISON MATRIX VIEW */}
          {viewState === 'compare' && (
            <ComparisonMatrix
              tools={compareList}
              onBack={() => setViewState(tools.length > 0 ? 'results' : 'home')}
              onRemove={(tool) => setCompareList((prev) => prev.filter((t) => t.url !== tool.url))}
            />
          )}
        </AnimatePresence>
      </div>

      {/* FLOATING COMPARISON BAR (When 1 to 3 tools are queued) */}
      <AnimatePresence>
        {compareList.length > 0 && viewState !== 'compare' && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/85 border border-white/10 rounded-2xl px-6 py-3.5 backdrop-blur-3xl shadow-[0_25px_50px_rgba(0,0,0,0.8)] z-[140] flex items-center gap-6"
          >
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-xs sm:text-sm text-white tracking-wide">
                Comparing {compareList.length} / 3 tools
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCompareList([])}
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setViewState('compare')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                View Matrix
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING COPILOT ASSISTANT */}
      <CopilotDrawer
        isOpen={copilotOpen}
        onToggle={() => setCopilotOpen(!copilotOpen)}
        messages={chatMessages}
        onSendMessage={handleCopilotSend}
        loading={chatLoading}
        onClearMessages={() =>
          setChatMessages([
            {
              role: 'model',
              text: "Conversation reset. What AI challenge or workflow can I help you discover next?"
            }
          ])
        }
      />

      {/* COMMUNITY COMMENTS MODAL */}
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

      {/* TOAST STATUS NOTIFICATIONS */}
      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}