import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LifeBuoy, Plus, MessageSquare, Send, ChevronRight, User } from 'lucide-react';
import api from '../../api';

const Support = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await api.get('/support');
        setTickets(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/support', { subject: newTicketSubject, message: newTicketMessage });
      alert('Ticket created successfully!');
      setShowCreate(false);
      // Refresh
      const res = await api.get('/support');
      setTickets(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating ticket');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await api.post(`/support/${selectedTicket.id}/reply`, { message: replyMessage });
      setReplyMessage('');
      // Refresh ticket details
      const res = await api.get(`/support/${selectedTicket.id}`);
      setSelectedTicket(res.data);
      // Also refresh the tickets list in background
      const listRes = await api.get('/support');
      setTickets(listRes.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error replying');
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

  if (selectedTicket) {
    return (
      <div className="flex gap-8 h-[calc(100vh-10rem)] overflow-hidden">
        <div className="flex-1 flex flex-col space-y-6">
          <button onClick={() => setSelectedTicket(null)} className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
             ← Back to tickets
          </button>

          <div className="flex items-center justify-between">
             <h2 className="text-2xl font-black text-gray-900">{selectedTicket.subject}</h2>
             <Badge variant={selectedTicket.status === 'OPEN' ? 'primary' : 'success'}>{selectedTicket.status}</Badge>
          </div>

          <Card className="flex-1 overflow-y-auto space-y-6 p-8 shadow-inner bg-gray-50/50">
             {selectedTicket.messages?.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                   <div className={`max-w-[80%] p-5 rounded-3xl shadow-sm ${
                      msg.isAdmin
                        ? 'bg-white border border-gray-100 rounded-tl-none'
                        : 'bg-blue-600 text-white rounded-tr-none'
                   }`}>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                            {msg.isAdmin ? 'Support Agent' : 'You'}
                         </span>
                         <span className="text-[10px] opacity-40 font-bold">
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
                placeholder="Type your message here..."
                className="flex-1 h-14 bg-white"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
             />
             <Button type="submit" className="h-14 w-14 p-0 shadow-lg shadow-blue-100">
                <Send className="w-5 h-5" />
             </Button>
          </form>
        </div>

        <div className="w-80 space-y-6">
           <Card className="border-none shadow-md">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <LifeBuoy className="w-5 h-5 text-blue-600" /> Ticket info
              </h3>
              <div className="space-y-4">
                 <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <Badge variant="ghost">{selectedTicket.status}</Badge>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">ID</span>
                    <span className="font-bold text-gray-900 text-sm">#{selectedTicket.id}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Last Update</span>
                    <span className="font-bold text-gray-900 text-sm">{new Date(selectedTicket.updatedAt).toLocaleDateString()}</span>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900">Technical Support</h2>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <Plus className="w-4 h-4" /> Open New Ticket
        </Button>
      </div>

      {showCreate && (
        <Card className="border-2 border-blue-100 bg-blue-50/20 shadow-xl overflow-hidden p-0">
           <div className="bg-blue-600 p-6 flex items-center gap-4 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                 <h3 className="font-bold text-lg">Describe your problem</h3>
                 <p className="text-xs text-blue-100">Our technical team will reply within 24 hours.</p>
              </div>
           </div>
           <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
              <Input label="Subject" placeholder="Brief summary of the issue" value={newTicketSubject} onChange={(e) => setNewTicketSubject(e.target.value)} required />
              <div className="space-y-1">
                 <label className="block text-sm font-medium text-gray-700 ml-1">Your Message</label>
                 <textarea
                    className="w-full min-h-[150px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm placeholder:text-gray-400"
                    placeholder="Tell us what's happening..."
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                    required
                 />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                 <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                 <Button type="submit">Submit Ticket</Button>
              </div>
           </form>
        </Card>
      )}

      {tickets.length === 0 ? (
        <Card className="text-center py-20 border-2 border-dashed">
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No active tickets</h3>
          <p className="text-gray-400">If you have technical issues, our team is here to help.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card
               key={ticket.id}
               className="hover:shadow-lg transition-all duration-300 border-none group cursor-pointer p-0 overflow-hidden"
               onClick={() => handleViewTicket(ticket.id)}
            >
               <div className="flex items-center p-6 gap-6">
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                     <MessageSquare className={`w-6 h-6 ${selectedTicket?.id === ticket.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-white'}`} />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3 mb-1">
                        <Badge variant={ticket.status === 'OPEN' ? 'primary' : ticket.status === 'ANSWERED' ? 'success' : 'ghost'} className="text-[10px] uppercase font-black tracking-widest px-2">
                           {ticket.status}
                        </Badge>
                        <span className="text-[10px] font-bold text-gray-300">#{ticket.id}</span>
                     </div>
                     <h3 className="text-lg font-bold text-gray-900">{ticket.subject}</h3>
                     <p className="text-xs text-gray-400 font-medium">Last update: {new Date(ticket.updatedAt).toLocaleDateString()}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
               </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Support;
