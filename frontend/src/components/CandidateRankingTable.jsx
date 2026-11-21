import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Award,
  CheckSquare,
  Square,
  Building2,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  LayoutList,
  Table as TableIcon,
  ArrowUpDown,
  Mail,
  UserCheck
} from 'lucide-react';

export default function CandidateRankingTable({
  candidates = [],
  selectedIds = [],
  onToggleSelect,
  onSelectCandidate,
  onStageChange,
  sortBy,
  sortOrder,
  onSortChange,
  activeJob
}) {
  const [displayMode, setDisplayMode] = useState('table'); // 'table' | 'cards'

  // Score Badge Styling
  const getScoreBadge = (score) => {
    if (score >= 80) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-700/60',
        dot: 'bg-emerald-500',
        label: 'Strong Fit'
      };
    }
    if (score >= 65) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-300 dark:border-blue-700/60',
        dot: 'bg-blue-500',
        label: 'Good Fit'
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-700/60',
        dot: 'bg-amber-500',
        label: 'Moderate'
      };
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-950/50',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-300 dark:border-rose-700/60',
      dot: 'bg-rose-500',
      label: 'Low Match'
    };
  };

  // Pipeline Stage Badge Styling
  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Shortlisted':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      case 'Interview':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700';
      case 'Offer':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 font-semibold';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  // Helper to generate consistent color initials avatar
  const getAvatarBg = (name = '') => {
    const colors = [
      'bg-blue-600',
      'bg-indigo-600',
      'bg-purple-600',
      'bg-emerald-600',
      'bg-teal-600',
      'bg-amber-600',
      'bg-rose-600'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name[0] || 'C').toUpperCase();
  };

  return (
    <div className="space-y-3 font-body transition-colors duration-150">
      {/* Table & View Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl text-xs shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Header & Count Badge */}
          <div className="flex items-center space-x-2">
            <span className="font-headline font-bold text-slate-900 dark:text-white text-sm">
              Ranked Candidates
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono font-medium text-[11px] border border-slate-200 dark:border-slate-700">
              {candidates.length} profiles
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Sort:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                onSortChange(sb, so);
              }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-xs"
            >
              <option value="score-desc">AI Match Score: High to Low</option>
              <option value="score-asc">AI Match Score: Low to High</option>
              <option value="cgpa-desc">College CGPA: High to Low</option>
              <option value="twelfth-desc">12th (HSC) %: High to Low</option>
              <option value="tenth-desc">10th (SSC) %: High to Low</option>
              <option value="exp-desc">Experience: High to Low</option>
              <option value="name-asc">Candidate Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Right Side: Comparison Counter & Display Toggle */}
        <div className="flex items-center space-x-3">
          {selectedIds.length > 0 ? (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold text-xs animate-in fade-in">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{selectedIds.length} of 4 selected for comparison</span>
            </div>
          ) : (
            <span className="text-slate-500 dark:text-slate-400 text-[11px] hidden md:inline">
              Select 2 to 4 candidates to compare side-by-side
            </span>
          )}

          {/* Toggle between Table & Cards */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                displayMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('cards')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                displayMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- OPTION 1: HIGH-DENSITY REDESIGNED TABLE ----------------- */}
      {displayMode === 'table' && (
        <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700 font-headline font-semibold">
                  <th className="py-3 px-3 w-10 text-center">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="py-3 px-3 w-32">Rank &amp; Score</th>
                  <th className="py-3 px-4 min-w-[200px]">Candidate Profile</th>
                  <th className="py-3 px-4 min-w-[220px]">Academic Record</th>
                  <th className="py-3 px-4 min-w-[170px]">Experience &amp; Role</th>
                  <th className="py-3 px-4 min-w-[220px]">Core Skills</th>
                  <th className="py-3 px-4 w-36">Pipeline Stage</th>
                  <th className="py-3 px-4 text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-16 text-center">
                      <div className="max-w-md mx-auto space-y-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          No direct applicants yet for this position
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Resumes uploaded for this role will appear here automatically. You can also view the <strong>Company Talent Pool</strong> to cross-source candidates.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  candidates.map((item, index) => {
                    const c = item.candidate;
                    const ms = item.match_score;
                    const isSelected = selectedIds.includes(c.id);
                    const score = ms ? Math.round(ms.overall_score) : 0;
                    const badge = getScoreBadge(score);

                    // Academic & Experience Normalized Data
                    const edu = c.education || c.academics || {};
                    const cgpa = edu.cgpa;
                    const twelfth = edu.twelfth_percentage;
                    const tenth = edu.tenth_percentage;
                    const college = edu.college || 'Engineering Institute';
                    const gradYear = edu.graduation_year;
                    const degree = edu.degree || 'B.Tech / B.E.';
                    const expYears = c.years_of_experience ?? c.experience_years ?? 0;
                    const role = c.current_title || c.experience_history?.[0]?.role || (expYears > 0 ? 'Software Engineer' : 'Fresher / Graduate');
                    const company = c.current_company || c.experience_history?.[0]?.company || '';

                    // Skills Breakdown vs Active Job
                    const requiredSkills = activeJob?.required_skills || [];
                    const candidateSkills = c.skills || [];
                    const matchedReq = ms?.matched_required_skills || candidateSkills.filter((s) =>
                      requiredSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
                    );
                    const missingReq = ms?.missing_required_skills || requiredSkills.filter(
                      (rs) => !candidateSkills.some((s) => s.toLowerCase() === rs.toLowerCase())
                    );

                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        {/* Checkbox for selection */}
                        <td className="py-3.5 px-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => onToggleSelect(c.id)}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                            title="Select for comparison"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Rank & Score */}
                        <td className="py-3.5 px-3 align-middle">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 dark:text-slate-500 font-mono font-bold text-xs w-4">
                              #{index + 1}
                            </span>
                            <div
                              className={`px-2.5 py-1 rounded-full border text-xs font-mono font-bold flex items-center space-x-1.5 shadow-2xs ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{score}%</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-semibold mt-1 pl-6 flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span className={badge.text}>{badge.label}</span>
                          </div>
                        </td>

                        {/* Candidate Profile Details */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="flex items-start space-x-3">
                            {/* Initials Avatar */}
                            <div
                              className={`w-8 h-8 rounded-full ${getAvatarBg(
                                c.name
                              )} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs`}
                            >
                              {getInitials(c.name)}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center space-x-1.5">
                                <span
                                  onClick={() => onSelectCandidate(c.id)}
                                  className="font-headline font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer text-sm transition-colors truncate"
                                >
                                  {c.name}
                                </span>

                                {c.is_duplicate && (
                                  <span
                                    className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60"
                                    title={c.duplicate_reasons?.join(', ')}
                                  >
                                    <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                    Dup
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-500 dark:text-slate-400 text-xs truncate flex items-center mt-0.5">
                                <Mail className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                                <span className="truncate">{c.email}</span>
                              </p>

                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-0.5 text-slate-400 shrink-0" />
                                  <span>{c.location || 'Remote'}</span>
                                </span>
                                {item.applied_job_title && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                    Role: {item.applied_job_title}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Academic Record */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-1">
                            {/* CGPA with distinction icon */}
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-xs">
                                {cgpa !== null && cgpa !== undefined ? `${cgpa} / 10 CGPA` : 'CGPA N/A'}
                              </span>
                              {cgpa !== null && cgpa >= 8.5 && (
                                <span className="inline-flex items-center text-[10px] px-1.5 py-0.2 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-800 font-semibold" title="Academic Distinction">
                                  <Award className="w-3 h-3 mr-0.5 text-amber-500" />
                                  Top Scholar
                                </span>
                              )}
                            </div>

                            {/* 10th & 12th Marks */}
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              12th:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {twelfth ? `${twelfth}%` : 'N/A'}
                              </strong>
                              {' • '}
                              10th:{' '}
                              <strong className="text-slate-800 dark:text-slate-200">
                                {tenth ? `${tenth}%` : 'N/A'}
                              </strong>
                            </div>

                            {/* College & Degree */}
                            <p
                              className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[210px]"
                              title={`${college} (${degree})`}
                            >
                              {college} {gradYear ? `• '${String(gradYear).slice(-2)}` : ''}
                            </p>
                          </div>
                        </td>

                        {/* Experience & Role */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-xs block">
                              {expYears > 0 ? `${expYears} yrs exp` : 'Fresher (0 exp)'}
                            </span>
                            <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px]" title={role}>
                              {role}
                            </p>
                            {company && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center truncate max-w-[160px]" title={company}>
                                <Building2 className="w-2.5 h-2.5 mr-0.5 text-slate-400 shrink-0" />
                                <span>{company}</span>
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Core Skills vs Job */}
                        <td className="py-3.5 px-4 align-middle">
                          <div className="space-y-1.5 max-w-[230px]">
                            {/* Matched Required Skills */}
                            <div className="flex flex-wrap gap-1">
                              {matchedReq.slice(0, 3).map((sk) => (
                                <span
                                  key={sk}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                >
                                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
                                  {sk}
                                </span>
                              ))}

                              {/* Missing Required Skills Alert */}
                              {missingReq.slice(0, 1).map((sk) => (
                                <span
                                  key={sk}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                                  title={`Missing must-have skill: ${sk}`}
                                >
                                  <XCircle className="w-2.5 h-2.5 mr-0.5 text-rose-500" />
                                  Missing: {sk}
                                </span>
                              ))}
                            </div>

                            {/* Additional Skills */}
                            <div className="flex flex-wrap gap-1">
                              {candidateSkills
                                .filter((s) => !matchedReq.includes(s))
                                .slice(0, 3)
                                .map((sk) => (
                                  <span
                                    key={sk}
                                    className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                  >
                                    {sk}
                                  </span>
                                ))}
                              {candidateSkills.length > 5 && (
                                <span className="text-[10px] text-slate-400 font-mono self-center">
                                  +{candidateSkills.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Pipeline Stage Dropdown */}
                        <td className="py-3.5 px-4 align-middle">
                          <select
                            value={c.stage}
                            onChange={(e) => onStageChange(c.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs ${getStageBadge(
                              c.stage
                            )}`}
                          >
                            <option value="Applied" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">Applied</option>
                            <option value="Shortlisted" className="bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300">Shortlisted</option>
                            <option value="Interview" className="bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300">Interview</option>
                            <option value="Offer" className="bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300">Offer</option>
                            <option value="Rejected" className="bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300">Rejected</option>
                          </select>
                        </td>

                        {/* Action Review Button */}
                        <td className="py-3.5 px-4 text-right align-middle">
                          <button
                            type="button"
                            onClick={() => onSelectCandidate(c.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/60 dark:hover:text-blue-300 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all font-semibold cursor-pointer group-hover:border-blue-300"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- OPTION 2: STREAMLINED CARD GRID VIEW ----------------- */}
      {displayMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((item, index) => {
            const c = item.candidate;
            const ms = item.match_score;
            const isSelected = selectedIds.includes(c.id);
            const score = ms ? Math.round(ms.overall_score) : 0;
            const badge = getScoreBadge(score);

            const edu = c.education || c.academics || {};
            const cgpa = edu.cgpa;
            const twelfth = edu.twelfth_percentage;
            const tenth = edu.tenth_percentage;
            const college = edu.college || 'Engineering Institute';
            const gradYear = edu.graduation_year;
            const expYears = c.years_of_experience ?? c.experience_years ?? 0;
            const role = c.current_title || c.experience_history?.[0]?.role || (expYears > 0 ? 'Software Engineer' : 'Fresher / Graduate');
            const company = c.current_company || c.experience_history?.[0]?.company || '';

            const requiredSkills = activeJob?.required_skills || [];
            const candidateSkills = c.skills || [];
            const matchedReq = candidateSkills.filter((s) =>
              requiredSkills.some((rs) => rs.toLowerCase() === s.toLowerCase())
            );
            const missingReq = requiredSkills.filter(
              (rs) => !candidateSkills.some((s) => s.toLowerCase() === rs.toLowerCase())
            );

            return (
              <div
                key={c.id}
                className={`bg-white dark:bg-[#1E293B] border rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3.5 relative ${
                  isSelected
                    ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Card Top: Rank, Checkbox, Avatar, Name & Score */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(c.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-slate-400 font-mono font-bold text-xs">
                        #{index + 1}
                      </span>
                    </div>

                    <div
                      className={`px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold flex items-center space-x-1 ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{score}% Match</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarBg(
                        c.name
                      )} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <h3
                        onClick={() => onSelectCandidate(c.id)}
                        className="font-headline font-bold text-slate-900 dark:text-white hover:text-blue-600 cursor-pointer text-base truncate transition-colors"
                      >
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.email}</p>
                      <p className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-0.5 shrink-0" />
                        <span>{c.location || 'Remote'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Middle: Academics & Experience highlights */}
                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2.5 space-y-1.5 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                      <GraduationCap className="w-3.5 h-3.5 mr-1 text-blue-600" />
                      <span>{college}</span>
                    </span>
                    {cgpa !== null && cgpa !== undefined && (
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                        {cgpa} CGPA
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>12th: {twelfth ? `${twelfth}%` : 'N/A'} • 10th: {tenth ? `${tenth}%` : 'N/A'}</span>
                    {gradYear && <span>Batch {gradYear}</span>}
                  </div>

                  <div className="pt-1 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {role} {company ? `@ ${company}` : ''}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] shrink-0">
                      {expYears > 0 ? `${expYears}y exp` : 'Fresher'}
                    </span>
                  </div>
                </div>

                {/* Card Bottom: Skills Chips & Action Bar */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap gap-1">
                    {matchedReq.map((sk) => (
                      <span
                        key={sk}
                        className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                    {missingReq.slice(0, 1).map((sk) => (
                      <span
                        key={sk}
                        className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      >
                        ✕ {sk}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <select
                      value={c.stage}
                      onChange={(e) => onStageChange(c.id, e.target.value)}
                      className={`px-2 py-1 rounded-md text-xs font-semibold border cursor-pointer ${getStageBadge(
                        c.stage
                      )}`}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => onSelectCandidate(c.id)}
                      className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center space-x-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Review</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
