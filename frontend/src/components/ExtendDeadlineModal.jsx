import React, { useState } from 'react';
import { Calendar, Clock, X, Check, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function ExtendDeadlineModal({
  job,
  isOpen,
  onClose,
  onSuccess
}) {
  if (!isOpen || !job) return null;

  const currentDeadline = job.application_deadline || new Date().toISOString().split('T')[0];
  const [newDeadline, setNewDeadline] = useState(currentDeadline);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePreset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setNewDeadline(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newDeadline) {
      setError('Please select a valid deadline date');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.extendJobDeadline(job.id, newDeadline);
      onSuccess(job.id, newDeadline);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to extend deadline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-body animate-in fade-in">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-headline font-bold text-lg text-slate-900 dark:text-white">
              Extend Application Deadline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {job.title}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select New Closing Date
            </label>
            <input
              type="date"
              required
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Extension Presets
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                +7 Days (1 Week)
              </button>
              <button
                type="button"
                onClick={() => handlePreset(14)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                +14 Days (2 Weeks)
              </button>
              <button
                type="button"
                onClick={() => handlePreset(30)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/60 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                +30 Days (1 Month)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Updating...' : 'Save Extended Deadline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
