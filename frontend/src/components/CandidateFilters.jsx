import React, { useState } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  GraduationCap,
  Briefcase,
  Code2,
  MapPin,
  Kanban,
  List,
  Columns,
  Mail,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers
} from 'lucide-react';

const COMMON_SKILLS = [
  'React', 'Node.js', 'TypeScript', 'Python', 'Docker',
  'AWS', 'PostgreSQL', 'Kubernetes', 'FastAPI', 'Next.js',
  'Java', 'Tailwind CSS', 'Redis', 'CI/CD', 'Git'
];

const LOCATIONS = [
  'All', 'Bengaluru, India', 'Pune, India', 'Delhi, India',
  'Mumbai, India', 'Hyderabad, India', 'Chennai, India', 'Remote'
];

export default function CandidateFilters({
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
  viewMode = 'kanban',
  onViewModeChange,
  selectedCount = 0,
  onOpenCompare,
  onOpenEmail
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Toggle skills helper
  const toggleSkill = (skill) => {
    const current = filters.skills ? filters.skills.split(',').filter(Boolean) : [];
    let updated;
    if (current.includes(skill)) {
      updated = current.filter((s) => s !== skill);
    } else {
      updated = [...current, skill];
    }
    onFilterChange('skills', updated.join(','));
  };

  const selectedSkillsList = filters.skills ? filters.skills.split(',').filter(Boolean) : [];

  let activeFilterCount = 0;
  if (filters.search) activeFilterCount++;
  if (filters.skills) activeFilterCount++;
  if (filters.min_exp) activeFilterCount++;
  if (filters.min_cgpa) activeFilterCount++;
  if (filters.min_tenth) activeFilterCount++;
  if (filters.min_twelfth) activeFilterCount++;
  if (filters.min_grad_year) activeFilterCount++;
  if (filters.location && filters.location !== 'All') activeFilterCount++;
  if (filters.stage && filters.stage !== 'all') activeFilterCount++;
  if (filters.min_score) activeFilterCount++;

  return (
    <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 mb-6 shadow-xs space-y-3.5 transition-colors duration-150">
      {/* Top Filter Bar: Search + Cutoff Chips + View Toggle + Actions (Stitch Style) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Search Input with ⌘K */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="search"
            placeholder="Search skills, CGPA, college, candidate name..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] dark:placeholder:text-[#64748B] focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A8A] dark:focus:border-blue-500 focus:ring-1 focus:ring-[#1E3A8A] dark:focus:ring-blue-500 outline-none transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
            ⌘K
          </span>
        </div>

        {/* Cutoff Chips Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold text-[11px] flex items-center space-x-1 mr-0.5">
            <Filter className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
            <span>Cutoffs:</span>
          </span>

          {/* CGPA Threshold Chip */}
          <div
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs cursor-pointer transition-colors"
          >
            <span className="text-[#64748B] dark:text-[#94A3B8]">CGPA:</span>
            <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400">
              {filters.min_cgpa ? `≥ ${filters.min_cgpa}` : 'Any'}
            </span>
            <SlidersHorizontal className="w-3 h-3 text-[#94A3B8] ml-0.5" />
          </div>

          {/* 10th / 12th Cutoff Chip */}
          <div
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs cursor-pointer transition-colors"
          >
            <span className="text-[#64748B] dark:text-[#94A3B8]">10th / 12th:</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {filters.min_twelfth || filters.min_tenth ? `≥ ${filters.min_twelfth || filters.min_tenth}%` : 'Any'}
            </span>
          </div>

          {/* Experience Chip */}
          <div
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs cursor-pointer transition-colors"
          >
            <span className="text-[#64748B] dark:text-[#94A3B8]">Exp:</span>
            <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {filters.min_exp ? `≥ ${filters.min_exp} yrs` : 'Any (0+)'}
            </span>
          </div>

          {/* Location Chip */}
          <select
            value={filters.location || 'All'}
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-2.5 py-1 text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:outline-none cursor-pointer"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc} className="bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]">
                {loc === 'All' ? 'All Locations' : loc}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher & Action Buttons (Stitch MCP Style) */}
        <div className="flex items-center space-x-2 self-end xl:self-center">
          {/* View Mode Toggle: Pipeline vs Table */}
          <div className="bg-[#F1F5F9] dark:bg-[#0F172A] p-0.5 border border-[#E2E8F0] dark:border-[#334155] rounded-lg flex items-center">
            <button
              type="button"
              onClick={() => onViewModeChange('kanban')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Pipeline View</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1E3A8A] dark:bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Ranked Table</span>
            </button>
          </div>

          <span className="h-4 w-px bg-[#E2E8F0] dark:bg-[#334155]" />

          {/* Side-by-Side Compare CTA Button */}
          <button
            type="button"
            onClick={onOpenCompare}
            disabled={selectedCount < 2}
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCount >= 2
                ? 'bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-[#1E3A8A] dark:text-blue-300 shadow-2xs'
                : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155] cursor-not-allowed'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare ({selectedCount})</span>
          </button>

          {/* Bulk Email CTA Button */}
          <button
            type="button"
            onClick={onOpenEmail}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
            <span>Email</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline px-1 cursor-pointer"
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filter Sliders (Toggleable Drawer / Accordion) */}
      {showAdvanced && (
        <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155]">
          {/* CGPA Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
              <span>College CGPA Cutoff:</span>
              <span className="font-mono font-bold text-[#1E3A8A] dark:text-blue-400">
                {filters.min_cgpa ? `${filters.min_cgpa} / 10.0` : 'None'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={filters.min_cgpa || 0}
              onChange={(e) =>
                onFilterChange('min_cgpa', parseFloat(e.target.value) > 0 ? parseFloat(e.target.value) : null)
              }
              className="w-full accent-[#1E3A8A] dark:accent-blue-500 cursor-pointer"
            />
          </div>

          {/* 12th % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
              <span>12th (HSC) Cutoff %:</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {filters.min_twelfth ? `${filters.min_twelfth}%` : 'None'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={filters.min_twelfth || 0}
              onChange={(e) =>
                onFilterChange('min_twelfth', parseFloat(e.target.value) > 0 ? parseFloat(e.target.value) : null)
              }
              className="w-full accent-[#1E3A8A] dark:accent-blue-500 cursor-pointer"
            />
          </div>

          {/* 10th % Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
              <span>10th (SSC) Cutoff %:</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {filters.min_tenth ? `${filters.min_tenth}%` : 'None'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={filters.min_tenth || 0}
              onChange={(e) =>
                onFilterChange('min_tenth', parseFloat(e.target.value) > 0 ? parseFloat(e.target.value) : null)
              }
              className="w-full accent-[#1E3A8A] dark:accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Min AI Match Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
              <span>Min ATS Match Score:</span>
              <span className="font-mono font-bold text-[#047857] dark:text-emerald-400">
                {filters.min_score ? `${filters.min_score}%` : 'Any'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={filters.min_score || 0}
              onChange={(e) =>
                onFilterChange('min_score', parseFloat(e.target.value) > 0 ? parseFloat(e.target.value) : null)
              }
              className="w-full accent-[#047857] dark:accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Skills Multi-Select Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] mr-1 flex items-center space-x-1">
          <Code2 className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />
          <span>Tech Stack:</span>
        </span>
        {COMMON_SKILLS.map((sk) => {
          const isSelected = selectedSkillsList.includes(sk);
          return (
            <button
              key={sk}
              type="button"
              onClick={() => toggleSkill(sk)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-950/70 text-[#1E3A8A] dark:text-blue-300 border-blue-200 dark:border-blue-700 font-bold'
                  : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {sk}
            </button>
          );
        })}
      </div>
    </section>
  );
}
