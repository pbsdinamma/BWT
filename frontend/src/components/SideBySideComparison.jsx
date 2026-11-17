import React from 'react';
import {
  X,
  Sparkles,
  Award,
  GraduationCap,
  Briefcase,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function SideBySideComparison({
  comparisonData,
  onClose,
  onStageChange,
  activeJob
}) {
  if (!comparisonData || !comparisonData.candidates) return null;

  const { candidates, skills_matrix, job } = comparisonData;

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (score >= 65) return 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Match Score', 'CGPA', '12th %', '10th %', 'Experience (Yrs)', 'College', 'Stage'];
    const rows = candidates.map(({ candidate: c, score: s }) => [
      `"${c.name}"`,
      `"${c.email}"`,
      s?.overall_score || 0,
      c.academics?.cgpa || 'N/A',
      c.academics?.twelfth_percentage || 'N/A',
      c.academics?.tenth_percentage || 'N/A',
      c.experience_years || 0,
      `"${c.academics?.college || ''}"`,
      c.stage
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Candidate_Comparison_${job?.id || 'Role'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAdvanceBoth = () => {
    candidates.forEach(({ candidate: c }) => {
      onStageChange(c.id, 'Interview');
    });
    alert(`Advanced ${candidates.length} candidates to Interview stage!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-body text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
        {/* Drawer Header (Stitch MCP Style) */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#1E293B]">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[#1E3A8A] dark:text-blue-300">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-headline text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Candidate Side-by-Side Match Matrix
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Benchmarking {candidates.length} candidates against role: <span className="text-[#1E3A8A] dark:text-blue-400 font-semibold">{job?.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] dark:hover:bg-[#334155] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs bg-[#F8FAFC] dark:bg-[#0F172A]">
          {/* Candidate Profile Summary Cards Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(candidates.length, 4)} gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#334155]`}>
            {candidates.map((item, idx) => {
              const c = item.candidate;
              const s = item.score;
              const overall = s ? Math.round(s.overall_score) : 0;

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] space-y-2 relative overflow-hidden shadow-2xs"
                >
                  <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] uppercase font-semibold block">
                    Candidate {String.fromCharCode(65 + idx)}
                  </span>
                  <h3 className="font-headline text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{c.name}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">{c.academics?.college || 'Engineering College'}</p>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] font-mono font-medium">{c.experience_years || 0}y Experience</p>

                  <div className="pt-2 flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full border font-mono text-xs font-bold ${getScoreBadge(overall)}`}>
                      {overall}% JD Fit
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] text-[11px] text-[#475569] dark:text-[#CBD5E1] font-medium">
                      {c.stage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic & Experience Cutoffs Benchmark Table (Stitch MCP Style) */}
          <div>
            <h4 className="font-headline text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-[#047857] dark:text-emerald-400" />
              <span>Academic &amp; Experience Cutoff Benchmarks</span>
            </h4>

            <div className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl overflow-hidden text-xs bg-white dark:bg-[#1E293B] shadow-2xs">
              {/* Row: CGPA */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 border-b border-[#E2E8F0] dark:border-[#334155] items-center bg-[#F8FAFC] dark:bg-[#0F172A]`}>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  College CGPA (Req: ≥ {job?.min_cgpa || 7.5})
                </span>
                {candidates.map(({ candidate: c }) => {
                  const pass = c.academics?.cgpa && (!job?.min_cgpa || c.academics.cgpa >= job.min_cgpa);
                  return (
                    <span key={c.id} className={`font-mono font-bold ${pass ? 'text-[#047857] dark:text-emerald-400' : 'text-[#B45309] dark:text-amber-400'}`}>
                      {c.academics?.cgpa ? `${c.academics.cgpa} / 10.0 ${pass ? '(Pass)' : '(Below)'}` : 'N/A'}
                    </span>
                  );
                })}
              </div>

              {/* Row: 12th % */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 border-b border-[#E2E8F0] dark:border-[#334155] items-center`}>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  12th Grade % (Req: ≥ {job?.min_twelfth_percentage || 75}%)
                </span>
                {candidates.map(({ candidate: c }) => (
                  <span key={c.id} className="font-mono text-[#0F172A] dark:text-[#F8FAFC] font-bold">
                    {c.academics?.twelfth_percentage ? `${c.academics.twelfth_percentage}%` : 'N/A'}
                  </span>
                ))}
              </div>

              {/* Row: 10th % */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 border-b border-[#E2E8F0] dark:border-[#334155] items-center bg-[#F8FAFC] dark:bg-[#0F172A]`}>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  10th Grade % (Req: ≥ {job?.min_tenth_percentage || 75}%)
                </span>
                {candidates.map(({ candidate: c }) => (
                  <span key={c.id} className="font-mono text-[#475569] dark:text-[#CBD5E1]">
                    {c.academics?.tenth_percentage ? `${c.academics.tenth_percentage}%` : 'N/A'}
                  </span>
                ))}
              </div>

              {/* Row: Experience */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 items-center`}>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Total Experience (Req: ≥ {job?.min_experience || 2.0} yrs)
                </span>
                {candidates.map(({ candidate: c }) => (
                  <span key={c.id} className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400">
                    {c.experience_years || 0} Years
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Skill-Gap Insights Section (Stitch MCP Style) */}
          <div>
            <h4 className="font-headline text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
              <span>AI Skill-Gap &amp; Core Strengths Insights</span>
            </h4>

            <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(candidates.length, 3)} gap-3`}>
              {candidates.map(({ candidate: c, score: s }, idx) => {
                const missing = s?.breakdown?.skills?.missing || s?.missing_required_skills || [];
                const matched = s?.breakdown?.skills?.matched || s?.matched_required_skills || c.skills?.slice(0, 4) || [];

                return (
                  <div key={c.id} className="space-y-2 p-3.5 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-xs">{c.name}</span>
                      <span className={`text-[11px] font-semibold flex items-center space-x-1 ${missing.length === 0 ? 'text-[#047857] dark:text-emerald-400' : 'text-[#B45309] dark:text-amber-400'}`}>
                        {missing.length === 0 ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>100% Core Met</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{missing.length} Gap(s)</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Matched skills */}
                    <div className="flex flex-wrap gap-1">
                      {matched.slice(0, 4).map((sk) => (
                        <span key={sk} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                      {missing.map((sk) => (
                        <span key={sk} className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-[#B45309] dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-medium">
                          ✕ {sk} (Gap)
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed pt-1">
                      {s?.ai_summary || `${c.name} scored ${Math.round(s?.overall_score || 85)}% fit for ${job?.title || 'the role'}.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions (Stitch MCP Style) */}
        <div className="p-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">
            {candidates.length} Candidates selected for action
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
              <span>Export CSV Comparison</span>
            </button>
            <button
              type="button"
              onClick={handleAdvanceBoth}
              className="px-3.5 py-1.5 bg-[#1E3A8A] dark:bg-blue-600 hover:bg-[#172554] dark:hover:bg-blue-500 text-white rounded-lg font-bold shadow-xs cursor-pointer transition-colors"
            >
              Advance All to Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
