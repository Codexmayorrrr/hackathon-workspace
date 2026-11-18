import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, 
  BookmarkCheck, 
  Bell, 
  Calendar, 
  Layers,
  Trophy,
  FolderArchive
} from 'lucide-react';
import { TimezoneIndicator } from './TimezoneIndicator';
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

  const navLinks = [
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
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased">
      {/* Universal Desktop & Tablet Top Bar (>= 768px) - Pure White, Zero Border, Zero Shadow */}
      <header className="hidden md:flex items-center justify-between px-6 lg:px-10 h-16 bg-white/90 backdrop-blur-xl sticky top-0 z-30 select-none">
        {/* Brand */}
        <NavLink to="/discover" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
            <Layers className="w-3.5 h-3.5 text-white stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-neutral-900">HackWorkspace</span>
            <span className="text-[10px] font-medium text-neutral-400 bg-[#FDFDFD] px-2 py-0.5 rounded-full font-mono">v1.2</span>
          </div>
        </NavLink>

        {/* Center Segmented Nav Control - Light Grey Track (#FDFDFD), Zero Shadow */}
        <nav className="flex items-center gap-1.5 bg-[#FDFDFD] p-1.5 rounded-2xl">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`relative px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive ? 'text-neutral-900 font-semibold' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-top-nav-indicator"
                    className="absolute inset-0 rounded-xl bg-white"
                    transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 stroke-[1.75] ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold font-mono bg-neutral-200 text-neutral-800 tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right Utilities */}
        <div className="flex items-center gap-3">
          <TimezoneIndicator />
          <button
            onClick={() => setVaultModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#FDFDFD] hover:bg-[#f4f4f6] text-neutral-800 active:scale-[0.97] transition-[transform,background-color] duration-150"
            title="Open Reusable Application Vault"
          >
            <FolderArchive className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            <span>Vault</span>
          </button>
          <button
            onClick={() => setCalendarModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#FDFDFD] hover:bg-[#f4f4f6] text-neutral-800 active:scale-[0.97] transition-[transform,background-color] duration-150"
          >
            <Calendar className="w-3.5 h-3.5 text-neutral-500 stroke-[1.75]" />
            <span>Calendar Sync</span>
          </button>
        </div>
      </header>

      {/* Mobile Top Header (< 768px) - Zero Border, Zero Shadow */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white/95 backdrop-blur-xl sticky top-0 z-30">
        <NavLink to="/discover" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center text-white">
            <Layers className="w-3 h-3 text-white stroke-[2.2]" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900">HackWorkspace</span>
        </NavLink>

        <div className="flex items-center gap-2">
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 md:pb-16 bg-white">
        <Outlet />
      </main>

      {/* Mobile Fixed Bottom Nav (< 768px) - Zero Shadow, Flat Blur */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around">
        {navLinks.map((item) => {
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
