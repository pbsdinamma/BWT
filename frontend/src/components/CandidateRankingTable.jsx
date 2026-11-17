import React from 'react';
import {
  Sparkles,
  MapPin,
  ChevronRight,
  AlertTriangle,
  Award,
  CheckSquare,
  Square
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
  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 65) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Shortlisted':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Interview':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'Offer':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Rejected':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-3">
      {/* Table Sorting Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Sort Ranked Profiles:
          </span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              onSortChange(sb, so);
            }}
            className="bg-slate-850 border border-slate-750 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
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

        <div className="text-slate-400">
          {selectedIds.length > 0 ? (
            <span className="text-blue-400 font-semibold">{selectedIds.length} candidate(s) selected for comparison</span>
          ) : (
            <span>Check boxes to select 2 to 4 candidates for Side-by-Side comparison</span>
          )}
        </div>
      </div>

      {/* Recruiter Ranked Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800 font-headline">
                <th className="py-3 px-3 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-3 px-3">Rank &amp; Score</th>
                <th className="py-3 px-4">Candidate Profile</th>
                <th className="py-3 px-4">Academic Record (CGPA / 12th / 10th)</th>
                <th className="py-3 px-4">Experience &amp; Role</th>
                <th className="py-3 px-4">Core Skills</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {candidates.map((item, index) => {
                const c = item.candidate;
                const ms = item.match_score;
                const isSelected = selectedIds.includes(c.id);
                const score = ms ? ms.overall_score : 0;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-850/60 transition-colors ${
                      isSelected ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    {/* Checkbox for side-by-side comparison */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(c.id)}
                        className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Rank & Score Pill */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500 font-mono font-bold text-xs w-4">
                          #{index + 1}
                        </span>
                        <div
                          className={`px-2.5 py-1 rounded-full border font-mono font-bold text-xs flex items-center space-x-1 ${getScoreBadge(
                            score
                          )}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{score}%</span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 pl-6">
                        {ms?.tier || 'Evaluated'}
                      </div>
                    </td>

                    {/* Candidate Name & Info */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            onClick={() => onSelectCandidate(c.id)}
                            className="font-headline font-bold text-white hover:text-blue-400 cursor-pointer text-sm transition-colors"
                          >
                            {c.name}
                          </span>
                          {c.is_duplicate && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40" title={c.duplicate_reasons?.join(', ')}>
                              <AlertTriangle className="w-3 h-3 mr-0.5" />
                              Dup
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-0.5">{c.email}</p>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5" />
                            {c.location || 'Remote'}
                          </span>
                          {c.education.graduation_year && (
                            <span>• Batch {c.education.graduation_year}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Academic Record Grid (Stitch MCP Style) */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-blue-400 text-xs">
                            CGPA: {c.education.cgpa !== null ? `${c.education.cgpa} / 10` : 'N/A'}
                          </span>
                          {c.education.cgpa >= 8.5 && (
                            <Award className="w-3.5 h-3.5 text-amber-400" title="High Academic Distinction" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          12th: <strong className="text-slate-200">{c.education.twelfth_percentage ? `${c.education.twelfth_percentage}%` : 'N/A'}</strong>
                          {' • '}
                          10th: <strong className="text-slate-200">{c.education.tenth_percentage ? `${c.education.tenth_percentage}%` : 'N/A'}</strong>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs" title={c.education.college}>
                          {c.education.college}
                        </p>
                      </div>
                    </td>

                    {/* Experience & Past Role */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-slate-200 block">
                          {c.years_of_experience} yrs exp
                        </span>
                        <p className="text-[11px] text-slate-400 truncate max-w-[170px]" title={c.experience_history?.[0]?.role}>
                          {c.experience_history?.[0]?.role || 'Software Engineer'}
                        </p>
                      </div>
                    </td>

                    {/* Skills Chips */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.skills.slice(0, 4).map((sk) => {
                          const isReq = activeJob?.required_skills?.some(
                            (rs) => rs.toLowerCase() === sk.toLowerCase()
                          );
                          return (
                            <span
                              key={sk}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                isReq
                                  ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold'
                                  : 'bg-slate-800 text-slate-300'
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                        {c.skills.length > 4 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{c.skills.length - 4}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stage Selector */}
                    <td className="py-3 px-4">
                      <select
                        value={c.stage}
                        onChange={(e) => onStageChange(c.id, e.target.value)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none ${getStageBadge(
                          c.stage
                        )}`}
                      >
                        <option value="Applied" className="bg-slate-900 text-slate-200">Applied</option>
                        <option value="Shortlisted" className="bg-slate-900 text-blue-300">Shortlisted</option>
                        <option value="Interview" className="bg-slate-900 text-purple-300">Interview</option>
                        <option value="Offer" className="bg-slate-900 text-emerald-300">Offer</option>
                        <option value="Rejected" className="bg-slate-900 text-rose-300">Rejected</option>
                      </select>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectCandidate(c.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition-all font-semibold cursor-pointer"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
