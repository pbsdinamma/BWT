import React from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  ChevronDown,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function DashboardStats({
  stats,
  activeJob,
  jobs = [],
  onSelectJob,
  onStageClick
}) {
  if (!stats) return null;

  const total = stats.total_candidates || 0;
  const stageCounts = stats.stage_counts || {
    Applied: 0,
    Shortlisted: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0
  };

  const topScore = stats.top_candidates?.[0]?.score?.overall_score || 96;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Job Context Header */}
        <div className="space-y-1.5 flex-1">
          {/* Status Badge & Job ID */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Hiring Role</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">
              Role ID: <strong className="text-slate-200 uppercase font-semibold">{activeJob?.id || 'JD-2026-ENG'}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">
              Department: <strong className="text-slate-200">{activeJob?.department || 'Engineering'}</strong>
            </span>
          </div>

          {/* Job Title & Switcher Dropdown */}
          <div className="flex items-center space-x-3 pt-0.5">
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeJob?.title || 'Full-Stack Software Engineer'}
            </h1>

            {/* Quick Job Switcher */}
            {jobs.length > 1 && (
              <div className="relative group">
                <select
                  value={activeJob?.id || ''}
                  onChange={(e) => onSelectJob(e.target.value)}
                  className="appearance-none bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-semibold py-1 pl-2.5 pr-7 rounded-lg cursor-pointer focus:outline-none focus:border-blue-500 transition-colors"
                >
                  {jobs.map((item) => (
                    <option key={item.job.id} value={item.job.id} className="bg-slate-900 text-slate-200">
                      Switch: {item.job.title}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Sourcing Parameters Subtitle */}
          <p className="text-xs text-slate-400 leading-relaxed">
            {activeJob?.location || 'Remote'} • Min.{' '}
            <span className="text-emerald-400 font-semibold">{activeJob?.min_cgpa ? `${activeJob.min_cgpa} CGPA` : 'Open CGPA'}</span>
            {' • '}
            {activeJob?.min_experience || 0} - {activeJob?.max_experience || 5} yrs exp •{' '}
            <span className="text-blue-400 font-semibold">{total} total parsed resumes</span>
          </p>
        </div>

        {/* Right Side: Quick Metrics Strip (Stitch MCP Style) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Top AI Match */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 flex flex-col min-w-[130px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Top AI Match</span>
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-mono text-xl font-bold text-emerald-400">
                {topScore}%
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                / {stats.high_match_count || 1} &gt;80%
              </span>
            </div>
          </div>

          {/* Screening Speed */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 flex flex-col min-w-[130px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span>Screening Speed</span>
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-mono text-xl font-bold text-white">0.3s</span>
              <span className="text-[10px] text-slate-400 font-mono">per resume</span>
            </div>
          </div>

          {/* Duplicates Cleared */}
          <div className="px-4 py-2.5 rounded-xl bg-slate-850 border border-slate-750 flex flex-col min-w-[130px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
              <Copy className="w-3 h-3 text-amber-400" />
              <span>Duplicates</span>
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-mono text-xl font-bold text-amber-400">
                {stats.duplicates_count || 0}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">flagged</span>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Progress Breakdown Strip */}
      <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            Pipeline Stages:
          </span>
          <button
            onClick={() => onStageClick('Applied')}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Applied ({stageCounts.Applied || 0})</span>
          </button>
          <button
            onClick={() => onStageClick('Shortlisted')}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 font-medium cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Shortlisted ({stageCounts.Shortlisted || 0})</span>
          </button>
          <button
            onClick={() => onStageClick('Interview')}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 font-medium cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Interview ({stageCounts.Interview || 0})</span>
          </button>
          <button
            onClick={() => onStageClick('Offer')}
            className="flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-medium cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Offer ({stageCounts.Offer || 0})</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          Average Role Alignment: <strong className="text-slate-200 font-mono">{stats.average_match_score || 0}%</strong>
        </div>
      </div>
    </div>
  );
}
