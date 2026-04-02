import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MessageSquare, User, Clock, ChevronRight, Send } from 'lucide-react';
import api from '../../api';

const AdminTicketManagement = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/all');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewTicket = async (ticketId: number) => {
    try {
      const res = await api.get(`/support/${ticketId}`);
      setSelectedTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await api.post(`/support/${selectedTicket.id}/reply`, { message: replyMessage });
      setReplyMessage('');
      handleViewTicket(selectedTicket.id);
      fetchTickets();
    } catch (err) {
      alert('Error replying');
    }
  };

  if (selectedTicket) {
    return (
      <div className="flex flex-col h-[calc(100vh-10rem)]">
        <button onClick={() => setSelectedTicket(null)} className="mb-4 text-sm font-bold text-rose-600 hover:underline flex items-center gap-1">
           ← Back to all tickets
        </button>

        <div className="flex gap-8 flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col space-y-6">
            <Card className="flex-1 overflow-y-auto space-y-6 p-8 shadow-inner bg-gray-50/50">
   {selectedTicket.messages?.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm ${
                        msg.isAdmin
                          ? 'bg-rose-600 text-white rounded-tr-none shadow-lg shadow-rose-100'
                          : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'
                     }`}>
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] font-black uppercase tracking-widest ${msg.isAdmin ? 'text-rose-100' : 'text-gray-400'}`}>
                              {msg.isAdmin ? (msg.user?.name || 'Support Agent') : (msg.user?.name || 'Customer')}
                           </span>
                           <span className={`text-[10px] font-bold ${msg.isAdmin ? 'text-rose-200' : 'text-gray-300'}`}>
                              {new Date(msg.createdAt).toLocaleString()}
                           </span>
                        </div>
                        <p className="text-sm leading-relaxed">{msg.message}</p>
                     </div>
                  </div>
               ))}
            </Card>

            <form onSubmit={handleReply} className="flex gap-4">
               <Input
                  placeholder="Type your reply to the customer..."
                  className="flex-1 h-14 bg-white"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
               />
               <Button type="submit" className="h-14 w-14 p-0 shadow-lg shadow-rose-100 bg-rose-600 hover:bg-rose-700">
                  <Send className="w-5 h-5 text-white" />
               </Button>
            </form>
          </div>

          <div className="w-80 space-y-6">
             <Card>
                <h3 className="text-lg font-bold mb-4">Customer Details</h3>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">{selectedTicket.user?.name?.charAt(0)}</div>
                   <div>
                      <p className="font-bold text-sm text-gray-900">{selectedTicket.user?.name}</p>
                      <p className="text-xs text-gray-400">{selectedTicket.user?.email}</p>
                   </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <div className="flex justify-between">
                      <span className="text-gray-400 text-xs font-bold uppercase">Status</span>
                      <Badge variant={selectedTicket.status === 'OPEN' ? 'danger' : 'success'}>{selectedTicket.status}</Badge>
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
      <h2 className="text-3xl font-black text-gray-900">Support Queue</h2>
      <div className="grid grid-cols-1 gap-4">
        {tickets.map(ticket => (
          <Card key={ticket.id} className="hover:shadow-lg transition-all cursor-pointer p-6" onClick={() => handleViewTicket(ticket.id)}>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                   <div className={`p-4 rounded-2xl ${ticket.status === 'OPEN' ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                      <MessageSquare className="w-6 h-6" />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <Badge variant={ticket.status === 'OPEN' ? 'danger' : 'success'}>{ticket.status}</Badge>
                         <span className="text-xs font-bold text-gray-300">#{ticket.id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{ticket.subject}</h3>
                      <p className="text-xs text-gray-400 font-bold flex items-center gap-2 mt-1">
                         <User className="w-3 h-3" /> {ticket.user?.name}
                         <span className="opacity-20">•</span>
                         <Clock className="w-3 h-3" /> {new Date(ticket.updatedAt).toLocaleString()}
                      </p>
                   </div>
                </div>
                <ChevronRight className="text-gray-200" />
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminTicketManagement;
