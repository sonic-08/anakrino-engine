import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, RotateCcw, MessageSquare, Compass } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const QUICK_PROMPTS = [
  "What is the best AI for coding?",
  "Recommend free AI video generators",
  "How to build an AI content pipeline?"
];

export default function CopilotDrawer({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  loading,
  onClearMessages
}) {
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = inputRef.current?.value?.trim();
    if (!val || loading) return;
    onSendMessage(val);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handlePromptClick = (prompt) => {
    if (loading) return;
    onSendMessage(prompt);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={onToggle}
        className={`fixed bottom-8 right-6 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-[0_10px_35px_rgba(16,185,129,0.4)] z-[150] transition-colors duration-300 cursor-pointer ${
          isOpen ? 'bg-white text-black border border-white/20' : 'bg-emerald-600 text-white hover:bg-emerald-500'
        }`}
        title={isOpen ? "Close Copilot" : "Open Anakrino Copilot"}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.92, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92, filter: 'blur(6px)' }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-26 sm:bottom-28 right-4 sm:right-10 w-[calc(100vw-2rem)] sm:w-[440px] bg-[#07130b]/95 border border-white/10 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.85)] backdrop-blur-3xl z-[150] overflow-hidden flex flex-col h-[580px] max-h-[75vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                  <Compass className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-heading text-base font-bold text-white block tracking-tight">
                    Anakrino Copilot
                  </span>
                  <span className="text-[0.7rem] text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    Live Web-Grounding Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onClearMessages}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  title="Reset conversation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggle}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-grow p-5 overflow-y-auto space-y-4 scrollbar-hide flex flex-col">
              {messages.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'model' && (
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mr-2 mt-1 shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed font-medium ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white shadow-md rounded-br-sm'
                        : 'bg-white/[0.05] border border-white/10 text-zinc-200 rounded-bl-sm prose prose-invert prose-xs max-w-none'
                    }`}
                  >
                    {msg.role === 'model' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                          code: ({ children }) => (
                            <code className="bg-black/40 text-emerald-300 px-1.5 py-0.5 rounded text-[0.75rem] font-mono">
                              {children}
                            </code>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">
                              {children}
                            </a>
                          )
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Suggestions chips if conversation is brief */}
              {messages.length <= 2 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <span className="text-[0.68rem] text-zinc-500 uppercase tracking-widest font-bold block mb-2">
                    Suggested Questions
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handlePromptClick(prompt)}
                        className="text-left text-xs bg-white/[0.04] hover:bg-emerald-600/20 hover:border-emerald-500/40 text-zinc-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/5 transition-all cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start items-center gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="bg-white/[0.05] border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
                    <span className="flex gap-1">
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -3, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                    </span>
                    <span className="text-[0.75rem] font-medium text-zinc-400">Researching AI catalog...</span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t border-white/5 bg-black/40 flex items-center gap-2 backdrop-blur-xl"
            >
              <input
                ref={inputRef}
                placeholder="Ask about AI platforms, comparisons..."
                className="flex-grow bg-white/5 border border-white/10 rounded-xl text-xs sm:text-sm text-white px-4 py-3 outline-none focus:border-emerald-500/50 transition-colors font-medium placeholder-zinc-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-white hover:bg-zinc-200 rounded-xl text-black transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
                title="Send message"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
