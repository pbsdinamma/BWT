import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import CandidateFilters from './components/CandidateFilters';
import CandidateRankingTable from './components/CandidateRankingTable';
import CandidateDetailModal from './components/CandidateDetailModal';
import PipelineKanban from './components/PipelineKanban';
import SideBySideComparison from './components/SideBySideComparison';
import ResumeUploader from './components/ResumeUploader';
import JobDescriptionManager from './components/JobDescriptionManager';
import DuplicateManagerModal from './components/DuplicateManagerModal';
import BulkEmailModal from './components/BulkEmailModal';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'candidates' | 'upload' | 'jobs' | 'duplicates' | 'email'
  const [jobs, setJobs] = useState([]);
  const [activeJobId, setActiveJobId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Modals & Panels
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [detailCandidateData, setDetailCandidateData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      setJobs(jobsRes.jobs || []);
      if (jobsRes.jobs && jobsRes.jobs.length > 0 && !activeJobId) {
        setActiveJobId(jobsRes.jobs[0].job.id);
      }

      const dupRes = await api.getDuplicates();
      setDuplicateCount(dupRes.total_duplicates || 0);

      const statsRes = await api.getStats(activeJobId || null);
      setStats(statsRes);
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  }, [activeJobId]);

  useEffect(() => {
    loadJobsAndStats();
  }, [loadJobsAndStats]);

  // Load Candidates whenever filters, activeJob, or sort changes
  const loadCandidates = useCallback(async () => {
    try {
      const params = {
        job_id: activeJobId || undefined,
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
    } catch (e) {
      console.error('Error loading candidates:', e);
    } finally {
      setIsLoading(false);
    }
  }, [activeJobId, filters, sortBy, sortOrder]);

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

  const activeJob = jobs.find((j) => j.job.id === activeJobId)?.job || jobs[0]?.job;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-body antialiased selection:bg-[#1E3A8A]/10 selection:text-[#1E3A8A]">
      {/* Top Global Navigation Bar (Stitch MCP Style) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jobs={jobs}
        activeJobId={activeJobId}
        setActiveJobId={(id) => {
          setActiveJobId(id);
          setSelectedCandidateIds([]);
        }}
        selectedCount={selectedCandidateIds.length}
        onOpenCompare={handleOpenCompare}
        onOpenUpload={() => setIsUploadOpen(true)}
        duplicateCount={duplicateCount}
        totalCandidateCount={totalCount}
        onResetDemo={handleResetDemo}
        isResetting={isResetting}
        onOpenCreateJob={() => setActiveTab('jobs')}
        searchTerm={filters.search}
        onSearchChange={(val) => handleFilterChange('search', val)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6">
        {/* Job Context Header & Metric Strip (Shown on Kanban and Candidates view) */}
        {(activeTab === 'kanban' || activeTab === 'candidates') && (
          <DashboardStats
            stats={stats}
            activeJob={activeJob}
            jobs={jobs}
            onSelectJob={(id) => {
              setActiveJobId(id);
              setSelectedCandidateIds([]);
            }}
            onStageClick={(stage) => {
              handleFilterChange('stage', stage);
            }}
          />
        )}

        {/* Smart Sourcing Filter Bar (Criteria & Cutoffs) */}
        {(activeTab === 'kanban' || activeTab === 'candidates') && (
          <CandidateFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={totalCount}
            viewMode={activeTab === 'kanban' ? 'kanban' : 'table'}
            onViewModeChange={(mode) => setActiveTab(mode === 'kanban' ? 'kanban' : 'candidates')}
            selectedCount={selectedCandidateIds.length}
            onOpenCompare={handleOpenCompare}
            onOpenEmail={() => setActiveTab('email')}
          />
        )}

        {/* Tab 1: Interactive Pipeline Kanban Grid (Stitch MCP Style) */}
        {activeTab === 'kanban' && (
          <PipelineKanban
            candidates={candidates}
            selectedIds={selectedCandidateIds}
            onToggleSelect={handleToggleSelect}
            onStageChange={handleStageChange}
            onSelectCandidate={handleSelectCandidate}
            activeJob={activeJob}
          />
        )}

        {/* Tab 2: Ranked Candidate Table */}
        {activeTab === 'candidates' && (
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

        {/* Tab 3: Bulk Resume Ingestion & Parsing Studio */}
        {activeTab === 'upload' && (
          <ResumeUploader
            isFullPage={true}
            jobs={jobs}
            activeJobId={activeJobId}
            onUploadSuccess={() => {
              loadJobsAndStats();
              loadCandidates();
            }}
          />
        )}

        {/* Tab 4: AI Job Openings Manager & Match Calibration */}
        {activeTab === 'jobs' && (
          <JobDescriptionManager
            jobs={jobs}
            activeJobId={activeJobId}
            onSelectActiveJob={(id) => {
              setActiveJobId(id);
            }}
            onRefreshJobs={loadJobsAndStats}
          />
        )}

        {/* Tab 5: Duplicates Detection Center */}
        {activeTab === 'duplicates' && (
          <DuplicateManagerModal
            onRefresh={() => {
              loadJobsAndStats();
              loadCandidates();
            }}
          />
        )}

        {/* Tab 6: Bulk Email Campaigns */}
        {activeTab === 'email' && (
          <BulkEmailModal
            candidates={candidates}
            activeJob={activeJob}
          />
        )}
      </main>

      {/* Candidate Full AI Detail Modal (Stitch Candidate Dossier & Resume Previewer) */}
      {detailCandidateData && (
        <CandidateDetailModal
          candidateData={detailCandidateData}
          onClose={() => setDetailCandidateData(null)}
          onStageChange={handleStageChange}
          onAddNote={handleAddNote}
          activeJob={activeJob}
        />
      )}

      {/* Side-by-Side Comparison Matrix / Drawer (Stitch MCP Style) */}
      {comparisonData && (
        <SideBySideComparison
          comparisonData={comparisonData}
          onClose={() => setComparisonData(null)}
          onStageChange={handleStageChange}
          activeJob={activeJob}
        />
      )}

      {/* Bulk Resume Uploader Modal (When triggered from top Navbar button) */}
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
    </div>
  );
}
