import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export function useMappings(refreshKey) {
  const api = useApi();
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/mappings');
      setMappings(data);
    } catch (err) {
      console.error('Failed to load mappings:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (mapping) => {
    const data = await api.post('/api/mappings', mapping);
    setMappings((prev) => [data, ...prev]);
    return data;
  };

  const update = async (id, updates) => {
    const data = await api.patch(`/api/mappings/${id}`, updates);
    setMappings((prev) => prev.map((m) => (m.id === id ? data : m)));
    return data;
  };

  const remove = async (id) => {
    await api.del(`/api/mappings/${id}`);
    setMappings((prev) => prev.filter((m) => m.id !== id));
  };

  return { mappings, loading, create, update, remove, refresh: load };
}
