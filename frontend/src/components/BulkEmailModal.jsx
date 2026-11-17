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
  FileText
} from 'lucide-react';
import { api } from '../api';

export default function BulkEmailModal({ candidates = [], activeJob }) {
  const [activeTab, setActiveTab] = useState('compose'); // 'compose' | 'history'
  const [templates, setTemplates] = useState({});
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('shortlisted');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [subject, setSubject] = useState('');
  const [bodyTemplate, setBodyTemplate] = useState('');
  const [companyName, setCompanyName] = useState('HireSwift Technologies');
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
      const payload = {
        candidate_ids: selectedCandidateIds,
        template_type: selectedTemplateKey,
        subject,
        body_template: bodyTemplate,
        job_title: activeJob?.title || 'Software Engineer',
        company_name: companyName,
        interview_date: interviewDate,
        interview_link: interviewLink
      };

      const res = await api.sendBulkEmail(payload);
      setSendSuccessMsg(`Successfully delivered ${res.total_sent} personalized emails!`);
      loadHistory();
    } catch (e) {
      alert('Error sending emails: ' + e.message);
    } finally {
      setIsSending(false);
    }
  };

  // Preview interpolation for first selected candidate
  const previewCandidate = candidates.find((c) => selectedCandidateIds.includes(c.candidate.id))?.candidate || candidates[0]?.candidate;

  const renderPreview = (text) => {
    if (!previewCandidate) return text;
    return text
      .replace(/\{\{\s*name\s*\}\}/g, previewCandidate.name)
      .replace(/\{\{\s*job_title\s*\}\}/g, activeJob?.title || 'Software Engineer')
      .replace(/\{\{\s*company\s*\}\}/g, companyName)
      .replace(/\{\{\s*skills\s*\}\}/g, previewCandidate.skills?.slice(0, 4).join(', ') || 'Engineering')
      .replace(/\{\{\s*experience\s*\}\}/g, `${previewCandidate.years_of_experience} years`)
      .replace(/\{\{\s*interview_date\s*\}\}/g, interviewDate)
      .replace(/\{\{\s*interview_link\s*\}\}/g, interviewLink)
      .replace(/\{\{\s*missing_skills\s*\}\}/g, 'cloud containerization');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Bulk Candidate Communications</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Send dynamic, personalized updates to shortlisted, interview, or rejected candidates using customizable templates.
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'compose' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compose Campaign
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sent Outbox ({sentHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
          {/* Left Column: Recipients & Template Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Selection Buttons */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="font-bold text-slate-200 block text-xs uppercase tracking-wide">
                1. Select Recipients ({selectedCandidateIds.length} Selected)
              </span>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => selectStageGroup('Shortlisted')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                >
                  All Shortlisted
                </button>
                <button
                  type="button"
                  onClick={() => selectStageGroup('Interview')}
                  className="px-2.5 py-1 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 border border-violet-500/30 text-[11px] font-semibold"
                >
                  All In Interview
                </button>
                <button
                  type="button"
                  onClick={() => selectStageGroup('Offer')}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold"
                >
                  All Offers
                </button>
                <button
                  type="button"
                  onClick={() => selectStageGroup('all')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                >
                  Select All
                </button>
              </div>

              {/* Candidates Scrollable Checkbox List */}
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border border-slate-800 rounded-lg p-2 bg-slate-850">
                {candidates.map((item) => {
                  const c = item.candidate;
                  const isChecked = selectedCandidateIds.includes(c.id);

                  return (
                    <label
                      key={c.id}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(c.id)}
                          className="accent-indigo-500 rounded"
                        />
                        <span className="font-medium text-slate-200">{c.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.2 rounded bg-slate-800">
                        {c.stage}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Template Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="font-bold text-slate-200 block text-xs uppercase tracking-wide">
                2. Choose Email Template
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'shortlisted', label: 'Shortlisted' },
                  { key: 'interview', label: 'Interview Invitation' },
                  { key: 'offer', label: 'Job Offer' },
                  { key: 'rejection', label: 'Polite Rejection' }
                ].map((tpl) => (
                  <button
                    key={tpl.key}
                    type="button"
                    onClick={() => handleTemplateChange(tpl.key)}
                    className={`p-2.5 rounded-lg border text-left font-semibold transition-all ${
                      selectedTemplateKey === tpl.key
                        ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-600/10'
                        : 'bg-slate-850 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Inputs for variables */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Company Name:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                  />
                </div>
                {selectedTemplateKey === 'interview' && (
                  <>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Interview Date & Time:</label>
                      <input
                        type="text"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-[11px] mb-1">Meeting Link:</label>
                      <input
                        type="text"
                        value={interviewLink}
                        onChange={(e) => setInterviewLink(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-slate-200"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Editor & Live Interpolated Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="font-bold text-slate-200 block text-xs uppercase tracking-wide">
                3. Subject & Template Editor
              </span>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Subject Line:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Email Body:</label>
                <textarea
                  rows="9"
                  value={bodyTemplate}
                  onChange={(e) => setBodyTemplate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="text-[11px] text-slate-500 flex flex-wrap gap-1 items-center">
                <span>Available Placeholders:</span>
                {['{{name}}', '{{job_title}}', '{{company}}', '{{skills}}', '{{interview_date}}', '{{interview_link}}'].map((pl) => (
                  <span key={pl} className="px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono text-[10px]">
                    {pl}
                  </span>
                ))}
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Live Rendered Preview (Previewing for {previewCandidate?.name || 'Candidate'})</span>
                </span>
                <span className="text-[10px] text-slate-500">Variables Replaced</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 font-sans text-xs space-y-2 text-slate-200">
                <div className="font-bold text-white border-b border-slate-800 pb-1.5">
                  Subject: {renderPreview(subject)}
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                  {renderPreview(bodyTemplate)}
                </div>
              </div>

              {/* Send Button & Status */}
              <div className="pt-2 flex items-center justify-between">
                {sendSuccessMsg && (
                  <div className="text-emerald-400 font-bold flex items-center space-x-1 text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>{sendSuccessMsg}</span>
                  </div>
                )}
                <div className="ml-auto">
                  <button
                    onClick={handleSend}
                    disabled={selectedCandidateIds.length === 0 || isSending}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCandidateIds.length > 0 && !isSending
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSending
                        ? 'Delivering...'
                        : `Send to ${selectedCandidateIds.length} Candidate(s)`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Sent History Tab */
        <div className="space-y-3 text-xs">
          {sentHistory.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
              No emails sent yet in this session.
            </div>
          ) : (
            sentHistory.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{rec.candidate_name}</span>
                    <span className="text-slate-400">({rec.candidate_email})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {rec.status}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {new Date(rec.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="text-slate-300 font-semibold">{rec.subject}</div>

                <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-[11px] text-slate-400 whitespace-pre-wrap max-h-24 overflow-y-auto">
                  {rec.body}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
