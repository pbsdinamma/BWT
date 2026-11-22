import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import CompanyAuthView from './components/CompanyAuthView';
import CompanyJobsDashboard from './components/CompanyJobsDashboard';
import CandidateFilters from './components/CandidateFilters';
import CandidateRankingTable from './components/CandidateRankingTable';
import CandidateDetailModal from './components/CandidateDetailModal';
import PipelineKanban from './components/PipelineKanban';
import SideBySideComparison from './components/SideBySideComparison';
import ResumeUploader from './components/ResumeUploader';
import JobDescriptionManager from './components/JobDescriptionManager';
import DuplicateManagerModal from './components/DuplicateManagerModal';
import BulkEmailModal from './components/BulkEmailModal';
import ExtendDeadlineModal from './components/ExtendDeadlineModal';
import { api } from './api';
import { Calendar, GraduationCap, MapPin, Sparkles, Table, Kanban, ArrowLeft, CheckSquare, UserCheck, Users } from 'lucide-react';

export default function App() {
  // 1. Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('hireswift_company_token') || '');
  const [company, setCompany] = useState(() => {
    const saved = localStorage.getItem('hireswift_company_profile');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = Boolean(token && company);

  const handleLoginSuccess = (companyData, sessionToken) => {
    setCompany(companyData);
    setToken(sessionToken);
    localStorage.setItem('hireswift_company_token', sessionToken);
    localStorage.setItem('hireswift_company_profile', JSON.stringify(companyData));
  };

  const handleLogout = async () => {
    try {
      await api.logoutCompany(token);
    } catch (e) {
      console.warn('Logout warning:', e);
    }
    setCompany(null);
    setToken('');
    localStorage.removeItem('hireswift_company_token');
    localStorage.removeItem('hireswift_company_profile');
    setCurrentView('dashboard');
  };

  // 2. Navigation State
  // 'dashboard' (Job Listings Landing Page) | 'job_workspace' (Role Candidate Triage) | 'create_job' | 'duplicates' | 'email'
  const [currentView, setCurrentView] = useState('dashboard');
  const [jobViewTab, setJobViewTab] = useState('shortlist'); // 'shortlist' | 'kanban'
  const [candidateScope, setCandidateScope] = useState('job'); // 'job' = direct role applicants | 'all' = company talent pool
  const [emailScope, setEmailScope] = useState('global'); // 'global' (cross-job talent pool) | 'role' (specific to activeJob)
  const [totalDirectCount, setTotalDirectCount] = useState(0);
  const [totalTalentPoolCount, setTotalTalentPoolCount] = useState(0);

  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Permanently lock to Clean Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    localStorage.removeItem('hireswift_theme');
  }, []);

  // Modals & Panels
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [detailCandidateData, setDetailCandidateData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [extendingJob, setExtendingJob] = useState(null);
  const [jobManagerMode, setJobManagerMode] = useState('create');

  // Sourcing Filters & Sorting
  const [filters, setFilters] = useState({
    search: '',
    skills: '',
    skill_mode: 'any',
    min_exp: null,
    max_exp: null,
    min_cgpa: null,
    min_tenth: null,
    min_twelfth: null,
    min_grad_year: null,
    max_grad_year: null,
    location: 'All',
    stage: 'all',
    min_score: null
  });

  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load initial Jobs and Stats
  const loadJobsAndStats = useCallback(async () => {
    try {
      const jobsRes = await api.getJobs();
      const jobList = jobsRes.jobs || [];
      setJobs(jobList);
      if (jobList.length > 0) {
        if (!activeJobId || !jobList.some((j) => j.job.id === activeJobId)) {
          setActiveJobId(jobList[0].job.id);
        }
      } else {
        setActiveJobId('');
      }

      const dupRes = await api.getDuplicates();
      setDuplicateCount(dupRes.total_duplicates || 0);

      const statsRes = await api.getStats(activeJobId || null);
      setStats(statsRes);
    } catch (e) {
      console.error('Error loading initial data:', e);
      if (e.message && e.message.includes('Authentication session expired')) {
        handleLogout();
      }
    }
  }, [activeJobId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadJobsAndStats();
    }
  }, [isAuthenticated, loadJobsAndStats]);

  // Load Candidates whenever filters, activeJob, scope, or sort changes
  const loadCandidates = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const params = {
        job_id: activeJobId || undefined,
        scope: candidateScope,
        search: filters.search || undefined,
        skills: filters.skills || undefined,
        skill_mode: filters.skill_mode,
        min_exp: filters.min_exp,
        max_exp: filters.max_exp,
        min_cgpa: filters.min_cgpa,
        min_tenth: filters.min_tenth,
        min_twelfth: filters.min_twelfth,
        min_grad_year: filters.min_grad_year,
        max_grad_year: filters.max_grad_year,
        location: filters.location !== 'All' ? filters.location : undefined,
        stage: filters.stage !== 'all' ? filters.stage : undefined,
        min_score: filters.min_score,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      const res = await api.getCandidates(params);
      setCandidates(res.candidates || []);
      setTotalCount(res.total_count || 0);
      if (res.total_direct_count !== undefined) setTotalDirectCount(res.total_direct_count);
      if (res.total_talent_pool_count !== undefined) setTotalTalentPoolCount(res.total_talent_pool_count);
    } catch (e) {
      console.error('Error loading candidates:', e);
    }
  }, [isAuthenticated, activeJobId, candidateScope, filters, sortBy, sortOrder]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  // Handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      skills: '',
      skill_mode: 'any',
      min_exp: null,
      max_exp: null,
      min_cgpa: null,
      min_tenth: null,
      min_twelfth: null,
      min_grad_year: null,
      max_grad_year: null,
      location: 'All',
      stage: 'all',
      min_score: null
    });
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleToggleSelect = (candidateId) => {
    setSelectedCandidateIds((prev) => {
      if (prev.includes(candidateId)) {
        return prev.filter((id) => id !== candidateId);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 candidates at once.');
          return prev;
        }
        return [...prev, candidateId];
      }
    });
  };

  const handleSelectCandidate = async (candidateId) => {
    try {
      const data = await api.getCandidate(candidateId, activeJobId);
      setDetailCandidateData(data);
    } catch (e) {
      alert('Error fetching candidate: ' + e.message);
    }
  };

  const handleStageChange = async (candidateId, stage, rejectionReason = null) => {
    try {
      await api.updateStage(candidateId, stage, rejectionReason);
      loadCandidates();
      loadJobsAndStats();
      if (detailCandidateData && detailCandidateData.candidate.id === candidateId) {
        setDetailCandidateData((prev) => ({
          ...prev,
          candidate: { ...prev.candidate, stage, rejection_reason: rejectionReason }
        }));
      }
    } catch (e) {
      alert('Error updating stage: ' + e.message);
    }
  };

  const handleAddNote = async (candidateId, content) => {
    try {
      const res = await api.addNote(candidateId, content);
      if (detailCandidateData && detailCandidateData.candidate.id === candidateId) {
        setDetailCandidateData((prev) => ({
          ...prev,
          candidate: { ...prev.candidate, notes: res.notes }
        }));
      }
    } catch (e) {
      alert('Error adding note: ' + e.message);
    }
  };

  const handleOpenCompare = async () => {
    if (selectedCandidateIds.length < 2) return;
    try {
      const res = await api.compareCandidates(selectedCandidateIds, activeJobId);
      setComparisonData(res);
    } catch (e) {
      alert('Error comparing candidates: ' + e.message);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reload default demo data with sample candidates and duplicate test cases?')) return;
    setIsResetting(true);
    try {
      await api.resetDemoData();
      handleResetFilters();
      setSelectedCandidateIds([]);
      await loadJobsAndStats();
      await loadCandidates();
      alert('Demo data successfully refreshed!');
    } catch (e) {
      alert('Error resetting demo: ' + e.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Job Actions from Dashboard
  const handleSelectJobForWorkspace = (jobId) => {
    setActiveJobId(jobId);
    setCandidateScope('job');
    setSelectedCandidateIds([]);
    setCurrentView('job_workspace');
    setJobViewTab('shortlist');
  };

  const handleUpdateJobStatus = async (jobId, newStatus) => {
    try {
      await api.updateJobStatus(jobId, newStatus);
      await loadJobsAndStats();
    } catch (e) {
      alert('Error updating job status: ' + e.message);
    }
  };

  const handleExtendJobDeadline = async (jobId, newDeadline) => {
    try {
      await api.extendJobDeadline(jobId, newDeadline);
      await loadJobsAndStats();
    } catch (e) {
      alert('Error extending deadline: ' + e.message);
    }
  };

  // Active Job object
  const activeJob = jobs.find((j) => j.job.id === activeJobId)?.job || jobs[0]?.job;

  // ----------------- UN-AUTHENTICATED: COMPANY LOGIN / REGISTER -----------------
  if (!isAuthenticated) {
    return <CompanyAuthView onLoginSuccess={handleLoginSuccess} />;
  }

  // ----------------- AUTHENTICATED: RECRUITER PORTAL -----------------
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-body antialiased transition-colors duration-150">
      {/* 1. Global Navigation Bar */}
      <Navbar
        company={company}
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeJob={activeJob}
        onBackToJobs={() => setCurrentView('dashboard')}
        jobViewTab={jobViewTab}
        setJobViewTab={setJobViewTab}
        duplicateCount={duplicateCount}
        selectedCount={selectedCandidateIds.length}
        onOpenCompare={handleOpenCompare}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCreateJob={() => {
          setJobManagerMode('create');
          setCurrentView('create_job');
        }}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        onLogout={handleLogout}
        onOpenGlobalEmail={() => {
          setEmailScope('global');
          setCurrentView('email');
        }}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* VIEW A: COMPANY JOBS DASHBOARD (THE LANDING PAGE) */}
        {currentView === 'dashboard' && (
          <CompanyJobsDashboard
            jobs={jobs}
            company={company}
            onSelectJob={handleSelectJobForWorkspace}
            onOpenCreateJob={() => {
              setJobManagerMode('create');
              setCurrentView('create_job');
            }}
            onOpenEditJob={(jobId) => {
              setActiveJobId(jobId);
              setJobManagerMode('edit');
              setCurrentView('create_job');
            }}
            onOpenUploadForJob={(jobId) => {
              setActiveJobId(jobId);
              setIsUploadOpen(true);
            }}
            onUpdateJobStatus={handleUpdateJobStatus}
            onExtendDeadline={handleExtendJobDeadline}
          />
        )}

        {/* VIEW B: FOCUSED JOB WORKSPACE (TRIAGE CANDIDATES FOR ACTIVE JOB) */}
        {currentView === 'job_workspace' && activeJob && (
          <div className="space-y-5 animate-in fade-in">
            {/* Sleek Role Summary Strip */}
            <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {activeJob.status || 'Active'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {activeJob.department} • {activeJob.location}
                  </span>
                </div>

                <h1 className="font-headline text-2xl font-bold text-slate-900 dark:text-white">
                  {activeJob.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                  <span className="flex items-center">
                    <GraduationCap className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    <span>Cutoff: Min. {activeJob.min_cgpa ? `${activeJob.min_cgpa} CGPA` : '7.0 CGPA'}</span>
                  </span>
                  <span>•</span>
                  <span>Exp: {activeJob.min_experience || 0} - {activeJob.max_experience || 5} yrs</span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Closes: <strong className="font-mono text-slate-800 dark:text-slate-200">{activeJob.application_deadline || '2026-12-31'}</strong></span>
                    <button
                      type="button"
                      onClick={() => setExtendingJob(activeJob)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline ml-1 cursor-pointer"
                    >
                      (Extend)
                    </button>
                  </span>
                </div>
              </div>

              {/* Controls: Scope Switcher + View Switcher */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Scope Switcher: Direct Applicants vs Company Talent Pool */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCandidateScope('job')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      candidateScope === 'job'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Direct Applicants ({totalDirectCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCandidateScope('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      candidateScope === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Company Talent Pool ({totalTalentPoolCount})</span>
                  </button>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setJobViewTab('shortlist')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      jobViewTab === 'shortlist'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Ranked Shortlist ({totalCount})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setJobViewTab('kanban')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      jobViewTab === 'kanban'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <Kanban className="w-3.5 h-3.5" />
                    <span>Pipeline Kanban</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Smart Sourcing Filter Bar (Criteria & Cutoffs) */}
            <CandidateFilters
              activeJob={activeJob}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              totalResults={totalCount}
              selectedCount={selectedCandidateIds.length}
              onOpenCompare={handleOpenCompare}
              onOpenEmail={() => {
                setEmailScope('role');
                setCurrentView('email');
              }}
            />

            {/* Tab Content 1: Ranked Shortlist Table / Cards */}
            {jobViewTab === 'shortlist' && (
              <CandidateRankingTable
                candidates={candidates}
                selectedIds={selectedCandidateIds}
                onToggleSelect={handleToggleSelect}
                onSelectCandidate={handleSelectCandidate}
                onStageChange={handleStageChange}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                activeJob={activeJob}
              />
            )}

            {/* Tab Content 2: Pipeline Kanban Grid */}
            {jobViewTab === 'kanban' && (
              <PipelineKanban
                candidates={candidates}
                selectedIds={selectedCandidateIds}
                onToggleSelect={handleToggleSelect}
                onStageChange={handleStageChange}
                onSelectCandidate={handleSelectCandidate}
                activeJob={activeJob}
              />
            )}
          </div>
        )}

        {/* VIEW C: CREATE / EDIT JOB MANAGER */}
        {currentView === 'create_job' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Job Openings</span>
            </button>
            <JobDescriptionManager
              jobs={jobs}
              activeJobId={activeJobId}
              initialMode={jobManagerMode}
              onSelectActiveJob={(id) => {
                setActiveJobId(id);
                setCurrentView('job_workspace');
              }}
              onRefreshJobs={async () => {
                await loadJobsAndStats();
                setCurrentView('dashboard');
              }}
            />
          </div>
        )}

        {/* VIEW D: DUPLICATES DETECTION CENTER */}
        {currentView === 'duplicates' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Job Openings</span>
            </button>
            <DuplicateManagerModal
              onRefresh={() => {
                loadJobsAndStats();
                loadCandidates();
              }}
            />
          </div>
        )}

        {/* VIEW E: BULK EMAIL OUTREACH CAMPAIGNS */}
        {currentView === 'email' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                if (emailScope === 'role' && activeJobId) {
                  setCurrentView('job_workspace');
                } else {
                  setCurrentView('dashboard');
                }
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>
                {emailScope === 'role' && activeJob?.title
                  ? `Back to ${activeJob.title} Workspace`
                  : 'Back to Job Openings'}
              </span>
            </button>
            <BulkEmailModal
              scope={emailScope}
              activeJob={activeJob}
              jobs={jobs}
              company={company}
              initialCandidates={candidates}
              onClose={() => {
                if (emailScope === 'role' && activeJobId) {
                  setCurrentView('job_workspace');
                } else {
                  setCurrentView('dashboard');
                }
              }}
            />
          </div>
        )}
      </main>

      {/* 3. Floating Comparison Dock (When 2-4 candidates are selected) */}
      {selectedCandidateIds.length >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center space-x-2 text-xs font-medium">
            <CheckSquare className="w-4 h-4 text-blue-400" />
            <span>{selectedCandidateIds.length} Candidates Selected</span>
          </div>
          <button
            type="button"
            onClick={handleOpenCompare}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white shadow-xs transition-colors cursor-pointer"
          >
            Compare Side-by-Side →
          </button>
          <button
            type="button"
            onClick={() => setSelectedCandidateIds([])}
            className="text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Candidate Full AI Detail Modal */}
      {detailCandidateData && (
        <CandidateDetailModal
          candidateData={detailCandidateData}
          onClose={() => setDetailCandidateData(null)}
          onStageChange={handleStageChange}
          onAddNote={handleAddNote}
          activeJob={activeJob}
        />
      )}

      {/* Side-by-Side Comparison Matrix */}
      {comparisonData && (
        <SideBySideComparison
          comparisonData={comparisonData}
          onClose={() => setComparisonData(null)}
          onStageChange={handleStageChange}
          activeJob={activeJob}
        />
      )}

      {/* Bulk Resume Uploader Modal */}
      <ResumeUploader
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        jobs={jobs}
        activeJobId={activeJobId}
        onUploadSuccess={() => {
          loadJobsAndStats();
          loadCandidates();
        }}
      />

      {/* Extend Deadline Modal */}
      <ExtendDeadlineModal
        job={extendingJob}
        isOpen={Boolean(extendingJob)}
        onClose={() => setExtendingJob(null)}
        onSuccess={(jobId, newDeadline) => {
          handleExtendJobDeadline(jobId, newDeadline);
        }}
      />
    </div>
  );
}
