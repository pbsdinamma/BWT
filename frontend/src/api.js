const BASE_URL = '/api';

export const api = {
  // Candidate endpoints
  async getCandidates(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${BASE_URL}/candidates?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
  },

  async getCandidate(id, jobId = null) {
    const url = jobId ? `${BASE_URL}/candidates/${id}?job_id=${jobId}` : `${BASE_URL}/candidates/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch candidate');
    return res.json();
  },

  async updateStage(candidateId, stage, rejectionReason = null) {
    const res = await fetch(`${BASE_URL}/candidates/${candidateId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, rejection_reason: rejectionReason }),
    });
    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
  },

  async addNote(candidateId, content, author = 'Recruiter') {
    const res = await fetch(`${BASE_URL}/candidates/${candidateId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
  },

  async deleteCandidate(candidateId) {
    const res = await fetch(`${BASE_URL}/candidates/${candidateId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete candidate');
    return res.json();
  },

  // Upload bulk resumes
  async uploadResumes(files, appliedJobId = null) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (appliedJobId) formData.append('applied_job_id', appliedJobId);

    const res = await fetch(`${BASE_URL}/resumes/upload-bulk`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload resumes');
    return res.json();
  },

  // Jobs endpoints
  async getJobs() {
    const res = await fetch(`${BASE_URL}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  },

  async createJob(jobData) {
    const res = await fetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  async updateJob(jobId, updates) {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update job');
    return res.json();
  },

  async deleteJob(jobId) {
    const res = await fetch(`${BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
  },

  // Compare candidates side-by-side
  async compareCandidates(candidateIds, jobId) {
    const res = await fetch(`${BASE_URL}/candidates/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: candidateIds, job_id: jobId }),
    });
    if (!res.ok) throw new Error('Failed to compare candidates');
    return res.json();
  },

  // Duplicates
  async getDuplicates() {
    const res = await fetch(`${BASE_URL}/duplicates`);
    if (!res.ok) throw new Error('Failed to fetch duplicates');
    return res.json();
  },

  async resolveDuplicate(candidateId, action, targetCandidateId = null) {
    const res = await fetch(`${BASE_URL}/duplicates/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate_id: candidateId,
        action,
        target_candidate_id: targetCandidateId,
      }),
    });
    if (!res.ok) throw new Error('Failed to resolve duplicate');
    return res.json();
  },

  // Bulk Email
  async getEmailTemplates() {
    const res = await fetch(`${BASE_URL}/email/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async sendBulkEmail(payload) {
    const res = await fetch(`${BASE_URL}/email/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to send bulk email');
    return res.json();
  },

  async getEmailHistory() {
    const res = await fetch(`${BASE_URL}/email/history`);
    if (!res.ok) throw new Error('Failed to fetch email history');
    return res.json();
  },

  // Dashboard Stats
  async getStats(jobId = null) {
    const url = jobId ? `${BASE_URL}/dashboard/stats?job_id=${jobId}` : `${BASE_URL}/dashboard/stats`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // System Demo Reset
  async resetDemoData() {
    const res = await fetch(`${BASE_URL}/system/reset-demo`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  // Sample files
  async getSampleFiles() {
    const res = await fetch(`${BASE_URL}/resumes/sample-files`);
    if (!res.ok) throw new Error('Failed to list sample files');
    return res.json();
  },
};
