import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  GitMerge,
  Trash2,
  CheckCircle,
  Copy,
  Users,
  Sparkles,
  ArrowRight
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
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Copy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Duplicate Resume Detection Center</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            HireSwift automatically detects duplicate applicants based on normalized emails, matching phone numbers, LinkedIn profiles, and content heuristics.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
          {duplicates.length} Pending Duplicates
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading duplicate records...</div>
      ) : duplicates.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-slate-200 text-sm">Zero Duplicates Detected</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
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
                className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-xl space-y-4 text-xs"
              >
                {/* Duplicate Reason Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-300">Flagged Duplicate Case #{idx + 1}</span>
                  </div>
                  <div className="text-[11px] text-amber-200/90 font-medium bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-800/60">
                    {dup.reasons?.join(' • ')}
                  </div>
                </div>

                {/* Side-by-Side Comparison of Original vs Incoming */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Profile */}
                  <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                        Existing Database Profile
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                        Original
                      </span>
                    </div>

                    {original ? (
                      <>
                        <h4 className="font-bold text-slate-100 text-sm">{original.name}</h4>
                        <div className="space-y-1 text-slate-400 text-[11px]">
                          <div>Email: <span className="text-slate-200">{original.email}</span></div>
                          <div>Phone: <span className="text-slate-200">{original.phone || 'N/A'}</span></div>
                          <div>Experience: <span className="text-slate-200">{original.years_of_experience} yrs</span></div>
                          <div>College: <span className="text-slate-200">{original.education.college}</span></div>
                          <div>Stage: <span className="text-indigo-400 font-semibold">{original.stage}</span></div>
                        </div>
                        <div className="pt-2">
                          <span className="text-[10px] text-slate-400 block mb-1">Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {original.skills?.slice(0, 5).map((sk) => (
                              <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500 italic">Original profile details unavailable.</p>
                    )}
                  </div>

                  {/* Incoming Duplicate Profile */}
                  <div className="bg-amber-950/20 p-3.5 rounded-xl border border-amber-900/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                        Incoming Candidate File
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300">
                        New Upload
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm">{incoming.name}</h4>
                    <div className="space-y-1 text-slate-400 text-[11px]">
                      <div>Email: <span className="text-slate-200">{incoming.email}</span></div>
                      <div>Phone: <span className="text-slate-200">{incoming.phone || 'N/A'}</span></div>
                      <div>Experience: <span className="text-slate-200">{incoming.years_of_experience} yrs</span></div>
                      <div>College: <span className="text-slate-200">{incoming.education.college}</span></div>
                      <div>File: <span className="text-slate-200">{incoming.file_name}</span></div>
                    </div>
                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 block mb-1">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {incoming.skills?.slice(0, 5).map((sk) => (
                          <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution Action CTAs */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => handleResolve(incoming.id, 'delete')}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Discard New File</span>
                  </button>

                  <button
                    onClick={() => handleResolve(incoming.id, 'keep_both')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 transition-all cursor-pointer"
                  >
                    Keep Both Separate
                  </button>

                  {original && (
                    <button
                      onClick={() => handleResolve(incoming.id, 'merge', original.id)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>Merge Skills & Update Profile</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
