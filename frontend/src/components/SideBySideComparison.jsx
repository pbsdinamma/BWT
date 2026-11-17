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
    if (score >= 80) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 65) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Match Score', 'CGPA', '12th %', '10th %', 'Experience (Yrs)', 'College', 'Stage'];
    const rows = candidates.map(({ candidate: c, score: s }) => [
      `"${c.name}"`,
      `"${c.email}"`,
      s?.overall_score || 0,
      c.education.cgpa || 'N/A',
      c.education.twelfth_percentage || 'N/A',
      c.education.tenth_percentage || 'N/A',
      c.years_of_experience,
      `"${c.education.college || ''}"`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer Header (Stitch MCP Style) */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-headline text-base font-bold text-white">
                Candidate Side-by-Side Match Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Benchmarking {candidates.length} candidates against role: <span className="text-blue-400 font-semibold">{job?.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Candidate Profile Summary Cards Grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(candidates.length, 4)} gap-4 pb-4 border-b border-slate-800`}>
            {candidates.map((item, idx) => {
              const c = item.candidate;
              const s = item.score;
              const overall = s ? s.overall_score : 0;

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-750 bg-slate-850 space-y-2 relative overflow-hidden"
                >
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                    Candidate {String.fromCharCode(65 + idx)}
                  </span>
                  <h3 className="font-headline text-base font-bold text-white">{c.name}</h3>
                  <p className="text-xs text-slate-400 truncate">{c.education.college || 'Engineering College'}</p>
                  <p className="text-xs text-slate-300 font-mono font-medium">{c.years_of_experience}y Experience</p>

                  <div className="pt-2 flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full border font-mono text-xs font-bold ${getScoreBadge(overall)}`}>
                      {overall}% JD Fit
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-medium">
                      {c.stage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Academic & Experience Cutoffs Benchmark Table (Stitch MCP Style) */}
          <div>
            <h4 className="font-headline text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Academic &amp; Experience Cutoff Benchmarks</span>
            </h4>

            <div className="border border-slate-800 rounded-xl overflow-hidden text-xs bg-slate-850">
              {/* Row: CGPA */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 border-b border-slate-800 items-center bg-slate-900/60`}>
                <span className="font-semibold text-slate-300">
                  College CGPA (Req: ≥ {job?.min_cgpa || 7.5})
                </span>
                {candidates.map(({ candidate: c }) => {
                  const pass = c.education.cgpa && (!job?.min_cgpa || c.education.cgpa >= job.min_cgpa);
                  return (
                    <span key={c.id} className={`font-mono font-bold ${pass ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {c.education.cgpa ? `${c.education.cgpa} / 10.0 ${pass ? '(Pass)' : '(Below)'}` : 'N/A'}
                    </span>
                  );
                })}
              </div>

              {/* Row: 12th % */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 border-b border-slate-800 items-center`}>
                <span className="font-semibold text-slate-300">
                  12th Grade % (Req: ≥ {job?.min_twelfth_percentage || 75}%)
                </span>
                {candidates.map(({ candidate: c }) => (
                  <span key={c.id} className="font-mono text-white font-bold">
                    {c.education.twelfth_percentage ? `${c.education.twelfth_percentage}%` : 'N/A'}
                  </span>
                ))}
              </div>

              {/* Row: 10th % */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 border-b border-slate-800 items-center bg-slate-900/60`}>
                <span className="font-semibold text-slate-300">
                  10th Grade % (Req: ≥ {job?.min_tenth_percentage || 75}%)
                </span>
                {candidates.map(({ candidate: c }) => (
                  <span key={c.id} className="font-mono text-slate-200">
                    {c.education.tenth_percentage ? `${c.education.tenth_percentage}%` : 'N/A'}
                  </span>
                ))}
              </div>

              {/* Row: Experience */}
              <div className={`grid grid-cols-${candidates.length + 1} p-3 items-center`}>
                <span className="font-semibold text-slate-300">
                  Total Experience (Req: ≥ {job?.min_experience || 2.0} yrs)
                </span>
                {candidates.map(({ candidate: c }) => (
                  <span key={c.id} className="font-mono font-bold text-blue-400">
                    {c.years_of_experience} Years
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Skill-Gap Insights Section (Stitch MCP Style) */}
          <div>
            <h4 className="font-headline text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>AI Skill-Gap &amp; Core Strengths Insights</span>
            </h4>

            <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(candidates.length, 3)} gap-3`}>
              {candidates.map(({ candidate: c, score: s }, idx) => {
                const missing = s ? s.missing_required_skills : [];
                const matched = s ? s.matched_required_skills : [];

                return (
                  <div key={c.id} className="space-y-2 p-3.5 bg-slate-850 rounded-xl border border-slate-750">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{c.name}</span>
                      <span className={`text-[11px] font-semibold flex items-center space-x-1 ${missing.length === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
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
                        <span key={sk} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
                          ✓ {sk}
                        </span>
                      ))}
                      {missing.map((sk) => (
                        <span key={sk} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                          ✕ {sk} (Gap)
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      {s?.ai_summary || `${c.name} scored ${s?.overall_score}% for ${job?.title}.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions (Stitch MCP Style) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">
            {candidates.length} Candidates selected for action
          </span>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-850 border border-slate-750 hover:bg-slate-800 rounded-lg text-slate-200 font-medium cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV Comparison</span>
            </button>
            <button
              type="button"
              onClick={handleAdvanceBoth}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-md shadow-blue-600/30 cursor-pointer transition-colors"
            >
              Advance All to Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
