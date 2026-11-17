import React from 'react';
import {
  Kanban,
  Users,
  BrainCircuit,
  Copy,
  Mail,
  UploadCloud,
  Plus,
  Search,
  Columns,
  RotateCcw
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  jobs = [],
  activeJobId,
  selectedCount = 0,
  onOpenCompare,
  onOpenUpload,
  duplicateCount = 0,
  totalCandidateCount = 0,
  onResetDemo,
  isResetting,
  onOpenCreateJob,
  searchTerm = '',
  onSearchChange
}) {
  return (
    <header className="border-b border-[#E2E8F0] bg-white sticky top-0 z-30 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-2xs font-body">
      <div className="flex items-center space-x-7">
        {/* Brand Logo (Stitch MCP Design) */}
        <div
          className="flex items-center space-x-2.5 cursor-pointer"
          onClick={() => setActiveTab('kanban')}
        >
          <div className="w-8 h-8 rounded-md bg-[#1E3A8A] flex items-center justify-center text-white font-headline font-bold text-base shadow-xs">
            H
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-headline font-bold text-lg tracking-tight text-[#0F172A]">
              HireSwift
            </span>
            <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]">
              ATS
            </span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60'
            }`}
          >
            <Kanban className="w-4 h-4 text-[#1E3A8A]" />
            <span>Pipeline &amp; Jobs</span>
          </button>

          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'candidates'
                ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60'
            }`}
          >
            <Users className="w-4 h-4 text-[#64748B]" />
            <span>Candidate Pool</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#E2E8F0] font-mono text-[11px] font-semibold text-[#334155]">
              {totalCandidateCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60'
            }`}
          >
            <UploadCloud className="w-4 h-4 text-[#64748B]" />
            <span>Bulk Ingestion</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-[#64748B]" />
            <span>AI Match Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer ${
              activeTab === 'duplicates'
                ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60'
            }`}
          >
            <Copy className="w-4 h-4 text-[#B45309]" />
            <span>Duplicates</span>
            {duplicateCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-50 text-[#B45309] border border-amber-200">
                {duplicateCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'bg-[#F1F5F9] text-[#0F172A] font-semibold'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]/60'
            }`}
          >
            <Mail className="w-4 h-4 text-[#64748B]" />
            <span>Bulk Outreach</span>
          </button>
        </nav>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center space-x-2.5">
        {/* Search Trigger (Stitch MCP Style) */}
        <div className="relative w-56 hidden md:block">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Filter skills, CGPA, name..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-8 pr-10 py-1.5 bg-[#F1F5F9] border border-[#E2E8F0] rounded-md text-xs text-[#0F172A] placeholder:text-[#64748B] focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded border border-[#E2E8F0] bg-white text-[10px] font-mono text-[#64748B]">
            ⌘K
          </span>
        </div>

        {/* Compare CTA */}
        {selectedCount > 0 && (
          <button
            onClick={onOpenCompare}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-[#1E3A8A] hover:bg-blue-100 rounded-md text-xs font-medium transition-colors cursor-pointer"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare ({selectedCount})</span>
          </button>
        )}

        {/* Bulk Upload Button (Stitch MCP Style) */}
        <button
          onClick={onOpenUpload}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-md text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9] shadow-2xs transition-colors cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-[#1E3A8A]" />
          <span>Bulk Upload</span>
        </button>

        {/* Create Job Primary Button (Stitch MCP Style) */}
        <button
          onClick={onOpenCreateJob}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#1E3A8A] text-white rounded-md text-xs font-medium hover:opacity-95 shadow-xs transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Job</span>
        </button>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={isResetting}
          className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          title="Reset Demo Data"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-[#1E3A8A]' : ''}`} />
        </button>

        {/* Recruiter Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center font-headline font-semibold text-xs text-[#475569] ml-1">
          HR
        </div>
      </div>
    </header>
  );
}
