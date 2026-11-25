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

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Toaster
          theme="light"
          position="top-right"
          richColors
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
              background: '#FFFFFF',
              border: 'none',
              boxShadow: '0 10px 28px -6px oklch(0 0 0 / 0.12)',
              color: '#18181B',
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
            <Route path="*" element={<Navigate to="/discover" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  );
}

export default App;
