import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, User, Send } from 'lucide-react';

export default function CommentsModal({ tool, onClose, user, onAddComment }) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(tool.url, commentText.trim());
    setCommentText('');
  };

  const comments = Array.isArray(tool.comments) ? tool.comments : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0a0a12] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl flex flex-col max-h-[82vh] overflow-hidden relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-400" /> Community Discussion
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{tool.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment Thread */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-zinc-500 py-12 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-3">
                <MessageCircle className="w-6 h-6 text-zinc-500" />
              </div>
              <p className="font-semibold text-sm text-zinc-300">No comments yet.</p>
              <p className="text-xs text-zinc-500 mt-1">Be the first to share your experience with {tool.name}!</p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 text-indigo-400">
                  <User className="w-4 h-4" />
                </div>
                <div className="bg-white/[0.04] rounded-2xl rounded-tl-none p-4 text-xs sm:text-sm text-zinc-200 leading-relaxed border border-white/5 flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-indigo-300 text-xs">{c.author || 'Member'}</span>
                    {c.date && (
                      <span className="text-[0.65rem] text-zinc-500">
                        {new Date(c.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-300">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-2.5">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts on this AI tool..."
                className="flex-grow bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-indigo-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="bg-indigo-600 text-white px-5 rounded-xl font-bold text-xs sm:text-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div className="text-center p-3 text-xs text-zinc-400 font-medium bg-black/40 rounded-xl border border-white/5">
              Please sign in to join the discussion.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
