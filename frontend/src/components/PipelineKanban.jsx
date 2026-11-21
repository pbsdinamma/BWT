import React, { useState } from 'react';
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
  Award,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListFilter,
  CheckCheck,
  TrendingUp,
  UserCheck,
  Zap,
  RotateCcw
} from 'lucide-react';

const STAGE_CONFIGS = [
  { id: 'Applied', title: 'Applied', dotColor: 'bg-slate-400', headerBg: 'border-slate-200 dark:border-slate-700' },
  { id: 'Shortlisted', title: 'Shortlisted', dotColor: 'bg-blue-600 dark:bg-blue-500', headerBg: 'border-blue-200 dark:border-blue-800' },
  { id: 'Interview', title: 'Interview', dotColor: 'bg-purple-600 dark:bg-purple-400', headerBg: 'border-purple-200 dark:border-purple-800' },
  { id: 'Offer', title: 'Offer / Closed', dotColor: 'bg-emerald-600 dark:bg-emerald-400', headerBg: 'border-emerald-200 dark:border-emerald-800' },
  { id: 'Rejected', title: 'Rejected', dotColor: 'bg-rose-600 dark:bg-rose-400', headerBg: 'border-rose-200 dark:border-rose-800' }
];

export default function PipelineKanban({
  candidates = [],
  selectedIds = [],
  onToggleSelect,
  onStageChange,
  onSelectCandidate,
  activeJob
}) {
  const [cardDensity, setCardDensity] = useState('detailed'); // 'detailed' | 'compact'
  const [collapsedStages, setCollapsedStages] = useState([]); // Array of collapsed stage IDs

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
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (score >= 65) return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  const toggleCollapse = (stageId) => {
    setCollapsedStages((prev) =>
      prev.includes(stageId) ? prev.filter((id) => id !== stageId) : [...prev, stageId]
    );
  };

  // Pipeline stage counts for horizontal funnel progression ribbon
  const appliedCount = candidates.filter((item) => item.candidate.stage === 'Applied').length;
  const shortlistedCount = candidates.filter((item) => item.candidate.stage === 'Shortlisted').length;
  const interviewCount = candidates.filter((item) => item.candidate.stage === 'Interview').length;
  const offerCount = candidates.filter((item) => item.candidate.stage === 'Offer').length;
  const rejectedCount = candidates.filter((item) => item.candidate.stage === 'Rejected').length;
  const totalInPipeline = candidates.length;

  // Bulk advance high scorers from Applied to Shortlisted (80%+)
  const highScoringApplied = candidates.filter(
    (item) => item.candidate.stage === 'Applied' && (item.match_score?.overall_score || 0) >= 80
  );

  const handleBulkShortlistTop = () => {
    if (highScoringApplied.length === 0) {
      alert('No candidates with AI Match Score >= 80% currently in Applied stage.');
      return;
    }
    if (confirm(`Move ${highScoringApplied.length} top-matching candidate(s) (>= 80% score) to Shortlisted?`)) {
      highScoringApplied.forEach((item) => {
        onStageChange(item.candidate.id, 'Shortlisted');
      });
    }
  };

  return (
    <div className="space-y-4 font-body transition-colors duration-150">
      {/* 1. Horizontal Pipeline Funnel & Control Bar */}
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Pipeline Funnel Progression Ribbon */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] flex items-center mr-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 mr-1" />
            <span>Hiring Funnel:</span>
          </span>

          {/* Funnel Step 1: Applied */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Applied</span>
            <strong className="font-mono text-slate-900 dark:text-white font-bold ml-1">{appliedCount}</strong>
          </div>

          <span className="text-slate-300 dark:text-slate-600">→</span>

          {/* Funnel Step 2: Shortlisted */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-blue-800 dark:text-blue-300 font-medium">Shortlisted</span>
            <strong className="font-mono text-blue-900 dark:text-blue-200 font-bold ml-1">{shortlistedCount}</strong>
          </div>

          <span className="text-slate-300 dark:text-slate-600">→</span>

          {/* Funnel Step 3: Interview */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span className="text-purple-800 dark:text-purple-300 font-medium">Interview</span>
            <strong className="font-mono text-purple-900 dark:text-purple-200 font-bold ml-1">{interviewCount}</strong>
          </div>

          <span className="text-slate-300 dark:text-slate-600">→</span>

          {/* Funnel Step 4: Offer */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-emerald-800 dark:text-emerald-300 font-medium">Offer</span>
            <strong className="font-mono text-emerald-900 dark:text-emerald-200 font-bold ml-1">{offerCount}</strong>
          </div>

          <span className="text-slate-300 dark:text-slate-600">|</span>

          {/* Funnel Step 5: Rejected */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span className="text-rose-800 dark:text-rose-300 font-medium">Rejected</span>
            <strong className="font-mono text-rose-900 dark:text-rose-200 font-bold ml-1">{rejectedCount}</strong>
          </div>
        </div>

        {/* Toolbar Controls: Card Density Toggle + Bulk AI Advance */}
        <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
          {highScoringApplied.length > 0 && (
            <button
              type="button"
              onClick={handleBulkShortlistTop}
              className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="Instantly advance all candidates with >= 80% score in Applied stage"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Shortlist Top ({highScoringApplied.length})</span>
            </button>
          )}

          {/* Density Switcher: Detailed Cards vs Compact Cards */}
          <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setCardDensity('detailed')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                cardDensity === 'detailed'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Detailed Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setCardDensity('compact')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center space-x-1 ${
                cardDensity === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Compact View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Unified Fixed-Height Aligned Kanban Columns */}
      <div className="flex gap-3.5 items-stretch overflow-x-auto pb-2">
        {STAGE_CONFIGS.map((stage) => {
          const isCollapsed = collapsedStages.includes(stage.id);
          const stageCandidates = candidates.filter((item) => item.candidate.stage === stage.id);
          const nextStage = getNextStage(stage.id);
          const prevStage = getPrevStage(stage.id);

          // Collapsed Column Strip
          if (isCollapsed) {
            return (
              <div
                key={stage.id}
                onClick={() => toggleCollapse(stage.id)}
                className="w-12 h-[680px] bg-slate-100/90 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 p-2 flex flex-col items-center justify-between cursor-pointer hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition-all shrink-0 shadow-2xs"
                title={`Click to expand ${stage.title}`}
              >
                <div className="flex flex-col items-center space-y-2 pt-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dotColor}`} />
                  <span className="px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-800 font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {stageCandidates.length}
                  </span>
                </div>
                <div
                  style={{ writingMode: 'vertical-lr' }}
                  className="transform rotate-180 font-headline font-semibold text-xs text-slate-600 dark:text-slate-400 tracking-wider uppercase"
                >
                  {stage.title}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 mb-1" />
              </div>
            );
          }

          // Full-Size Aligned Column
          return (
            <div
              key={stage.id}
              className="flex-1 min-w-[270px] max-w-[340px] h-[680px] flex flex-col bg-slate-100/70 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-2xs transition-all duration-150 shrink-0"
            >
              {/* Column Header (Fixed Height, Aligned across all boxes) */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${stage.dotColor}`} />
                  <h3 className="font-headline font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {stage.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Column Action: Collapse button */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(stage.id)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Collapse column"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sub-bar: Ranking info */}
              <div className="text-[11px] text-slate-500 dark:text-slate-400 py-1.5 flex items-center justify-between font-mono border-b border-slate-200/50 dark:border-slate-800/50 mb-2">
                <span>Ranked by AI Score</span>
                <span className="text-blue-600 dark:text-blue-400 text-[10px]">High → Low</span>
              </div>

              {/* Cards Container (Independent Vertical Scrollbar, Aligned!) */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {stageCandidates.length === 0 ? (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white/40 dark:bg-slate-900/40">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No candidates in {stage.title}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {stage.id === 'Applied' ? 'Upload resumes to start' : 'Advance from previous stage'}
                    </p>
                  </div>
                ) : (
                  stageCandidates.map((item) => {
                    const c = item.candidate;
                    const ms = item.match_score;
                    const score = ms ? Math.round(ms.overall_score) : 0;
                    const isSelected = selectedIds?.includes(c.id);

                    // ==========================================
                    // COMPACT CARD VIEW (High-Density Layout)
                    // ==========================================
                    if (cardDensity === 'compact') {
                      return (
                        <div
                          key={c.id}
                          className={`bg-white dark:bg-[#1E293B] border rounded-lg p-2.5 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/30'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <h4
                                onClick={() => onSelectCandidate(c.id)}
                                className="font-headline text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400"
                              >
                                {c.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {c.years_of_experience || 0}y exp • {c.education?.cgpa ? `${c.education.cgpa} CGPA` : 'Grad'}
                              </p>
                            </div>

                            {/* Match Score Badge */}
                            <span
                              className={`px-2 py-0.5 rounded-full border font-mono text-[10px] font-bold shrink-0 ${getScoreBadge(
                                score
                              )}`}
                            >
                              {score}%
                            </span>

                            {/* Quick Next Arrow */}
                            {nextStage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onStageChange(c.id, nextStage);
                                }}
                                className="p-1 rounded bg-blue-50 hover:bg-blue-600 dark:bg-blue-950/60 text-blue-600 hover:text-white dark:text-blue-400 dark:hover:text-white transition-colors cursor-pointer"
                                title={`Advance to ${nextStage}`}
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // ==========================================
                    // DETAILED CARD VIEW (Rich Information Layout)
                    // ==========================================
                    return (
                      <article
                        key={c.id}
                        className={`bg-white dark:bg-[#1E293B] border rounded-xl p-3 shadow-2xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/30'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {/* Top: Name + Score Badge */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <h4
                                onClick={() => onSelectCandidate(c.id)}
                                className="font-headline text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate"
                              >
                                {c.name}
                              </h4>
                              {onToggleSelect && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => onToggleSelect(c.id)}
                                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 w-3 h-3 cursor-pointer shrink-0"
                                  title="Select for comparison"
                                />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                              {c.years_of_experience || 0} yrs exp • {c.location?.split(',')[0] || 'Remote'}
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border font-mono text-[11px] font-bold shrink-0 ${getScoreBadge(
                              score
                            )}`}
                          >
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{score}%</span>
                          </span>
                        </div>

                        {/* Duplicate Alert Pill if detected */}
                        {c.is_duplicate && (
                          <div className="mb-2 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-700/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center space-x-1">
                            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">Duplicate Resume</span>
                          </div>
                        )}

                        {/* Qualification Metrics Grid */}
                        <div className="grid grid-cols-3 gap-1 py-1 px-2 bg-slate-50 dark:bg-slate-900/70 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400 mb-2 border border-slate-200/70 dark:border-slate-800">
                          <div>
                            <span className="text-[8px] uppercase text-slate-400 block font-sans">CGPA</span>
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {c.education?.cgpa ? `${c.education.cgpa}` : 'N/A'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase text-slate-400 block font-sans">12th</span>
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {c.education?.twelfth_percentage ? `${c.education.twelfth_percentage}%` : 'N/A'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase text-slate-400 block font-sans">10th</span>
                            <strong className="text-slate-900 dark:text-white font-bold">
                              {c.education?.tenth_percentage ? `${c.education.tenth_percentage}%` : 'N/A'}
                            </strong>
                          </div>
                        </div>

                        {/* Skills Chips */}
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {c.skills?.slice(0, 3).map((sk) => {
                            const isReq = activeJob?.required_skills?.some(
                              (rs) => rs.toLowerCase() === sk.toLowerCase()
                            );
                            return (
                              <span
                                key={sk}
                                className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${
                                  isReq
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {sk}
                              </span>
                            );
                          })}
                        </div>

                        {/* Card Bottom: Stage Move Controls */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                          {prevStage ? (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, prevStage)}
                              className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                              title={`Back to ${prevStage}`}
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, 'Rejected')}
                              className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                            >
                              Reject
                            </button>
                          )}

                          {nextStage ? (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, nextStage)}
                              className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                            >
                              <span>{nextStage === 'Shortlisted' ? 'Shortlist' : nextStage === 'Interview' ? 'Interview' : 'Offer'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ) : stage.id === 'Offer' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">Hired / Offered</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onStageChange(c.id, 'Applied')}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>Reopen</span>
                            </button>
                          )}
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
    </div>
  );
}
