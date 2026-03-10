import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Plus, MessageSquare, X, Trash2 } from 'lucide-react';
import { useChat } from '@/lib/chat-context';
import { DynamicSVG } from './DynamicSVG';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { sessions, currentSessionId, setCurrentSessionId, createNewSession, deleteSession } = useChat();

  const handleSelectChat = (id: string) => {
    setCurrentSessionId(id);
    setIsOpen(false);
  };

  const handleNewChat = () => {
    createNewSession();
    setIsOpen(false);
  };

  // Group sessions by date
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const groupedSessions = sessions.reduce((acc, session) => {
    const sessionDate = new Date(session.updatedAt).toDateString();
    let group = 'Anteriores';
    if (sessionDate === today) group = 'Hoy';
    else if (sessionDate === yesterday) group = 'Ayer';

    if (!acc[group]) acc[group] = [];
    acc[group].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-6 z-50 p-2.5 rounded-full bg-white/60 dark:glass-dark hover:bg-white/90 dark:hover:bg-white/10 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm text-[#0e1745]/60 dark:text-white/60 hover:text-[#0e1745] dark:hover:text-white transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#0e1745]/5 dark:bg-black/40 backdrop-blur-sm z-[60]"
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-white/80 dark:bg-[#0e1745]/90 backdrop-blur-xl border-r border-white/50 dark:border-white/10 shadow-[20px_0_40px_0_rgba(14,23,69,0.05)] dark:shadow-[20px_0_40px_0_rgba(0,0,0,0.3)] z-[70] flex flex-col text-[#0e1745] dark:text-white"
            >
              <div className="p-6 flex items-center justify-between border-b border-[#0e1745]/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg tracking-tight">Historial</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-[#0e1745]/5 dark:hover:bg-white/10 text-[#0e1745]/60 dark:text-white/60 hover:text-[#0e1745] dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4">
                <button 
                  onClick={handleNewChat}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {Object.entries(groupedSessions).map(([group, groupSessions]) => (
                  <div key={group}>
                    <h3 className="text-xs font-medium text-[#0e1745]/40 dark:text-white/40 uppercase tracking-wider mb-3 px-2">{group}</h3>
                    <div className="space-y-1">
                      {groupSessions.map((chat) => (
                        <div key={chat.id} className="relative group flex items-center">
                          <button 
                            onClick={() => handleSelectChat(chat.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${currentSessionId === chat.id ? 'bg-[#0e1745]/5 dark:bg-white/10 text-[#0e1745] dark:text-white' : 'hover:bg-[#0e1745]/5 dark:hover:bg-white/5 text-[#0e1745]/80 dark:text-white/80'}`}
                          >
                            <MessageSquare className={`w-4 h-4 transition-colors ${currentSessionId === chat.id ? 'text-primary dark:text-secondary' : 'text-[#0e1745]/40 dark:text-white/40 group-hover:text-primary dark:group-hover:text-secondary'}`} />
                            <div className="flex-1 truncate text-sm font-medium group-hover:text-[#0e1745] dark:group-hover:text-white">
                              {chat.title}
                            </div>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSession(chat.id);
                            }}
                            className="absolute right-2 p-1.5 rounded-md text-[#0e1745]/40 dark:text-white/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {sessions.length === 0 && (
                  <div className="text-center text-sm text-[#0e1745]/40 dark:text-white/40 mt-10">
                    No hay chats recientes
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
