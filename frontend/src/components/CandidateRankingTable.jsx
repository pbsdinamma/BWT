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
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (score >= 65) return 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  const getStageBadge = (stage) => {
    switch (stage) {
      case 'Shortlisted':
        return 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Interview':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Offer':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Rejected':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-[#F1F5F9] dark:bg-[#334155] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]';
    }
  };

  return (
    <div className="space-y-3 font-body transition-colors duration-150">
      {/* Table Sorting Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] p-3 rounded-xl text-xs shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider text-[11px]">
            Sort Ranked Profiles:
          </span>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              onSortChange(sb, so);
            }}
            className="bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg px-2.5 py-1 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#1E3A8A] dark:focus:border-blue-500 cursor-pointer"
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

        <div className="text-[#64748B] dark:text-[#94A3B8]">
          {selectedIds.length > 0 ? (
            <span className="text-[#1E3A8A] dark:text-blue-400 font-semibold">{selectedIds.length} candidate(s) selected for comparison</span>
          ) : (
            <span>Check boxes to select 2 to 4 candidates for Side-by-Side comparison</span>
          )}
        </div>
      </div>

      {/* Recruiter Ranked Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-[11px] border-b border-[#E2E8F0] dark:border-[#334155] font-headline">
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
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
              {candidates.map((item, index) => {
                const c = item.candidate;
                const ms = item.match_score;
                const isSelected = selectedIds.includes(c.id);
                const score = ms ? Math.round(ms.overall_score) : 0;

                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50 transition-colors ${
                      isSelected ? 'bg-blue-50/50 dark:bg-blue-950/30' : ''
                    }`}
                  >
                    {/* Checkbox for side-by-side comparison */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(c.id)}
                        className="text-[#94A3B8] hover:text-[#1E3A8A] dark:hover:text-blue-400 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#1E3A8A] dark:text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Rank & Score Pill */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#94A3B8] font-mono font-bold text-xs w-4">
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
                      <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-1 pl-6">
                        {score >= 85 ? 'Top Match' : 'Evaluated'}
                      </div>
                    </td>

                    {/* Candidate Name & Info */}
                    <td className="py-3 px-4">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span
                            onClick={() => onSelectCandidate(c.id)}
                            className="font-headline font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#1E3A8A] dark:hover:text-blue-400 cursor-pointer text-sm transition-colors"
                          >
                            {c.name}
                          </span>
                          {c.is_duplicate && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-amber-200 dark:border-amber-700/60" title={c.duplicate_reasons?.join(', ')}>
                              <AlertTriangle className="w-3 h-3 mr-0.5" />
                              Dup
                            </span>
                          )}
                        </div>
                        <p className="text-[#64748B] dark:text-[#94A3B8] text-xs mt-0.5">{c.email}</p>
                        <div className="flex items-center space-x-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-[#94A3B8]" />
                            {c.location || 'Remote'}
                          </span>
                          {c.academics?.graduation_year && (
                            <span>• Batch {c.academics.graduation_year}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Academic Record Grid */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400 text-xs">
                            CGPA: {c.academics?.cgpa !== null && c.academics?.cgpa !== undefined ? `${c.academics.cgpa} / 10` : 'N/A'}
                          </span>
                          {c.academics?.cgpa >= 8.5 && (
                            <Award className="w-3.5 h-3.5 text-amber-500" title="High Academic Distinction" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">
                          12th: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{c.academics?.twelfth_percentage ? `${c.academics.twelfth_percentage}%` : 'N/A'}</strong>
                          {' • '}
                          10th: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{c.academics?.tenth_percentage ? `${c.academics.tenth_percentage}%` : 'N/A'}</strong>
                        </div>
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-xs" title={c.academics?.college}>
                          {c.academics?.college}
                        </p>
                      </div>
                    </td>

                    {/* Experience & Past Role */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] block">
                          {c.experience_years || 0} yrs exp
                        </span>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[170px]" title={c.current_title}>
                          {c.current_title || 'Software Engineer'}
                        </p>
                      </div>
                    </td>

                    {/* Skills Chips */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.skills?.slice(0, 4).map((sk) => {
                          const isReq = activeJob?.required_skills?.some(
                            (rs) => rs.toLowerCase() === sk.toLowerCase()
                          );
                          return (
                            <span
                              key={sk}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                isReq
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold'
                                  : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#334155] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                              }`}
                            >
                              {sk}
                            </span>
                          );
                        })}
                        {c.skills?.length > 4 && (
                          <span className="text-[10px] text-[#94A3B8] self-center">
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
                        <option value="Applied" className="bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]">Applied</option>
                        <option value="Shortlisted" className="bg-white dark:bg-[#1E293B] text-[#1E3A8A] dark:text-blue-300">Shortlisted</option>
                        <option value="Interview" className="bg-white dark:bg-[#1E293B] text-purple-700 dark:text-purple-300">Interview</option>
                        <option value="Offer" className="bg-white dark:bg-[#1E293B] text-[#047857] dark:text-emerald-300">Offer</option>
                        <option value="Rejected" className="bg-white dark:bg-[#1E293B] text-rose-700 dark:text-rose-300">Rejected</option>
                      </select>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectCandidate(c.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#1E3A8A] dark:text-blue-400 border border-[#E2E8F0] dark:border-[#334155] transition-all font-semibold cursor-pointer"
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
