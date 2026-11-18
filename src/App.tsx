import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
    <BrowserRouter>
      <Toaster 
        theme="light" 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            background: '#FDFDFD',
            border: 'none',
            boxShadow: 'none',
            color: '#18181b',
            borderRadius: '16px',
            padding: '14px 18px',
          }
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
  );
}

export default App;
