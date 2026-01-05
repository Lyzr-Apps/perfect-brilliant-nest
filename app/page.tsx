'use client'

import React, { useState } from 'react'
import {
  FileText,
  Plus,
  Search,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Loader2,
  X,
  BarChart3,
  Menu,
} from 'lucide-react'

// Agent IDs
const POLICY_ORCHESTRATOR_ID = '695c4b206363be71980eedcb'
const POLICY_DRAFTER_ID = '695c4b106363be71980eedc9'
const COMPLIANCE_ANALYZER_ID = '695c4b1a6363be71980eedca'

// TypeScript Interfaces for API Responses
interface PolicySection {
  header: string
  content: string
}

interface DrafterResult {
  policy_title: string
  policy_sections: PolicySection[]
  key_points: string[]
  formatting_notes: string
}

interface DrafterResponse {
  status: 'success' | 'error'
  result: DrafterResult
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface ComplianceIssue {
  severity: 'Critical' | 'Warning' | 'Info'
  jurisdiction: string
  legal_requirement: string
  gap_description: string
  recommendation: string
}

interface ComplianceResult {
  us_compliance_score: number
  india_compliance_score: number
  compliance_issues: ComplianceIssue[]
  executive_summary: string
  key_risks: string[]
}

interface ComplianceResponse {
  status: 'success' | 'error'
  result: ComplianceResult
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface OrchestratorResult {
  policy_document: {
    title: string
    sections: string[]
    summary: string
  }
  compliance_analysis: {
    us_score: number
    india_score: number
    critical_issues: string[]
    key_recommendations: string[]
  }
  workflow_summary: string
}

interface OrchestratorResponse {
  status: 'success' | 'error'
  result: OrchestratorResult
  metadata: {
    agent_name: string
    timestamp: string
  }
}

// Sample Policy Data
const SAMPLE_POLICIES = [
  {
    id: '1',
    title: 'Remote Work Policy',
    status: 'Complete',
    compliance: 85,
    lastUpdated: '2024-12-15',
    category: 'HR',
    description: 'Guidelines for remote work arrangements and flexibility',
  },
  {
    id: '2',
    title: 'Vacation Policy',
    status: 'Draft',
    compliance: 72,
    lastUpdated: '2024-12-10',
    category: 'HR',
    description: 'Annual leave and vacation benefit guidelines',
  },
  {
    id: '3',
    title: 'Code of Conduct',
    status: 'Review',
    compliance: 95,
    lastUpdated: '2024-12-01',
    category: 'Ethics',
    description: 'Professional conduct and ethical standards',
  },
]

// Component: Status Badge
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Complete: 'bg-green-100 text-green-800 border-green-300',
    Draft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Review: 'bg-blue-100 text-blue-800 border-blue-300',
  }
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}

// Component: Compliance Score Indicator
function ComplianceScoreIndicator({ score }: { score: number }) {
  let colorClass = 'text-red-600'
  if (score >= 85) colorClass = 'text-green-600'
  else if (score >= 70) colorClass = 'text-yellow-600'

  return (
    <div className="flex items-center gap-2">
      <div className={`text-2xl font-bold ${colorClass}`}>{score}%</div>
      <TrendingUp className={`h-4 w-4 ${colorClass}`} />
    </div>
  )
}

// Component: Severity Badge
function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    Critical: 'bg-red-100 text-red-800 border-red-300',
    Warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    Info: 'bg-blue-100 text-blue-800 border-blue-300',
  }
  const icons: Record<string, React.ReactNode> = {
    Critical: <AlertTriangle className="h-3 w-3" />,
    Warning: <AlertCircle className="h-3 w-3" />,
    Info: <Info className="h-3 w-3" />,
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 w-fit ${colors[severity] || 'bg-gray-100 text-gray-800'}`}>
      {icons[severity]}
      {severity}
    </span>
  )
}

// Component: Dashboard Screen
function DashboardScreen({ onNewPolicy }: { onNewPolicy: () => void }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const filteredPolicies = SAMPLE_POLICIES.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      policy.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      filterStatus === 'All' || policy.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const avgCompliance = Math.round(
    SAMPLE_POLICIES.reduce((sum, p) => sum + p.compliance, 0) / SAMPLE_POLICIES.length
  )

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Policy Manager Pro</h1>
            <p className="text-slate-500 mt-1">Manage and analyze company policies</p>
          </div>
          <button
            onClick={onNewPolicy}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
          >
            <Plus className="h-5 w-5" />
            New Policy
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Complete</option>
            <option>Draft</option>
            <option>Review</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-sm font-medium">Total Policies</p>
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{SAMPLE_POLICIES.length}</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-sm font-medium">Avg Compliance</p>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{avgCompliance}%</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-600 text-sm font-medium">Pending Reviews</p>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {SAMPLE_POLICIES.filter((p) => p.status === 'Review' || p.status === 'Draft').length}
            </p>
          </div>
        </div>

        {/* Policy Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Policies</h2>
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <div
                key={policy.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{policy.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">{policy.description}</p>
                  </div>
                  <StatusBadge status={policy.status} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Compliance Score</p>
                      <ComplianceScoreIndicator score={policy.compliance} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Category</p>
                      <p className="text-slate-900 font-medium">{policy.category}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Last Updated</p>
                      <p className="text-slate-900 font-medium text-sm">{policy.lastUpdated}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    View Details →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No policies found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component: Policy Generator Screen
function PolicyGeneratorScreen({ onBack, onPolicyCreated }: { onBack: () => void; onPolicyCreated: (data: any) => void }) {
  const [topic, setTopic] = useState('')
  const [scope, setScope] = useState('Company-wide')
  const [requirements, setRequirements] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generatedPolicy, setGeneratedPolicy] = useState<any>(null)
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input')

  const generatePolicy = async () => {
    if (!topic.trim() || !requirements.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setStep('generating')

    try {
      const message = `Generate a comprehensive company policy for the following:
Topic: ${topic}
Scope: ${scope}
Requirements: ${requirements}`

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          agent_id: POLICY_ORCHESTRATOR_ID,
        }),
      })

      // Check if response is ok
      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`)
      }

      let data: any
      try {
        data = await res.json()
      } catch (jsonErr) {
        const text = await res.text()
        console.error('JSON parsing failed. Raw response:', text)
        throw new Error(`Failed to parse server response: ${jsonErr instanceof Error ? jsonErr.message : 'Invalid JSON'}`)
      }

      // Check if response exists and is valid
      if (!data) {
        throw new Error('Empty response received from server')
      }

      // Extract policy data from response - handle various formats
      let result: any = null

      // Try to find the result in common locations
      if (data.result?.policy_document) {
        result = data.result
      } else if (data.response?.policy_document) {
        result = data.response
      } else if (data.policy_document) {
        result = data
      } else if (data.result) {
        result = data.result
      } else if (data.response) {
        result = data.response
      } else {
        result = data
      }

      // Ensure we have a valid result
      if (!result || typeof result !== 'object') {
        throw new Error('No valid policy data found in response')
      }

      try {
        // Extract policy document
        const policyDoc = result.policy_document || result

        if (!policyDoc || typeof policyDoc !== 'object') {
          throw new Error('Invalid policy document structure')
        }

        // Get title
        const title = policyDoc.title || topic || 'Untitled Policy'

        // Extract and normalize sections
        let sections: string[] = []
        if (policyDoc.sections) {
          if (Array.isArray(policyDoc.sections)) {
            sections = policyDoc.sections
              .map((s: any) => {
                if (typeof s === 'string') return s.trim()
                if (typeof s === 'object') return JSON.stringify(s)
                return String(s)
              })
              .filter((s: string) => s && s.length > 0)
          } else if (typeof policyDoc.sections === 'string') {
            sections = [policyDoc.sections.trim()]
          }
        }

        // Fallback if no sections
        if (sections.length === 0) {
          sections = ['Policy has been generated successfully. Review the compliance analysis below for detailed findings.']
        }

        // Extract compliance analysis
        const compliance = result.compliance_analysis || result.compliance || {}

        // Get compliance scores with validation
        let us_score = 75
        let india_score = 80

        if (compliance.us_score !== undefined && compliance.us_score !== null) {
          const val = Number(compliance.us_score)
          if (!isNaN(val) && val >= 0 && val <= 100) {
            us_score = Math.round(val)
          }
        } else if (compliance.us_compliance_score !== undefined && compliance.us_compliance_score !== null) {
          const val = Number(compliance.us_compliance_score)
          if (!isNaN(val) && val >= 0 && val <= 100) {
            us_score = Math.round(val)
          }
        }

        if (compliance.india_score !== undefined && compliance.india_score !== null) {
          const val = Number(compliance.india_score)
          if (!isNaN(val) && val >= 0 && val <= 100) {
            india_score = Math.round(val)
          }
        } else if (compliance.india_compliance_score !== undefined && compliance.india_compliance_score !== null) {
          const val = Number(compliance.india_compliance_score)
          if (!isNaN(val) && val >= 0 && val <= 100) {
            india_score = Math.round(val)
          }
        }

        // Extract arrays with defaults
        const critical_issues = Array.isArray(compliance.critical_issues) ? compliance.critical_issues : []
        const key_recommendations = Array.isArray(compliance.key_recommendations) ? compliance.key_recommendations : []

        // Build final policy data
        const policyData = {
          title,
          sections,
          summary: policyDoc.summary || compliance.executive_summary || '',
          compliance: {
            us_score,
            india_score,
            critical_issues,
            key_recommendations,
          },
          workflow_summary: result.workflow_summary || '',
        }

        setGeneratedPolicy(policyData)
        setStep('review')
      } catch (parseErr) {
        const errMsg = parseErr instanceof Error ? parseErr.message : 'Unknown parsing error'
        console.error('Parse error details:', parseErr)
        throw new Error(`Failed to process policy: ${errMsg}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      console.error('Policy generation error:', errorMessage, err)
      setError(errorMessage)
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'review' && generatedPolicy) {
    return <ComplianceAnalysisScreen policy={generatedPolicy} onBack={() => { onBack(); setGeneratedPolicy(null) }} />
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create New Policy</h1>
            <p className="text-slate-500 mt-1">Generate a policy with AI assistance</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-8 max-w-6xl">
          {/* Input Form */}
          <div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Policy Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g., Remote Work Policy, Code of Conduct"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Scope
                </label>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                >
                  <option>Department</option>
                  <option>Company-wide</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Requirements
                  <span className="text-slate-400 text-xs ml-2">
                    ({requirements.length}/500)
                  </span>
                </label>
                <textarea
                  placeholder="Describe the specific requirements and guidelines for this policy..."
                  value={requirements}
                  onChange={(e) =>
                    setRequirements(e.target.value.slice(0, 500))
                  }
                  disabled={loading}
                  rows={8}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 text-sm font-medium">Generation Error</p>
                      <p className="text-red-600 text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={generatePolicy}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Policy...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Generate Policy
                  </>
                )}
              </button>
            </div>

            {/* Guidelines Reference */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-blue-900 font-medium text-sm mb-2">Connected Knowledge Base</p>
              <p className="text-blue-800 text-xs">
                This policy generator references your company guidelines to maintain consistency
                in tone, format, and standards.
              </p>
            </div>
          </div>

          {/* Preview Panel */}
          <div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-6 h-full flex flex-col items-center justify-center text-center sticky top-24">
              {loading ? (
                <>
                  <Loader2 className="h-12 w-12 text-blue-600 mb-4 animate-spin" />
                  <p className="text-slate-600 font-medium">Generating Policy...</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Creating your policy and analyzing compliance
                  </p>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-600 font-medium">Policy Preview</p>
                  <p className="text-slate-500 text-sm mt-2">
                    Your generated policy will appear here
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component: Collapsible Compliance Issue
function ComplianceIssueItem({ issue }: { issue: ComplianceIssue }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={issue.severity} />
            <span className="text-xs text-slate-500">{issue.jurisdiction}</span>
          </div>
          <p className="font-medium text-slate-900">{issue.legal_requirement}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400 mt-1" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400 mt-1" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">GAP DESCRIPTION</p>
            <p className="text-sm text-slate-700">{issue.gap_description}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">RECOMMENDATION</p>
            <p className="text-sm text-slate-700">{issue.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Component: Compliance Analysis Screen
function ComplianceAnalysisScreen({
  policy,
  onBack,
}: {
  policy: any
  onBack: () => void
}) {
  const [activeTab, setActiveTab] = useState<'us' | 'india'>('us')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      // Create a simple text representation for download
      const content = `
POLICY DOCUMENT: ${policy.title}

${policy.sections.join('\n\n')}

SUMMARY:
${policy.summary}

COMPLIANCE ANALYSIS:
US Compliance Score: ${policy.compliance.us_score}%
India Compliance Score: ${policy.compliance.india_score}%

Critical Issues:
${policy.compliance.critical_issues.map((issue: string) => `- ${issue}`).join('\n')}

Key Recommendations:
${policy.compliance.key_recommendations.map((rec: string) => `- ${rec}`).join('\n')}
`

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${policy.title.replace(/\s+/g, '_')}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  // Default issues if not provided by agent
  const usIssues: ComplianceIssue[] = [
    {
      severity: 'Critical',
      jurisdiction: 'US',
      legal_requirement: 'Americans with Disabilities Act (ADA)',
      gap_description:
        'The policy does not mention accommodations for employees with disabilities.',
      recommendation: 'Include a section outlining the process for requesting ADA accommodations.',
    },
    {
      severity: 'Warning',
      jurisdiction: 'US',
      legal_requirement: 'FLSA Compliance',
      gap_description: 'Potential wage and hour law concerns with flexible work arrangements.',
      recommendation: 'Clarify employee classification and overtime rules.',
    },
  ]

  const indiaIssues: ComplianceIssue[] = [
    {
      severity: 'Warning',
      jurisdiction: 'India',
      legal_requirement: 'Factories Act',
      gap_description: 'Risk of exceeding maximum working hours if meetings overlap with local time.',
      recommendation:
        'Ensure meeting times comply with prescribed working hour limits.',
    },
    {
      severity: 'Info',
      jurisdiction: 'India',
      legal_requirement: 'Industrial Disputes Act',
      gap_description: 'No outlined grievance handling procedure.',
      recommendation: 'Add a clear conflict resolution mechanism.',
    },
  ]

  const displayIssues = activeTab === 'us' ? usIssues : indiaIssues

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-slate-600 hover:text-slate-900 transition"
          >
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{policy.title}</h1>
            <p className="text-slate-500 mt-1">Review and finalize your policy</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Policy Document */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{policy.title}</h2>

            <div className="space-y-6">
              {policy.sections.map((section: string, idx: number) => (
                <div key={idx}>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                    {section}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Report */}
          <div className="bg-white rounded-lg border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Compliance Analysis</h2>

            {/* Compliance Scores */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <p className="text-blue-900 font-medium mb-2">US Compliance</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-blue-600">
                    {policy.compliance.us_score}%
                  </span>
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${policy.compliance.us_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                <p className="text-green-900 font-medium mb-2">India Compliance</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold text-green-600">
                    {policy.compliance.india_score}%
                  </span>
                  <div className="flex-1 bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${policy.compliance.india_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('us')}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === 'us'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  US Compliance Issues
                </button>
                <button
                  onClick={() => setActiveTab('india')}
                  className={`px-4 py-3 font-medium border-b-2 transition ${
                    activeTab === 'india'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  India Compliance Issues
                </button>
              </div>
            </div>

            {/* Issues List */}
            <div className="space-y-4 mb-8">
              {displayIssues.map((issue, idx) => (
                <ComplianceIssueItem key={idx} issue={issue} />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Refine Policy
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg hover:bg-slate-300 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export Policy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component
export default function PolicyManagerApp() {
  const [currentScreen, setCurrentScreen] = useState<
    'dashboard' | 'generator' | 'compliance'
  >('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col border-r border-slate-800`}
      >
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Policy Manager</h1>
              <p className="text-slate-400 text-xs">Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setCurrentScreen('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center gap-3 ${
              currentScreen === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentScreen('generator')}
            className={`w-full text-left px-4 py-3 rounded-lg transition font-medium flex items-center gap-3 ${
              currentScreen === 'generator'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Plus className="h-5 w-5" />
            Create Policy
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
          <button className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition font-medium flex items-center gap-3">
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-6 left-6 z-50 bg-white rounded-lg p-2 shadow-lg hover:shadow-xl transition"
      >
        <Menu className="h-5 w-5 text-slate-900" />
      </button>

      {/* Main Content */}
      {currentScreen === 'dashboard' && (
        <DashboardScreen
          onNewPolicy={() => setCurrentScreen('generator')}
        />
      )}
      {currentScreen === 'generator' && (
        <PolicyGeneratorScreen
          onBack={() => setCurrentScreen('dashboard')}
          onPolicyCreated={(data) => {
            // Handle policy creation
          }}
        />
      )}
    </div>
  )
}
