import React from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  ChevronDown,
  ChevronsUpDown
} from 'lucide-react';

export default function DashboardStats({
  stats,
  activeJob,
  jobs = [],
  onSelectJob
}) {
  if (!stats) return null;

  const total = stats.total_candidates || 0;
  const topScore = stats.top_candidates?.[0]?.score?.overall_score || 96;
  const highMatchCount = stats.high_match_count || 3;
  const duplicatesCount = stats.duplicates_count || 0;

  return (
    <div className="bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] px-4 sm:px-6 py-4 transition-colors duration-150">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side: Job Context Header */}
        <div>
          {/* Active Hiring Badge & Job ID */}
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 text-[11px] font-medium flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] dark:bg-emerald-400 animate-pulse" />
              <span>Active Hiring</span>
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-xs">•</span>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Job ID: <strong className="font-mono font-medium text-[#0F172A] dark:text-[#F8FAFC]">{activeJob?.id || 'JD-2026-ENG4'}</strong>
            </span>
          </div>

          {/* Job Title & Switcher */}
          <div className="flex items-center space-x-2">
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {activeJob?.title || 'Full-Stack Software Engineer (React / Node / Cloud)'}
            </h1>

            {/* Job Switcher Dropdown */}
            {jobs.length > 1 && (
              <div className="relative group">
                <select
                  value={activeJob?.id || ''}
                  onChange={(e) => onSelectJob(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                  title="Switch Target Job Opening"
                >
                  {jobs.map((item) => (
                    <option key={item.job.id} value={item.job.id}>
                      {item.job.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#334155] cursor-pointer"
                  title="Switch Target Job Opening"
                >
                  <ChevronsUpDown className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Sourcing Parameters Subtitle */}
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            {activeJob?.department || 'Engineering & Product'} • {activeJob?.location || 'Remote (India)'} • Min.{' '}
            {activeJob?.min_cgpa ? `${activeJob.min_cgpa} CGPA` : '7.5 CGPA'} •{' '}
            {activeJob?.min_experience || 2} - {activeJob?.max_experience || 5} yrs exp •{' '}
            {total} total parsed resumes
          </p>
        </div>

        {/* Right Side: Quick Metrics Strip (Stitch MCP Style) */}
        <div className="flex items-center space-x-3">
          {/* Metric 1: Top AI Match */}
          <div className="px-3.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider">
              Top AI Match
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-mono text-xl font-bold text-[#047857] dark:text-emerald-400">
                {topScore}%
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                / {highMatchCount} candidates &gt;80%
              </span>
            </div>
          </div>

          {/* Metric 2: Screening Speed */}
          <div className="px-3.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider">
              Screening Speed
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-mono text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                0.3s
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                per resume parsed
              </span>
            </div>
          </div>

          {/* Metric 3: Duplicates Cleared */}
          <div className="px-3.5 py-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] flex flex-col">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider">
              Duplicates Flagged
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="font-mono text-xl font-bold text-[#B45309] dark:text-amber-400">
                {duplicatesCount}
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                auto-flagged
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
