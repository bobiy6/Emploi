import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Send, Zap, Cpu, HardDrive } from 'lucide-react';
import api from '../api';
import { cn } from '../utils/cn';

interface ConsoleProps {
  serviceId: number;
}

export const Console: React.FC<ConsoleProps> = ({ serviceId }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('offline');
  const [stats, setStats] = useState<any>({ cpu: 0, memory: 0, disk: 0 });
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWebsocket();
    return () => ws.current?.close();
  }, [serviceId]);

  const fetchWebsocket = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/services/${serviceId}/websocket`);
      const { socket, token } = res.data;
      connect(socket, token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to console');
    } finally {
      setLoading(false);
    }
  };

  const connect = (url: string, token: string) => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ event: 'auth', args: [token] }));
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      switch (data.event) {
        case 'status':
          setStatus(data.args[0]);
          break;
        case 'console output':
          setLines(prev => [...prev.slice(-100), data.args[0]]);
          break;
        case 'stats':
          const s = JSON.parse(data.args[0]);
          setStats({
            cpu: s.cpu_absolute.toFixed(1),
            memory: (s.memory_bytes / 1024 / 1024).toFixed(1),
            disk: (s.disk_bytes / 1024 / 1024).toFixed(1)
          });
          break;
        case 'token expiring':
        case 'token expired':
          fetchWebsocket(); // Refresh auth
          break;
      }
    };

    ws.current.onerror = () => setError('Websocket connection error');
    ws.current.onclose = () => setStatus('offline');
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const sendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim() || !ws.current) return;
    ws.current.send(JSON.stringify({ event: 'send command', args: [command] }));
    setCommand('');
  };

  if (loading) return <div className="h-64 flex items-center justify-center bg-black rounded-2xl animate-pulse text-gray-500 font-mono">Connecting to console...</div>;
  if (error) return <div className="h-64 flex flex-col items-center justify-center bg-black rounded-2xl text-rose-500 font-mono p-4 text-center">
    <p>{error}</p>
    <button onClick={fetchWebsocket} className="mt-4 text-xs text-blue-500 underline uppercase font-bold">Retry</button>
  </div>;

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
         <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Cpu className="w-4 h-4" /></div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase">CPU</p>
               <p className="text-sm font-black">{stats.cpu}%</p>
            </div>
         </div>
         <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Zap className="w-4 h-4" /></div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase">RAM</p>
               <p className="text-sm font-black">{stats.memory} MB</p>
            </div>
         </div>
         <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><HardDrive className="w-4 h-4" /></div>
            <div>
               <p className="text-[10px] font-black text-gray-400 uppercase">Disk</p>
               <p className="text-sm font-black">{stats.disk} MB</p>
            </div>
         </div>
      </div>

      {/* Terminal */}
      <div className="relative group">
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className={cn("w-2 h-2 rounded-full", status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500')} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
        </div>

        <div
          ref={terminalRef}
          className="bg-[#0f172a] rounded-2xl p-6 h-[400px] font-mono text-sm overflow-y-auto scrollbar-thin scrollbar-thumb-white/10"
        >
          {lines.length === 0 && <p className="text-gray-500 italic">Waiting for console output...</p>}
          {lines.map((line, i) => (
            <div key={i} className="mb-1 text-gray-300 break-all whitespace-pre-wrap leading-relaxed">
               <span className="text-emerald-500/50 mr-2">❯</span>
               {line}
            </div>
          ))}
        </div>

        <form onSubmit={sendCommand} className="absolute bottom-4 left-4 right-4 flex gap-2">
          <div className="relative flex-1">
             <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
             <input
                type="text"
                placeholder="Tapez une commande..."
                className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={command}
                onChange={e => setCommand(e.target.value)}
             />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
