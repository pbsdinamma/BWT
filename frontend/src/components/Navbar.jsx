import React from 'react';
import {
  Briefcase,
  Users,
  Copy,
  Mail,
  UploadCloud,
  Plus,
  ArrowLeft,
  RotateCcw,
  LogOut,
  Building2,
  Kanban,
  Table,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Navbar({
  company,
  currentView, // 'dashboard' | 'job_workspace' | 'duplicates' | 'email'
  setCurrentView,
  activeJob,
  onBackToJobs,
  jobViewTab, // 'shortlist' | 'kanban' | 'upload'
  setJobViewTab,
  duplicateCount = 0,
  selectedCount = 0,
  onOpenCompare,
  onOpenUpload,
  onOpenCreateJob,
  onResetDemo,
  isResetting,
  onLogout,
  onOpenGlobalEmail
}) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs font-body transition-colors duration-150">
      {/* Left: Brand or Breadcrumb */}
      <div className="flex items-center space-x-4">
        {currentView === 'job_workspace' && activeJob ? (
          /* Breadcrumb navigation when inside a Job Workspace */
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onBackToJobs}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Jobs</span>
            </button>
            <span className="text-slate-400">/</span>
            <div className="flex items-center space-x-2">
              <span className="font-headline font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs">
                {activeJob.title}
              </span>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {activeJob.status || 'Active'}
              </span>
            </div>
          </div>
        ) : (
          /* Standard Company Branding */
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-headline font-bold text-base shadow-xs">
              H
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-headline font-bold text-base tracking-tight text-slate-900 dark:text-white">
                  HireSwift
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ATS
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center">
                <Building2 className="w-3 h-3 mr-1 text-slate-400" />
                <span>{company?.company_name || 'Company Portal'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Breadcrumb end */}
      </div>

      {/* Center Navigation Links (When on Dashboard / Global Mode) */}
      {currentView !== 'job_workspace' && (
        <nav className="hidden lg:flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Job Openings</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentView('duplicates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              currentView === 'duplicates'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Copy className="w-3.5 h-3.5 text-amber-500" />
            <span>Duplicate Hub</span>
            {duplicateCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold">
                {duplicateCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenGlobalEmail ? onOpenGlobalEmail : () => setCurrentView('email')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
              currentView === 'email'
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Global Cross-Job Outreach & Campaigns"
          >
            <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Email Campaigns</span>
          </button>
        </nav>
      )}

      {/* Right: Actions, Utilities & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Upload Resumes Button */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <UploadCloud className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="hidden sm:inline">Upload Resumes</span>
        </button>

        {/* Demo Data Refresh Button - Only visible for Acme Demo workspace */}
        {(company?.id === 'comp-acme-corp' || company?.work_email?.toLowerCase() === 'hr@acme.com') && (
          <button
            type="button"
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reload Demo Candidates & Jobs"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        )}

        {/* Recruiter Profile / Logout */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {(company?.recruiter_name?.[0] || company?.company_name?.[0] || 'C').toUpperCase()}
          </div>
          <div className="hidden xl:block text-left text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[110px]">
              {company?.recruiter_name || 'Recruiter'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
              {company?.work_email || 'hr@company.com'}
            </span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Log Out of Company Workspace"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
