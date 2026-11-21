import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  GraduationCap,
  Briefcase,
  Code2,
  MapPin,
  Columns,
  Mail,
  ChevronDown,
  Sparkles,
  Check,
  Plus,
  RotateCcw
} from 'lucide-react';

const LOCATIONS = [
  'All',
  'Bengaluru, India',
  'Pune, India',
  'Delhi, India',
  'Mumbai, India',
  'Hyderabad, India',
  'Chennai, India',
  'Remote'
];

const DEFAULT_DEV_SKILLS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'TypeScript',
  'Git', 'C++', 'Java', 'Docker', 'AWS', 'SQL'
];

const DEFAULT_DESIGN_SKILLS = [
  'Figma', 'UI/UX design', 'Wireframing', 'Prototyping',
  'User Research', 'Design Systems', 'Adobe XD', 'CSS3'
];

export default function CandidateFilters({
  activeJob,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0,
  selectedCount = 0,
  onOpenCompare,
  onOpenEmail
}) {
  // Popover state
  const [openDropdown, setOpenDropdown] = useState(null); // 'academics' | 'exp' | 'location' | 'score'
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showCustomSkillInput, setShowCustomSkillInput] = useState(false);
  const containerRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute active skills
  const selectedSkillsList = useMemo(() => {
    return filters.skills ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  }, [filters.skills]);

  // Derive relevant skills dynamically based on activeJob
  const relevantSkills = useMemo(() => {
    const skillsSet = new Set();

    // 1. Add required and nice-to-have skills from the active job
    if (activeJob) {
      if (Array.isArray(activeJob.required_skills)) {
        activeJob.required_skills.forEach((s) => s && skillsSet.add(s.trim()));
      }
      if (Array.isArray(activeJob.nice_to_have_skills)) {
        activeJob.nice_to_have_skills.forEach((s) => s && skillsSet.add(s.trim()));
      }
    }

    // 2. Fallbacks based on title
    const titleLower = (activeJob?.title || '').toLowerCase();
    if (titleLower.includes('design') || titleLower.includes('ui') || titleLower.includes('ux')) {
      DEFAULT_DESIGN_SKILLS.forEach((s) => skillsSet.add(s));
    } else {
      DEFAULT_DEV_SKILLS.forEach((s) => skillsSet.add(s));
    }

    // 3. Make sure any currently selected skill is in the visible list so the user can see it
    selectedSkillsList.forEach((s) => skillsSet.add(s));

    return Array.from(skillsSet);
  }, [activeJob, selectedSkillsList]);

  // Toggle skills helper
  const toggleSkill = (skill) => {
    const current = [...selectedSkillsList];
    const skillNorm = skill.trim();
    const idx = current.findIndex((s) => s.toLowerCase() === skillNorm.toLowerCase());
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(skillNorm);
    }
    onFilterChange('skills', current.join(','));
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const skillNorm = customSkillInput.trim();
    if (!selectedSkillsList.some((s) => s.toLowerCase() === skillNorm.toLowerCase())) {
      const updated = [...selectedSkillsList, skillNorm];
      onFilterChange('skills', updated.join(','));
    }
    setCustomSkillInput('');
    setShowCustomSkillInput(false);
  };

  // Active filter count
  let activeFilterCount = 0;
  if (filters.search) activeFilterCount++;
  if (selectedSkillsList.length > 0) activeFilterCount += selectedSkillsList.length;
  if (filters.min_exp !== null && filters.min_exp !== undefined && filters.min_exp !== '') activeFilterCount++;
  if (filters.min_cgpa) activeFilterCount++;
  if (filters.min_tenth) activeFilterCount++;
  if (filters.min_twelfth) activeFilterCount++;
  if (filters.location && filters.location !== 'All') activeFilterCount++;
  if (filters.min_score) activeFilterCount++;

  const hasAcademicsFilter = Boolean(filters.min_cgpa || filters.min_tenth || filters.min_twelfth);

  return (
    <section
      ref={containerRef}
      className="bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-800 rounded-xl p-3.5 mb-5 shadow-xs font-body transition-colors"
    >
      {/* ----------------- TOP ROW: SEARCH + FILTER PILLS + ACTION BUTTONS ----------------- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
        
        {/* Left Side: Search + Dropdown Controls */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          
          {/* Refined Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate, skill, college..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="w-full h-9 pl-9 pr-14 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 outline-none transition-all"
            />
            {filters.search ? (
              <button
                type="button"
                onClick={() => onFilterChange('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-400">
                ⌘K
              </span>
            )}
          </div>

          {/* 1. Academics Cutoffs Popover Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'academics' ? null : 'academics')}
              className={`h-9 inline-flex items-center space-x-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                hasAcademicsFilter
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${hasAcademicsFilter ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>
                {filters.min_cgpa
                  ? `CGPA ≥ ${filters.min_cgpa}`
                  : filters.min_twelfth
                  ? `12th ≥ ${filters.min_twelfth}%`
                  : 'Academics'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {/* Academics Popover */}
            {openDropdown === 'academics' && (
              <div className="absolute left-0 mt-2 w-72 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 text-xs space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Academic Cutoff Gates
                  </span>
                  {hasAcademicsFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        onFilterChange('min_cgpa', null);
                        onFilterChange('min_tenth', null);
                        onFilterChange('min_twelfth', null);
                      }}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* CGPA */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Minimum College CGPA:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {filters.min_cgpa ? `${filters.min_cgpa} / 10.0` : 'Any'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {[null, 6.0, 7.0, 8.0, 8.5].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => onFilterChange('min_cgpa', val)}
                        className={`py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                          filters.min_cgpa === val
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {val === null ? 'Any' : `${val}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 12th Board */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-medium">12th (HSC) Board Cutoff:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {filters.min_twelfth ? `${filters.min_twelfth}%` : 'Any'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[null, 70, 80, 90].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => onFilterChange('min_twelfth', val)}
                        className={`py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                          filters.min_twelfth === val
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {val === null ? 'Any' : `${val}%+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10th Board */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-medium">10th (SSC) Board Cutoff:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {filters.min_tenth ? `${filters.min_tenth}%` : 'Any'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 pt-1">
                    {[null, 70, 80, 90].map((val) => (
                      <button
                        key={String(val)}
                        type="button"
                        onClick={() => onFilterChange('min_tenth', val)}
                        className={`py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                          filters.min_tenth === val
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {val === null ? 'Any' : `${val}%+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(null)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Experience Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'exp' ? null : 'exp')}
              className={`h-9 inline-flex items-center space-x-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                filters.min_exp !== null && filters.min_exp !== undefined && filters.min_exp !== ''
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Briefcase className={`w-3.5 h-3.5 ${filters.min_exp ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span>
                {filters.min_exp !== null && filters.min_exp !== undefined && filters.min_exp !== ''
                  ? filters.min_exp === 0
                    ? 'Fresher (0 exp)'
                    : `Exp: ≥ ${filters.min_exp} yrs`
                  : 'Experience: Any'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {openDropdown === 'exp' && (
              <div className="absolute left-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 text-xs animate-in fade-in duration-150">
                {[
                  { label: 'Any Experience', value: null },
                  { label: 'Fresher / Campus (0 yrs)', value: 0 },
                  { label: '≥ 1 Year Experience', value: 1 },
                  { label: '≥ 2 Years Experience', value: 2 },
                  { label: '≥ 3 Years Experience', value: 3 },
                  { label: '≥ 5+ Years Experience', value: 5 }
                ].map((item) => (
                  <button
                    key={String(item.value)}
                    type="button"
                    onClick={() => {
                      onFilterChange('min_exp', item.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 text-left font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      filters.min_exp === item.value
                        ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {filters.min_exp === item.value && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Location Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'location' ? null : 'location')}
              className={`h-9 inline-flex items-center space-x-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                filters.location && filters.location !== 'All'
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${filters.location && filters.location !== 'All' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
              <span className="max-w-[130px] truncate">
                {filters.location && filters.location !== 'All' ? filters.location : 'All Locations'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {openDropdown === 'location' && (
              <div className="absolute left-0 mt-2 w-52 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 text-xs max-h-60 overflow-y-auto animate-in fade-in duration-150">
                {LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => {
                      onFilterChange('location', loc);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 text-left font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      (filters.location || 'All') === loc
                        ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{loc === 'All' ? 'All Locations' : loc}</span>
                    {(filters.location || 'All') === loc && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Min Match Score Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'score' ? null : 'score')}
              className={`h-9 inline-flex items-center space-x-1.5 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                filters.min_score
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${filters.min_score ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{filters.min_score ? `Score ≥ ${filters.min_score}%` : 'Match Score'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
            </button>

            {openDropdown === 'score' && (
              <div className="absolute left-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 text-xs animate-in fade-in duration-150">
                {[
                  { label: 'Any Match Score', value: null },
                  { label: '≥ 50% (Moderate+)', value: 50 },
                  { label: '≥ 70% (Strong Match)', value: 70 },
                  { label: '≥ 80% (High Alignment)', value: 80 },
                  { label: '≥ 90% (Top Fit)', value: 90 }
                ].map((item) => (
                  <button
                    key={String(item.value)}
                    type="button"
                    onClick={() => {
                      onFilterChange('min_score', item.value);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-1.5 text-left font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      filters.min_score === item.value
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.label}</span>
                    {filters.min_score === item.value && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear All Filters Button */}
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="h-9 inline-flex items-center space-x-1 px-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset ({activeFilterCount})</span>
            </button>
          )}

        </div>

        {/* Right Side Action Buttons: Side-by-Side Compare & Email Outreach */}
        <div className="flex items-center space-x-2 self-end lg:self-center">
          
          {/* Side-by-Side Compare CTA Button */}
          <button
            type="button"
            onClick={onOpenCompare}
            disabled={selectedCount < 2}
            className={`h-9 inline-flex items-center space-x-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCount >= 2
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold border border-blue-600'
                : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
            }`}
            title={selectedCount < 2 ? 'Select at least 2 candidates using table checkboxes to compare side-by-side' : 'Open detailed side-by-side comparison modal'}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Compare {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
          </button>

          {/* Bulk Email CTA Button */}
          <button
            type="button"
            onClick={onOpenEmail}
            className="h-9 inline-flex items-center space-x-1.5 px-3.5 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Email</span>
          </button>

        </div>
      </div>

      {/* ----------------- SECOND ROW: CONTEXTUAL ROLE SKILLS ----------------- */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-1.5">
        <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs font-semibold mr-1 shrink-0">
          <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{activeJob?.title ? `${activeJob.title} Skills:` : 'Skills:'}</span>
        </div>

        {/* Dynamic Skill Chips */}
        {relevantSkills.map((sk) => {
          const isSelected = selectedSkillsList.some((s) => s.toLowerCase() === sk.toLowerCase());
          return (
            <button
              key={sk}
              type="button"
              onClick={() => toggleSkill(sk)}
              className={`h-6.5 px-2.5 rounded-md text-[11px] font-medium border transition-all cursor-pointer flex items-center space-x-1 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <span>{sk}</span>
              {isSelected && <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100" />}
            </button>
          );
        })}

        {/* Quick Add Custom Skill */}
        {showCustomSkillInput ? (
          <form onSubmit={handleAddCustomSkill} className="inline-flex items-center">
            <input
              type="text"
              autoFocus
              placeholder="e.g. Docker, Figma..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              onBlur={() => {
                if (!customSkillInput.trim()) setShowCustomSkillInput(false);
              }}
              className="h-6.5 px-2 w-28 bg-white dark:bg-slate-900 border border-blue-500 rounded-md text-[11px] text-slate-900 dark:text-slate-100 outline-none"
            />
            <button
              type="submit"
              className="h-6.5 px-1.5 bg-blue-600 text-white text-[10px] rounded-r-md font-bold hover:bg-blue-700"
            >
              Add
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCustomSkillInput(true)}
            className="h-6.5 px-2 rounded-md text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-dashed border-blue-300 dark:border-blue-700 transition-colors inline-flex items-center space-x-0.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Filter by Skill</span>
          </button>
        )}
      </div>
    </section>
  );
}
