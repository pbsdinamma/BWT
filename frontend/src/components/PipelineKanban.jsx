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
  { id: 'Applied', title: 'Applied', badgeColor: 'bg-slate-500/10 text-slate-300 border-slate-700', dotColor: 'bg-slate-400' },
  { id: 'Shortlisted', title: 'Shortlisted', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dotColor: 'bg-blue-500' },
  { id: 'Interview', title: 'Interview', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30', dotColor: 'bg-purple-500' },
  { id: 'Offer', title: 'Offer / Closed', badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dotColor: 'bg-emerald-500' },
  { id: 'Rejected', title: 'Rejected', badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30', dotColor: 'bg-rose-500' }
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
    if (score >= 80) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 65) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
      {STAGE_CONFIGS.map((stage) => {
        const stageCandidates = candidates.filter((item) => item.candidate.stage === stage.id);
        const nextStage = getNextStage(stage.id);
        const prevStage = getPrevStage(stage.id);

        return (
          <div
            key={stage.id}
            className="flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 p-3 min-h-[620px] shadow-lg"
          >
            {/* Column Header (Stitch MCP Style) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 px-1">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                <h2 className="font-headline font-bold text-sm text-white">
                  {stage.title}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-850 border border-slate-750 font-mono text-[11px] font-semibold text-slate-300">
                  {stageCandidates.length}
                </span>
              </div>
            </div>

            {/* Subheader info */}
            <div className="text-[11px] text-slate-400 py-2 px-1 flex items-center justify-between font-mono">
              <span>Sorted by AI Match</span>
              <span className="text-blue-400 font-semibold">{stageCandidates.length} profiles</span>
            </div>

            {/* Cards Column */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-1 pr-0.5">
              {stageCandidates.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  No applicants in {stage.title}
                </div>
              ) : (
                stageCandidates.map((item) => {
                  const c = item.candidate;
                  const ms = item.match_score;
                  const score = ms ? ms.overall_score : 0;
                  const isSelected = selectedIds?.includes(c.id);

                  return (
                    <article
                      key={c.id}
                      className={`bg-slate-850 border rounded-xl p-3.5 shadow-sm hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer group ${
                        isSelected ? 'border-indigo-500 bg-slate-800/90 ring-1 ring-indigo-500/50' : 'border-slate-750'
                      }`}
                    >
                      {/* Card Top: Name + Comparison Checkbox + AI Match Score Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <h3
                              onClick={() => onSelectCandidate(c.id)}
                              className="font-headline text-sm font-bold text-white group-hover:text-blue-400 transition-colors"
                            >
                              {c.name}
                            </h3>
                            {onToggleSelect && (
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(c.id)}
                                className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                title="Select for side-by-side comparison"
                              />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {c.experience_history?.[0]?.role || 'Engineer'} • {c.years_of_experience} yrs exp
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
                        <div className="mb-2 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">Duplicate Resume Detected</span>
                        </div>
                      )}

                      {/* Qualification Metrics Grid (Stitch MCP Style) */}
                      <div className="grid grid-cols-3 gap-1 py-1.5 px-2 bg-slate-900/80 rounded-lg text-[11px] font-mono text-slate-300 mb-2.5 border border-slate-800">
                        <div>
                          <span className="text-[9px] uppercase text-slate-400 block font-sans">CGPA</span>
                          <strong className="text-white font-bold">{c.education.cgpa || 'N/A'}</strong>/10
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-400 block font-sans">12th %</span>
                          <strong className="text-white font-bold">
                            {c.education.twelfth_percentage ? `${c.education.twelfth_percentage}%` : 'N/A'}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase text-slate-400 block font-sans">Grad</span>
                          <strong className="text-white font-bold">{c.education.graduation_year || 2022}</strong>
                        </div>
                      </div>

                      {/* Parsed Skills Chips + Skill Gap Highlighter */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {c.skills.slice(0, 3).map((sk) => {
                          const isReq = activeJob?.required_skills?.some(
                            (rs) => rs.toLowerCase() === sk.toLowerCase()
                          );
                          return (
                            <span
                              key={sk}
                              className={`px-1.5 py-0.5 border rounded text-[10px] font-medium ${
                                isReq
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-semibold'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                        {/* Highlight Missing Skill Gap from JD if any */}
                        {ms?.missing_required_skills?.[0] && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded text-[10px] font-semibold">
                            +{ms.missing_required_skills[0]} (Gap)
                          </span>
                        )}
                      </div>

                      {/* Card Bottom Bar: Location + Stage Transition Action */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[90px]">{c.location?.split(',')[0] || 'Remote'}</span>
                        </span>

                        <div className="flex items-center space-x-1">
                          {prevStage && (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, prevStage)}
                              className="p-1 rounded bg-slate-850 hover:bg-slate-750 text-slate-400 hover:text-white"
                              title={`Back to ${prevStage}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {nextStage ? (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, nextStage)}
                              className="px-2.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center space-x-1 shadow-sm transition-colors cursor-pointer"
                            >
                              <span>{nextStage === 'Shortlisted' ? 'Shortlist' : nextStage === 'Interview' ? 'Interview' : 'Offer'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : stage.id === 'Offer' ? (
                            <span className="text-emerald-400 font-bold text-xs">Offer Extended</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onSelectCandidate(c.id)}
                              className="text-xs text-blue-400 hover:underline"
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
