import React from 'react';
import {
  Sparkles,
  MapPin,
  ArrowRight,
  ArrowLeft,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Calendar,
  Award
} from 'lucide-react';

const STAGE_CONFIGS = [
  { id: 'Applied', title: 'Applied', badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700', dotColor: 'bg-slate-400' },
  { id: 'Shortlisted', title: 'Shortlisted', badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800', dotColor: 'bg-blue-500' },
  { id: 'Interview', title: 'Interview', badgeColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', dotColor: 'bg-purple-500' },
  { id: 'Offer', title: 'Offer / Closed', badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', dotColor: 'bg-emerald-500' },
  { id: 'Rejected', title: 'Rejected', badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800', dotColor: 'bg-rose-500' }
];

export default function PipelineKanban({
  candidates = [],
  selectedIds = [],
  onToggleSelect,
  onStageChange,
  onSelectCandidate,
  activeJob
}) {
  const getNextStage = (curr) => {
    if (curr === 'Applied') return 'Shortlisted';
    if (curr === 'Shortlisted') return 'Interview';
    if (curr === 'Interview') return 'Offer';
    return null;
  };

  const getPrevStage = (curr) => {
    if (curr === 'Offer') return 'Interview';
    if (curr === 'Interview') return 'Shortlisted';
    if (curr === 'Shortlisted') return 'Applied';
    if (curr === 'Rejected') return 'Applied';
    return null;
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (score >= 65) return 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start font-body transition-colors duration-150">
      {STAGE_CONFIGS.map((stage) => {
        const stageCandidates = candidates.filter((item) => item.candidate.stage === stage.id);
        const nextStage = getNextStage(stage.id);
        const prevStage = getPrevStage(stage.id);

        return (
          <div
            key={stage.id}
            className="flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-3 min-h-[620px] shadow-2xs transition-colors duration-150"
          >
            {/* Column Header (Stitch MCP Style) */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#334155] px-1">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                <h2 className="font-headline font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                  {stage.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] font-mono text-[11px] font-semibold text-[#475569] dark:text-[#CBD5E1]">
                  {stageCandidates.length}
                </span>
              </div>
            </div>

            {/* Subheader info */}
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] py-2 px-1 flex items-center justify-between font-mono">
              <span>Sorted by AI Match</span>
              <span className="text-[#1E3A8A] dark:text-blue-400 font-semibold">{stageCandidates.length} profiles</span>
            </div>

            {/* Cards Column */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-1 pr-0.5">
              {stageCandidates.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#94A3B8] border border-dashed border-[#E2E8F0] dark:border-[#334155] rounded-xl">
                  No applicants in {stage.title}
                </div>
              ) : (
                stageCandidates.map((item) => {
                  const c = item.candidate;
                  const ms = item.match_score;
                  const score = ms ? Math.round(ms.overall_score) : 0;
                  const isSelected = selectedIds?.includes(c.id);

                  return (
                    <article
                      key={c.id}
                      className={`bg-white dark:bg-[#1E293B] border rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer group ${
                        isSelected
                          ? 'border-[#1E3A8A] dark:border-blue-500 ring-2 ring-[#1E3A8A]/30 dark:ring-blue-500/40'
                          : 'border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569]'
                      }`}
                    >
                      {/* Card Top: Name + Comparison Checkbox + AI Match Score Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3
                              onClick={() => onSelectCandidate(c.id)}
                              className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors"
                            >
                              {c.name}
                            </h3>
                            {onToggleSelect && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(c.id)}
                                className="rounded border-[#CBD5E1] dark:border-[#475569] text-[#1E3A8A] dark:text-blue-500 focus:ring-[#1E3A8A] w-3.5 h-3.5 cursor-pointer"
                                title="Select for side-by-side comparison"
                              />
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            {c.current_title || 'Software Engineer'} • {c.experience_years || 0} yrs exp
                          </p>
                        </div>

                        {/* Stitch AI Match Score Pill */}
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border font-mono text-xs font-bold shrink-0 ${getScoreBadge(
                            score
                          )}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{score}%</span>
                        </span>
                      </div>

                      {/* Duplicate Alert Pill if detected */}
                      {c.is_duplicate && (
                        <div className="mb-2 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 text-[#B45309] dark:text-amber-300 text-[10px] font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">Duplicate Resume Detected</span>
                        </div>
                      )}

                      {/* Qualification Metrics Grid (Stitch MCP Style) */}
                      <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-lg text-[11px] font-mono text-[#475569] dark:text-[#CBD5E1] mb-2.5 border border-[#E2E8F0] dark:border-[#334155]">
                        <div>
                          <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] block font-sans">CGPA</span>
                          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                            {c.academics?.cgpa ? `${c.academics.cgpa}` : 'N/A'}
                          </strong>
                          <span className="text-[10px] text-[#64748B]">/10</span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] block font-sans">12th %</span>
                          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                            {c.academics?.twelfth_percentage ? `${c.academics.twelfth_percentage}%` : 'N/A'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-[#64748B] dark:text-[#94A3B8] block font-sans">Grad</span>
                          <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                            {c.academics?.graduation_year || 2022}
                          </strong>
                        </div>
                      </div>

                      {/* Parsed Skills Chips + Skill Gap Highlighter */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.skills?.slice(0, 3).map((sk) => {
                          const isReq = activeJob?.required_skills?.some(
                            (rs) => rs.toLowerCase() === sk.toLowerCase()
                          );
                          return (
                            <span
                              key={sk}
                              className={`px-1.5 py-0.5 border rounded text-[10px] font-medium ${
                                isReq
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold'
                                  : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                        {/* Highlight Missing Skill Gap from JD if any */}
                        {ms?.breakdown?.skills?.missing?.[0] && (
                          <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 rounded text-[10px] font-semibold">
                            +{ms.breakdown.skills.missing[0]} (Gap)
                          </span>
                        )}
                      </div>

                      {/* Card Bottom Bar: Location + Stage Transition Action */}
                      <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-[#94A3B8]" />
                          <span className="truncate max-w-[90px]">{c.location?.split(',')[0] || 'Remote'}</span>
                        </span>

                        <div className="flex items-center space-x-1">
                          {prevStage && (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, prevStage)}
                              className="p-1 rounded bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                              title={`Back to ${prevStage}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {nextStage ? (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, nextStage)}
                              className="px-2.5 py-1 rounded-md bg-[#1E3A8A] dark:bg-blue-600 hover:bg-[#172554] dark:hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <span>{nextStage === 'Shortlisted' ? 'Shortlist' : nextStage === 'Interview' ? 'Interview' : 'Offer'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : stage.id === 'Offer' ? (
                            <span className="text-[#047857] dark:text-emerald-400 font-bold text-xs">Offer Extended</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectCandidate(c.id)}
                              className="text-xs text-[#1E3A8A] dark:text-blue-400 hover:underline"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
