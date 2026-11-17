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
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

export default function ResumeUploader({
  isOpen,
  onClose,
  jobs = [],
  activeJobId,
  onUploadSuccess
}) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'samples'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetJobId, setTargetJobId] = useState(activeJobId || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [sampleFiles, setSampleFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (activeJobId) setTargetJobId(activeJobId);
  }, [activeJobId]);

  useEffect(() => {
    if (isOpen) {
      loadSampleFiles();
    }
  }, [isOpen]);

  const loadSampleFiles = async () => {
    try {
      const data = await api.getSampleFiles();
      setSampleFiles(data.files || []);
    } catch (e) {
      console.error('Error loading sample files:', e);
    }
  };

  if (!isOpen) return null;

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
    setUploadResult(null);

    try {
      const res = await api.uploadResumes(selectedFiles, targetJobId || null);
      setUploadResult(res);
      setSelectedFiles([]);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Bulk Resume Ingestion & Parser</h2>
              <p className="text-xs text-slate-400">
                Upload batches of resumes (PDF / DOCX) for automatic parsing and deduplication
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-900/60 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Bulk File Upload
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`py-3 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'samples'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sample Test Resumes ({sampleFiles.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {activeTab === 'upload' ? (
            <>
              {/* Target Job Selector */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Match Against Job Opening:
                </label>
                <select
                  value={targetJobId}
                  onChange={(e) => setTargetJobId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Default: Match across all openings</option>
                  {jobs.map((j) => (
                    <option key={j.job.id} value={j.job.id}>
                      {j.job.title} ({j.job.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Box */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-slate-750 hover:border-slate-600 bg-slate-850/50'
                }`}
                onClick={() => document.getElementById('resume-file-input').click()}
              >
                <input
                  id="resume-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="font-bold text-slate-200 text-sm">
                  Drag and drop PDF or DOCX resumes here
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  or <span className="text-indigo-400 underline">browse your local files</span> to upload multiple resumes at once
                </p>
                <p className="text-[10px] text-slate-500 mt-2">
                  Supports bulk parsing: extracts 10th/12th/CGPA, skills, experience, and checks for duplicates.
                </p>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-300 font-semibold">
                    <span>Selected Files ({selectedFiles.length})</span>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="text-rose-400 text-[11px] hover:underline"
                    >
                      Remove All
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800 border border-slate-750"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-slate-200 font-medium truncate">{file.name}</span>
                          <span className="text-slate-500 text-[10px]">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                          className="text-slate-400 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Result Alert Banner */}
              {uploadResult && (
                <div className="bg-slate-850 border border-slate-700 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        Successfully parsed {uploadResult.successful} of {uploadResult.total_uploaded} resumes!
                      </span>
                    </div>
                  </div>

                  {uploadResult.duplicates_detected > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-lg text-amber-300 text-[11px] flex items-center space-x-1.5">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        {uploadResult.duplicates_detected} resume(s) matched existing candidate records and were flagged as duplicates!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Sample Resumes Tab */
            <div className="space-y-3">
              <div className="bg-indigo-950/30 border border-indigo-900/50 p-3 rounded-xl text-slate-300">
                <span className="font-bold text-indigo-300 block mb-0.5">
                  Ready-to-Test Realistic Resumes:
                </span>
                We generated physical PDF and DOCX resume files with varied credentials (10th/12th, high vs average CGPA, senior vs fresher) so you can test parsing without having to craft test documents!
              </div>

              <div className="space-y-2">
                {sampleFiles.map((sf) => (
                  <div
                    key={sf.filename}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-850 border border-slate-750"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-indigo-300">
                        {sf.ext}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200">{sf.filename}</div>
                        <span className="text-slate-500 text-[10px]">{sf.size_kb} KB</span>
                      </div>
                    </div>

                    <a
                      href={`/api/resumes/sample-files/${sf.filename}`}
                      download={sf.filename}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close
          </button>

          {activeTab === 'upload' && (
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedFiles.length > 0 && !isUploading
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isUploading ? 'Parsing Profiles...' : `Upload & Parse (${selectedFiles.length})`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
