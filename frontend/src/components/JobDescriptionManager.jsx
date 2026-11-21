import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Sparkles,
  GraduationCap,
  Users,
  MapPin,
  Clock,
  Layers,
  X,
  Save,
  RefreshCw,
  Sliders,
  Check,
  CheckSquare,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';

const STARTER_TEMPLATES = {
  fullstack: {
    title: 'Full-Stack Software Engineer',
    department: 'Engineering',
    location: 'Bengaluru, India',
    workplace_mode: 'Hybrid',
    employment_type: 'Full-Time',
    description: 'We are hiring a Full-Stack Software Engineer to build and scale modern web applications and microservices using React, Node.js, and cloud backends.\nRequirements:\n- Strong fundamentals of JavaScript/TypeScript, React, and Node.js\n- Hands-on experience with SQL/NoSQL databases and Docker\n- Experience building RESTful APIs and modern frontend architectures',
    min_experience: 2.0,
    max_experience: 5.0,
    min_cgpa: 7.0,
    min_tenth_percentage: 70.0,
    min_twelfth_percentage: 75.0,
    required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    preferred_skills: ['Next.js', 'AWS', 'GraphQL', 'Tailwind CSS', 'Redis']
  },
  uiux: {
    title: 'UI/ UX Designer',
    department: 'Design & Product',
    location: 'Bengaluru, India',
    workplace_mode: 'Hybrid',
    employment_type: 'Full-Time',
    description: 'We are hiring a UI/ UX Designer to improve the User Interface and user experience of our websites and mobile platforms.\nRequirements:\n- Strong fundamentals of UI / UX design and wireframing\n- Strong proficiency in modern design tools like Figma, Sketch, or Adobe XD\n- Ability to build responsive design systems and collaborate closely with engineering teams',
    min_experience: 1.0,
    max_experience: 4.0,
    min_cgpa: 6.5,
    min_tenth_percentage: 65.0,
    min_twelfth_percentage: 70.0,
    required_skills: ['Figma', 'UI/UX design', 'Wireframing', 'Design Systems'],
    preferred_skills: ['Prototyping', 'User Research', 'CSS', 'Adobe XD']
  },
  fresher: {
    title: 'Software Engineer (Campus Fresher / Graduate)',
    department: 'Early Career Hub',
    location: 'Bengaluru, India',
    workplace_mode: 'On-site',
    employment_type: 'Full-Time',
    description: 'We are hiring passionate early-career software engineering graduates. Candidates should demonstrate strong problem-solving fundamentals, core CS knowledge, and hands-on coding projects.\nRequirements:\n- Strong foundation in Data Structures, Algorithms, and OOP\n- Hands-on project portfolio in modern web or systems development\n- Strong academic performance',
    min_experience: 0.0,
    max_experience: 1.0,
    min_cgpa: 7.5,
    min_tenth_percentage: 75.0,
    min_twelfth_percentage: 80.0,
    required_skills: ['Data Structures and Algorithms', 'JavaScript', 'Python', 'Git', 'C++'],
    preferred_skills: ['React', 'SQL', 'Node.js', 'Linux']
  }
};

export default function JobDescriptionManager({
  jobs = [],
  activeJobId,
  initialMode = 'create', // 'create' | 'edit'
  onSelectActiveJob,
  onRefreshJobs
}) {
  const [mode, setMode] = useState(initialMode); // 'create' | 'edit'
  const [selectedJobId, setSelectedJobId] = useState(activeJobId || (jobs[0]?.job?.id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');

  // Initial Form Data State
  const defaultEmptyForm = {
    title: '',
    department: 'Engineering',
    location: 'Bengaluru, India',
    workplace_mode: 'Hybrid',
    employment_type: 'Full-Time',
    application_deadline: '2026-12-31',
    description: '',
    min_experience: 0.0,
    max_experience: 5.0,
    min_cgpa: 6.5,
    min_tenth_percentage: 70.0,
    min_twelfth_percentage: 75.0,
    required_skills: [],
    preferred_skills: []
  };

  const [formData, setFormData] = useState(defaultEmptyForm);

  // Weights (Dynamic Composite ATS Scoring Weights)
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 30,
    academics: 20,
    domain: 10
  });

  // Calculate real total weight
  const totalWeight = weights.skills + weights.experience + weights.academics + weights.domain;
  const isWeightBalanced = totalWeight === 100;

  // When switching modes or selected job changes in edit mode
  useEffect(() => {
    if (mode === 'edit') {
      const targetJobObj = jobs.find((j) => j.job.id === selectedJobId) || jobs[0];
      if (targetJobObj?.job) {
        const j = targetJobObj.job;
        setFormData({
          title: j.title || '',
          department: j.department || 'Engineering',
          location: j.location || 'Bengaluru, India',
          workplace_mode: j.workplace_mode || (j.location?.includes('Remote') ? 'Remote' : j.location?.includes('Hybrid') ? 'Hybrid' : 'On-site'),
          employment_type: j.employment_type || 'Full-Time',
          application_deadline: j.application_deadline || '2026-12-31',
          description: j.description || '',
          min_experience: j.min_experience !== undefined ? j.min_experience : 0.0,
          max_experience: j.max_experience !== undefined ? j.max_experience : 5.0,
          min_cgpa: j.min_cgpa !== undefined ? j.min_cgpa : 6.5,
          min_tenth_percentage: j.min_tenth_percentage !== undefined ? j.min_tenth_percentage : 70.0,
          min_twelfth_percentage: j.min_twelfth_percentage !== undefined ? j.min_twelfth_percentage : 75.0,
          required_skills: j.required_skills ? [...j.required_skills] : [],
          preferred_skills: j.preferred_skills ? [...j.preferred_skills] : []
        });

        if (j.scoring_weights) {
          setWeights({
            skills: Math.round(j.scoring_weights.skills || 40),
            experience: Math.round(j.scoring_weights.experience || 30),
            academics: Math.round(j.scoring_weights.academics || 20),
            domain: Math.round(j.scoring_weights.domain || 10)
          });
        }
      }
    } else {
      // In create mode, if form is completely empty, apply the fullstack starter template
      if (!formData.title) {
        applyTemplate('fullstack');
      }
    }
  }, [mode, selectedJobId, jobs]);

  const applyTemplate = (key) => {
    const tpl = STARTER_TEMPLATES[key];
    if (!tpl) return;
    setFormData({
      ...tpl,
      application_deadline: formData.application_deadline || '2026-12-31'
    });
  };

  // Skill Add / Remove Handlers
  const handleAddRequiredSkill = (e) => {
    e.preventDefault();
    if (!newRequiredSkill.trim()) return;
    const clean = newRequiredSkill.trim();
    if (!formData.required_skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, clean]
      }));
    }
    setNewRequiredSkill('');
  };

  const removeRequiredSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleAddPreferredSkill = (e) => {
    e.preventDefault();
    if (!newPreferredSkill.trim()) return;
    const clean = newPreferredSkill.trim();
    if (!formData.preferred_skills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setFormData((prev) => ({
        ...prev,
        preferred_skills: [...prev.preferred_skills, clean]
      }));
    }
    setNewPreferredSkill('');
  };

  const removePreferredSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      preferred_skills: prev.preferred_skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Weight Presets & Auto-Normalize
  const setWeightPreset = (skills, experience, academics, domain) => {
    setWeights({ skills, experience, academics, domain });
  };

  const handleAutoNormalize = () => {
    if (totalWeight <= 0) {
      setWeights({ skills: 40, experience: 30, academics: 20, domain: 10 });
      return;
    }
    // Proportional normalization to exactly 100
    const factor = 100 / totalWeight;
    const normSkills = Math.round(weights.skills * factor);
    const normExp = Math.round(weights.experience * factor);
    const normAcad = Math.round(weights.academics * factor);
    const normDomain = 100 - (normSkills + normExp + normAcad); // Absorb rounding delta into domain
    setWeights({
      skills: normSkills,
      experience: normExp,
      academics: normAcad,
      domain: Math.max(5, normDomain)
    });
  };

  // Form Submission: Create OR Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please provide a valid Job Title.');
      return;
    }

    if (!isWeightBalanced) {
      alert(`Scoring weights must total exactly 100% (currently ${totalWeight}%). Please click 'Auto-Balance to 100%' or adjust the sliders.`);
      return;
    }

    if (formData.required_skills.length === 0) {
      alert('Please add at least one Required Tech Skill (Must Have) to guide candidate matching.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        department: formData.department.trim(),
        location: formData.location.trim(),
        workplace_mode: formData.workplace_mode,
        employment_type: formData.employment_type,
        application_deadline: formData.application_deadline,
        description: formData.description.trim(),
        min_experience: parseFloat(formData.min_experience) || 0.0,
        max_experience: parseFloat(formData.max_experience) || null,
        min_cgpa: formData.min_cgpa ? parseFloat(formData.min_cgpa) : null,
        min_tenth_percentage: formData.min_tenth_percentage ? parseFloat(formData.min_tenth_percentage) : null,
        min_twelfth_percentage: formData.min_twelfth_percentage ? parseFloat(formData.min_twelfth_percentage) : null,
        required_skills: formData.required_skills,
        preferred_skills: formData.preferred_skills,
        scoring_weights: {
          skills: parseFloat(weights.skills),
          experience: parseFloat(weights.experience),
          academics: parseFloat(weights.academics),
          domain: parseFloat(weights.domain)
        }
      };

      if (mode === 'create') {
        // Explicit CREATE mode: POST /api/jobs adds a BRAND NEW job!
        const created = await api.createJob(payload);
        alert(`Job Opening "${payload.title}" successfully published and ready to receive candidate applications!`);
        if (onRefreshJobs) await onRefreshJobs();
      } else {
        // Explicit EDIT mode: PUT /api/jobs/{id} updates the selected job
        await api.updateJob(selectedJobId, payload);
        alert(`Job Opening "${payload.title}" criteria updated and re-indexed across candidate pool!`);
        if (onRefreshJobs) await onRefreshJobs();
      }
    } catch (err) {
      alert('Error saving job opening: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] font-body rounded-2xl border border-[#E2E8F0] dark:border-[#334155] overflow-hidden shadow-xs transition-colors duration-150">
      
      {/* 1. Header with Mode Selector Toggle */}
      <div className="bg-white dark:bg-[#1E293B] border-b border-[#E2E8F0] dark:border-[#334155] px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                mode === 'create'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}>
                {mode === 'create' ? <Plus className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                <span>{mode === 'create' ? 'Create New Job Opening' : 'Calibrate Active Opening'}</span>
              </span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
                {mode === 'create' ? 'Brand New Requisition' : `Editing: ${formData.title || 'Role'}`}
              </span>
            </div>
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              {mode === 'create' ? 'Post New Job Opening' : 'Job Description & Algorithm Calibration'}
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-0.5">
              {mode === 'create'
                ? 'Fill in position details, workplace mode, academic thresholds, and custom AI scoring weights for your new role.'
                : 'Fine-tune candidate scoring weights, update eligibility cutoffs, and calibrate skill vectors for this role.'}
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'create'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post New Job</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'edit'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Calibrate Existing ({jobs.length})</span>
              </button>
            </div>

            {/* In Edit mode, show Job Selector Dropdown */}
            {mode === 'edit' && jobs.length > 0 && (
              <div className="flex items-center bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl px-3 py-1.5 text-xs">
                <span className="text-[#64748B] dark:text-[#94A3B8] mr-2 font-medium">Select Job:</span>
                <select
                  value={selectedJobId}
                  onChange={(e) => {
                    setSelectedJobId(e.target.value);
                    if (onSelectActiveJob) onSelectActiveJob(e.target.value);
                  }}
                  className="bg-transparent font-semibold text-[#0F172A] dark:text-[#F8FAFC] border-none text-xs focus:ring-0 cursor-pointer"
                >
                  {jobs.map((j) => (
                    <option key={j.job.id} value={j.job.id} className="bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]">
                      {j.job.title} ({j.job.status || 'Active'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Starter Templates Pill Bar (When in Create Mode) */}
        {mode === 'create' && (
          <div className="mt-4 pt-3 border-t border-[#E2E8F0]/80 dark:border-[#334155] flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Autofill Starter Template:</span>
            </span>
            <button
              type="button"
              onClick={() => applyTemplate('fullstack')}
              className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0F172A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155] font-medium transition-colors cursor-pointer"
            >
              Full-Stack Engineer
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('uiux')}
              className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0F172A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155] font-medium transition-colors cursor-pointer"
            >
              UI / UX Designer
            </button>
            <button
              type="button"
              onClick={() => applyTemplate('fresher')}
              className="px-2.5 py-1 rounded-md bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[#0F172A] dark:text-[#F8FAFC] border border-[#CBD5E1] dark:border-[#334155] font-medium transition-colors cursor-pointer"
            >
              Campus Fresher / Graduate
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Form Grid: Left Position Details (7 cols) & Right Calibration Weights (5 cols) */}
      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">

        {/* LEFT COLUMN: Role Information & Skills (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Core Position Details */}
          <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Position & Workplace Information
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                {mode === 'create' ? 'NEW REQUISITION' : `ID: #${selectedJobId?.slice(0, 8)}`}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Row 1: Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. UI / UX Designer, Full-Stack Engineer"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1">
                    Department & Team
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Engineering, Design & Product"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Location, Workplace Mode & Employment Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Location */}
                <div>
                  <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Job Location</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, India / Remote"
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 outline-none"
                  />
                </div>

                {/* Workplace Mode */}
                <div>
                  <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1">
                    Workplace Mode
                  </label>
                  <select
                    value={formData.workplace_mode}
                    onChange={(e) => setFormData({ ...formData, workplace_mode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="Hybrid">Hybrid (In-Office + WFH)</option>
                    <option value="On-site">On-site (Office)</option>
                    <option value="Remote">Remote (Anywhere)</option>
                  </select>
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1">
                    Employment Type
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 outline-none cursor-pointer"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-Time">Part-Time</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Application Closing Deadline */}
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Application Closing Deadline</span>
                </label>
                <input
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="w-full sm:w-1/2 px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] text-xs font-medium focus:border-blue-600 outline-none font-mono"
                />
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block text-[#475569] dark:text-[#94A3B8] font-semibold mb-1">
                  Role Description & Candidate Requirements
                </label>
                <textarea
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline core responsibilities, qualifications, and project context..."
                  className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#0F172A] focus:border-blue-600 outline-none leading-relaxed font-sans"
                />
              </div>
            </div>
          </section>

          {/* Skill Clusters: Required vs Preferred */}
          <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
            <h3 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Target Skill Clusters & Keyword Extraction</span>
              </span>
              <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                {formData.required_skills.length} Required • {formData.preferred_skills.length} Nice-to-Have
              </span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* Required Skills (Must Have) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Required Tech Skills (Must Have)</span>
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Evaluated under 40% Skills Fit weight
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg min-h-[44px]">
                  {formData.required_skills.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px] self-center">
                      No required skills added yet. Type below to add must-have technologies.
                    </span>
                  ) : (
                    formData.required_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 rounded-md font-semibold text-xs shadow-2xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeRequiredSkill(skill)}
                          className="text-[#94A3B8] hover:text-rose-600 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add new required skill */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newRequiredSkill}
                    onChange={(e) => setNewRequiredSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequiredSkill(e);
                      }
                    }}
                    placeholder="Add required skill (e.g. Figma, React, Python)..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:border-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddRequiredSkill}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Must-Have
                  </button>
                </div>
              </div>

              {/* Preferred / Nice-to-Have Skills */}
              <div className="pt-2 border-t border-[#E2E8F0]/70 dark:border-[#334155]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#475569] dark:text-[#94A3B8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Nice-to-Have / Complementary Skills</span>
                  </span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Acts as positive bonus credit
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg min-h-[44px]">
                  {formData.preferred_skills.length === 0 ? (
                    <span className="text-slate-400 italic text-[11px] self-center">
                      No optional bonus skills defined yet.
                    </span>
                  ) : (
                    formData.preferred_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] rounded-md text-xs"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removePreferredSkill(skill)}
                          className="text-[#94A3B8] hover:text-rose-600 ml-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add new preferred skill */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newPreferredSkill}
                    onChange={(e) => setNewPreferredSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddPreferredSkill(e);
                      }
                    }}
                    placeholder="Add nice-to-have skill (e.g. AWS, Next.js, Redis)..."
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:border-blue-600 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPreferredSkill}
                    className="px-3 py-1.5 bg-[#F1F5F9] dark:bg-[#334155] hover:bg-[#E2E8F0] text-[#0F172A] dark:text-[#F8FAFC] border border-[#E2E8F0] dark:border-[#334155] rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Nice-To-Have
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Match Calibration & Hard Cutoff Thresholds (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Scoring Weight Calibration Sliders with 100% Total Enforcement */}
          <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0] dark:border-[#334155]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Scoring Algorithm Weights
                </h2>
              </div>

              {/* Dynamic Total Badge */}
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-bold transition-all ${
                  isWeightBalanced
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 animate-pulse'
                }`}
              >
                {isWeightBalanced ? '✓ Total: 100%' : `⚠ Total: ${totalWeight}% (Must be 100%)`}
              </span>
            </div>

            {/* Warning & Auto-Normalize Helper */}
            {!isWeightBalanced && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Weights currently sum to <strong>{totalWeight}%</strong>.</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoNormalize}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Auto-Balance
                </button>
              </div>
            )}

            {/* Quick Strategy Presets */}
            <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-[#64748B] dark:text-[#94A3B8] font-medium mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => setWeightPreset(40, 30, 20, 10)}
                className="px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-[#E2E8F0] dark:border-[#334155] font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
              >
                Balanced (40/30/20/10)
              </button>
              <button
                type="button"
                onClick={() => setWeightPreset(50, 25, 15, 10)}
                className="px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-[#E2E8F0] dark:border-[#334155] font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
              >
                Skills-Heavy (50/25/15/10)
              </button>
              <button
                type="button"
                onClick={() => setWeightPreset(30, 15, 40, 15)}
                className="px-2 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-blue-50 dark:hover:bg-blue-950/60 border border-[#E2E8F0] dark:border-[#334155] font-semibold text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
              >
                Campus / Fresher (30/15/40/15)
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Skills Overlap */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Skills Overlap Weight</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: parseInt(e.target.value) || 0 })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Experience Relevancy */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Experience Relevancy Weight</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: parseInt(e.target.value) || 0 })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Academic Performance */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Academic Performance (CGPA / 10th / 12th)</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{weights.academics}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={weights.academics}
                  onChange={(e) => setWeights({ ...weights, academics: parseInt(e.target.value) || 0 })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Domain & Background */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Domain & Semantic Fit</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{weights.domain}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.domain}
                  onChange={(e) => setWeights({ ...weights, domain: parseInt(e.target.value) || 0 })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Hard Cutoffs / Eligibility Gates */}
          <section className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-5 shadow-xs">
            <h3 className="font-headline text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Hard Eligibility Thresholds (Pre-Filter Gates)</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* College CGPA */}
              <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                <div>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">Minimum College CGPA Cutoff</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Reject / Deprioritize below cutoff</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="10"
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                    className="w-16 px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded text-right font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">/10.0</span>
                </div>
              </div>

              {/* 10th Board Score */}
              <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                <div>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">Minimum 10th Board Score</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Secondary school percentage cutoff</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="40"
                    max="100"
                    value={formData.min_tenth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_tenth_percentage: e.target.value })}
                    className="w-16 px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded text-right font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">%</span>
                </div>
              </div>

              {/* 12th Board Score */}
              <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                <div>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">Minimum 12th Board Score</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Class XII / Intermediate percentage</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="40"
                    max="100"
                    value={formData.min_twelfth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_twelfth_percentage: e.target.value })}
                    className="w-16 px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded text-right font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">%</span>
                </div>
              </div>

              {/* Experience Range: Min & Max */}
              <div className="p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block">Target Experience Range</span>
                  <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Years of experience</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] w-8">Min:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="15"
                      value={formData.min_experience}
                      onChange={(e) => setFormData({ ...formData, min_experience: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded text-right font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                    <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">Yrs</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] w-8">Max:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={formData.max_experience}
                      onChange={(e) => setFormData({ ...formData, max_experience: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded text-right font-mono font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                    <span className="font-mono text-[#64748B] dark:text-[#94A3B8]">Yrs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Submit Button */}
            <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#334155]">
              <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-3 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  mode === 'create'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{mode === 'create' ? 'Creating Job Opening...' : 'Re-Indexing Candidate Pool...'}</span>
                  </>
                ) : (
                  <>
                    {mode === 'create' ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{mode === 'create' ? 'Publish & Create New Job Opening' : 'Save Changes & Re-Index Resumes'}</span>
                  </>
                )}
              </button>
            </div>
          </section>

        </div>

      </form>

    </div>
  );
}
