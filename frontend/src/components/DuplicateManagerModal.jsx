import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  GitMerge,
  Trash2,
  CheckCircle,
  Copy,
  Users,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { api } from '../api';

export default function DuplicateManagerModal({ onRefresh }) {
  const [duplicates, setDuplicates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDuplicates();
      setDuplicates(res.duplicates || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolve = async (candidateId, action, targetCandidateId) => {
    try {
      await api.resolveDuplicate(candidateId, action, targetCandidateId);
      loadDuplicates();
      if (onRefresh) onRefresh();
    } catch (e) {
      alert('Error resolving duplicate: ' + e.message);
    }
  };

  return (
    <div className="space-y-5 font-body text-[#0F172A]">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Copy className="w-5 h-5 text-[#B45309]" />
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
              Duplicate Resume Detection & Resolution Center
            </h2>
          </div>
          <p className="text-xs text-[#475569] mt-0.5">
            HireSwift automatically detects duplicate submissions using exact emails, normalized phone numbers, and semantic profile matching.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-[#B45309] border border-amber-200 self-start sm:self-auto font-mono">
          {duplicates.length} Flagged Duplicates
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-[#64748B]">Loading duplicate records...</div>
      ) : duplicates.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center space-y-2 shadow-xs">
          <CheckCircle className="w-10 h-10 text-[#047857] mx-auto" />
          <h3 className="font-bold text-[#0F172A] text-sm">Zero Duplicates Detected</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            Your candidate database is clean and deduplicated. Any newly uploaded resumes that share emails, phone numbers, or academic history will appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {duplicates.map((dup, idx) => {
            const incoming = dup.duplicate_candidate;
            const original = dup.original_candidate;

            return (
              <div
                key={incoming.id}
                className="bg-white border border-amber-200 rounded-xl p-5 shadow-xs space-y-4 text-xs"
              >
                {/* Duplicate Reason Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-[#B45309] shrink-0" />
                    <span className="font-bold text-[#B45309]">Flagged Duplicate Case #{idx + 1}</span>
                  </div>
                  <div className="text-[11px] text-[#B45309] font-medium bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 font-mono">
                    {dup.reasons?.join(' • ') || 'Exact match on email / phone'}
                  </div>
                </div>

                {/* Side-by-Side Comparison of Original vs Incoming */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Profile */}
                  <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide">
                        Original Existing Record
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#047857] border border-emerald-200 text-[10px] font-bold">
                        Master Record
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0F172A]">{original?.name}</h4>
                    <div className="space-y-1 text-[#475569]">
                      <p><strong>Email:</strong> {original?.email}</p>
                      <p><strong>Phone:</strong> {original?.phone || 'N/A'}</p>
                      <p><strong>Experience:</strong> {original?.experience_years} Yrs</p>
                      <p><strong>Academics:</strong> CGPA: {original?.academics?.cgpa || 'N/A'} • 12th: {original?.academics?.twelfth_percentage || 'N/A'}%</p>
                      <p><strong>Stage:</strong> <span className="font-semibold text-[#1E3A8A]">{original?.stage}</span></p>
                    </div>
                  </div>

                  {/* Incoming Duplicate Profile */}
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-wide">
                        Incoming Duplicate Submission
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-[#B45309] text-[10px] font-bold">
                        Needs Resolution
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0F172A]">{incoming?.name}</h4>
                    <div className="space-y-1 text-[#475569]">
                      <p><strong>Email:</strong> {incoming?.email}</p>
                      <p><strong>Phone:</strong> {incoming?.phone || 'N/A'}</p>
                      <p><strong>Experience:</strong> {incoming?.experience_years} Yrs</p>
                      <p><strong>Academics:</strong> CGPA: {incoming?.academics?.cgpa || 'N/A'} • 12th: {incoming?.academics?.twelfth_percentage || 'N/A'}%</p>
                      <p><strong>File:</strong> <span className="font-mono text-[11px]">{incoming?.resume_file_path?.split('\\').pop() || 'resume.pdf'}</span></p>
                    </div>
                  </div>
                </div>

                {/* Resolution Action Toolbar */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => handleResolve(incoming.id, 'dismiss')}
                    className="px-3 py-1.5 rounded-md border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] font-medium transition-colors"
                  >
                    Keep Both (False Positive)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleResolve(incoming.id, 'merge', original?.id)}
                    className="px-4 py-1.5 rounded-md bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Merge with Original (1-Click)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
