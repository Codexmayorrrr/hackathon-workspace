import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  BookmarkCheck,
  Bell,
  Calendar,
  Trophy,
  FolderArchive,
  LayoutDashboard,
  CalendarDays,
  Inbox,
  Plus,
} from 'lucide-react';
import { TimezoneIndicator } from './TimezoneIndicator';
import { Sidebar } from './Sidebar';
import { CalendarSyncModal } from '../calendar/CalendarSyncModal';
import { ReusableVaultModal } from '../vault/ReusableVaultModal';
import { CreateOpportunityModal } from '../organizer/CreateOpportunityModal';
import { useAllOpportunities, useWorkspaceStore } from '../../store/useWorkspaceStore';
import { PlatformRole } from '../../types';

export const AppShell: React.FC = () => {
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [createEventModalOpen, setCreateEventModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const allOpportunities = useAllOpportunities();
  const activeRole = useWorkspaceStore((state) => state.activeRole);
  const setRole = useWorkspaceStore((state) => state.setRole);
  const savedWorkspaces = useWorkspaceStore((state) => state.savedWorkspaces);
  const organizerSubmissions = useWorkspaceStore((state) => state.organizerSubmissions);

  const activeSavedCount = Object.values(savedWorkspaces).filter(
    (w) => w.stage === 'saved' || w.stage === 'preparing'
  ).length;

  const pendingSubmissionsCount = organizerSubmissions.filter(
    (s) => s.status === 'pending'
  ).length;

  const handleMobileRoleSwitch = (nextRole: PlatformRole) => {
    setRole(nextRole);
    if (nextRole === 'organizer' && !location.pathname.startsWith('/organizer')) {
      navigate('/organizer');
    } else if (nextRole === 'developer' && location.pathname.startsWith('/organizer')) {
      navigate('/discover');
    }
  };

  useEffect(() => {
    const path = location.pathname;
    let pageTitle = 'HackWorkspace · Opportunity Discovery & Preparation';
    if (path === '/discover') {
      pageTitle = 'Discover Opportunities · HackWorkspace';
    } else if (path.startsWith('/discover/')) {
      pageTitle = 'Explore Category · HackWorkspace';
    } else if (path.startsWith('/opportunities/')) {
      const slug = path.replace('/opportunities/', '');
      const opp = allOpportunities.find((o) => o.slug === slug);
      pageTitle = opp ? `${opp.title} · HackWorkspace` : 'Opportunity Details · HackWorkspace';
    } else if (path === '/saved') {
      pageTitle = 'Saved Queue · HackWorkspace';
    } else if (path.startsWith('/workspaces/')) {
      const id = path.replace('/workspaces/', '');
      const opp = allOpportunities.find((o) => o.id === id);
      pageTitle = opp ? `${opp.title} · Workspace · HackWorkspace` : 'Workspace · HackWorkspace';
    } else if (path === '/notifications') {
      pageTitle = 'Reminders · HackWorkspace';
    } else if (path === '/winners') {
      pageTitle = 'Winners & Talent · HackWorkspace';
    } else if (path === '/organizer') {
      pageTitle = 'Organizer Studio · HackWorkspace';
    } else if (path === '/organizer/events') {
      pageTitle = 'Hosted Events & Banners · Organizer · HackWorkspace';
    } else if (path === '/organizer/submissions') {
      pageTitle = 'Submissions Inbox · Organizer · HackWorkspace';
    }
    document.title = pageTitle;
  }, [location.pathname, allOpportunities]);

  const mobileNavLinks =
    activeRole === 'organizer'
      ? [
          {
            label: 'Overview',
            path: '/organizer',
            icon: LayoutDashboard,
            exact: true,
          },
          {
            label: 'Events',
            path: '/organizer/events',
            icon: CalendarDays,
            exact: true,
          },
          {
            label: 'Inbox',
            path: '/organizer/submissions',
            icon: Inbox,
            badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
            exact: true,
          },
          {
            label: 'Feed',
            path: '/discover',
            icon: Compass,
            exact: true,
          },
        ]
      : [
          {
            label: 'Discover',
            path: '/discover',
            icon: Compass,
            exact: false,
          },
          {
            label: 'Saved',
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
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <div
        id="app-shell-root"
        className="min-h-[100dvh] bg-[#F3F3F6] text-[#18181B] flex flex-col md:flex-row antialiased"
      >
        {/* Desktop & Tablet Sidebar (>= 768px) */}
        <Sidebar
          onOpenVault={() => setVaultModalOpen(true)}
          onOpenCalendar={() => setCalendarModalOpen(true)}
          onOpenCreateEvent={() => setCreateEventModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[100dvh] bg-[#F3F3F6]">
          {/* Mobile Top Header (< 768px) - Reflows safely down to 320px and clears safe-area notch */}
          <header className="md:hidden flex items-center justify-between gap-1.5 min-h-[calc(3.5rem+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top)] ps-[max(0.625rem,env(safe-area-inset-left))] pe-[max(0.625rem,env(safe-area-inset-right))] bg-white/95 backdrop-blur-xl sticky top-0 z-30">
            <NavLink
              to={activeRole === 'organizer' ? '/organizer' : '/discover'}
              className="flex items-center gap-1.5 min-w-0 rounded-lg py-1 active:scale-[0.96] transition-transform duration-150"
            >
              <div
                aria-hidden="true"
                className="w-6 h-6 rounded-[4px] bg-[#DECAFF] flex items-center justify-center text-[#18181B] font-bold text-xs flex-shrink-0"
              >
                H
              </div>
              <span className="text-[13px] font-semibold tracking-tight text-[#18181B] truncate">
                HackWorkspace
              </span>
            </NavLink>

            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="hidden min-[420px]:block">
                <TimezoneIndicator compact />
              </div>

              {/* Dual-role Segmented Pill */}
              <div
                role="group"
                aria-label="Switch platform role"
                className="flex items-center bg-[#F4F4F6] p-0.5 rounded-xl gap-0.5"
              >
                <button
                  type="button"
                  onClick={() => handleMobileRoleSwitch('developer')}
                  aria-pressed={activeRole === 'developer'}
                  aria-label="Developer role"
                  className={`px-1.5 py-1 rounded-[10px] text-[11px] leading-none min-h-[30px] transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                    activeRole === 'developer'
                      ? 'bg-white text-[#18181B] font-semibold'
                      : 'text-[#52525B] font-medium'
                  }`}
                >
                  Dev
                </button>
                <button
                  type="button"
                  onClick={() => handleMobileRoleSwitch('organizer')}
                  aria-pressed={activeRole === 'organizer'}
                  aria-label="Organizer role"
                  className={`px-1.5 py-1 rounded-[10px] text-[11px] leading-none min-h-[30px] transition-[background-color,color,transform] duration-150 active:scale-[0.96] ${
                    activeRole === 'organizer'
                      ? 'bg-[#18181B] text-white font-semibold'
                      : 'text-[#52525B] font-medium'
                  }`}
                >
                  Org
                </button>
              </div>

              {activeRole === 'organizer' ? (
                <button
                  type="button"
                  onClick={() => setCreateEventModalOpen(true)}
                  aria-label="Publish new event"
                  className="relative w-9 h-9 rounded-xl btn-tactile-primary flex items-center justify-center before:content-[''] before:absolute before:-inset-1"
                >
                  <Plus aria-hidden="true" className="w-4 h-4 stroke-[2.2]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setVaultModalOpen(true)}
                  aria-label="Open Reusable Vault"
                  className="relative w-9 h-9 rounded-xl btn-tactile-secondary text-[#18181B] flex items-center justify-center before:content-[''] before:absolute before:-inset-1"
                >
                  <FolderArchive aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setCalendarModalOpen(true)}
                aria-label="Open Calendar Sync"
                className="relative w-9 h-9 rounded-xl btn-tactile-secondary text-[#18181B] flex items-center justify-center before:content-[''] before:absolute before:-inset-1"
              >
                <Calendar aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>
          </header>

          {/* Primary Page Canvas */}
          <main
            id="main"
            tabIndex={-1}
            className="flex-1 w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-12 focus-visible:outline-none"
          >
            <Outlet />
          </main>
        </div>

        {/* Mobile Fixed Bottom Nav (< 768px) - 4 even flex slots fit cleanly at 320px */}
        <nav
          aria-label="Primary mobile navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl ps-[max(0.375rem,env(safe-area-inset-left))] pe-[max(0.375rem,env(safe-area-inset-right))] pt-1.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-1"
        >
          {mobileNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
                className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-1 rounded-xl transition-[transform,background-color,color] duration-150 relative active:scale-[0.96] ${
                  isActive
                    ? 'text-[#18181B] font-semibold bg-[#F4F4F6]'
                    : 'text-[#52525B] hover:text-[#18181B]'
                }`}
              >
                <div className="relative">
                  <Icon
                    aria-hidden="true"
                    className={`w-[18px] h-[18px] ${
                      isActive ? 'text-[#18181B] stroke-[2.1]' : 'text-[#52525B] stroke-[1.75]'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -end-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#18181B] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-tight tracking-tight truncate max-w-full">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <CalendarSyncModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
      />

      <ReusableVaultModal
        isOpen={vaultModalOpen}
        onClose={() => setVaultModalOpen(false)}
      />

      <CreateOpportunityModal
        isOpen={createEventModalOpen}
        onClose={() => setCreateEventModalOpen(false)}
      />
    </>
  );
};
