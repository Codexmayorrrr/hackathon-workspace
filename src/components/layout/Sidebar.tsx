import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  Sparkles,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { MOCK_OPPORTUNITIES } from '../../data/mockOpportunities';
import { getUserTimezone, getTimezoneAbbreviation } from '../../utils/dateUtils';
import { CATEGORY_THEMES } from '../../utils/categoryTheme';

interface SidebarProps {
  onOpenVault: () => void;
  onOpenCalendar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenVault, onOpenCalendar }) => {
  const location = useLocation();
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);
  const shouldReduceMotion = useReducedMotion();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hackworkspace_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [pinnedExpanded, setPinnedExpanded] = useState<boolean>(true);

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

  const primaryNavItems = [
    {
      label: 'Home',
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

  const toolItems = [
    {
      label: 'Reusable Vault',
      icon: FolderArchive,
      action: onOpenVault,
    },
    {
      label: 'Calendar Sync',
      icon: Calendar,
      action: onOpenCalendar,
    },
  ];

  const pinnedList = Object.values(savedWorkspaces)
    .map((ws) => {
      const opp = MOCK_OPPORTUNITIES.find((o) => o.id === ws.opportunityId);
      return {
        id: ws.opportunityId,
        title: opp?.title || ws.opportunityId,
        type: opp?.type || 'hackathon',
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
      aria-label="Primary Sidebar Navigation"
      className={`hidden md:flex flex-col flex-shrink-0 min-h-[100dvh] bg-[#F4F4F6] shadow-[1px_0_0_0_oklch(0_0_0/0.05)] select-none transition-[width] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* 1. Brand Header */}
      <div className="h-16 px-3.5 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full gap-2">
            <NavLink
              to="/discover"
              className="flex items-center gap-2.5 rounded-lg py-1 group active:scale-[0.96] transition-transform duration-150"
            >
              <div
                aria-hidden="true"
                className="w-6 h-6 rounded-[5px] bg-[#DECAFF] shadow-[0_0_0_1px_oklch(0_0_0/0.06)] flex items-center justify-center flex-shrink-0 text-[#18181B] font-bold text-xs leading-none"
              >
                H
              </div>
              <span className="text-[13px] font-semibold text-[#18181B] tracking-tight">
                HackWorkspace
              </span>
            </NavLink>

            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-8 h-8 rounded-lg text-[#52525B] hover:text-[#18181B] hover:bg-[#E7E7EB] active:scale-[0.96] transition-[transform,background-color,color] duration-150 flex items-center justify-center"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              aria-expanded={true}
            >
              <PanelLeftClose aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="w-8 h-8 rounded-lg bg-[#DECAFF] shadow-[0_0_0_1px_oklch(0_0_0/0.06)] hover:opacity-90 flex items-center justify-center text-[#18181B] font-bold text-xs active:scale-[0.96] transition-[transform,opacity] duration-150"
              title="Expand sidebar (HackWorkspace)"
              aria-label="Expand sidebar"
              aria-expanded={false}
            >
              H
            </button>
          </div>
        )}
      </div>

      {/* 2. Primary Navigation */}
      <nav aria-label="Primary pages" className="px-2.5 py-2 flex flex-col gap-1">
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
                aria-label={`${item.label}${item.badge ? `, ${item.badge} active` : ''}`}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-[transform,background-color,color] duration-150 active:scale-[0.96] ${
                  isActive
                    ? 'bg-white text-[#18181B] font-semibold shadow-border'
                    : 'text-[#52525B] hover:bg-[#EBECEF] hover:text-[#18181B]'
                }`}
              >
                <Icon
                  aria-hidden="true"
                  className={`w-4 h-4 ${isActive ? 'stroke-[2]' : 'stroke-[1.75]'}`}
                />
                {item.badge !== undefined && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 end-2 w-2 h-2 rounded-full bg-[#18181B]"
                  />
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-[transform,background-color,color] duration-150 active:scale-[0.96] ${
                isActive
                  ? 'bg-white text-[#18181B] font-semibold shadow-border'
                  : 'text-[#52525B] font-medium hover:text-[#18181B] hover:bg-[#EBECEF]/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  aria-hidden="true"
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive
                      ? 'text-[#18181B] stroke-[2]'
                      : 'text-[#52525B] stroke-[1.75] group-hover:text-[#18181B]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#DECAFF] text-[#18181B] tabular-nums">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 3. Action Tools Section */}
      <div className="px-2.5 py-2 flex flex-col gap-1">
        {!isCollapsed && (
          <div className="px-3 pt-3.5 pb-1 text-xs font-semibold text-[#63636B]">
            Tools
          </div>
        )}

        {toolItems.map((tool) => {
          const Icon = tool.icon;

          if (isCollapsed) {
            return (
              <button
                type="button"
                key={tool.label}
                onClick={tool.action}
                title={tool.label}
                aria-label={tool.label}
                className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-[#52525B] hover:text-[#18181B] hover:bg-[#EBECEF] transition-[transform,background-color,color] duration-150 active:scale-[0.96]"
              >
                <Icon aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
              </button>
            );
          }

          return (
            <button
              type="button"
              key={tool.label}
              onClick={tool.action}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-[#52525B] hover:text-[#18181B] hover:bg-[#EBECEF]/80 transition-[transform,background-color,color] duration-150 text-start active:scale-[0.96]"
            >
              <Icon aria-hidden="true" className="w-4 h-4 stroke-[1.75] text-[#52525B]" />
              <span className="truncate">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Collapsible Pinned Workspaces */}
      <div className="flex-1 px-2.5 py-2 overflow-y-auto no-scrollbar">
        {!isCollapsed ? (
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setPinnedExpanded(!pinnedExpanded)}
              aria-expanded={pinnedExpanded}
              className="flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-semibold text-[#63636B] hover:text-[#18181B] transition-colors"
            >
              <span>Pinned</span>
              {pinnedExpanded ? (
                <ChevronDown aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              ) : (
                <ChevronRight aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {pinnedExpanded && (
                <motion.div
                  initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col gap-0.5 overflow-hidden"
                >
                  {pinnedList.length > 0 ? (
                    pinnedList.map((pin) => {
                      const isPinActive = location.pathname === `/workspaces/${pin.id}`;
                      const badgeStyle = CATEGORY_THEMES[pin.type]?.badgeClasses || 'bg-[#EFE6FF] text-[#3B0764]';
                      return (
                        <NavLink
                          key={pin.id}
                          to={`/workspaces/${pin.id}`}
                          title={pin.title}
                          aria-current={isPinActive ? 'page' : undefined}
                          className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-[transform,background-color,color] duration-150 active:scale-[0.96] ${
                            isPinActive
                              ? 'bg-white text-[#18181B] font-semibold shadow-border'
                              : 'text-[#52525B] font-medium hover:text-[#18181B] hover:bg-[#EBECEF]/80'
                          }`}
                        >
                          <div
                            aria-hidden="true"
                            className={`w-5 h-5 rounded-md ${badgeStyle} font-bold text-[10px] flex items-center justify-center flex-shrink-0`}
                          >
                            {pin.initial}
                          </div>
                          <span className="truncate">{pin.title}</span>
                        </NavLink>
                      );
                    })
                  ) : (
                    <NavLink
                      to="/discover"
                      className="px-3 py-2 text-[13px] text-[#52525B] hover:text-[#18181B] transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles aria-hidden="true" className="w-3.5 h-3.5" />
                      <span>Pin a workspace</span>
                    </NavLink>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="w-4 h-[1px] bg-neutral-300 my-1" />
            {pinnedList.slice(0, 4).map((pin) => {
              const isPinActive = location.pathname === `/workspaces/${pin.id}`;
              const badgeStyle = CATEGORY_THEMES[pin.type]?.badgeClasses || 'bg-[#EFE6FF] text-[#3B0764]';
              return (
                <NavLink
                  key={pin.id}
                  to={`/workspaces/${pin.id}`}
                  title={pin.title}
                  aria-label={pin.title}
                  aria-current={isPinActive ? 'page' : undefined}
                  className={`w-8 h-8 rounded-lg ${badgeStyle} hover:opacity-90 active:scale-[0.96] font-bold text-xs flex items-center justify-center transition-[transform,opacity] duration-150 ${
                    isPinActive ? 'ring-2 ring-[#18181B] ring-offset-1' : ''
                  }`}
                >
                  {pin.initial}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Footer Utility */}
      <div className="p-3 bg-[#F4F4F6] flex flex-col gap-2">
        {!isCollapsed ? (
          <div
            title={`Timezone: ${tzName} (${tzAbbr})`}
            className="px-3 py-2 rounded-xl bg-white/80 shadow-[0_0_0_1px_oklch(0_0_0/0.04)] text-[11px] text-[#52525B] flex items-center gap-2 min-w-0"
          >
            <Clock aria-hidden="true" className="w-3.5 h-3.5 text-[#63636B] flex-shrink-0" />
            <span className="font-mono font-semibold text-[#18181B] flex-shrink-0">{tzAbbr}</span>
            <span aria-hidden="true" className="text-[#63636B]">·</span>
            <span className="truncate text-[#52525B] font-mono">{tzName}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-[#52525B] hover:text-[#18181B] hover:bg-[#EBECEF] active:scale-[0.96] transition-[transform,background-color,color] duration-150"
            title="Expand sidebar"
            aria-label="Expand sidebar"
            aria-expanded={false}
          >
            <PanelLeftOpen aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
          </button>
        )}
      </div>
    </aside>
  );
};
