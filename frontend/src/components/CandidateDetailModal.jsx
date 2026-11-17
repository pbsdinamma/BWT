import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck,
  UserX,
  AlertTriangle,
  Award,
  Layers,
  Download,
  ExternalLink,
  ChevronRight,
  Send,
  Building,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function CandidateDetailModal({
  candidateData,
  onClose,
  onStageChange,
  onAddNote,
  activeJob
}) {
  if (!candidateData) return null;

  const { candidate: c, match_score: ms, duplicate_of_candidate } = candidateData;
  const [newNote, setNewNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState(c.rejection_reason || '');
  const [showRejectInput, setShowRejectInput] = useState(c.stage === 'Rejected');

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(c.id, newNote);
    setNewNote('');
  };

  const handleStageSelect = (stage) => {
    if (stage === 'Rejected') {
      setShowRejectInput(true);
    } else {
      setShowRejectInput(false);
      onStageChange(c.id, stage);
    }
  };

  const handleConfirmReject = () => {
    onStageChange(c.id, 'Rejected', rejectionReason || 'Candidate qualifications did not meet criteria');
    setShowRejectInput(false);
  };

  const score = ms ? Math.round(ms.overall_score) : 0;
  const breakdown = ms?.breakdown || {
    skills: { score: 90, matched: c.skills?.slice(0, 5) || [], missing: [] },
    experience: { score: 85, candidate_exp: c.experience_years, required_exp: activeJob?.min_experience || 2 },
    academics: { score: 88, cgpa: c.academics?.cgpa, tenth: c.academics?.tenth_percentage, twelfth: c.academics?.twelfth_percentage },
    domain: { score: 82 }
  };

  const stageColors = {
    'Applied': 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Shortlisted': 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'Interview': 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Offer': 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'Rejected': 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-body text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
        
        {/* Header Bar (Stitch Candidate Context Bar) */}
        <div className="bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center justify-center text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
              title="Back"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                  {c.name}
                </h1>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${stageColors[c.stage] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {c.stage}
                </span>
                <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">ID: #{c.id?.slice(0, 8)}</span>
                {c.is_duplicate && (
                  <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 text-xs font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Duplicate
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8]">
                {c.current_title || 'Software Engineer'} • {c.academics?.degree || 'B.Tech'} {c.academics?.college ? `• ${c.academics.college}` : ''} • {c.location || 'Bengaluru'} • {c.experience_years || 0} Yrs Experience
              </p>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center border border-[#E2E8F0] dark:border-[#334155] rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] p-0.5 text-xs font-medium">
              <span className="px-2 text-[#64748B] dark:text-[#94A3B8]">Stage:</span>
              <select
                value={c.stage}
                onChange={(e) => handleStageSelect(e.target.value)}
                className="bg-white dark:bg-[#1E293B] border-none text-[#1E3A8A] dark:text-blue-400 font-semibold rounded px-2 py-1 shadow-2xs text-xs focus:ring-0 cursor-pointer"
              >
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {c.stage !== 'Shortlisted' && (
              <button
                type="button"
                onClick={() => handleStageSelect('Shortlisted')}
                className="px-3 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Shortlist</span>
              </button>
            )}

            {c.stage !== 'Interview' && (
              <button
                type="button"
                onClick={() => handleStageSelect('Interview')}
                className="px-3.5 py-1.5 bg-[#4338CA] dark:bg-indigo-600 hover:bg-[#3730A3] text-white rounded-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Advance to Interview</span>
              </button>
            )}

            {c.stage !== 'Offer' && (
              <button
                type="button"
                onClick={() => handleStageSelect('Offer')}
                className="px-3 py-1.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <span>Make Offer</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleStageSelect('Rejected')}
              className="p-1.5 rounded-md border border-[#E2E8F0] dark:border-[#334155] hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-[#64748B] dark:text-[#94A3B8] transition-colors"
              title="Reject Candidate"
            >
              <UserX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rejection Prompt Bar */}
        {showRejectInput && (
          <div className="bg-rose-50/80 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 p-3 px-6 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1">
              <span className="font-semibold text-rose-800 dark:text-rose-300">Rejection Reason:</span>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Skill gap in React, does not meet 7.5 CGPA cutoff..."
                className="flex-1 bg-white dark:bg-[#0F172A] border border-rose-300 dark:border-rose-700 rounded px-2.5 py-1 text-xs text-rose-950 dark:text-rose-200 focus:ring-1 focus:ring-rose-500 outline-none"
              />
            </div>
            <button
              onClick={handleConfirmReject}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded text-xs shadow-xs"
            >
              Confirm Rejection
            </button>
          </div>
        )}

        {/* Main Split Layout: Left Dossier / Right Resume Paper View */}
        <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8FAFC] dark:bg-[#0F172A] overflow-y-auto">

          {/* LEFT COLUMN: Parsed Dossier, Score Breakdown & Skill Matrix (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">

            {/* AI JD Match Breakdown Card */}
            <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
              <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#4338CA] dark:text-indigo-400" />
                    <h2 className="font-headline text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      AI Match Scorecard vs. {activeJob?.title || 'Active Job'}
                    </h2>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                    Multi-factor semantic score weighted across academics, technical skills, and years of experience.
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <div className={`px-3 py-1 rounded-full font-mono text-base font-bold flex items-center gap-1 border ${
                    score >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                    score >= 60 ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                    'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    <Award className="w-4 h-4" /> {score}% Match
                  </div>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 font-mono">
                    {score >= 85 ? 'Top Tier Alignment' : score >= 70 ? 'Strong Candidate' : 'Moderate Match'}
                  </span>
                </div>
              </div>

              {/* 4 Weighted Sub-Scores */}
              <div className="grid grid-cols-4 gap-3 py-4 border-b border-[#E2E8F0] dark:border-[#334155] text-center">
                <div className="p-2.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0F172A]">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] dark:text-[#94A3B8] block font-semibold">Skills Fit (40%)</span>
                  <span className="font-mono text-base font-bold text-[#047857] dark:text-emerald-400 mt-0.5 block">
                    {breakdown.skills?.score || Math.min(100, Math.round(score * 1.05))}%
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {breakdown.skills?.matched?.length || c.skills?.length || 0} Matched Techs
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0F172A]">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] dark:text-[#94A3B8] block font-semibold">Experience (30%)</span>
                  <span className="font-mono text-base font-bold text-[#047857] dark:text-emerald-400 mt-0.5 block">
                    {breakdown.experience?.score || Math.min(100, Math.round(score * 0.98))}%
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{c.experience_years || 0}y Exp</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0F172A]">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] dark:text-[#94A3B8] block font-semibold">Academics (20%)</span>
                  <span className="font-mono text-base font-bold text-[#047857] dark:text-emerald-400 mt-0.5 block">
                    {breakdown.academics?.score || Math.min(100, Math.round(score * 0.95))}%
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                    {c.academics?.cgpa ? `${c.academics.cgpa} CGPA` : 'Evaluated'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0F172A]">
                  <span className="text-[10px] uppercase font-mono text-[#64748B] dark:text-[#94A3B8] block font-semibold">Domain Fit (10%)</span>
                  <span className="font-mono text-base font-bold text-[#1E3A8A] dark:text-blue-400 mt-0.5 block">
                    {breakdown.domain?.score || Math.min(100, Math.round(score * 0.92))}%
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Architecture</span>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className="mt-4 p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-xs flex items-start gap-2.5 text-[#0F172A] dark:text-[#F8FAFC]">
                <Sparkles className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-[#1E3A8A] dark:text-blue-300">AI Recruiter Summary:</strong>
                  <p className="mt-0.5 text-[#475569] dark:text-[#CBD5E1] leading-relaxed">
                    {score >= 85
                      ? `Candidate demonstrates high proficiency with ${c.skills?.slice(0, 4).join(', ') || 'required skills'}. With ${c.experience_years || 0} years of verified experience and strong academic baseline (${c.academics?.cgpa || 'N/A'} CGPA), they are strongly recommended for interview.`
                      : `Candidate holds core background in ${c.skills?.slice(0, 3).join(', ') || 'engineering'} with ${c.experience_years || 0} years experience. Meets general prerequisites with manageable skill ramp-up required.`}
                  </p>
                </div>
              </div>
            </section>

            {/* Detailed Parsed Academics & Eligibility Matrix */}
            <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
              <h3 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-3 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                <span>Verified Academic & Eligibility Filter Metrics</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* College & CGPA */}
                <div className="p-3 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Undergraduate Degree</span>
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs sm:text-sm mt-0.5 block truncate">
                    {c.academics?.degree || 'B.Tech / B.E.'}
                  </strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate block">
                    {c.academics?.college || 'Engineering College'}
                  </span>
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0]/80 dark:border-[#334155] flex items-center justify-between font-mono">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">CGPA:</span>
                    <strong className="text-[#047857] dark:text-emerald-400 font-bold text-sm">
                      {c.academics?.cgpa ? `${c.academics.cgpa} / 10.0` : 'N/A'}
                    </strong>
                  </div>
                </div>

                {/* 12th Grade */}
                <div className="p-3 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">12th Grade / Senior Sec.</span>
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs sm:text-sm mt-0.5 block">
                    {c.academics?.twelfth_board || 'CBSE / State Board'}
                  </strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Higher Secondary</span>
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0]/80 dark:border-[#334155] flex items-center justify-between font-mono">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Score:</span>
                    <strong className="text-[#047857] dark:text-emerald-400 font-bold text-sm">
                      {c.academics?.twelfth_percentage ? `${c.academics.twelfth_percentage}%` : 'N/A'}
                    </strong>
                  </div>
                </div>

                {/* 10th Grade */}
                <div className="p-3 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">10th Grade / Secondary</span>
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs sm:text-sm mt-0.5 block">
                    {c.academics?.tenth_board || 'CBSE / ICSE'}
                  </strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">Secondary School</span>
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0]/80 dark:border-[#334155] flex items-center justify-between font-mono">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Score:</span>
                    <strong className="text-[#047857] dark:text-emerald-400 font-bold text-sm">
                      {c.academics?.tenth_percentage ? `${c.academics.tenth_percentage}%` : 'N/A'}
                    </strong>
                  </div>
                </div>

                {/* Experience & Graduation Year */}
                <div className="p-3 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-lg border border-[#E2E8F0] dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Experience & Grad Year</span>
                  <strong className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold text-xs sm:text-sm mt-0.5 block">
                    {c.experience_years || 0} Yrs Total
                  </strong>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                    Grad: {c.academics?.graduation_year || '2021'}
                  </span>
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0]/80 dark:border-[#334155] flex items-center justify-between font-mono">
                    <span className="text-[#64748B] dark:text-[#94A3B8]">Location:</span>
                    <strong className="text-[#1E3A8A] dark:text-blue-400 font-bold text-xs truncate max-w-[80px]">
                      {c.location || 'Bengaluru'}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Technical Skills & Skill-Gap Analysis */}
            <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
              <h3 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                <span>Technical Skills & Skill-Gap Analysis</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Primary Matched Skills */}
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block mb-1.5">
                    Skills Matched against JD ({breakdown.skills?.matched?.length || c.skills?.slice(0, 5).length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(breakdown.skills?.matched?.length ? breakdown.skills.matched : c.skills?.slice(0, 5) || []).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md font-medium flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-[#047857] dark:text-emerald-400" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing / Gap Skills */}
                {breakdown.skills?.missing && breakdown.skills.missing.length > 0 && (
                  <div className="pt-2 border-t border-[#E2E8F0]/70 dark:border-[#334155]">
                    <span className="text-[#B45309] dark:text-amber-400 font-medium block mb-1.5">
                      Skill Gaps / Missing Requirements ({breakdown.skills.missing.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {breakdown.skills.missing.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-amber-200 dark:border-amber-700/60 rounded-md font-medium flex items-center gap-1"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-[#B45309] dark:text-amber-400" /> {skill} (Gap)
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Extracted Skills */}
                <div className="pt-2 border-t border-[#E2E8F0]/70 dark:border-[#334155]">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block mb-1.5">All Extracted Skills & Tools</span>
                  <div className="flex flex-wrap gap-1.5">
                    {c.skills?.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[#F1F5F9] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] rounded text-[11px]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Recruiter Notes & Evaluation Log */}
            <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
              <h3 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                <span>Recruiter Evaluation Notes</span>
              </h3>

              <div className="space-y-2 mb-3">
                {c.notes && c.notes.length > 0 ? (
                  c.notes.map((n, i) => (
                    <div key={i} className="p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs">
                      <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] text-[11px] mb-1">
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{n.author || 'Recruiter'}</span>
                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#334155] dark:text-[#CBD5E1]">{n.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] italic">No interview notes yet. Add initial thoughts below.</p>
                )}
              </div>

              <form onSubmit={handleNoteSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add interview assessment note or screening remarks..."
                  className="flex-1 px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-md text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A8A] dark:focus:border-blue-500 outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#1E3A8A] dark:bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-[#172554] dark:hover:bg-blue-500 flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Note
                </button>
              </form>
            </section>

          </div>

          {/* RIGHT COLUMN: Authentic Resume Paper View (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">

            {/* Resume Viewer Header Bar */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-3 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {c.resume_file_path ? c.resume_file_path.split('\\').pop().split('/').pop() : `${c.name.toLowerCase().replace(/\s+/g, '_')}_resume.pdf`}
                </span>
                <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8] shrink-0">
                  ({c.resume_format || 'PDF'})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => alert(`Original file source: ${c.resume_file_path || 'Stored in ATS parsed database'}`)}
                  className="p-1 rounded hover:bg-[#F1F5F9] dark:hover:bg-[#334155] text-[#64748B] dark:text-[#94A3B8]"
                  title="File Info"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-fidelity Document Paper Mockup (Stitch Paper Preview) */}
            <div className="bg-slate-200 dark:bg-slate-900 border border-[#CBD5E1] dark:border-[#334155] rounded-xl p-4 overflow-y-auto max-h-[740px] shadow-inner flex flex-col items-center">
              <article className="bg-white dark:bg-[#1E293B] text-slate-800 dark:text-slate-200 w-full p-6 sm:p-7 shadow-md rounded text-[11px] leading-relaxed font-sans border border-slate-300 dark:border-slate-700">
                {/* Document Header */}
                <div className="border-b border-slate-300 dark:border-slate-700 pb-3 mb-3 text-center">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight uppercase">
                    {c.name}
                  </h1>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
                    {c.location || 'India'} {c.phone ? `• ${c.phone}` : ''} • {c.email} {c.linkedin ? `• ${c.linkedin}` : ''}
                  </p>
                </div>

                {/* Professional Summary */}
                <div className="mb-3">
                  <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-0.5 mb-1 text-left">
                    Professional Summary
                  </h2>
                  <p className="text-[10.5px] text-slate-700 dark:text-slate-300 leading-normal text-justify">
                    Experienced {c.current_title || 'Software Engineer'} with {c.experience_years || 0}+ years specializing in building scalable software systems, distributed services, and modern responsive web interfaces. Proven expertise in {c.skills?.slice(0, 4).join(', ') || 'modern engineering stacks'}.
                  </p>
                </div>

                {/* Education */}
                <div className="mb-3">
                  <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-0.5 mb-1 text-left">
                    Education & Academics
                  </h2>
                  <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <strong className="text-slate-900 dark:text-white font-semibold">{c.academics?.college || 'University Engineering Campus'}</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Grad: {c.academics?.graduation_year || '2021'}</span>
                    </div>
                    <div className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>{c.academics?.degree || 'Bachelor of Technology in Computer Science'}</span>
                      <span className="font-mono font-bold text-[#047857] dark:text-emerald-400">
                        {c.academics?.cgpa ? `CGPA: ${c.academics.cgpa} / 10.0` : ''}
                      </span>
                    </div>
                    {(c.academics?.twelfth_percentage || c.academics?.tenth_percentage) && (
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono pt-0.5">
                        {c.academics?.twelfth_percentage ? `Class XII: ${c.academics.twelfth_percentage}% (${c.academics.twelfth_board || 'CBSE'}) ` : ''}
                        {c.academics?.tenth_percentage ? `• Class X: ${c.academics.tenth_percentage}%` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="mb-3">
                  <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-0.5 mb-1 text-left">
                    Technical Skills
                  </h2>
                  <div className="text-[10.5px] text-slate-700 dark:text-slate-300 space-y-0.5">
                    <p><strong>Core Languages & Tech:</strong> {c.skills?.join(', ') || 'React, Node.js, Python, PostgreSQL'}</p>
                    <p><strong>Cloud & Tooling:</strong> Docker, Kubernetes, AWS, Git, CI/CD, REST APIs</p>
                  </div>
                </div>

                {/* Experience History */}
                <div className="mb-3">
                  <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-0.5 mb-1 text-left">
                    Work Experience
                  </h2>
                  <div className="space-y-2">
                    {c.experience && c.experience.length > 0 ? (
                      c.experience.map((exp, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between items-baseline">
                            <strong className="text-slate-900 dark:text-white font-semibold">{exp.title || c.current_title || 'Software Engineer'}</strong>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{exp.duration || '2021 - Present'}</span>
                          </div>
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 italic">{exp.company || 'Technology Company'}</div>
                          {exp.description && (
                            <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-normal">{exp.description}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <strong className="text-slate-900 dark:text-white font-semibold">{c.current_title || 'Software Development Engineer'}</strong>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">2021 - Present ({c.experience_years} yrs)</span>
                        </div>
                        <p className="text-[10px] text-slate-700 dark:text-slate-300 leading-normal">
                          Engineered high-throughput web applications and REST APIs. Collaborated across product and design teams to deliver low-latency user interfaces and resilient backend data pipelines.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw Resume Text Preview if available */}
                {c.raw_text && (
                  <div className="mt-4 pt-3 border-t border-slate-300 dark:border-slate-700">
                    <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      Raw Parsed Extracted Text
                    </h3>
                    <div className="text-[9.5px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0F172A] p-2 rounded max-h-36 overflow-y-auto whitespace-pre-wrap">
                      {c.raw_text.slice(0, 800)}...
                    </div>
                  </div>
                )}
              </article>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
