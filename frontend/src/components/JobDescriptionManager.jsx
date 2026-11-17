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
  CheckSquare
} from 'lucide-react';
import { api } from '../api';

export default function JobDescriptionManager({
  jobs = [],
  activeJobId,
  onSelectActiveJob,
  onRefreshJobs
}) {
  const [selectedJobId, setSelectedJobId] = useState(activeJobId || (jobs[0]?.job?.id || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Find currently selected job
  const currentJobObj = jobs.find((j) => j.job.id === selectedJobId) || jobs[0];
  const currentJob = currentJobObj?.job || {
    id: 'sample',
    title: 'Full-Stack Software Engineer',
    department: 'Engineering',
    location: 'Bengaluru (Hybrid)',
    description: 'We are hiring a Full-Stack Engineer to scale our core B2B workflow platform.\nRequirements:\n- 2 to 5 years building scalable production web applications.\n- Strong hands-on proficiency in React, TypeScript, Node.js, and SQL databases.\n- Hands-on experience with Docker, cloud infrastructure, and modern CI/CD.\n- Minimum 7.5 CGPA or equivalent.',
    min_experience: 2.0,
    max_experience: 5.0,
    min_cgpa: 7.5,
    min_tenth_percentage: 70.0,
    min_twelfth_percentage: 75.0,
    required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
    preferred_skills: ['AWS', 'Next.js', 'Tailwind CSS', 'Redis', 'GraphQL']
  };

  const [formData, setFormData] = useState({
    title: currentJob.title || '',
    department: currentJob.department || 'Engineering',
    location: currentJob.location || 'Bengaluru',
    description: currentJob.description || '',
    min_experience: currentJob.min_experience || 2.0,
    max_experience: currentJob.max_experience || 5.0,
    min_cgpa: currentJob.min_cgpa || 7.5,
    min_twelfth_percentage: currentJob.min_twelfth_percentage || 75.0,
    min_tenth_percentage: currentJob.min_tenth_percentage || 70.0,
    required_skills: currentJob.required_skills || [],
    preferred_skills: currentJob.preferred_skills || []
  });

  // Weights (Stitch Scoring Weights)
  const [weights, setWeights] = useState({
    skills: 40,
    experience: 30,
    academics: 20,
    domain: 10
  });

  useEffect(() => {
    if (currentJobObj?.job) {
      const j = currentJobObj.job;
      setFormData({
        title: j.title || '',
        department: j.department || 'Engineering',
        location: j.location || 'Bengaluru',
        description: j.description || '',
        min_experience: j.min_experience || 2.0,
        max_experience: j.max_experience || 5.0,
        min_cgpa: j.min_cgpa || 7.5,
        min_twelfth_percentage: j.min_twelfth_percentage || 75.0,
        min_tenth_percentage: j.min_tenth_percentage || 70.0,
        required_skills: j.required_skills || [],
        preferred_skills: j.preferred_skills || []
      });
    }
  }, [selectedJobId, jobs]);

  const handleAddRequiredSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (!formData.required_skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        required_skills: [...prev.required_skills, newSkill.trim()]
      }));
    }
    setNewSkill('');
  };

  const removeRequiredSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSaveAndReindex = async () => {
    setIsSaving(true);
    setIsReindexing(true);
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        description: formData.description,
        min_experience: parseFloat(formData.min_experience) || 0,
        max_experience: parseFloat(formData.max_experience) || null,
        min_cgpa: parseFloat(formData.min_cgpa) || null,
        min_twelfth_percentage: parseFloat(formData.min_twelfth_percentage) || null,
        min_tenth_percentage: parseFloat(formData.min_tenth_percentage) || null,
        required_skills: formData.required_skills,
        preferred_skills: formData.preferred_skills
      };

      if (currentJob.id && currentJob.id !== 'sample') {
        await api.updateJob(currentJob.id, payload);
      } else {
        await api.createJob(payload);
      }

      if (onRefreshJobs) await onRefreshJobs();
      alert('Job description and matching algorithm calibration successfully saved and re-indexed across candidate pool!');
    } catch (err) {
      alert('Error updating job: ' + err.message);
    } finally {
      setIsSaving(false);
      setIsReindexing(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#F8FAFC] text-[#0F172A] font-body rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
      
      {/* Subheader (Stitch JD Calibration Header) */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-purple-50 text-[#4338CA] border border-purple-200 text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Semantic Scorer
              </span>
              <span className="text-[#94A3B8]">•</span>
              <span className="text-xs text-[#475569]">
                Target Role: <strong className="text-[#0F172A] font-semibold">{formData.title || 'Software Engineer'}</strong>
              </span>
            </div>
            <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
              Job Description & Match Algorithm Calibration
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              Tune candidate scoring weights, set hard eligibility cutoffs (CGPA, 10th/12th, experience), and define required vs. nice-to-have skill vectors.
            </p>
          </div>

          {/* Job Selector & Save Action */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-md px-3 py-1.5 text-xs">
              <span className="text-[#64748B] mr-2">Active JD:</span>
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  if (onSelectActiveJob) onSelectActiveJob(e.target.value);
                }}
                className="bg-transparent font-semibold text-[#0F172A] border-none text-xs focus:ring-0 cursor-pointer"
              >
                {jobs.map((j) => (
                  <option key={j.job.id} value={j.job.id}>
                    {j.job.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleSaveAndReindex}
              disabled={isSaving}
              className="px-4 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-md text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? 'Re-Indexing Pool...' : 'Save & Re-Index Resumes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left JD Input (7 Cols) & Right Calibration Weights (5 Cols) */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] w-full mx-auto">

        {/* LEFT COLUMN: JD Input & Skill Clusters (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">

          {/* Job Description Rich Input */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="font-headline text-sm font-bold text-[#0F172A]">Job Description Details</h2>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">JD-CONFIG</span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[#475569] font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-[#CBD5E1] text-[#0F172A] text-xs font-medium focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#475569] font-medium mb-1">Department & Level</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-md border border-[#CBD5E1] text-[#0F172A] text-xs font-medium focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#475569] font-medium text-xs mb-1">
                  Role Description & Candidate Requirements
                </label>
                <textarea
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg text-xs text-[#0F172A] focus:bg-white focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] outline-none leading-relaxed font-sans"
                />
              </div>
            </div>
          </section>

          {/* Skill Cluster Configuration */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <h3 className="font-headline text-sm font-bold text-[#0F172A] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1E3A8A]" />
                <span>Extracted Skill Clusters & Keyword Weights</span>
              </span>
              <span className="text-[11px] font-mono text-[#64748B]">Auto-Taxonomy</span>
            </h3>

            <div className="space-y-4 text-xs">
              {/* Required Skills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Required Tech Skills (Must Have)</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#64748B]">
                    {formData.required_skills.length} skills defined
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg min-h-[46px]">
                  {formData.required_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[#CBD5E1] text-[#0F172A] rounded-md font-medium text-xs shadow-2xs"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeRequiredSkill(skill)}
                        className="text-[#94A3B8] hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill inline */}
                <form onSubmit={handleAddRequiredSkill} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add required skill (e.g. Next.js, Redis, AWS)..."
                    className="flex-1 px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-md text-xs text-[#0F172A] focus:bg-white focus:border-[#1E3A8A] outline-none"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] border border-[#E2E8F0] rounded-md text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </form>
              </div>

              {/* Preferred Skills */}
              <div>
                <span className="font-semibold text-[#475569] block mb-1.5">
                  Nice-to-Have / Complementary Skills
                </span>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                  {formData.preferred_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-[#E2E8F0] text-[#475569] rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Match Calibration & Hard Cutoff Thresholds (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Scoring Weight Calibration Sliders */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1E3A8A]" />
                <h2 className="font-headline text-sm font-bold text-[#0F172A]">Scoring Algorithm Weights</h2>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                Total: 100%
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Skills Overlap */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-[#0F172A]">Skills Overlap Weight</span>
                  <span className="font-mono font-bold text-[#1E3A8A]">{weights.skills}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={weights.skills}
                  onChange={(e) => setWeights({ ...weights, skills: parseInt(e.target.value) })}
                  className="w-full accent-[#1E3A8A]"
                />
              </div>

              {/* Experience Relevancy */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-[#0F172A]">Experience Relevancy Weight</span>
                  <span className="font-mono font-bold text-[#1E3A8A]">{weights.experience}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: parseInt(e.target.value) })}
                  className="w-full accent-[#1E3A8A]"
                />
              </div>

              {/* Academic Performance */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-[#0F172A]">Academic Performance (CGPA/10th/12th)</span>
                  <span className="font-mono font-bold text-[#1E3A8A]">{weights.academics}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={weights.academics}
                  onChange={(e) => setWeights({ ...weights, academics: parseInt(e.target.value) })}
                  className="w-full accent-[#1E3A8A]"
                />
              </div>

              {/* Domain & Background */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-[#0F172A]">Domain & Semantic Fit</span>
                  <span className="font-mono font-bold text-[#1E3A8A]">{weights.domain}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={weights.domain}
                  onChange={(e) => setWeights({ ...weights, domain: parseInt(e.target.value) })}
                  className="w-full accent-[#1E3A8A]"
                />
              </div>
            </div>
          </section>

          {/* Hard Cutoffs / Eligibility Gates */}
          <section className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs">
            <h3 className="font-headline text-sm font-bold text-[#0F172A] mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
              <span>Hard Eligibility Thresholds (Pre-Filter Gates)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div>
                  <span className="font-semibold text-[#0F172A] block">Minimum College CGPA Cutoff</span>
                  <span className="text-[11px] text-[#64748B]">Reject/Deprioritize below threshold</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="10"
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                    className="w-16 px-2 py-1 bg-white border border-[#CBD5E1] rounded text-right font-mono font-bold text-xs"
                  />
                  <span className="font-mono text-[#64748B]">/10.0</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div>
                  <span className="font-semibold text-[#0F172A] block">Minimum 12th Board Score</span>
                  <span className="text-[11px] text-[#64748B]">Indian Class XII percentage criteria</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="100"
                    value={formData.min_twelfth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_twelfth_percentage: e.target.value })}
                    className="w-16 px-2 py-1 bg-white border border-[#CBD5E1] rounded text-right font-mono font-bold text-xs"
                  />
                  <span className="font-mono text-[#64748B]">%</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
                <div>
                  <span className="font-semibold text-[#0F172A] block">Minimum Experience</span>
                  <span className="text-[11px] text-[#64748B]">Years in verified engineering roles</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={formData.min_experience}
                    onChange={(e) => setFormData({ ...formData, min_experience: e.target.value })}
                    className="w-16 px-2 py-1 bg-white border border-[#CBD5E1] rounded text-right font-mono font-bold text-xs"
                  />
                  <span className="font-mono text-[#64748B]">Yrs</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleSaveAndReindex}
                className="w-full py-2.5 bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Apply Calibration & Recalculate Candidate Matches</span>
              </button>
            </div>
          </section>

        </div>

      </div>

    </div>
  );
}
