import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle,
  Clock,
  ChevronDown,
  Eye,
  FileText,
  Calendar,
  Link as LinkIcon,
  Check,
  X
} from 'lucide-react';
import { api } from '../api';

export default function BulkEmailModal({ candidates = [], activeJob, onClose }) {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  const [templates, setTemplates] = useState({});
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('shortlisted');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [subject, setSubject] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [companyName, setCompanyName] = useState('HireSwift Engineering');
  const [interviewDate, setInterviewDate] = useState('Thursday at 2:30 PM IST');
  const [interviewLink, setInterviewLink] = useState('https://meet.google.com/hsw-ats-tech');
  const [sentHistory, setSentHistory] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState('');

  useEffect(() => {
    loadTemplates();
    loadHistory();
  }, []);

  // Pre-select shortlisted candidates by default
  useEffect(() => {
    const shortlisted = candidates
      .filter((c) => c.candidate.stage === 'Shortlisted')
      .map((c) => c.candidate.id);
    if (shortlisted.length > 0) {
      setSelectedCandidateIds(shortlisted);
    } else {
      setSelectedCandidateIds(candidates.slice(0, 3).map((c) => c.candidate.id));
    }
  }, [candidates]);

  const loadTemplates = async () => {
    try {
      const data = await api.getEmailTemplates();
      setTemplates(data);
      if (data.shortlisted) {
        setSubject(data.shortlisted.subject);
        setBodyTemplate(data.shortlisted.body);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.getEmailHistory();
      setSentHistory(res.emails || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTemplateChange = (key) => {
    setSelectedTemplateKey(key);
    if (templates[key]) {
      setSubject(templates[key].subject);
      setBodyTemplate(templates[key].body);
    }
  };

  const selectStageGroup = (stage) => {
    if (stage === 'all') {
      setSelectedCandidateIds(candidates.map((c) => c.candidate.id));
    } else {
      setSelectedCandidateIds(
        candidates.filter((c) => c.candidate.stage === stage).map((c) => c.candidate.id)
      );
    }
  };

  const toggleSelect = (id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedCandidateIds.length === 0) {
      alert('Please select at least one candidate to email.');
      return;
    }
    setIsSending(true);
    setSendSuccessMsg('');

    try {
      const res = await api.sendBulkEmail(
        selectedCandidateIds,
        subject,
        bodyTemplate,
        companyName,
        interviewDate,
        interviewLink
      );
      setSendSuccessMsg(`Successfully sent ${res.sent_count} personalized outreach emails!`);
      loadHistory();
    } catch (err) {
      alert('Error sending emails: ' + err.message);
    } finally {
      setIsSending(false);
    }
  };

  const previewCandidate = candidates.find((c) =>
    selectedCandidateIds.includes(c.candidate.id)
  )?.candidate || candidates[0]?.candidate;

  const getPersonalizedPreview = (text) => {
    if (!text || !previewCandidate) return text || '';
    const firstName = previewCandidate.name.split(' ')[0];
    const topSkill = previewCandidate.skills?.[0] || 'Software Engineering';
    return text
      .replace(/{{first_name}}/g, firstName)
      .replace(/{{candidate_name}}/g, previewCandidate.name)
      .replace(/{{top_skill}}/g, topSkill)
      .replace(/{{job_title}}/g, activeJob?.title || 'Full-Stack Engineer')
      .replace(/{{company_name}}/g, companyName)
      .replace(/{{interview_date}}/g, interviewDate)
      .replace(/{{interview_link}}/g, interviewLink)
      .replace(/{{schedule_link}}/g, interviewLink);
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl shadow-xl overflow-hidden flex flex-col font-body text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-150">
      
      {/* Modal / Panel Header (Stitch Header) */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-white dark:bg-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-400 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-headline text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Bulk Candidate Outreach & Automated Interview Dispatch
            </h1>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
              Personalized automated invitation sequence for <strong>{selectedCandidateIds.length} Selected Candidates</strong>
            </p>
          </div>
        </div>

        {/* Tab switch & close */}
        <div className="flex items-center gap-2">
          <div className="flex bg-[#F1F5F9] dark:bg-[#0F172A] p-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold">
            <button
              onClick={() => setActiveTab('compose')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'compose'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E3A8A] dark:text-blue-400 shadow-2xs'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              Compose
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-[#1E293B] text-[#1E3A8A] dark:text-blue-400 shadow-2xs'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              History ({sentHistory.length})
            </button>
          </div>
        </div>
      </div>

      {sendSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-6 py-2.5 text-xs text-[#047857] dark:text-emerald-300 flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{sendSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'compose' ? (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8FAFC] dark:bg-[#0F172A]">
          
          {/* Left Column: Template & Message Editor (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Communication Template Buttons */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2">Communication Template</label>
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleTemplateChange('shortlisted')}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    selectedTemplateKey === 'shortlisted'
                      ? 'border-[#1E3A8A] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 font-semibold'
                      : 'border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-[#94A3B8] hover:border-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Round 1 Invite</span>
                    {selectedTemplateKey === 'shortlisted' && <Check className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">Tech interview + link</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTemplateChange('interview')}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    selectedTemplateKey === 'interview'
                      ? 'border-[#1E3A8A] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 font-semibold'
                      : 'border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-[#94A3B8] hover:border-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>Assignment / Tech</span>
                    {selectedTemplateKey === 'interview' && <Check className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">Take-home code test</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTemplateChange('rejection')}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    selectedTemplateKey === 'rejection'
                      ? 'border-[#1E3A8A] dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-blue-300 font-semibold'
                      : 'border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-[#475569] dark:text-[#94A3B8] hover:border-[#94A3B8]'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span>Gentle Reject</span>
                    {selectedTemplateKey === 'rejection' && <Check className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal mt-0.5">Warm talent pool note</p>
                </button>
              </div>
            </div>

            {/* Subject Line */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <label className="block text-xs font-semibold text-[#475569] dark:text-[#94A3B8] mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-md text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A8A] dark:focus:border-blue-500 outline-none"
              />
            </div>

            {/* Message Body with Tag Chips */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between mb-1.5 gap-2">
                <label className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Message Body</label>
                <div className="flex items-center gap-1 text-[11px] font-mono text-[#1E3A8A] dark:text-blue-400">
                  <span>Tags:</span>
                  {['{{first_name}}', '{{top_skill}}', '{{interview_link}}'].map((tag) => (
                    <span
                      key={tag}
                      onClick={() => setBodyTemplate((b) => b + ' ' + tag)}
                      className="px-1.5 py-0.5 rounded bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] cursor-pointer hover:bg-[#E2E8F0] dark:hover:bg-[#334155]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                rows={9}
                value={bodyTemplate}
                onChange={(e) => setBodyTemplate(e.target.value)}
                className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:bg-white dark:focus:bg-[#0F172A] focus:border-[#1E3A8A] dark:focus:border-blue-500 outline-none leading-relaxed font-sans"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#334155] text-xs">
                <div>
                  <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 font-medium">Interview Slot / Date</label>
                  <input
                    type="text"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-0.5 font-medium">Meeting / Calendly Link</label>
                  <input
                    type="text"
                    value={interviewLink}
                    onChange={(e) => setInterviewLink(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Audience Selector & Live Preview (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">

            {/* Recipient Audience Filter */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                  <span>Target Recipients ({selectedCandidateIds.length})</span>
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{candidates.length} pool total</span>
              </div>

              {/* Stage Quick Filter Chips */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {['all', 'Shortlisted', 'Interview', 'Applied'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => selectStageGroup(st)}
                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#F1F5F9] dark:bg-[#0F172A] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#475569] dark:text-[#CBD5E1] border border-[#E2E8F0] dark:border-[#334155]"
                  >
                    {st === 'all' ? 'All Candidates' : st}
                  </button>
                ))}
              </div>

              {/* Candidate Selection List */}
              <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
                {candidates.map((c) => {
                  const isChecked = selectedCandidateIds.includes(c.candidate.id);
                  return (
                    <label
                      key={c.candidate.id}
                      className={`flex items-center justify-between p-2 rounded border cursor-pointer text-xs ${
                        isChecked ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' : 'bg-[#F8FAFC] dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#334155]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(c.candidate.id)}
                          className="rounded text-[#1E3A8A] dark:text-blue-500 border-[#CBD5E1] dark:border-[#475569]"
                        />
                        <div className="truncate">
                          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate">{c.candidate.name}</span>
                          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-mono block truncate">{c.candidate.email}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#CBD5E1] font-medium ml-2 shrink-0">
                        {c.candidate.stage}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Live Personalized Preview Card */}
            <div className="bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#4338CA] dark:text-indigo-400" />
                  <span>Live Render Preview</span>
                </span>
                <span className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                  For: {previewCandidate?.name || 'Candidate'}
                </span>
              </div>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-lg text-xs space-y-1.5 font-sans">
                <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] border-b border-[#E2E8F0] dark:border-[#334155] pb-1">
                  Subject: {getPersonalizedPreview(subject)}
                </div>
                <div className="text-[#334155] dark:text-[#CBD5E1] whitespace-pre-wrap leading-relaxed text-[11px] max-h-36 overflow-y-auto">
                  {getPersonalizedPreview(bodyTemplate)}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSend}
                disabled={isSending || selectedCandidateIds.length === 0}
                className="w-full mt-4 py-2.5 bg-[#1E3A8A] dark:bg-blue-600 hover:bg-[#172554] dark:hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSending
                    ? 'Dispatching Emails...'
                    : `Send Outreach Campaign (${selectedCandidateIds.length} Recipients)`}
                </span>
              </button>
            </div>

          </div>

        </div>
      ) : (
        /* History Tab */
        <div className="p-6 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl bg-white dark:bg-[#1E293B] overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] text-[#475569] dark:text-[#94A3B8]">
                  <th className="py-2.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Recipient</th>
                  <th className="py-2.5 px-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Subject</th>
                  <th className="py-2.5 px-3 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Time</th>
                  <th className="py-2.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                {sentHistory.length > 0 ? (
                  sentHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50">
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{item.recipient_name}</span>
                        <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono">{item.recipient_email}</span>
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px] truncate text-[#334155] dark:text-[#CBD5E1]">{item.subject}</td>
                      <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8] font-mono">{new Date(item.sent_at).toLocaleTimeString()}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#047857] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                          Sent
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No previous outreach emails recorded in this session.
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
