import { useState } from 'react';
import { Plus, Search, Link2 } from 'lucide-react';
import { useMappings } from '../hooks/useMappings';
import MappingCard from '../components/MappingCard';
import TagPill from '../components/TagPill';

export default function Dashboard({ refreshKey, onNewMapping, onViewLogs, onRefresh }) {
  const { mappings, loading, update, remove } = useMappings(refreshKey);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const allTags = [...new Set(mappings.flatMap((m) => m.tags || []))];

  const filtered = mappings.filter((m) => {
    const matchesSearch =
      !search ||
      m.project_name.toLowerCase().includes(search.toLowerCase()) ||
      m.slack_channel_name?.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || (m.tags || []).includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const handleToggle = async (id, status) => {
    await update(id, { status });
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this mapping?')) {
      await remove(id);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link2 size={28} className="text-teal" />
          <h1 className="text-2xl font-bold text-white">ChannelBridge</h1>
        </div>
        <button
          onClick={onNewMapping}
          className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-navy hover:bg-teal-dark"
        >
          <Plus size={16} />
          New Mapping
        </button>
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mappings..."
            className="w-full rounded-lg border border-navy-lighter bg-navy-light py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-600 focus:border-teal focus:outline-none"
          />
        </div>
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}>
            <TagPill tag={tag} />
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="mt-16 text-center text-slate-500">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="mt-20 text-center">
          <Link2 size={48} className="mx-auto text-slate-700" />
          <h2 className="mt-4 text-lg font-semibold text-slate-400">No mappings yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Create your first Slack-to-Box mapping to get started.
          </p>
          <button
            onClick={onNewMapping}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-navy hover:bg-teal-dark"
          >
            <Plus size={16} />
            New Mapping
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <MappingCard
              key={m.id}
              mapping={m}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onViewLogs={onViewLogs}
            />
          ))}
        </div>
      )}
    </div>
  );
}
