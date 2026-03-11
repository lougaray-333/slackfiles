import { Hash, Folder, Pause, Play, Trash2, FileText } from 'lucide-react';
import TagPill from './TagPill';

export default function MappingCard({ mapping, onToggle, onDelete, onViewLogs }) {
  const isActive = mapping.status === 'active';

  return (
    <div className="rounded-xl border border-navy-lighter bg-navy-light p-5 transition hover:border-teal/30">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{mapping.project_name}</h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {(mapping.tags || []).map((t) => (
              <TagPill key={t} tag={t} />
            ))}
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isActive ? 'bg-teal/15 text-teal' : 'bg-yellow-500/15 text-yellow-400'
          }`}
        >
          {isActive ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <Hash size={14} className="text-slate-500" />
          <span className="font-mono">{mapping.slack_channel_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Folder size={14} className="text-slate-500" />
          <span className="font-mono">{mapping.box_folder_name}</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-navy-lighter pt-3">
        <button
          onClick={() => onToggle(mapping.id, isActive ? 'paused' : 'active')}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-navy-lighter hover:text-white"
        >
          {isActive ? <Pause size={13} /> : <Play size={13} />}
          {isActive ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => onViewLogs(mapping)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-navy-lighter hover:text-white"
        >
          <FileText size={13} />
          Logs
        </button>
        <button
          onClick={() => onDelete(mapping.id)}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}
