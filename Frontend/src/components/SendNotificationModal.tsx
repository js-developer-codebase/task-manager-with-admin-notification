import React, { useState } from 'react';
import { api } from '../services/api.js';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SendNotificationModal = ({ isOpen, onClose }: SendNotificationModalProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.sendNotification(title.trim(), message.trim());
      setSuccess('Notification queued successfully!');
      setTimeout(() => {
        setSuccess('');
        setTitle('');
        setMessage('');
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">📢 Broadcast Notification</h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-slate-600 text-lg"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4">
          As an Admin, this notification will be queued via BullMQ, saved to MongoDB, and broadcasted in real time via Socket.io to all online users.
        </p>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notification Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Scheduled System Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message Content *
            </label>
            <textarea
              placeholder="Write message for all users..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cursor-pointer rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Queuing...' : 'Send Broadcast'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { SendNotificationModal };
export default SendNotificationModal;
