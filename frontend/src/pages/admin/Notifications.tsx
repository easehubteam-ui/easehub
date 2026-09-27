import React, { useState } from 'react';

export const Notifications: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState<'all' | 'students' | 'vendors'>('students');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendChannel, setSendChannel] = useState<'push' | 'sms' | 'both'>('both');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      alert('Please provide both broadcast title and message body.');
      return;
    }

    setStatusMsg(`Broadcast successfully queued to ${targetAudience.toUpperCase()} recipients via ${sendChannel.toUpperCase()}!`);
    setTitle('');
    setMessage('');

    setTimeout(() => {
      setStatusMsg(null);
    }, 5000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1D6] shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#E5E1D6]">
          <div className="w-12 h-12 rounded-2xl bg-[#225944] text-[#EECA3A] flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">campaign</span>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#171A18]">Broadcast Notification Dispatcher</h2>
            <p className="text-xs text-[#6B6B63]">Send instant push alerts and SMS notifications to campus users</p>
          </div>
        </div>

        {statusMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Target Audience</label>
            <div className="grid grid-cols-3 gap-3">
              {(['all', 'students', 'vendors'] as const).map((aud) => (
                <button
                  type="button"
                  key={aud}
                  onClick={() => setTargetAudience(aud)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                    targetAudience === aud
                      ? 'bg-[#225944] text-white shadow-md'
                      : 'bg-slate-100 text-[#6B6B63] hover:bg-slate-200'
                  }`}
                >
                  {aud}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Notification Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Festival Holiday Mess Schedule Update"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-[#E5E1D6] text-xs font-medium text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Message Content</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message broadcast for students/vendors here..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-[#E5E1D6] text-xs font-medium text-[#171A18] focus:outline-none focus:ring-2 focus:ring-[#225944]"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171A18] mb-1">Delivery Channel</label>
            <select
              value={sendChannel}
              onChange={(e) => setSendChannel(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-[#E5E1D6] text-xs font-bold text-[#171A18] focus:outline-none cursor-pointer"
            >
              <option value="both">In-App Push + Mobile SMS Gateway</option>
              <option value="push">In-App Push Notification Only</option>
              <option value="sms">Mobile SMS Alert Only</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#225944] hover:bg-[#184232] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
            <span>Dispatch Broadcast Alert</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Notifications;
