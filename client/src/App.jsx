import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import NewMappingModal from './components/NewMappingModal';
import LogsDrawer from './components/LogsDrawer';

export default function App() {
  const [showModal, setShowModal] = useState(false);
  const [logsMapping, setLogsMapping] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="min-h-screen">
      <Dashboard
        refreshKey={refreshKey}
        onNewMapping={() => setShowModal(true)}
        onViewLogs={setLogsMapping}
        onRefresh={refresh}
      />
      {showModal && (
        <NewMappingModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            refresh();
          }}
        />
      )}
      {logsMapping && (
        <LogsDrawer
          mapping={logsMapping}
          onClose={() => setLogsMapping(null)}
        />
      )}
    </div>
  );
}
