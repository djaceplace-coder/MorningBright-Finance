import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationBell() {
  const { notifications, markNotificationAsRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out the ones the user doesn't want
  const filteredNotifications = notifications.filter((notif) => {
    const skipTitles = [
      "Account Balance Adjusted",
      "External Deposit Cleared",
      "Transfer Dispatched",
      "Wire Credits Cleared"
    ];
    return !skipTitles.includes(notif.title);
  });

  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center relative hover:bg-slate-300 dark:hover:bg-white/10 transition-colors"
      >
        <Bell size={16} className="text-slate-600 dark:text-slate-300" />
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-100 dark:border-slate-950" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono tracking-widest uppercase text-slate-800 dark:text-white">Notifications</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={14} />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredNotifications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic">No new notifications</div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-3 rounded-lg text-left cursor-pointer transition-colors ${notif.isRead ? 'opacity-60 hover:bg-slate-100 dark:hover:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/80'}`}
                    onClick={() => {
                      if (!notif.isRead) markNotificationAsRead(notif.id);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 dark:text-slate-300">
                        {notif.title}
                      </span>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-0.5 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{notif.message}</p>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 block">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
