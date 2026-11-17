import React from 'react';
import {
  Briefcase,
  Users,
  Kanban,
  FileText,
  Copy,
  Mail,
  UploadCloud,
  Columns,
  RotateCcw,
  Sparkles,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  jobs = [],
  activeJobId,
  setActiveJobId,
  selectedCount = 0,
  onOpenCompare,
  onOpenUpload,
  duplicateCount = 0,
  totalCandidateCount = 0,
  onResetDemo,
  isResetting,
  onOpenCreateJob
}) {
  const activeJob = jobs.find((j) => j.job.id === activeJobId)?.job || jobs[0]?.job;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Nav */}
          <div className="flex items-center space-x-6">
            {/* Stitch-style Brand Logo */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('candidates')}>
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white font-headline font-bold text-base shadow-sm ring-1 ring-blue-500/40">
                H
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="font-headline font-extrabold text-lg tracking-tight text-white">
                  HireSwift
                </span>
                <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ATS
                </span>
              </div>
            </div>

            {/* Main Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
              <button
                onClick={() => setActiveTab('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'kanban'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Kanban className="w-4 h-4 text-blue-400" />
                <span>Pipeline &amp; Stages</span>
              </button>

              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'candidates'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Candidate Pool</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">
                  {totalCandidateCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('jobs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'jobs'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>AI Job Openings</span>
              </button>

              <button
                onClick={() => setActiveTab('duplicates')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeTab === 'duplicates'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Duplicates</span>
                {duplicateCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {duplicateCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('email')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Bulk Email</span>
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2.5">
            {/* Compare Button */}
            <button
              onClick={onOpenCompare}
              disabled={selectedCount < 2}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCount >= 2
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
              title={selectedCount < 2 ? 'Select at least 2 candidates to compare' : 'Open Side-by-Side Comparison Matrix'}
            >
              <Columns className="w-3.5 h-3.5 text-indigo-300" />
              <span>Compare ({selectedCount})</span>
            </button>

            {/* Bulk Upload Button */}
            <button
              onClick={onOpenUpload}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-750 text-slate-100 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-blue-400" />
              <span>Bulk Upload</span>
            </button>

            {/* Create Job Button */}
            <button
              onClick={onOpenCreateJob}
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Job</span>
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Reset Demo Data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            {/* Recruiter Avatar */}
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-headline font-semibold text-xs text-slate-300 ml-1 relative">
              HR
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-slate-900" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-800/80 scrollbar-none">
          {['kanban', 'candidates', 'jobs', 'duplicates', 'email'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize shrink-0 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              {tab === 'duplicates' && duplicateCount > 0 ? `Duplicates (${duplicateCount})` : tab}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
