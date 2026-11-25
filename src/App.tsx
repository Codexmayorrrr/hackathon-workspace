import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { DiscoverPage } from './pages/DiscoverPage';
import { SectionRailPage } from './pages/SectionRailPage';
import { OpportunityDetailPage } from './pages/OpportunityDetailPage';
import { SavedQueuePage } from './pages/SavedQueuePage';
import { WorkspacePage } from './pages/WorkspacePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { WinnersLeaderboardPage } from './pages/WinnersLeaderboardPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { OrganizerEventsPage } from './pages/OrganizerEventsPage';
import { OrganizerSubmissionsPage } from './pages/OrganizerSubmissionsPage';

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster
          theme="dark"
          position="top-right"
          visibleToasts={1}
          closeButton
          swipeDirections={['top', 'right', 'left']}
          mobileOffset={{
            top: 'calc(4.25rem + env(safe-area-inset-top, 0px))',
            left: '12px',
            right: '12px',
          }}
          toastOptions={{
            style: {
              fontFamily: 'inherit',
              background: '#18181B',
              border: 'none',
              boxShadow: 'none',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '14px 18px',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/discover" replace />} />
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="discover/:sectionType" element={<SectionRailPage />} />
            <Route path="opportunities/:slug" element={<OpportunityDetailPage />} />
            <Route path="saved" element={<SavedQueuePage />} />
            <Route path="workspaces/:workspaceId" element={<WorkspacePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="winners" element={<WinnersLeaderboardPage />} />
            <Route path="organizer" element={<OrganizerDashboardPage />} />
            <Route path="organizer/events" element={<OrganizerEventsPage />} />
            <Route path="organizer/submissions" element={<OrganizerSubmissionsPage />} />
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
