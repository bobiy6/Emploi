import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Terminal, Search, Filter, ChevronLeft, ChevronRight, User, HardDrive, AlertCircle } from 'lucide-react';
import api from '../../api';

const LogViewer = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    type: '',
    level: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        ...(filters.type && { type: filters.type }),
        ...(filters.level && { level: filters.level }),
        ...(filters.search && { search: filters.search })
      });
      const res = await api.get(`/users/logs?${params}`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.type, filters.level]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchLogs();
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'WARN': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'INFO': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            Search
          </button>
        </form>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            className="flex-1 md:w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
          >
            <option value="">All Types</option>
            <option value="AUTH">Auth</option>
            <option value="PROVISIONING">Provisioning</option>
            <option value="BILLING">Billing</option>
            <option value="SERVICE">Service</option>
            <option value="API">API</option>
          </select>
          <select
            className="flex-1 md:w-40 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none"
            value={filters.level}
            onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
          >
            <option value="">All Levels</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Message</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">User/Service</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading logs...</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[10px] font-bold text-indigo-600">
                    {log.type}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">{log.message}</p>
                    {log.details && (
                      <pre className="mt-2 text-[9px] bg-gray-900 text-gray-300 p-2 rounded-lg max-h-32 overflow-y-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {log.user && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <User className="w-3 h-3" /> {log.user.name}
                        </div>
                      )}
                      {log.service && (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-500">
                          <HardDrive className="w-3 h-3" /> Service #{log.service.id} ({log.service.module})
                        </div>
                      )}
                      {!log.user && !log.service && <span className="text-[10px] text-gray-300">System</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No logs found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={filters.page === pagination.totalPages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LogViewer;
