import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LifeBuoy, Plus, MessageSquare, Send, ChevronRight, User, ArrowLeft, Clock } from 'lucide-react';
import api from '../../api';

const Support = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [reply, setReply] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support');
      setTickets(res.data);
    } catch (err) {
      console.error('Fetch tickets error:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;
    setLoading(true);
    try {
      await api.post('/support', newTicket);
      setNewTicket({ subject: '', message: '' });
      setShowCreate(false);
      fetchTickets();
    } catch (err) {
      alert('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (ticketId: number) => {
    try {
      const res = await api.get(`/support/${ticketId}`);
      setSelectedTicket(res.data);
    } catch (err) {
      console.error('Fetch ticket details error:', err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setLoading(true);
    try {
      await api.post(`/support/${selectedTicket.id}/reply`, { message: reply });
      setReply('');
      handleView(selectedTicket.id);
      fetchTickets(); // Refresh list in bg
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setLoading(false);
    }
  };

  if (selectedTicket) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)] space-y-6">
        <div className="flex items-center justify-between">
           <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Tickets
           </button>
           <Badge variant={selectedTicket.status === 'OPEN' ? 'primary' : 'success'}>
              {selectedTicket.status}
           </Badge>
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
          <div className="flex-1 flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
               <h2 className="text-xl font-black text-gray-900">{selectedTicket.subject}</h2>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Ticket ID: #{selectedTicket.id}</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
               {selectedTicket.messages?.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                     <div className={`max-w-[75%] p-5 rounded-3xl shadow-sm ${
                        msg.isAdmin
                          ? 'bg-white border border-gray-100 rounded-tl-none'
                          : 'bg-blue-600 text-white rounded-tr-none shadow-blue-100 shadow-lg'
                     }`}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isAdmin ? 'text-blue-600' : 'text-blue-100'}`}>
                              {msg.isAdmin ? (msg.user?.name || 'Support Agent') : 'You'}
                           </span>
                           <span className={`text-[10px] font-bold opacity-40 ${msg.isAdmin ? 'text-gray-400' : 'text-blue-200'}`}>
                              {new Date(msg.createdAt).toLocaleString()}
                           </span>
                        </div>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                     </div>
                  </div>
               ))}
            </div>

            {/* Input */}
            <form onSubmit={handleReply} className="p-6 border-t border-gray-50 bg-white flex gap-4">
               <Input
                  placeholder="Type your message here..."
                  className="flex-1 h-14 bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={loading}
               />
               <Button type="submit" disabled={loading} className="h-14 w-14 p-0 rounded-2xl shadow-lg shadow-blue-100">
                  <Send className="w-5 h-5" />
               </Button>
            </form>
          </div>

          <div className="w-80 hidden lg:block space-y-6">
             <Card>
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-blue-600" /> Ticket History
                </h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Created</span>
                      <span className="font-bold">{new Date(selectedTicket.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Update</span>
                      <span className="font-bold">{new Date(selectedTicket.updatedAt).toLocaleDateString()}</span>
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-gray-900">Support Center</h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Need help? Our technical team is here for you.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2 px-6">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      {showCreate && (
        <Card className="border-none shadow-2xl overflow-hidden p-0">
           <div className="bg-blue-600 p-8 text-white">
              <h3 className="text-xl font-bold">Open a new ticket</h3>
              <p className="text-sm text-blue-100 mt-1 opacity-80">Detailed information helps us resolve your issue faster.</p>
           </div>
           <form onSubmit={handleCreate} className="p-8 space-y-6 bg-white">
              <Input
                label="Subject"
                placeholder="Briefly describe the problem"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                required
              />
              <div className="space-y-2">
                 <label className="block text-sm font-bold text-gray-700">Detailed Message</label>
                 <textarea
                    className="w-full min-h-[150px] p-4 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-blue-600 transition-all outline-none text-sm placeholder:text-gray-400"
                    placeholder="Provide logs, screenshots (if applicable), or error messages..."
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    required
                 />
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-50">
                 <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                 <Button type="submit" disabled={loading} isLoading={loading}>Submit Ticket</Button>
              </div>
           </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <Card className="text-center py-20 border-2 border-dashed flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">No Support Tickets</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">You haven't opened any support tickets yet. If you have any technical issues, click the button above.</p>
          </Card>
        ) : (
          tickets.map((ticket) => (
            <Card
               key={ticket.id}
               className="hover:shadow-xl transition-all duration-300 border-none group cursor-pointer p-0 overflow-hidden"
               onClick={() => handleView(ticket.id)}
            >
               <div className="flex items-center p-6 gap-6">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                     <MessageSquare className="w-6 h-6 text-gray-400 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <Badge variant={ticket.status === 'OPEN' ? 'primary' : 'success'} className="px-2">
                           {ticket.status}
                        </Badge>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{ticket.id}</span>
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                     <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                           <Clock className="w-3 h-3" /> Last update: {new Date(ticket.updatedAt).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                     <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Support;
