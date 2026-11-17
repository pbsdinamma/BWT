import React, { useState } from 'react';
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
  X
} from 'lucide-react';
import { api } from '../api';

export default function JobDescriptionManager({
  jobs = [],
  activeJobId,
  onSelectActiveJob,
  onRefreshJobs
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    location: 'Bengaluru (Hybrid)',
    employment_type: 'Full-Time',
    description: '',
    min_experience: 2.0,
    max_experience: 5.0,
    required_skills: 'React, Node.js, TypeScript',
    preferred_skills: 'Docker, AWS, PostgreSQL',
    min_cgpa: 7.0,
    min_tenth_percentage: 70.0,
    min_twelfth_percentage: 70.0,
    preferred_grad_years: '2021, 2022, 2023'
  });

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      department: 'Engineering',
      location: 'Bengaluru (Hybrid)',
      employment_type: 'Full-Time',
      description: '',
      min_experience: 2.0,
      max_experience: 5.0,
      required_skills: 'React, Node.js, TypeScript',
      preferred_skills: 'Docker, AWS, PostgreSQL',
      min_cgpa: 7.0,
      min_tenth_percentage: 70.0,
      min_twelfth_percentage: 70.0,
      preferred_grad_years: '2021, 2022, 2023'
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location,
      employment_type: job.employment_type,
      description: job.description,
      min_experience: job.min_experience,
      max_experience: job.max_experience || 5.0,
      required_skills: job.required_skills?.join(', ') || '',
      preferred_skills: job.preferred_skills?.join(', ') || '',
      min_cgpa: job.min_cgpa || 0.0,
      min_tenth_percentage: job.min_tenth_percentage || 0.0,
      min_twelfth_percentage: job.min_twelfth_percentage || 0.0,
      preferred_grad_years: job.preferred_grad_years?.join(', ') || ''
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        department: formData.department,
        location: formData.location,
        employment_type: formData.employment_type,
        description: formData.description,
        min_experience: parseFloat(formData.min_experience) || 0.0,
        max_experience: parseFloat(formData.max_experience) || null,
        required_skills: formData.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean),
        min_cgpa: parseFloat(formData.min_cgpa) || null,
        min_tenth_percentage: parseFloat(formData.min_tenth_percentage) || null,
        min_twelfth_percentage: parseFloat(formData.min_twelfth_percentage) || null,
        preferred_grad_years: formData.preferred_grad_years
          .split(',')
          .map((y) => parseInt(y.trim()))
          .filter((y) => !isNaN(y)),
        status: 'Active'
      };

      if (editingJob) {
        await api.updateJob(editingJob.id, payload);
      } else {
        await api.createJob(payload);
      }

      setShowCreateModal(false);
      onRefreshJobs();
    } catch (err) {
      alert('Error saving Job Description: ' + err.message);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this Job Description?')) return;
    try {
      await api.deleteJob(jobId);
      onRefreshJobs();
    } catch (err) {
      alert('Error deleting job: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white">Job Description Openings & Matching Profiles</h2>
          <p className="text-xs text-slate-400">
            Define role parameters, required skills, and academic criteria to automatically rank and score incoming resumes.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Job Role</span>
        </button>
      </div>

      {/* JDs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((item) => {
          const j = item.job;
          const isActive = j.id === activeJobId;

          return (
            <div
              key={j.id}
              className={`bg-slate-900/90 border rounded-xl p-5 flex flex-col justify-between transition-all relative ${
                isActive
                  ? 'border-indigo-500 bg-slate-850 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-base">{j.title}</h3>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Active Role
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center">
                        <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {j.department}
                      </span>
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        {j.location}
                      </span>
                      <span>• {j.employment_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(j)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit JD"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      title="Delete JD"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 my-2.5 leading-relaxed">
                  {j.description}
                </p>

                {/* Metrics Pill Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-850 p-2.5 rounded-lg border border-slate-800 my-3 text-center text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Applicants</span>
                    <span className="font-bold text-slate-100">{item.applicant_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Avg Score</span>
                    <span className="font-bold text-sky-400">{item.average_match_score}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Strong Fits</span>
                    <span className="font-bold text-emerald-400">{item.strong_matches}</span>
                  </div>
                </div>

                {/* Required Skills */}
                <div className="space-y-1.5 text-xs">
                  <div className="text-[11px] font-semibold text-slate-400">Required Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {j.required_skills?.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Preferred Skills */}
                {j.preferred_skills?.length > 0 && (
                  <div className="space-y-1.5 text-xs mt-2">
                    <div className="text-[11px] font-semibold text-slate-400">Bonus / Preferred:</div>
                    <div className="flex flex-wrap gap-1">
                      {j.preferred_skills?.map((sk) => (
                        <span
                          key={sk}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Criteria Note */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                  <span className="flex items-center text-slate-300">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Min Exp: {j.min_experience} yrs
                  </span>
                  {j.min_cgpa && (
                    <span className="flex items-center text-emerald-400 font-semibold">
                      <GraduationCap className="w-3.5 h-3.5 mr-1" />
                      Min CGPA: {j.min_cgpa}
                    </span>
                  )}
                  {j.min_twelfth_percentage && (
                    <span>Min 12th: {j.min_twelfth_percentage}%</span>
                  )}
                  {j.min_tenth_percentage && (
                    <span>Min 10th: {j.min_tenth_percentage}%</span>
                  )}
                </div>
              </div>

              {/* Set Active Button */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectActiveJob(j.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                  }`}
                >
                  {isActive ? 'Current Matching Target' : 'Score Candidates for this Role'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit JD Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                {editingJob ? 'Edit Job Description' : 'Create New Job Opening'}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full-Stack Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru (Hybrid) or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Job Overview & Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Responsibilities, requirements, team context..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Required Skills (Comma separated) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. React, Node.js, TypeScript, PostgreSQL"
                    value={formData.required_skills}
                    onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Preferred Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Docker, AWS, Redis, Next.js"
                    value={formData.preferred_skills}
                    onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Min Exp (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.min_experience}
                    onChange={(e) => setFormData({ ...formData, min_experience: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 7.5"
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min 12th %</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 75"
                    value={formData.min_twelfth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_twelfth_percentage: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Min 10th %</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 75"
                    value={formData.min_tenth_percentage}
                    onChange={(e) => setFormData({ ...formData, min_tenth_percentage: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {editingJob ? 'Save Changes' : 'Publish Job Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
