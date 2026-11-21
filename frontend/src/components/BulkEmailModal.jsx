import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Calendar,
  Link as LinkIcon,
  Check,
  X,
  Search,
  Filter,
  Layers,
  Briefcase,
  AlertCircle,
  HelpCircle,
  UserCheck,
  UserX,
  ExternalLink
} from 'lucide-react';
import { api } from '../api';

export default function BulkEmailModal({
  scope = 'global', // 'global' (company-wide all roles) | 'role' (specific to activeJob)
  activeJob = null,
  jobs = [],
  company = null,
  initialCandidates = [],
  onClose
}) {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  const [templates, setTemplates] = useState({});
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    scope === 'global' ? 'global_rejection' : 'assessment'
  );
  
  // All candidates pool for this view
  const [candidatePool, setCandidatePool] = useState([]);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  
  // Search & Filter state for recipient list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  
  // Form variables
  const [subject, setSubject] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [companyName, setCompanyName] = useState(company?.company_name || 'HireSwift');
  const [interviewDate, setInterviewDate] = useState('Thursday at 2:30 PM IST');
  const [interviewLink, setInterviewLink] = useState('https://meet.google.com/hsw-ats-tech');
  const [assessmentLink, setAssessmentLink] = useState('https://app.codesignal.com/assessment-invite/hsw-ats');
  const [assessmentDeadline, setAssessmentDeadline] = useState('Sunday by 11:59 PM IST');
  
  // Preview Candidate
  const [previewCandidateId, setPreviewCandidateId] = useState(null);
  
  // Sent history
  const [sentHistory, setSentHistory] = useState([]);
  const [historyScopeFilter, setHistoryScopeFilter] = useState(scope === 'role' ? 'role' : 'all');
  const [smtpStatus, setSmtpStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  // Map job ID to title
  const jobTitleMap = useMemo(() => {
    const map = {};
    jobs.forEach((j) => {
      const jobObj = j.job || j;
      if (jobObj.id) map[jobObj.id] = jobObj.title;
    });
    return map;
  }, [jobs]);

  // Load candidate pool based on scope
  useEffect(() => {
    loadCandidatePool();
    loadTemplates();
    loadHistory();
    api.getSmtpStatus().then(setSmtpStatus).catch(() => {});
  }, [scope, activeJob?.id]);

  useEffect(() => {
    if (company?.company_name) {
      setCompanyName(company.company_name);
    }
  }, [company]);

  const loadCandidatePool = async () => {
    setIsLoadingPool(true);
    try {
      if (scope === 'global') {
        // Fetch ALL company candidates across all jobs
        const res = await api.getCandidates({ scope: 'all' });
        const list = res.candidates || [];
        setCandidatePool(list);
        
        // Auto-select rejected candidates if global_rejection template is active, else select all
        const rejected = list.filter((c) => c.candidate?.stage === 'Rejected');
        if (rejected.length > 0 && selectedTemplateKey === 'global_rejection') {
          setSelectedCandidateIds(rejected.map((c) => c.candidate.id));
        } else {
          setSelectedCandidateIds(list.map((c) => c.candidate.id));
        }
      } else {
        // Fetch candidates scoped to activeJob
        const res = await api.getCandidates({ job_id: activeJob?.id, scope: 'job' });
        const list = res.candidates || [];
        setCandidatePool(list);
        
        // Auto-select shortlisted or all
        const shortlisted = list.filter((c) => c.candidate?.stage === 'Shortlisted');
        if (shortlisted.length > 0) {
          setSelectedCandidateIds(shortlisted.map((c) => c.candidate.id));
        } else {
          setSelectedCandidateIds(list.map((c) => c.candidate.id));
        }
      }
    } catch (err) {
      console.error('Error loading candidate pool:', err);
    } finally {
      setIsLoadingPool(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await api.getEmailTemplates();
      setTemplates(data);
      
      const defaultKey = scope === 'global' ? 'global_rejection' : 'assessment';
      const initialKey = data[defaultKey] ? defaultKey : Object.keys(data)[0];
      setSelectedTemplateKey(initialKey);
      
      if (data[initialKey]) {
        setSubject(data[initialKey].subject);
        setBodyTemplate(data[initialKey].body);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async (targetScope = historyScopeFilter) => {
    try {
      const params = {};
      if (targetScope === 'role' && activeJob?.id) {
        params.job_id = activeJob.id;
        params.scope = 'role';
      } else if (targetScope === 'global') {
        params.scope = 'global';
      }
      const res = await api.getEmailHistory(params);
      setSentHistory(res.emails || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setHistoryScopeFilter(scope === 'role' ? 'role' : 'all');
  }, [scope, activeJob?.id]);

  useEffect(() => {
    loadHistory(historyScopeFilter);
  }, [historyScopeFilter, activeJob?.id, scope]);

  const handleTemplateChange = (key) => {
    setSelectedTemplateKey(key);
    if (templates[key]) {
      setSubject(templates[key].subject);
      setBodyTemplate(templates[key].body);
    }

    // Smart auto-audience switching
    if (key === 'global_rejection' || key === 'rejection') {
      const rejected = candidatePool.filter((c) => c.candidate?.stage === 'Rejected');
      if (rejected.length > 0) {
        setSelectedCandidateIds(rejected.map((c) => c.candidate.id));
        setSelectedStageFilter('Rejected');
      }
    } else if (key === 'shortlisted' || key === 'assessment') {
      const shortlisted = candidatePool.filter((c) => c.candidate?.stage === 'Shortlisted');
      if (shortlisted.length > 0) {
        setSelectedCandidateIds(shortlisted.map((c) => c.candidate.id));
        setSelectedStageFilter('Shortlisted');
      }
    }
  };

  // Filter candidate pool
  const filteredCandidates = useMemo(() => {
    return candidatePool.filter((item) => {
      const c = item.candidate || item;
      const q = searchQuery.toLowerCase().trim();
      
      // Search match
      if (q) {
        const matchesName = c.name?.toLowerCase().includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q);
        const matchesSkill = c.skills?.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesSkill) return false;
      }
      
      // Stage match
      if (selectedStageFilter !== 'all' && c.stage !== selectedStageFilter) {
        return false;
      }
      
      // Role match (Global mode)
      if (scope === 'global' && selectedRoleFilter !== 'all') {
        if (c.applied_job_id !== selectedRoleFilter) return false;
      }
      
      return true;
    });
  }, [candidatePool, searchQuery, selectedStageFilter, selectedRoleFilter, scope]);

  // Stage quick counts
  const stageCounts = useMemo(() => {
    const counts = { all: candidatePool.length, Applied: 0, Shortlisted: 0, Interview: 0, Rejected: 0 };
    candidatePool.forEach((item) => {
      const stage = item.candidate?.stage || item.stage;
      if (counts[stage] !== undefined) counts[stage]++;
    });
    return counts;
  }, [candidatePool]);

  // Recipient selection actions
  const toggleSelect = (id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCandidates.map((c) => c.candidate?.id || c.id);
    const allSelected = filteredIds.every((id) => selectedCandidateIds.includes(id));
    if (allSelected) {
      setSelectedCandidateIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedCandidateIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Preview Candidate resolution
  const activePreviewCandidate = useMemo(() => {
    if (previewCandidateId) {
      const found = candidatePool.find((c) => (c.candidate?.id || c.id) === previewCandidateId);
      if (found) return found.candidate || found;
    }
    const firstSelected = candidatePool.find((c) =>
      selectedCandidateIds.includes(c.candidate?.id || c.id)
    );
    if (firstSelected) return firstSelected.candidate || firstSelected;
    return candidatePool[0]?.candidate || candidatePool[0] || null;
  }, [candidatePool, selectedCandidateIds, previewCandidateId]);

  // Live personalized text substitution
  const getPersonalizedPreview = (templateText) => {
    if (!templateText) return '';
    const cand = activePreviewCandidate;
    
    const cName = cand?.name || 'Jane Doe';
    const cFirstName = cName.split(' ')[0] || 'Jane';
    const cJobTitle =
      (cand?.applied_job_id && jobTitleMap[cand.applied_job_id]) ||
      activeJob?.title ||
      'Software Engineer';
    const comp = company?.company_name || companyName || 'HappyWave';
    const skillsList = cand?.skills?.slice(0, 4)?.join(', ') || 'Software Engineering';
    const topSkill = cand?.skills?.[0] || 'Software Engineering';
    const exp = (cand?.years_of_experience || 0) > 0 ? `${cand.years_of_experience} Yrs` : 'Campus Fresher';

    return templateText
      .replace(/\{\{\s*(?:name|candidate_name)\s*\}\}/gi, cName)
      .replace(/\{\{\s*first_name\s*\}\}/gi, cFirstName)
      .replace(/\{\{\s*(?:company|company_name)\s*\}\}/gi, comp)
      .replace(/\{\{\s*(?:job_title|role|position)\s*\}\}/gi, cJobTitle)
      .replace(/\{\{\s*skills\s*\}\}/gi, skillsList)
      .replace(/\{\{\s*top_skill\s*\}\}/gi, topSkill)
      .replace(/\{\{\s*experience\s*\}\}/gi, exp)
      .replace(/\{\{\s*(?:interview_date|date|slot)\s*\}\}/gi, interviewDate)
      .replace(/\{\{\s*(?:interview_link|meeting_link|schedule_link)\s*\}\}/gi, interviewLink)
      .replace(/\{\{\s*(?:assessment_link|test_link)\s*\}\}/gi, assessmentLink)
      .replace(/\{\{\s*(?:assessment_deadline|deadline)\s*\}\}/gi, assessmentDeadline);
  };

  const handleSend = async () => {
    if (selectedCandidateIds.length === 0) {
      alert('Please select at least one recipient candidate.');
      return;
    }
    setIsSending(true);
    setSendSuccessMsg('');

    try {
      const payload = {
        candidate_ids: selectedCandidateIds,
        template_type: selectedTemplateKey,
        subject: subject,
        body_template: bodyTemplate,
        job_id: scope === 'role' ? activeJob?.id : undefined,
        job_title: scope === 'role' ? activeJob?.title : undefined,
        campaign_scope: scope,
        company_name: companyName,
        interview_date: interviewDate,
        interview_link: interviewLink,
        assessment_link: assessmentLink,
        assessment_deadline: assessmentDeadline,
      };

      const res = await api.sendBulkEmail(payload);
      setSendSuccessMsg(`Successfully sent ${res.total_sent || res.sent_count || selectedCandidateIds.length} personalized outreach emails!`);
      loadHistory(historyScopeFilter);
    } catch (err) {
      alert('Error sending emails: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Group templates by scope
  const availableTemplates = useMemo(() => {
    if (scope === 'global') {
      return [
        { key: 'global_rejection', title: 'Bulk Rejection (All Roles)', desc: 'Warm reject referencing each candidate’s applied role' },
        { key: 'talent_pool', title: 'Talent Pool & Future Roles', desc: 'Keep talent warm across departments' },
        { key: 'general_announcement', title: 'Recruitment Update', desc: 'General status notice' }
      ];
    } else {
      return [
        { key: 'assessment', title: 'Assessment / Code Test', desc: 'Custom test link & submission deadline' },
        { key: 'interview', title: 'Round 1 Tech Interview', desc: 'Interview slot & meeting link' },
        { key: 'shortlisted', title: 'Shortlist Notification', desc: 'Passed resume screening' },
        { key: 'offer', title: 'Offer Letter', desc: 'Formal employment offer' },
        { key: 'rejection', title: 'Role Rejection', desc: 'Specific to this position' }
      ];
    }
  }, [scope]);

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-xl overflow-hidden flex flex-col font-body text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      
      {/* 1. AUTHORITATIVE HEADER BAR */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            scope === 'global'
              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              : 'bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
          }`}>
            {scope === 'global' ? <Layers className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {scope === 'global'
                  ? 'Company-Wide Talent Pool Outreach & Campaigns'
                  : `Role Outreach & Assessment Dispatch: ${activeJob?.title || 'Open Position'}`}
              </h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                scope === 'global'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
              }`}>
                {scope === 'global' ? 'Global Multi-Role Scope' : 'Role-Scoped'}
              </span>
            </div>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
              {scope === 'global'
                ? `Broadcast bulk status updates and mass rejection notices across ALL open jobs (${candidatePool.length} Total Candidates)`
                : `Dispatch technical assessments, interview slots, and updates specifically for applicants to this opening (${candidatePool.length} Role Applicants)`}
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'compose'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E3A8A] dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              Compose Campaign
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E3A8A] dark:text-blue-400 shadow-2xs font-bold'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              Dispatch Log ({sentHistory.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONTEXTUAL HELPER BANNER (Explains the difference clearly to the recruiter) */}
      <div className={`px-6 py-2.5 text-xs flex items-center justify-between gap-3 border-b ${
        scope === 'global'
          ? 'bg-purple-50/70 dark:bg-purple-950/30 text-purple-900 dark:text-purple-200 border-purple-100 dark:border-purple-900/50'
          : 'bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 border-blue-100 dark:border-blue-900/50'
      }`}>
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0 text-current opacity-80" />
          <span>
            {scope === 'global' ? (
              <>
                <strong>Company-Wide Outreach Mode:</strong> Reaches candidates across all job openings simultaneously. Essential for <em>bulk rejection notices</em> and general announcements. Dynamic tag <code className="px-1 py-0.5 bg-white dark:bg-black/40 rounded font-mono font-bold">{'{{job_title}}'}</code> automatically adapts to each candidate's applied position.
              </>
            ) : (
              <>
                <strong>Role-Specific Dispatch Mode:</strong> Tailored exclusively for <strong>{activeJob?.title}</strong>. Perfect for dispatching <em>coding test links</em>, technical assessments, and interview bookings unique to this job.
              </>
            )}
          </span>
        </div>
        {scope === 'global' && (
          <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 underline underline-offset-2 shrink-0">
            For role assessments, use Job workspace
          </span>
        )}
      </div>

      {sendSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-6 py-3 text-xs text-[#047857] dark:text-emerald-300 flex items-center gap-2 font-semibold animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{sendSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'compose' ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8FAFC] dark:bg-[#0F172A]">
          
          {/* ================= LEFT COLUMN: TEMPLATE & MESSAGE EDITOR (7 Cols) ================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Communication Template Selection */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {scope === 'global' ? 'Global Outreach Template' : 'Role-Specific Template'}
                </label>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {scope === 'global' ? 'Essential Cross-Job Templates' : 'Full Assessment & Interview Suite'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {availableTemplates.map((tmpl) => {
                  const isSelected = selectedTemplateKey === tmpl.key;
                  return (
                    <button
                      key={tmpl.key}
                      type="button"
                      onClick={() => handleTemplateChange(tmpl.key)}
                      className={`p-2.5 rounded-lg text-left transition-all border cursor-pointer ${
                        isSelected
                          ? scope === 'global'
                            ? 'border-purple-600 dark:border-purple-400 bg-purple-50/60 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-bold shadow-xs'
                            : 'border-[#1E3A8A] dark:border-blue-400 bg-blue-50/60 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-200 font-bold shadow-xs'
                          : 'border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-[#94A3B8] hover:border-[#94A3B8]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tmpl.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-current shrink-0" />}
                      </div>
                      <p className="text-[10.5px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5 line-clamp-2">
                        {tmpl.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Line */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <label className="block text-xs font-bold text-[#475569] dark:text-[#94A3B8] mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Update regarding your application..."
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A8A] dark:focus:border-blue-500 outline-none"
              />
            </div>

            {/* Message Body & Dynamic Tag Chips */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                <label className="text-xs font-bold text-[#475569] dark:text-[#94A3B8]">
                  Email Body Content
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#1E3A8A] dark:text-blue-400">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Click tag to insert:</span>
                  {['{{name}}', '{{job_title}}', '{{company}}', '{{skills}}'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setBodyTemplate((b) => b + ' ' + tag)}
                      className="px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs cursor-pointer font-bold transition-colors"
                      title={`Insert ${tag}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={10}
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A8A] dark:focus:border-blue-500 outline-none leading-relaxed font-sans"
              />

              {/* Dynamic Inputs according to template */}
              {selectedTemplateKey === 'assessment' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] text-xs">
                  <div>
                    <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 font-bold">
                      Assessment / Code Test URL {'{{assessment_link}}'}
                    </label>
                    <input
                      type="text"
                      value={assessmentLink}
                      onChange={(e) => setAssessmentLink(e.target.value)}
                      placeholder="https://app.codesignal.com/..."
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 font-bold">
                      Submission Deadline {'{{assessment_deadline}}'}
                    </label>
                    <input
                      type="text"
                      value={assessmentDeadline}
                      onChange={(e) => setAssessmentDeadline(e.target.value)}
                      placeholder="Sunday by 11:59 PM IST"
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>
              )}

              {selectedTemplateKey === 'interview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] text-xs">
                  <div>
                    <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 font-bold">
                      Interview Slot / Proposed Date {'{{interview_date}}'}
                    </label>
                    <input
                      type="text"
                      value={interviewDate}
                      onChange={(e) => setInterviewDate(e.target.value)}
                      placeholder="Thursday at 2:30 PM IST"
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 font-bold">
                      Meeting Link (Google Meet / Zoom) {'{{interview_link}}'}
                    </label>
                    <input
                      type="text"
                      value={interviewLink}
                      onChange={(e) => setInterviewLink(e.target.value)}
                      placeholder="https://meet.google.com/..."
                      className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between">
                <span>Sender Company: <strong>{companyName}</strong></span>
                <span>Active Variable Tags: <strong className="font-mono text-blue-600 dark:text-blue-400">{'{{name}}, {{job_title}}, {{company}}, {{skills}}'}</strong></span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: RECIPIENT AUDIENCE & LIVE PREVIEW (5 Cols) ================= */}
          <div className="lg:col-span-5 flex flex-col gap-4">

            {/* Recipient Audience Selector */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                  <span>Target Recipients ({selectedCandidateIds.length})</span>
                </span>
                <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                  {candidatePool.length} in talent pool
                </span>
              </div>

              {/* Stage Quick Filter Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedStageFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                    selectedStageFilter === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                  }`}
                >
                  All ({stageCounts.all})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStageFilter('Rejected')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                    selectedStageFilter === 'Rejected'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                  }`}
                >
                  Rejected ({stageCounts.Rejected})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStageFilter('Shortlisted')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                    selectedStageFilter === 'Shortlisted'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                  }`}
                >
                  Shortlisted ({stageCounts.Shortlisted})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStageFilter('Applied')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                    selectedStageFilter === 'Applied'
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155]'
                  }`}
                >
                  Applied ({stageCounts.Applied})
                </button>
              </div>

              {/* Role Filter (In Global Mode) */}
              {scope === 'global' && jobs.length > 0 && (
                <div className="mb-2">
                  <select
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium"
                  >
                    <option value="all">Filter by Position: All Open Positions</option>
                    {jobs.map((j) => {
                      const jObj = j.job || j;
                      return (
                        <option key={jObj.id} value={jObj.id}>
                          {jObj.title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Search Bar & Master Checkbox */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name or email..."
                    className="w-full pl-8 pr-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSelectAllFiltered}
                  className="px-2 py-1.5 bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] border border-[#CBD5E1] dark:border-[#334155] rounded text-[11px] font-semibold text-[#475569] dark:text-[#CBD5E1] shrink-0 cursor-pointer"
                >
                  Select / Clear
                </button>
              </div>

              {/* Candidate Selection List */}
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-[#E2E8F0]/60 dark:divide-[#334155]/60">
                {isLoadingPool ? (
                  <div className="py-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Loading candidate pool...
                  </div>
                ) : filteredCandidates.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    No candidates found matching the selected filter criteria.
                  </div>
                ) : (
                  filteredCandidates.map((item) => {
                    const c = item.candidate || item;
                    const isChecked = selectedCandidateIds.includes(c.id);
                    const candRoleTitle = (c.applied_job_id && jobTitleMap[c.applied_job_id]) || 'General Talent Pool';
                    
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleSelect(c.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                          isChecked
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700'
                            : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Controlled via parent row click
                            className="w-4 h-4 rounded text-blue-600 border-[#CBD5E1] dark:border-[#475569] cursor-pointer"
                          />
                          <div className="truncate">
                            <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block truncate">
                              {c.name}
                            </span>
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono block truncate">
                              {c.email}
                            </span>
                            {scope === 'global' && (
                              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold inline-block mt-0.5 truncate max-w-[170px]">
                                {candRoleTitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${
                            c.stage === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : c.stage === 'Shortlisted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.stage === 'Interview'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {c.stage}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewCandidateId(c.id);
                            }}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>Preview</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Live Personalized Preview Card */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#4338CA] dark:text-indigo-400" />
                  <span>Real-Time Personalized Render</span>
                </span>
                
                {/* Switch preview candidate */}
                <select
                  value={activePreviewCandidate?.id || ''}
                  onChange={(e) => setPreviewCandidateId(e.target.value)}
                  className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded px-1.5 py-0.5 max-w-[160px] truncate"
                >
                  {candidatePool.map((c) => {
                    const cand = c.candidate || c;
                    return (
                      <option key={cand.id} value={cand.id}>
                        Preview for: {cand.name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs space-y-2 font-sans shadow-inner">
                <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] border-b border-[#E2E8F0] dark:border-[#334155] pb-1.5">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-normal">Subject: </span>
                  {getPersonalizedPreview(subject)}
                </div>
                <div className="text-[#334155] dark:text-[#CBD5E1] whitespace-pre-wrap leading-relaxed text-[11px] max-h-44 overflow-y-auto">
                  {getPersonalizedPreview(bodyTemplate)}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || selectedCandidateIds.length === 0}
                className={`w-full mt-4 py-2.5 rounded-lg text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  selectedCandidateIds.length > 0
                    ? scope === 'global'
                      ? 'bg-purple-700 hover:bg-purple-800 text-white'
                      : 'bg-[#1E3A8A] hover:bg-[#172554] text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSending
                    ? 'Dispatching Personalized Outreach...'
                    : scope === 'global'
                    ? `Broadcast Global Campaign (${selectedCandidateIds.length} Recipients)`
                    : `Send Role Outreach (${selectedCandidateIds.length} Applicants)`}
                </span>
              </button>

              {/* SMTP Dispatch Engine Indicator */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  {smtpStatus?.is_configured ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Live SMTP Active</span>
                      <span className="text-slate-400 font-mono text-[10px]">({smtpStatus.from_email})</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Fast Demo Mode (Simulated)</span>
                      <span className="text-slate-400 text-[10px]">• Ready for Hackathon</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {smtpStatus?.is_configured ? 'Real inbox delivery enabled' : 'Live SMTP: Add creds to .env'}
                </span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* ================= HISTORY LOG TAB ================= */
        <div className="p-6 bg-[#F8FAFC] dark:bg-[#0F172A] space-y-3">
          
          {/* Dispatch Log Scope Sub-header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1E293B] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Log Scope:</span>
              {scope === 'role' ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setHistoryScopeFilter('role')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                      historyScopeFilter === 'role'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                        : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    This Role ({activeJob?.title})
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryScopeFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                      historyScopeFilter === 'all'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                        : 'bg-[#F1F5F9] dark:bg-[#0F172A] text-[#475569] dark:text-[#CBD5E1] border-[#E2E8F0] dark:border-[#334155] hover:bg-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Company Outreaches
                  </button>
                </div>
              ) : (
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Showing all company-wide candidate outreach logs
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              {sentHistory.length} Record{sentHistory.length === 1 ? '' : 's'} Logged
            </span>
          </div>

          <div className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl bg-white dark:bg-[#1E293B] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-2.5 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC]">Recipient</th>
                  <th className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC]">Scope & Position</th>
                  <th className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC]">Subject Line</th>
                  <th className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC]">Template Type</th>
                  <th className="py-2.5 px-3 font-bold text-[#0F172A] dark:text-[#F8FAFC]">Timestamp</th>
                  <th className="py-2.5 px-4 font-bold text-[#0F172A] dark:text-[#F8FAFC] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {sentHistory.length > 0 ? (
                  sentHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50">
                      <td className="py-2.5 px-4">
                        <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block">{item.candidate_name}</span>
                        <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">{item.recipient_email}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {item.campaign_scope === 'global' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Global Campaign
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {item.job_title || 'Role Outreach'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 max-w-[220px] truncate text-[#334155] dark:text-[#CBD5E1]">
                        {item.subject}
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8] capitalize">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                          {item.template_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8] font-mono">
                        {new Date(item.sent_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
                          Delivered
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {scope === 'role'
                        ? `No role-specific dispatch records for ${activeJob?.title || 'this position'} yet.`
                        : 'No outgoing emails dispatched in this session yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
