import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  BookmarkCheck, 
  Bell, 
  Trophy, 
  FolderArchive, 
  Calendar, 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen,
  Clock,
  Sparkles
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { MOCK_OPPORTUNITIES } from '../../data/mockOpportunities';
import { getUserTimezone, getTimezoneAbbreviation } from '../../utils/dateUtils';

interface SidebarProps {
  onOpenVault: () => void;
  onOpenCalendar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenVault, onOpenCalendar }) => {
  const location = useLocation();
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);

  // Read initial collapsed state from localStorage or default to false
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hackworkspace_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [pinnedExpanded, setPinnedExpanded] = useState<boolean>(true);

  // Sync collapsed state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hackworkspace_sidebar_collapsed', String(isCollapsed));
    } catch {
      // Ignore storage errors
    }
  }, [isCollapsed]);

  const activeSavedCount = Object.values(savedWorkspaces).filter(
    (w) => w.stage === 'saved' || w.stage === 'preparing'
  ).length;

  // Primary navigation items corresponding to Figma Frame 11 & App routes
  const primaryNavItems = [
    {
      label: 'Home',
      sublabel: 'Discover',
      path: '/discover',
      icon: Compass,
      exact: false,
    },
    {
      label: 'Saved Queue',
      sublabel: 'Workspaces',
      path: '/saved',
      icon: BookmarkCheck,
      badge: activeSavedCount > 0 ? activeSavedCount : undefined,
      exact: true,
    },
    {
      label: 'Reminders',
      sublabel: 'Alerts',
      path: '/notifications',
      icon: Bell,
      exact: true,
    },
    {
      label: 'Winners',
      sublabel: 'Archive',
      path: '/winners',
      icon: Trophy,
      exact: true,
    },
  ];

  // Secondary tools (Vault & Calendar)
  const toolItems = [
    {
      label: 'Application Vault',
      icon: FolderArchive,
      action: onOpenVault,
    },
    {
      label: 'Calendar Sync',
      icon: Calendar,
      action: onOpenCalendar,
    },
  ];

  // Pinned/recent saved workspaces matching Figma Frame 4518 "Pinned Pages"
  const pinnedList = Object.values(savedWorkspaces)
    .map((ws) => {
      const opp = MOCK_OPPORTUNITIES.find((o) => o.id === ws.opportunityId);
      return {
        id: ws.opportunityId,
        title: opp?.title || ws.opportunityId,
        initial: (opp?.title || ws.opportunityId).charAt(0).toUpperCase(),
        savedAt: ws.savedAt,
      };
    })
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
    .slice(0, 6);

  const tzAbbr = getTimezoneAbbreviation();
  const tzName = getUserTimezone();

  return (
    <aside
      aria-label="Application Sidebar"
      className={`hidden md:flex flex-col flex-shrink-0 min-h-screen bg-[#F5F5F5] select-none transition-all duration-200 ease-out z-20 ${
        isCollapsed ? 'w-16' : 'w-56 lg:w-60'
      }`}
    >
      {/* 1. Header / Brand Bar (Figma Frame 2 / Frame 12) */}
      <div className="h-14 px-3 flex items-center justify-between border-0">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <NavLink
              to="/discover"
              className="flex items-center gap-2.5 px-1 py-1 rounded-lg group active:scale-[0.97] transition-transform"
            >
              {/* Figma Frame 12: Lavender Badge (#DECAFF) with initial "H" */}
              <div className="w-5 h-5 rounded-[3px] bg-[#DECAFF] flex items-center justify-center flex-shrink-0 text-neutral-900 font-bold text-[10px] leading-none shadow-none">
                H
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-neutral-950 tracking-tight">
                  HackWorkspace
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
              </div>
            </NavLink>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-800 hover:bg-[#ECECEC] active:scale-[0.97] transition-all"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-7 h-7 rounded-[4px] bg-[#DECAFF] hover:opacity-90 flex items-center justify-center text-neutral-900 font-bold text-xs active:scale-[0.97] transition-transform shadow-none"
              title="Expand sidebar (HackWorkspace)"
              aria-label="Expand sidebar"
            >
              H
            </button>
          </div>
        )}
      </div>

      {/* 2. Primary Navigation (Figma Frame 11) */}
      <div className="px-2 py-2 flex flex-col gap-1">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          if (isCollapsed) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={`${item.label}${item.badge ? ` (${item.badge})` : ''}`}
                className={`relative flex items-center justify-center w-11 h-9 mx-auto rounded-lg text-neutral-600 transition-all active:scale-[0.97] ${
                  isActive
                    ? 'bg-[#EBEBEB] text-neutral-950 font-semibold'
                    : 'hover:bg-[#ECECEC] hover:text-neutral-950'
                }`}
              >
                <Icon className={`w-4 h-4 stroke-[1.8] ${isActive ? 'text-neutral-950' : 'text-neutral-500'}`} />
                {item.badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neutral-900" />
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-[0.97] ${
                isActive
                  ? 'bg-[#EBEBEB] text-neutral-950 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-950 hover:bg-[#ECECEC]/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 stroke-[1.8] flex-shrink-0 ${
                    isActive ? 'text-neutral-950' : 'text-neutral-500 group-hover:text-neutral-950'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold bg-[#E0E0E0] text-neutral-900 tabular-nums">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* 3. Action Tools Section (Vault & Calendar) */}
      <div className="px-2 py-1.5 flex flex-col gap-1">
        {!isCollapsed && (
          <div className="px-2.5 pt-2 pb-1 text-[9px] font-bold tracking-wider text-neutral-400 uppercase">
            Tools
          </div>
        )}

        {toolItems.map((tool) => {
          const Icon = tool.icon;

          if (isCollapsed) {
            return (
              <button
                key={tool.label}
                onClick={tool.action}
                title={tool.label}
                className="flex items-center justify-center w-11 h-9 mx-auto rounded-lg text-neutral-500 hover:text-neutral-950 hover:bg-[#ECECEC] transition-all active:scale-[0.97]"
              >
                <Icon className="w-4 h-4 stroke-[1.8]" />
              </button>
            );
          }

          return (
            <button
              key={tool.label}
              onClick={tool.action}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-950 hover:bg-[#ECECEC]/70 transition-all text-left active:scale-[0.97]"
            >
              <Icon className="w-4 h-4 stroke-[1.8] text-neutral-500" />
              <span className="truncate">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Collapsible Pinned Workspaces (Figma Frame 4518 "Pinned Pages") */}
      <div className="flex-1 px-2 py-2 overflow-y-auto no-scrollbar">
        {!isCollapsed ? (
          <div className="flex flex-col gap-1">
            {/* Pinned Header with Accordion Toggle */}
            <button
              onClick={() => setPinnedExpanded(!pinnedExpanded)}
              className="flex items-center justify-between w-full px-2.5 py-1 rounded text-[9px] font-bold tracking-wider text-neutral-400 hover:text-neutral-700 uppercase transition-colors"
            >
              <span>Pinned Workspaces</span>
              {pinnedExpanded ? (
                <ChevronDown className="w-3 h-3 stroke-[2] text-neutral-400" />
              ) : (
                <ChevronRight className="w-3 h-3 stroke-[2] text-neutral-400" />
              )}
            </button>

            {/* Pinned List */}
            <AnimatePresence initial={false}>
              {pinnedExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col gap-0.5 overflow-hidden"
                >
                  {pinnedList.length > 0 ? (
                    pinnedList.map((pin) => {
                      const isPinActive = location.pathname === `/workspaces/${pin.id}`;
                      return (
                        <NavLink
                          key={pin.id}
                          to={`/workspaces/${pin.id}`}
                          className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-[0.97] ${
                            isPinActive
                              ? 'bg-[#EBEBEB] text-neutral-950 font-semibold'
                              : 'text-neutral-700 hover:text-neutral-950 hover:bg-[#ECECEC]/60'
                          }`}
                        >
                          {/* Figma circular initial badge (Frame 12) */}
                          <div className="w-4 h-4 rounded-full bg-[#DECAFF] text-neutral-900 font-bold text-[8px] flex items-center justify-center flex-shrink-0">
                            {pin.initial}
                          </div>
                          <span className="truncate">{pin.title}</span>
                        </NavLink>
                      );
                    })
                  ) : (
                    <NavLink
                      to="/discover"
                      className="px-2.5 py-1.5 text-[11px] text-neutral-400 hover:text-neutral-600 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-neutral-400" />
                      <span>Pin from Discover</span>
                    </NavLink>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Collapsed Pinned Avatars */
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="w-4 h-[1px] bg-neutral-200 my-1" />
            {pinnedList.slice(0, 4).map((pin) => (
              <NavLink
                key={pin.id}
                to={`/workspaces/${pin.id}`}
                title={pin.title}
                className="w-7 h-7 rounded-full bg-[#DECAFF] hover:scale-105 active:scale-95 text-neutral-900 font-bold text-[9px] flex items-center justify-center transition-transform"
              >
                {pin.initial}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* 5. Footer Utility (Timezone & Expand/Collapse) */}
      <div className="p-2 border-0 bg-[#F5F5F5] flex flex-col gap-1.5">
        {!isCollapsed ? (
          <>
            {/* Timezone pill */}
            <div className="px-2.5 py-1.5 rounded-lg bg-[#ECECEC]/70 text-[10px] text-neutral-600 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <Clock className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                <span className="font-mono font-semibold text-neutral-900">{tzAbbr}</span>
                <span className="text-neutral-300">·</span>
                <span className="truncate text-neutral-500 font-mono text-[9px]">{tzName}</span>
              </div>
            </div>

            {/* Bottom Collapse Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:bg-[#ECECEC] active:scale-[0.97] transition-all"
            >
              <span>Collapse</span>
              <PanelLeftClose className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center w-11 h-9 mx-auto rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-[#ECECEC] active:scale-[0.97] transition-all"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4 text-neutral-600" />
          </button>
        )}
      </div>
    </aside>
  );
};
