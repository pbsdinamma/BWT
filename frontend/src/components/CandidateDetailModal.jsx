import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Globe,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  FileText,
  UserCheck,
  UserX,
  ChevronRight,
  AlertTriangle,
  Award,
  Layers,
  ExternalLink
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'notes' | 'resume'
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

  const score = ms ? ms.overall_score : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-indigo-600/20">
              {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-xl font-bold text-white">{c.name}</h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    c.stage === 'Shortlisted'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : c.stage === 'Interview'
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      : c.stage === 'Offer'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : c.stage === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {c.stage}
                </span>
                {c.is_duplicate && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 mr-0.5" />
                    <span>Duplicate Flagged</span>
                  </span>
                )}
              </div>

              {/* Contact and Links bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                <span className="flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {c.email}
                </span>
                {c.phone && (
                  <span className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {c.phone}
                  </span>
                )}
                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {c.location || 'Remote'}
                </span>
                {c.linkedin && (
                  <a
                    href={c.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-sky-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-0.5" />
                    LinkedIn
                  </a>
                )}
                {c.github && (
                  <a
                    href={c.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-slate-300 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-0.5" />
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate warning bar if duplicate */}
        {c.is_duplicate && (
          <div className="bg-amber-950/40 border-b border-amber-800/60 px-5 py-2.5 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Duplicate Alert:</strong> {c.duplicate_reasons?.join(' • ')}
              </span>
            </div>
            {duplicate_of_candidate && (
              <span className="text-[11px] text-amber-300/80">
                Matches existing: {duplicate_of_candidate.name} ({duplicate_of_candidate.email})
              </span>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-5 bg-slate-900/60 text-xs">
          {[
            { id: 'overview', label: 'AI Score & Overview' },
            { id: 'skills', label: 'Skill Gap Breakdown' },
            { id: 'history', label: 'Work Experience & Projects' },
            { id: 'notes', label: `Recruiter Notes (${c.notes?.length || 0})` },
            { id: 'resume', label: 'Raw Resume Text' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 font-semibold transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* AI Match Score Header Banner */}
              {ms && (
                <div className="bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          AI ATS Match Rating
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          Target: {activeJob?.title}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white mt-1">
                        {score}%{' '}
                        <span className="text-sm font-semibold text-slate-400">({ms.tier})</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full sm:w-60 space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Overall Fit</span>
                        <span className="font-bold text-white">{score} / 100</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${score}%` }}
                          className={`h-full transition-all ${
                            score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-sky-500' : 'bg-amber-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Factor Sub-Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Required Skills</div>
                      <div className="font-extrabold text-slate-100 text-base">{ms.skills_score}%</div>
                      <div className="text-[10px] text-slate-500">40% weight</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Experience Fit</div>
                      <div className="font-extrabold text-slate-100 text-base">{ms.experience_score}%</div>
                      <div className="text-[10px] text-slate-500">20% weight</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Semantic Match</div>
                      <div className="font-extrabold text-slate-100 text-base">{ms.semantic_score}%</div>
                      <div className="text-[10px] text-slate-500">25% weight (NLP)</div>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Academics Compliance</div>
                      <div className="font-extrabold text-slate-100 text-base">{ms.academics_score}%</div>
                      <div className="text-[10px] text-slate-500">15% weight</div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommendation & Strengths/Gaps */}
              {ms && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      <CheckCircle className="w-4 h-4" />
                      <span>Key Candidate Strengths</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-200">
                      {ms.strengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-emerald-400 shrink-0">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks & Skill Gaps */}
                  <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-400 uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4" />
                      <span>Risks & Skill Gaps</span>
                    </div>
                    {ms.risks_or_gaps?.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-slate-200">
                        {ms.risks_or_gaps.map((gap, idx) => (
                          <li key={idx} className="flex items-start space-x-1.5">
                            <span className="text-rose-400 shrink-0">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400">No major disqualifying gaps detected.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendation Box */}
              {ms && (
                <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-3.5 flex items-start space-x-3 text-xs">
                  <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-300">Hiring Recommendation:</span>
                    <p className="text-slate-300 mt-0.5">{ms.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Academics & Education Card */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-200 uppercase tracking-wide">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Academic Record</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Degree & Major:</span>
                    <span className="font-semibold text-slate-200">{c.education.degree || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">College / University:</span>
                    <span className="font-semibold text-slate-200">{c.education.college || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">College CGPA:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {c.education.cgpa !== null ? `${c.education.cgpa} / 10.0` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Graduation Year:</span>
                    <span className="font-semibold text-slate-200">{c.education.graduation_year || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Class 12th (HSC) %:</span>
                    <span className="font-bold text-slate-200">
                      {c.education.twelfth_percentage ? `${c.education.twelfth_percentage}%` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Class 10th (SSC) %:</span>
                    <span className="font-bold text-slate-200">
                      {c.education.tenth_percentage ? `${c.education.tenth_percentage}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skill Gap Breakdown Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-5">
              {ms && (
                <>
                  {/* Matched Required Skills */}
                  <div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Matched Required Skills ({ms.matched_required_skills?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ms.matched_required_skills?.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>{sk}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing Required Skills */}
                  <div>
                    <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing Required Skills ({ms.missing_required_skills?.length || 0})</span>
                    </div>
                    {ms.missing_required_skills?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {ms.missing_required_skills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1"
                          >
                            <AlertCircle className="w-3 h-3 text-rose-400" />
                            <span>{sk}</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">All required technologies are present in resume!</p>
                    )}
                  </div>

                  {/* Bonus Skills */}
                  <div>
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Layers className="w-4 h-4" />
                      <span>Additional Candidate Skills ({ms.additional_skills?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ms.additional_skills?.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-xs border border-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Categorized Skills Taxonomy */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Full Categorized Skillset
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {Object.entries(c.categorized_skills || {}).map(([cat, skList]) => (
                    <div key={cat} className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                      <div className="font-semibold text-slate-300 mb-1.5">{cat}</div>
                      <div className="flex flex-wrap gap-1">
                        {skList.map((sk) => (
                          <span key={sk} className="px-1.5 py-0.5 bg-slate-800 rounded text-[11px] text-slate-300">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Work History ({c.years_of_experience} Years Total)
                </h4>
                <div className="space-y-3">
                  {c.experience_history?.map((exp, idx) => (
                    <div key={idx} className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-100 text-sm">{exp.role}</div>
                          <div className="text-xs text-indigo-400 font-medium">{exp.company}</div>
                        </div>
                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-800 rounded">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 pt-1 leading-relaxed">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {c.projects?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Key Projects
                  </h4>
                  <div className="space-y-2">
                    {c.projects.map((proj, idx) => (
                      <div key={idx} className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                        <div className="font-semibold text-slate-200 text-xs">{proj.title}</div>
                        <p className="text-xs text-slate-400 mt-0.5">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recruiter Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleNoteSubmit} className="space-y-2">
                <textarea
                  placeholder="Add evaluation note (e.g. 'Strong DSA round', 'Asked for 22 LPA CTC', 'Available in 30 days')..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  rows="3"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {c.notes?.map((n) => (
                  <div key={n.id} className="bg-slate-850 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span className="font-bold text-indigo-300">{n.author}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-200">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Resume Text */}
          {activeTab === 'resume' && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {c.raw_text || 'No raw text available.'}
            </div>
          )}
        </div>

        {/* Rejection reason prompt if user clicked Rejected */}
        {showRejectInput && (
          <div className="bg-rose-950/40 border-t border-rose-900/60 p-4 space-y-2">
            <label className="block text-xs font-bold text-rose-300">
              Provide Rejection Reason (for records & feedback):
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. Skill gap in Kubernetes, salary expectation mismatch..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="flex-1 bg-slate-900 border border-rose-800/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
              />
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => setShowRejectInput(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer: Quick Stage Advancement */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400 font-medium">Update Pipeline Stage:</span>
            {['Applied', 'Shortlisted', 'Interview', 'Offer'].map((stg) => (
              <button
                key={stg}
                onClick={() => handleStageSelect(stg)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  c.stage === stg
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {stg}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStageSelect('Rejected')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition-all cursor-pointer ${
                c.stage === 'Rejected'
                  ? 'bg-rose-600 text-white border-rose-500'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              Reject Candidate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
