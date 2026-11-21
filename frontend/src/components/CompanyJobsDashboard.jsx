import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  GraduationCap,
  SlidersHorizontal,
  UploadCloud,
  Edit3,
  AlertCircle
} from 'lucide-react';
import ExtendDeadlineModal from './ExtendDeadlineModal';

export default function CompanyJobsDashboard({
  jobs = [],
  company,
  onSelectJob,
  onOpenCreateJob,
  onOpenEditJob,
  onOpenUploadForJob,
  onUpdateJobStatus,
  onExtendDeadline
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'closed'
  const [extendingJob, setExtendingJob] = useState(null);

  // Filter jobs
  const filteredJobs = jobs.filter((item) => {
    const job = item.job;
    const matchesSearch =
      (job.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isClosed = job.status?.toLowerCase() === 'closed';
    if (statusFilter === 'active') return matchesSearch && !isClosed;
    if (statusFilter === 'closed') return matchesSearch && isClosed;
    return matchesSearch;
  });

  const activeJobsCount = jobs.filter((j) => j.job.status?.toLowerCase() !== 'closed').length;
  const closedJobsCount = jobs.filter((j) => j.job.status?.toLowerCase() === 'closed').length;
  const totalCandidatesAcrossAll = jobs.reduce((acc, j) => acc + (j.applicant_count || 0), 0);

  return (
    <div className="space-y-5 font-body transition-colors duration-150 animate-in fade-in">
      {/* 1. Header Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Building2 className="w-4 h-4" />
            <span>{company?.company_name || 'Company Portal'} • Recruiter Command Center</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Company Job Openings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your open positions, track applicants, extend closing deadlines, or post a new role.
          </p>
        </div>

        {/* Header Right: Compact Total Applicants Badge + Post New Job Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Total Applicants:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs sm:text-sm bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
              {totalCandidatesAcrossAll}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenCreateJob}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job Opening</span>
          </button>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search job title, department, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Roles ({jobs.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Active ({activeJobsCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('closed')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              statusFilter === 'closed'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Closed ({closedJobsCount})
          </button>
        </div>
      </div>

      {/* 4. Job Listings Grid */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-headline font-bold text-lg text-slate-800 dark:text-slate-200">
              No Job Openings Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'No job listings match your search query. Try clearing filters.'
                : 'Get started by listing your first company job opening.'}
            </p>
            <button
              type="button"
              onClick={onOpenCreateJob}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs"
            >
              + Post New Job
            </button>
          </div>
        ) : (
          filteredJobs.map((item) => {
            const job = item.job;
            const isClosed = job.status?.toLowerCase() === 'closed';
            const applicantCount = item.applicant_count || 0;
            const shortlistedCount = item.stages?.Shortlisted || 0;
            const interviewCount = item.stages?.Interview || 0;
            const deadline = job.application_deadline || '2026-12-31';

            return (
              <div
                key={job.id}
                className={`bg-white dark:bg-[#1E293B] border rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all ${
                  isClosed
                    ? 'border-slate-200 dark:border-slate-800 opacity-80'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Job Info */}
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isClosed
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                        />
                        <span>{isClosed ? 'Applications Closed' : 'Active Hiring'}</span>
                      </span>

                      {/* Department */}
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {job.department || 'Engineering'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>

                      {/* Location */}
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                        <span>{job.location || 'Remote'}</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>

                      {/* Employment Type */}
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {job.employment_type || 'Full-Time'}
                      </span>
                    </div>

                    {/* Job Title */}
                    <h2
                      onClick={() => onSelectJob(job.id)}
                      className="font-headline font-bold text-xl text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                    >
                      {job.title}
                    </h2>

                    {/* Academic & Experience Prerequisites */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center">
                        <GraduationCap className="w-3.5 h-3.5 mr-1 text-blue-600 shrink-0" />
                        <span>Min. {job.min_cgpa ? `${job.min_cgpa} CGPA` : '7.0 CGPA'}</span>
                      </span>
                      <span>•</span>
                      <span>
                        Exp: {job.min_experience || 0} - {job.max_experience || 5} yrs
                      </span>
                      {job.min_tenth_percentage && (
                        <>
                          <span>•</span>
                          <span>10th: {job.min_tenth_percentage}%+</span>
                        </>
                      )}
                      {job.min_twelfth_percentage && (
                        <>
                          <span>•</span>
                          <span>12th: {job.min_twelfth_percentage}%+</span>
                        </>
                      )}
                    </div>

                    {/* Required Skills Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-slate-400">Must Have:</span>
                      {job.required_skills?.slice(0, 5).map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                        >
                          {sk}
                        </span>
                      ))}
                      {job.required_skills?.length > 5 && (
                        <span className="text-[11px] text-slate-400 font-mono">
                          +{job.required_skills.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                    {/* Deadline Pill & Extend Button */}
                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">
                        Deadline: <strong className="font-mono text-slate-900 dark:text-white">{deadline}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setExtendingJob(job)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-1 cursor-pointer"
                        title="Extend closing deadline"
                      >
                        Extend
                      </button>
                    </div>

                    {/* Applicant Funnel Badges */}
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {applicantCount} Total
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-mono font-semibold">
                        {shortlistedCount} Shortlisted
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-mono font-semibold">
                        {interviewCount} Interview
                      </span>
                    </div>

                    {/* Primary Button: View & Manage Candidates */}
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      {/* Calibrate Algorithm & Edit Criteria */}
                      {onOpenEditJob && (
                        <button
                          type="button"
                          onClick={() => onOpenEditJob(job.id)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-all cursor-pointer"
                          title="Calibrate match scoring weights & criteria"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Calibrate</span>
                        </button>
                      )}

                      {/* Close or Re-open Application Status */}
                      <button
                        type="button"
                        onClick={() => onUpdateJobStatus(job.id, isClosed ? 'Active' : 'Closed')}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isClosed
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-300 hover:border-rose-300 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-rose-950/60'
                        }`}
                        title={isClosed ? 'Re-open this role for applications' : 'Close applications for this role'}
                      >
                        {isClosed ? 'Re-Open Job' : 'Close Applications'}
                      </button>

                      {/* Manage Candidates for this Job */}
                      <button
                        type="button"
                        onClick={() => onSelectJob(job.id)}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <span>Manage Candidates</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Extend Deadline Modal */}
      <ExtendDeadlineModal
        job={extendingJob}
        isOpen={Boolean(extendingJob)}
        onClose={() => setExtendingJob(null)}
        onSuccess={(jobId, newDeadline) => {
          onExtendDeadline(jobId, newDeadline);
        }}
      />
    </div>
  );
}
