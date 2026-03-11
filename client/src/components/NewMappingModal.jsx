import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronDown, Folder, Check } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import TagPill from './TagPill';

const STEPS = ['Project Info', 'Slack Channel', 'Box Folder', 'Confirm'];

export default function NewMappingModal({ onClose, onCreated }) {
  const api = useApi();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    project_name: '',
    tags: [],
    tagInput: '',
    slack_channel_id: '',
    slack_channel_name: '',
    box_folder_id: '',
    box_folder_name: '',
  });
  const [channels, setChannels] = useState([]);
  const [channelsError, setChannelsError] = useState(false);
  const [channelSearch, setChannelSearch] = useState('');
  const [folders, setFolders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [children, setChildren] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load Slack channels on step 1
  useEffect(() => {
    if (step === 1 && channels.length === 0 && !channelsError) {
      api.get('/slack/channels')
        .then((data) => {
          if (Array.isArray(data)) setChannels(data);
          else setChannelsError(true);
        })
        .catch(() => setChannelsError(true));
    }
  }, [step]);

  // Load root Box folders on step 2
  useEffect(() => {
    if (step === 2 && folders.length === 0) {
      api.get('/api/box/folders').then(setFolders).catch(console.error);
    }
  }, [step]);

  const addTag = () => {
    const tag = form.tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag], tagInput: '' });
    }
  };

  const toggleFolder = async (folder) => {
    if (expanded[folder.id]) {
      setExpanded((prev) => ({ ...prev, [folder.id]: false }));
    } else {
      if (!children[folder.id]) {
        const data = await api.get(`/api/box/folders?parent=${folder.id}`);
        setChildren((prev) => ({ ...prev, [folder.id]: data }));
      }
      setExpanded((prev) => ({ ...prev, [folder.id]: true }));
    }
  };

  const selectFolder = (folder) => {
    setForm({ ...form, box_folder_id: folder.id, box_folder_name: folder.name });
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.post('/api/mappings', {
        project_name: form.project_name,
        tags: form.tags,
        slack_channel_id: form.slack_channel_id,
        slack_channel_name: form.slack_channel_name,
        box_folder_id: form.box_folder_id,
        box_folder_name: form.box_folder_name,
      });
      onCreated();
    } catch (err) {
      console.error('Create mapping failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const canNext =
    (step === 0 && form.project_name.trim()) ||
    (step === 1 && form.slack_channel_id?.trim()) ||
    (step === 2 && form.box_folder_id) ||
    step === 3;

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  const renderFolderTree = (items, depth = 0) =>
    items.map((f) => (
      <div key={f.id}>
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-navy-lighter ${
            form.box_folder_id === f.id ? 'bg-teal/10 text-teal' : 'text-slate-300'
          }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          <button onClick={() => toggleFolder(f)} className="shrink-0">
            {expanded[f.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <Folder size={14} className="shrink-0 text-slate-500" />
          <span className="font-mono text-xs truncate" onClick={() => selectFolder(f)}>
            {f.name}
          </span>
          {form.box_folder_id === f.id && <Check size={14} className="ml-auto text-teal" />}
        </div>
        {expanded[f.id] && children[f.id] && renderFolderTree(children[f.id], depth + 1)}
      </div>
    ));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-navy-lighter bg-navy-light p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Mapping</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Stepper */}
        <div className="mt-4 flex gap-2">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 rounded-full py-1 text-center text-xs font-medium ${
                i === step
                  ? 'bg-teal text-navy'
                  : i < step
                    ? 'bg-teal/20 text-teal'
                    : 'bg-navy-lighter text-slate-500'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="mt-6 min-h-[240px]">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Project Name
                </label>
                <input
                  value={form.project_name}
                  onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                  placeholder="e.g. Marketing Q1 Assets"
                  className="w-full rounded-lg border border-navy-lighter bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-teal focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Tags</label>
                <div className="flex gap-2">
                  <input
                    value={form.tagInput}
                    onChange={(e) => setForm({ ...form, tagInput: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag and press Enter"
                    className="flex-1 rounded-lg border border-navy-lighter bg-navy px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-teal focus:outline-none"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.tags.map((t) => (
                    <TagPill
                      key={t}
                      tag={t}
                      removable
                      onRemove={(tag) =>
                        setForm({ ...form, tags: form.tags.filter((x) => x !== tag) })
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-slate-500">#</span>
                <input
                  value={channelSearch}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^#/, '');
                    setChannelSearch(val);
                    // When API unavailable, allow manual entry
                    if (channelsError) {
                      setForm({ ...form, slack_channel_id: val, slack_channel_name: val });
                    }
                  }}
                  placeholder="search or type channel name..."
                  className="w-full rounded-lg border border-navy-lighter bg-navy py-2 pl-7 pr-3 font-mono text-sm text-white placeholder:text-slate-600 focus:border-teal focus:outline-none"
                />
              </div>
              {channelsError ? (
                <div className="space-y-2">
                  {channelSearch.trim() && (
                    <div className="flex items-center gap-2 rounded-lg bg-teal/10 px-3 py-2 text-sm text-teal">
                      <Check size={14} />
                      <span className="font-mono text-xs">#{channelSearch.trim()}</span>
                      <span className="ml-auto text-xs text-slate-400">manual entry</span>
                    </div>
                  )}
                  <p className="text-center text-xs text-slate-500">
                    Could not load channels from Slack. Type the channel name manually above.
                  </p>
                </div>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filteredChannels.map((c) => (
                    <button
                      key={c.id}
                      onClick={() =>
                        setForm({ ...form, slack_channel_id: c.id, slack_channel_name: c.name })
                      }
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                        form.slack_channel_id === c.id
                          ? 'bg-teal/10 text-teal'
                          : 'text-slate-300 hover:bg-navy-lighter'
                      }`}
                    >
                      <span className="font-mono text-xs">#{c.name}</span>
                      {form.slack_channel_id === c.id && <Check size={14} className="ml-auto" />}
                    </button>
                  ))}
                  {filteredChannels.length === 0 && (
                    <p className="py-4 text-center text-sm text-slate-500">No channels found</p>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {folders.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">Loading folders...</p>
              ) : (
                renderFolderTree(folders)
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-400">Confirm your mapping</h3>
              <div className="space-y-3 rounded-lg border border-navy-lighter bg-navy p-4">
                <Row label="Project" value={form.project_name} />
                <Row label="Tags" value={form.tags.join(', ') || 'None'} />
                <Row label="Slack Channel" value={`#${form.slack_channel_name}`} mono />
                <Row label="Box Folder" value={form.box_folder_name} mono />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            {step > 0 ? 'Back' : 'Cancel'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
              className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-navy disabled:opacity-40"
            >
              {submitting ? 'Creating...' : 'Create Mapping'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`text-white ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  );
}
