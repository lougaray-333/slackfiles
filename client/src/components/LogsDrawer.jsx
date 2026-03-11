import { useState, useEffect } from 'react';
import { X, Hash, Folder } from 'lucide-react';
import { useApi } from '../hooks/useApi';

export default function LogsDrawer({ mapping, onClose }) {
  const api = useApi();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/mappings/${mapping.id}/logs`)
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [mapping.id]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex h-full w-full max-w-md flex-col border-l border-navy-lighter bg-navy-light">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-lighter p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">{mapping.project_name}</h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Hash size={12} /> <span className="font-mono">{mapping.slack_channel_name}</span>
              </span>
              <span className="flex items-center gap-1">
                <Folder size={12} /> <span className="font-mono">{mapping.box_folder_name}</span>
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Loading logs...</p>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500">No sync logs yet</p>
              <p className="mt-1 text-xs text-slate-600">
                Logs will appear here when files are synced
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-lighter text-left text-xs text-slate-500">
                  <th className="pb-2 font-medium">File</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-navy-lighter/50">
                    <td className="py-2.5 pr-3 font-mono text-xs text-slate-300 truncate max-w-[180px]">
                      {log.file_name}
                    </td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          log.status === 'success'
                            ? 'bg-green-500/15 text-green-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-xs text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
