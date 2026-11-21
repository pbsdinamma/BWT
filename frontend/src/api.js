const BASE_URL = '/api';

export const normalizeCandidate = (c) => {
  if (!c) return c;
  const edu = c.education || c.academics || {};
  const expYears = c.years_of_experience ?? c.experience_years ?? 0;
  const title = c.current_title || c.experience_history?.[0]?.role || (expYears > 0 ? 'Software Engineer' : 'Fresher / Graduate');
  const company = c.current_company || c.experience_history?.[0]?.company || '';
  return {
    ...c,
    education: edu,
    academics: edu,
    years_of_experience: expYears,
    experience_years: expYears,
    current_title: title,
    current_company: company
  };
};

export const getAuthToken = () => {
  return localStorage.getItem('hireswift_company_token') || '';
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const authFetch = async (url, options = {}) => {
  const authHeaders = getAuthHeaders();
  const headers = {
    ...authHeaders,
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  return res;
};

export const api = {
  // Candidate endpoints (Scoped to authenticated company)
  async getCandidates(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await authFetch(`${BASE_URL}/candidates?${query.toString()}`);
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      throw new Error('Failed to fetch candidates');
    }
    const data = await res.json();
    if (data.candidates && Array.isArray(data.candidates)) {
      data.candidates = data.candidates.map((item) => ({
        ...item,
        candidate: normalizeCandidate(item.candidate)
      }));
    }
    return data;
  },

  async getCandidate(id, jobId = null) {
    const url = jobId ? `${BASE_URL}/candidates/${id}?job_id=${jobId}` : `${BASE_URL}/candidates/${id}`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to fetch candidate');
    const data = await res.json();
    if (data.candidate) {
      data.candidate = normalizeCandidate(data.candidate);
    }
    return data;
  },

  async updateCandidate(candidateId, updates) {
    const res = await authFetch(`${BASE_URL}/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update candidate details');
    const data = await res.json();
    if (data.candidate) {
      data.candidate = normalizeCandidate(data.candidate);
    }
    return data;
  },

  async updateStage(candidateId, stage, rejectionReason = null) {
    const res = await authFetch(`${BASE_URL}/candidates/${candidateId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, rejection_reason: rejectionReason }),
    });
    if (!res.ok) throw new Error('Failed to update stage');
    const data = await res.json();
    if (data.candidate) {
      data.candidate = normalizeCandidate(data.candidate);
    }
    return data;
  },

  async addNote(candidateId, content, author = 'Recruiter') {
    const res = await authFetch(`${BASE_URL}/candidates/${candidateId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author }),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
  },

  async deleteCandidate(candidateId) {
    const res = await authFetch(`${BASE_URL}/candidates/${candidateId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete candidate');
    return res.json();
  },

  // Upload bulk resumes (Scoped to authenticated company)
  async uploadResumes(files, appliedJobId = null) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (appliedJobId) formData.append('applied_job_id', appliedJobId);

    const token = getAuthToken();
    if (token) {
      formData.append('token', token);
    }

    const res = await authFetch(`${BASE_URL}/resumes/upload-bulk`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload resumes');
    return res.json();
  },

  // Jobs endpoints (Scoped to authenticated company)
  async getJobs() {
    const res = await authFetch(`${BASE_URL}/jobs`);
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication session expired. Please log in again.');
      }
      throw new Error('Failed to fetch jobs');
    }
    return res.json();
  },

  async createJob(jobData) {
    const res = await authFetch(`${BASE_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData),
    });
    if (!res.ok) throw new Error('Failed to create job');
    return res.json();
  },

  async getJob(jobId) {
    const res = await authFetch(`${BASE_URL}/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job details');
    return res.json();
  },

  async updateJob(jobId, updates) {
    const res = await authFetch(`${BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update job');
    return res.json();
  },

  async deleteJob(jobId) {
    const res = await authFetch(`${BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete job');
    return res.json();
  },

  // Compare candidates side-by-side
  async compareCandidates(candidateIds, jobId) {
    const res = await authFetch(`${BASE_URL}/candidates/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_ids: candidateIds, job_id: jobId }),
    });
    if (!res.ok) throw new Error('Failed to compare candidates');
    const data = await res.json();
    if (data.candidates && Array.isArray(data.candidates)) {
      data.candidates = data.candidates.map((c) => ({
        ...c,
        candidate: normalizeCandidate(c.candidate)
      }));
    }
    return data;
  },

  // Duplicates (Scoped to authenticated company)
  async getDuplicates() {
    const res = await authFetch(`${BASE_URL}/duplicates`);
    if (!res.ok) throw new Error('Failed to fetch duplicates');
    return res.json();
  },

  async resolveDuplicate(candidateId, action, targetCandidateId = null) {
    const res = await authFetch(`${BASE_URL}/duplicates/resolve`, {
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

  // Bulk Email (Scoped to authenticated company)
  async getEmailTemplates() {
    const res = await authFetch(`${BASE_URL}/email/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates');
    return res.json();
  },

  async sendBulkEmail(payload, ...args) {
    // Support both single payload object OR positional parameters for backwards compatibility
    let bodyObj = payload;
    if (Array.isArray(payload)) {
      bodyObj = {
        candidate_ids: payload,
        subject: args[0] || '',
        body_template: args[1] || '',
        company_name: args[2] || '',
        interview_date: args[3] || '',
        interview_link: args[4] || '',
        template_type: 'custom',
      };
    }
    const res = await authFetch(`${BASE_URL}/email/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to send bulk email');
    }
    return res.json();
  },

  async getEmailHistory(params = {}) {
    const query = new URLSearchParams();
    if (params.job_id) query.append('job_id', params.job_id);
    if (params.scope) query.append('scope', params.scope);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await authFetch(`${BASE_URL}/email/history${queryString}`);
    if (!res.ok) throw new Error('Failed to fetch email history');
    return res.json();
  },

  async getSmtpStatus() {
    try {
      const res = await authFetch(`${BASE_URL}/email/smtp-status`);
      if (!res.ok) return { is_configured: false, mode: 'Simulated Demo Mode' };
      return res.json();
    } catch {
      return { is_configured: false, mode: 'Simulated Demo Mode' };
    }
  },

  // Dashboard Stats (Scoped to authenticated company)
  async getStats(jobId = null) {
    const url = jobId ? `${BASE_URL}/dashboard/stats?job_id=${jobId}` : `${BASE_URL}/dashboard/stats`;
    const res = await authFetch(url);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // System Demo Reset (Resets Acme demo company data)
  async resetDemoData() {
    const res = await authFetch(`${BASE_URL}/system/reset-demo`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  // Public Authentication Endpoints
  async registerCompany(companyData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },

  async loginCompany(credentials) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  async getCurrentCompany(token) {
    const url = token ? `${BASE_URL}/auth/me?token=${encodeURIComponent(token)}` : `${BASE_URL}/auth/me`;
    const res = await authFetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to fetch current company');
    return data;
  },

  async logoutCompany(token) {
    const url = token ? `${BASE_URL}/auth/logout?token=${encodeURIComponent(token)}` : `${BASE_URL}/auth/logout`;
    const res = await authFetch(url, { method: 'POST' });
    return res.json();
  },

  // Job status & deadline management
  async updateJobStatus(jobId, status, applicationDeadline = null) {
    const res = await authFetch(`${BASE_URL}/jobs/${jobId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, application_deadline: applicationDeadline }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to update job status');
    return data;
  },

  async extendJobDeadline(jobId, newDeadline) {
    const res = await authFetch(`${BASE_URL}/jobs/${jobId}/deadline`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_deadline: newDeadline }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to extend job deadline');
    return data;
  },

  // Candidate Resume PDF URL (Direct inline viewing in browser tab)
  getResumeUrl(candidateId) {
    const token = getAuthToken() || '';
    return `${BASE_URL}/candidates/${candidateId}/resume?token=${encodeURIComponent(token)}`;
  },

  // Ingest built-in sample resumes into current company's ATS workspace
  async loadSampleResumes(appliedJobId = null) {
    const res = await authFetch(`${BASE_URL}/resumes/load-samples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applied_job_id: appliedJobId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to load sample resumes');
    }
    return res.json();
  },

  // Sample files (Public)
  async getSampleFiles() {
    const res = await fetch(`${BASE_URL}/resumes/sample-files`);
    if (!res.ok) throw new Error('Failed to list sample files');
    return res.json();
  },
};
