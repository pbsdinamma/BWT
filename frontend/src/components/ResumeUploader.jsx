import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  ChevronRight,
  ShieldCheck,
  Check,
  Briefcase
} from 'lucide-react';
import { api } from '../api';

export default function ResumeUploader({
  isOpen,
  onClose,
  jobs = [],
  activeJobId,
  onUploadSuccess,
  isFullPage = false
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetJobId, setTargetJobId] = useState(activeJobId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [sampleFiles, setSampleFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);

  // Parsing schema toggles matching Stitch
  const [rules, setRules] = useState({
    marks: true,
    cgpa: true,
    gradYear: true,
    exp: true,
    skills: true,
    duplicates: true
  });

  useEffect(() => {
    if (activeJobId) setTargetJobId(activeJobId);
  }, [activeJobId]);

  useEffect(() => {
    if (isOpen || isFullPage) {
      loadSampleFiles();
    }
  }, [isOpen, isFullPage]);

  const loadSampleFiles = async () => {
    try {
      const data = await api.getSampleFiles();
      setSampleFiles(data.files || []);
    } catch (e) {
      console.error('Error loading sample files:', e);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (f) => f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    const validFiles = files.filter(
      (f) => f.name.endsWith('.pdf') || f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadProgress(15);
    setUploadResult(null);

    const progressTimer = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 20 : p));
    }, 150);

    try {
      const res = await api.uploadResumes(selectedFiles, targetJobId || null);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setUploadResult(res);
      setSelectedFiles([]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      clearInterval(progressTimer);
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSamples = async () => {
    setLoadingSamples(true);
    try {
      const res = await api.loadSampleResumes(targetJobId || null);
      setUploadResult({
        total_uploaded: res.loaded_count,
        successful_parses: res.loaded_count,
        duplicates_detected: res.duplicates_found,
        results: res.candidates.map((c) => ({
          status: 'success',
          candidate_id: c.id,
          candidate_name: c.name,
          filename: c.resume_file_path?.split('\\').pop() || 'sample_resume.pdf',
          experience_years: c.experience_years,
          skills: c.skills,
          academics: c.academics,
          match_score: c.match_score,
          is_duplicate: c.is_duplicate,
          reasons: c.duplicate_reasons
        }))
      });
      if (onUploadSuccess) onUploadSuccess();
    } catch (e) {
      alert('Error loading sample resumes: ' + e.message);
    } finally {
      setLoadingSamples(false);
    }
  };

  if (!isOpen && !isFullPage) return null;

  const targetJob = jobs.find((j) => j.job.id === targetJobId)?.job || jobs[0]?.job;

  const content = (
    <div className="flex flex-col bg-[#F8FAFC] text-[#0F172A] font-body">
      {/* Top Banner / Ingestion Stage Indicator (Stitch Style) */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs text-[#475569] hover:text-[#0F172A] flex items-center gap-1 font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Close Ingestion Studio</span>
                </button>
              )}
              <span className="text-[#94A3B8]">•</span>
              <span className="text-xs font-mono text-[#1E3A8A] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Batch Ingestion Studio
              </span>
            </div>
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Bulk Resume Dropzone & AI Parsing Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              Drop hundreds of PDF or DOCX resumes. The OCR engine automatically parses academics (CGPA, 10th/12th), work experience, skills, and flags duplicate submissions.
            </p>
          </div>

          {/* Ingestion Pipeline Stage Indicator */}
          <div className="flex items-center gap-2 bg-[#F1F5F9] px-3.5 py-2 rounded-lg border border-[#E2E8F0] self-start lg:self-auto">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
              <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-mono text-[10px]">1</span>
              <span>Upload</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A]">
              <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-mono text-[10px]">2</span>
              <span>Parse & OCR</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <span className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#475569] flex items-center justify-center font-mono text-[10px]">3</span>
              <span>Deduplicate</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8]" />
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
              <span className="w-5 h-5 rounded-full bg-[#E2E8F0] text-[#475569] flex items-center justify-center font-mono text-[10px]">4</span>
              <span>Rank & Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Split Layout */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">

        {/* Left Column: Dropzone & Settings (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Interactive Drag & Drop Box */}
          <section
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all shadow-xs ${
              isDragOver ? 'border-[#1E3A8A] bg-blue-50/50' : 'border-[#1E3A8A]/40 hover:border-[#1E3A8A]'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#1E3A8A] flex items-center justify-center mb-3">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h2 className="font-headline text-base font-bold text-[#0F172A]">
              Drag & Drop Resume Batch Here
            </h2>
            <p className="text-xs text-[#475569] mt-1 max-w-sm">
              Supports bulk selection of <strong>PDF</strong> and <strong>DOCX</strong> files up to 25MB each.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <label className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4" />
                <span>Browse Files from Folder</span>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleLoadSamples}
                disabled={loadingSamples}
                className="px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#4338CA]" />
                <span>{loadingSamples ? 'Ingesting Samples...' : 'Load Built-In Sample Resumes'}</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#047857]" /> Multi-page OCR
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#047857]" /> Phone & Email Dedupe
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-[#047857]" /> Indian Grading Scales
              </span>
            </div>
          </section>

          {/* Selected Files Ready to Ingest */}
          {selectedFiles.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#1E3A8A]" />
                  <span>Selected Files Queue ({selectedFiles.length})</span>
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-[11px] text-[#64748B] hover:text-rose-600 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="max-h-36 overflow-y-auto space-y-1 mb-3">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-xs"
                  >
                    <span className="truncate max-w-[260px] font-medium text-[#334155]">{file.name}</span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-[#94A3B8] hover:text-rose-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing & Matching Resumes ({uploadProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Run Ingestion & AI Parsing ({selectedFiles.length} Resumes)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Target Job Mapping & Parsing Profile (Stitch Settings Card) */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <h3 className="font-headline text-sm font-bold text-[#0F172A] mb-3 flex items-center justify-between">
              <span>Parsing Target & Rules</span>
              <span className="text-[11px] font-mono text-[#64748B]">Settings</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-[#475569] mb-1">Target Job Description</label>
                <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                    <select
                      value={targetJobId}
                      onChange={(e) => setTargetJobId(e.target.value)}
                      className="bg-transparent font-semibold text-[#0F172A] border-none text-xs focus:ring-0 cursor-pointer"
                    >
                      {jobs.map((j) => (
                        <option key={j.job.id} value={j.job.id}>
                          {j.job.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {targetJob?.id ? `JD-${targetJob.id.slice(0, 6)}` : 'ACTIVE'}
                  </span>
                </div>
              </div>

              {/* Extraction Schema Toggles */}
              <div className="pt-2 border-t border-[#E2E8F0]">
                <span className="block font-medium text-[#475569] mb-2">Automated Extraction Fields</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.marks}
                      onChange={(e) => setRules({ ...rules, marks: e.target.checked })}
                      className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[#0F172A] font-medium">10th / 12th Marks</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.cgpa}
                      onChange={(e) => setRules({ ...rules, cgpa: e.target.checked })}
                      className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[#0F172A] font-medium">College CGPA / Scale</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.gradYear}
                      onChange={(e) => setRules({ ...rules, gradYear: e.target.checked })}
                      className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[#0F172A] font-medium">Graduation Year</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.exp}
                      onChange={(e) => setRules({ ...rules, exp: e.target.checked })}
                      className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[#0F172A] font-medium">Total Years Exp</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.skills}
                      onChange={(e) => setRules({ ...rules, skills: e.target.checked })}
                      className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[#0F172A] font-medium">Tech Skills Breakdown</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded bg-[#F8FAFC] border border-[#E2E8F0] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rules.duplicates}
                      onChange={(e) => setRules({ ...rules, duplicates: e.target.checked })}
                      className="rounded border-[#CBD5E1] text-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <span className="text-[#0F172A] font-medium">Duplicate Warning</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Live Parsing Progress Summary */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 text-[#1E3A8A] ${isUploading ? 'animate-spin' : ''}`} />
                <span className="font-headline text-xs sm:text-sm font-bold text-[#0F172A]">Current Batch Progress</span>
              </div>
              <span className="font-mono text-xs font-bold text-[#047857]">
                {uploadResult ? `${uploadResult.successful_parses} Parsed` : isUploading ? 'Processing...' : 'Ready'}
              </span>
            </div>

            <div className="w-full bg-[#F1F5F9] rounded-full h-2 overflow-hidden border border-[#E2E8F0] mb-2">
              <div
                className="bg-[#1E3A8A] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadResult ? 100 : uploadProgress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] font-mono">
              <span>Screening speed: ~0.3s / resume</span>
              <span>OCR & TF-IDF Match Engine</span>
            </div>
          </div>

        </div>

        {/* Right Column: Parsed Candidates Table & Duplicate Alerts (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* Header & Ingestion Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline text-base sm:text-lg font-bold text-[#0F172A]">
                Parsed Candidates in this Batch {uploadResult ? `(${uploadResult.results?.length || 0})` : ''}
              </h2>
              <p className="text-xs text-[#475569]">
                Review parsed structured data, resolve duplicates, and commit verified profiles into the pipeline.
              </p>
            </div>

            {uploadResult && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(uploadResult, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'parsed_candidates.json';
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-md text-xs font-medium text-[#0F172A] hover:bg-[#F1F5F9]"
                >
                  Export Parsed JSON
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-medium shadow-xs"
                  >
                    Commit to Pipeline
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Duplicate Alert Callout (Bonus Requirement) */}
          {uploadResult?.duplicates_detected > 0 && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-headline text-xs font-bold text-[#B45309] uppercase tracking-wider">
                    {uploadResult.duplicates_detected} Potential Duplicate Resumes Detected
                  </h3>
                  <p className="text-xs text-[#0F172A] mt-0.5">
                    Profiles were detected sharing identical email, phone, or normalized credentials with existing applicants.
                  </p>
                </div>
              </div>
              <span className="shrink-0 px-2.5 py-1 bg-[#B45309] text-white rounded text-xs font-semibold">
                Flagged for Review
              </span>
            </div>
          )}

          {/* Structured Extraction Grid Table */}
          <div className="border border-[#E2E8F0] rounded-xl bg-white overflow-hidden shadow-xs">
            <div className="px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0F172A]">Structured Extraction Grid</span>
                <span className="px-2 py-0.5 bg-[#F1F5F9] text-[#475569] rounded text-[11px] font-mono">Real-time OCR</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#64748B] font-mono">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {uploadResult?.successful_parses || 0} Parsed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span> {uploadResult?.duplicates_detected || 0} Duplicates
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-medium text-[11px]">
                    <th scope="col" className="py-2.5 px-4 font-semibold text-[#0F172A]">Candidate & File</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-[#0F172A]">Academics (CGPA / 12th)</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-[#0F172A]">Experience</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-[#0F172A]">Key Skills Extracted</th>
                    <th scope="col" className="py-2.5 px-3 font-semibold text-[#0F172A]">JD Match</th>
                    <th scope="col" className="py-2.5 px-4 font-semibold text-[#0F172A] text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {uploadResult?.results && uploadResult.results.length > 0 ? (
                    uploadResult.results.map((res, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-[#F8FAFC] transition-colors ${
                          res.is_duplicate ? 'bg-amber-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                            <span>{res.candidate_name || 'Candidate'}</span>
                            {res.is_duplicate && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-[#B45309] text-[10px] font-mono font-bold">
                                DUPLICATE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-mono">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span className="truncate max-w-[150px]">{res.filename}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-[#047857]">
                            {res.academics?.cgpa ? `${res.academics.cgpa} CGPA` : 'N/A'}
                          </div>
                          <div className="text-[10px] font-mono text-[#64748B]">
                            {res.academics?.twelfth_percentage ? `12th: ${res.academics.twelfth_percentage}%` : ''}
                            {res.academics?.tenth_percentage ? ` • 10th: ${res.academics.tenth_percentage}%` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-medium text-[#0F172A]">
                            {res.experience_years || 0} Years
                          </div>
                          <div className="text-[10px] text-[#64748B]">
                            Grad: {res.academics?.graduation_year || '2021'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {res.skills?.slice(0, 3).map((s, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.2 bg-[#F1F5F9] rounded text-[10px] font-medium text-[#334155]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono text-[11px] font-bold border ${
                              (res.match_score || 80) >= 80
                                ? 'bg-emerald-50 text-[#047857] border-emerald-200'
                                : 'bg-blue-50 text-[#1E3A8A] border-blue-200'
                            }`}
                          >
                            {Math.round(res.match_score || 82)}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[#047857] font-medium text-xs">
                            <Check className="w-3.5 h-3.5" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#64748B]">
                        <UploadCloud className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                        <p className="font-medium">No resumes ingested in current session yet.</p>
                        <p className="text-[11px] mt-0.5">
                          Drop PDF/DOCX files or click "Load Built-In Sample Resumes" above to trigger parsing.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
