import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Compass, 
  BookmarkCheck, 
  Bell, 
  Calendar, 
  Trophy,
  FolderArchive
} from 'lucide-react';
import { TimezoneIndicator } from './TimezoneIndicator';
import { Sidebar } from './Sidebar';
import { CalendarSyncModal } from '../calendar/CalendarSyncModal';
import { ReusableVaultModal } from '../vault/ReusableVaultModal';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';

export const AppShell: React.FC = () => {
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const location = useLocation();
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);

  const activeSavedCount = Object.values(savedWorkspaces).filter(
    (w) => w.stage === 'saved' || w.stage === 'preparing'
  ).length;

  const mobileNavLinks = [
    {
      label: 'Discover',
      path: '/discover',
      icon: Compass,
      exact: false,
    },
    {
      label: 'Saved Queue',
      path: '/saved',
      icon: BookmarkCheck,
      badge: activeSavedCount > 0 ? activeSavedCount : undefined,
      exact: true,
    },
    {
      label: 'Reminders',
      path: '/notifications',
      icon: Bell,
      exact: true,
    },
    {
      label: 'Winners',
      path: '/winners',
      icon: Trophy,
      exact: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col md:flex-row antialiased">
      {/* Desktop & Tablet Sidebar (>= 768px) - Exact Figma node 2:2 / 5:80 styling */}
      <Sidebar
        onOpenVault={() => setVaultModalOpen(true)}
        onOpenCalendar={() => setCalendarModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white">
        {/* Mobile Top Header (< 768px) - Zero Border, Zero Shadow */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-xl sticky top-0 z-30">
          <NavLink to="/discover" className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[3px] bg-[#DECAFF] flex items-center justify-center text-neutral-900 font-bold text-xs shadow-none">
              H
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">HackWorkspace</span>
          </NavLink>

          <div className="flex items-center gap-1.5">
            <TimezoneIndicator />
            <button
              onClick={() => setVaultModalOpen(true)}
              aria-label="Open Reusable Vault"
              className="p-2 rounded-xl bg-[#FDFDFD] text-neutral-700 active:scale-[0.97] hover:bg-[#f4f4f6]"
            >
              <FolderArchive className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
            </button>
            <button
              onClick={() => setCalendarModalOpen(true)}
              aria-label="Open Calendar Sync"
              className="p-2 rounded-xl bg-[#FDFDFD] text-neutral-700 active:scale-[0.97] hover:bg-[#f4f4f6]"
            >
              <Calendar className="w-4 h-4 text-neutral-600 stroke-[1.75]" />
            </button>
          </div>
        </header>

        {/* Primary Page Canvas - Pure White, Generous Spacing */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-12 bg-white">
          <Outlet />
        </main>
      </div>

      {/* Mobile Fixed Bottom Nav (< 768px) - Zero Shadow, Flat Blur */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        {mobileNavLinks.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-medium transition-colors relative min-w-[64px] active:scale-[0.97] ${
                isActive ? 'text-neutral-900 font-semibold' : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 stroke-[1.75] ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-neutral-900 text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
      />

      <ReusableVaultModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
      />
    </div>
  );
};
