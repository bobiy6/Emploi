import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MessageSquare, User, Clock, ChevronRight, Send, ArrowLeft, MoreVertical, X, CheckCircle } from 'lucide-react';
import api from '../../api';

const AdminTicketManagement = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/all');
      setTickets(res.data);
    } catch (err) {
      console.error('Fetch all tickets error:', err);
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
      fetchTickets();
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
           <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-2 text-sm font-bold text-rose-600 hover:text-rose-700 transition-all">
              <ArrowLeft className="w-4 h-4" /> Back to Queue
           </button>
           <div className="flex items-center gap-4">
              <Badge variant={selectedTicket.status === 'OPEN' ? 'danger' : 'success'}>
                 {selectedTicket.status}
              </Badge>
              <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                 <MoreVertical className="w-4 h-4" />
              </button>
           </div>
        </div>

        <div className="flex-1 flex gap-8 overflow-hidden">
          <div className="flex-1 flex flex-col h-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedTicket.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: #{selectedTicket.id}</p>
                     <span className="text-gray-200 text-[10px]">•</span>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested by: {selectedTicket.user?.name}</p>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/50">
               {selectedTicket.messages?.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[75%] p-5 rounded-3xl shadow-sm ${
                        msg.isAdmin
                          ? 'bg-rose-600 text-white rounded-tr-none shadow-rose-100 shadow-lg'
                          : 'bg-white border border-gray-100 rounded-tl-none'
                     }`}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isAdmin ? 'text-rose-100' : 'text-rose-600'}`}>
                              {msg.isAdmin ? (msg.user?.name || 'Support Agent') : (msg.user?.name || 'Customer')}
                           </span>
                           <span className={`text-[10px] font-bold opacity-40 ${msg.isAdmin ? 'text-rose-200' : 'text-gray-400'}`}>
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
                  placeholder="Type your reply to the customer..."
                  className="flex-1 h-14 bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-rose-600 transition-all"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  disabled={loading}
               />
               <Button type="submit" disabled={loading} className="h-14 w-14 p-0 rounded-2xl shadow-lg shadow-rose-100 bg-rose-600 hover:bg-rose-700">
                  <Send className="w-5 h-5 text-white" />
               </Button>
            </form>
          </div>

          <div className="w-80 hidden lg:block space-y-6">
             <Card>
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                   <User className="w-4 h-4 text-rose-600" /> Customer Info
                </h3>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-rose-50 border-2 border-white shadow-sm flex items-center justify-center font-bold text-rose-600">
                      {selectedTicket.user?.name?.charAt(0)}
                   </div>
                   <div>
                      <p className="text-sm font-bold text-gray-900">{selectedTicket.user?.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedTicket.user?.email}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-400">Account Type</span>
                      <span className={selectedTicket.user?.role === 'ADMIN' ? 'text-rose-600' : 'text-gray-900'}>{selectedTicket.user?.role}</span>
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
          <h2 className="text-3xl font-black text-gray-900">Support Queue</h2>
          <p className="text-gray-400 font-bold text-sm mt-1">Pending requests and ticket management.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" className="gap-2">
              <CheckCircle className="w-4 h-4" /> Filter Solved
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tickets.length === 0 ? (
          <Card className="text-center py-20 border-2 border-dashed flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-1">Queue is empty</h3>
            <p className="text-gray-400 text-sm">No pending support tickets at the moment. Great job!</p>
          </Card>
        ) : (
          tickets.map(ticket => (
            <Card key={ticket.id} className="hover:shadow-xl transition-all cursor-pointer p-0 overflow-hidden group" onClick={() => handleView(ticket.id)}>
               <div className="flex items-center p-6 gap-6">
                  <div className={`p-4 rounded-2xl transition-colors duration-300 ${ticket.status === 'OPEN' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-600 group-hover:text-white'}`}>
                     <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <Badge variant={ticket.status === 'OPEN' ? 'danger' : 'success'}>{ticket.status}</Badge>
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{ticket.id}</span>
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 group-hover:text-rose-600 transition-colors">{ticket.subject}</h3>
                     <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                           <User className="w-3 h-3" /> {ticket.user?.name}
                        </p>
                        <span className="text-gray-200 text-[10px]">•</span>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-widest">
                           <Clock className="w-3 h-3" /> {new Date(ticket.updatedAt).toLocaleString()}
                        </p>
                     </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-rose-50 group-hover:text-rose-600 transition-all">
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

export default AdminTicketManagement;
