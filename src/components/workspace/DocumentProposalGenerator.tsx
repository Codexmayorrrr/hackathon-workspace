import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Layers,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { Opportunity } from '../../types';
import { MarkdownContent } from '../ui/MarkdownContent';
import { toast } from 'sonner';

interface DocumentProposalGeneratorProps {
  opportunity: Opportunity;
  workspaceId: string;
}

type DocType = 'executive_1pager' | 'business_proposal' | 'grant_statement' | 'tech_spec';

export const DocumentProposalGenerator: React.FC<DocumentProposalGeneratorProps> = ({
  opportunity,
}) => {
  const [docType, setDocType] = useState<DocType>('executive_1pager');
  const [viewMode, setViewMode] = useState<'formatted' | 'markdown'>('formatted');
  const [isCopied, setIsCopied] = useState(false);

  const getDocContent = (): { title: string; content: string } => {
    switch (docType) {
      case 'executive_1pager':
        return {
          title: 'Executive 1-Pager: Project Summary & Value Proposition',
          content: `# ${opportunity.title} — Executive Summary

## 1. Problem Statement
Cross-border informal merchants across West Africa face severe banking delays (3–5 business days) and high foreign exchange spreads (8–14%) when settling supplier invoices. This friction slows inventory restocking and locks up working capital.

## 2. Engineered Solution
An embedded settlement infrastructure combining local bank virtual accounts with instant stablecoin liquidity. Transactions clear in under 6 seconds with sub-cent routing fees and automated verification.

## 3. Market Opportunity (TAM / SAM / SOM)
- **Total Addressable Market (TAM):** $115B annual informal merchant trade across ECOWAS.
- **Serviceable Addressable Market (SAM):** $18B tech-enabled commercial trade.
- **Serviceable Obtainable Market (SOM):** $240M Year 1 volume across 14,000 active importers.

## 4. Monetization & Unit Economics
- Fixed 0.35% transaction routing fee (70% lower than legacy wire corridors).
- 0.15% instant liquidity rebalancing fee for high-frequency cash agents.

## 5. Execution Team
Experienced fintech infrastructure builders with 4+ years of experience scaling payment rails handling $4M+ in monthly transaction volume.`,
        };

      case 'business_proposal':
        return {
          title: 'Commercial & Business Proposal',
          content: `# Commercial Partnership Proposal: Decentralized B2B Settlement Rails

### Strategic Alignment
Targeting **${opportunity.title}**, this proposal outlines the commercial rollout of our instant clearing SDK for regional merchant associations.

### Key Milestones & Rollout Plan
1. **Phase 1: Controlled Pilot (Month 1)** — Integration with 15 verified importers in Balogun Market, Lagos. Target volume: $250,000.
2. **Phase 2: Multi-Currency Corridors (Months 2–3)** — Connecting Nigerian Naira virtual accounts to Ghanaian Cedi and CFA franc settlement pools.
3. **Phase 3: Regulatory Sandbox Submission (Month 4)** — Engaging Central Bank sandbox frameworks for compliant digital asset processing.

### Risk Mitigation & Compliance
- Tiered KYC/AML onboarding via automated verification.
- Real-time sanctions screening and transaction velocity limits.
- Redundant multi-bank clearing partnerships targeting 99.99% uptime.`,
        };

      case 'grant_statement':
        return {
          title: 'Non-Dilutive Grant & Impact Statement',
          content: `# Grant Application: Financial Inclusion for Cross-Border Traders

### Executive Justification
Over 70% of regional cross-border trade is conducted informally by women-led micro-enterprises lacking access to institutional letters of credit and facing cash-courier safety risks.

### Social & Economic Impact
By providing low-cost digital settlement without requiring continuous broadband connectivity, the platform:
- Eliminates physical cash transport risks along border corridors.
- Cuts cross-border trade settlement overhead from 12% to under 0.5%.
- Builds verifiable digital transaction ledgers to unlock formal credit access.

### Grant Allocation Budget
- **45%** — Core smart contract security audits and cryptographic verification.
- **30%** — Field merchant pilots and localized onboarding in Yoruba, Hausa, and French.
- **25%** — Cloud server infrastructure and 99.99% uptime redundancy.`,
        };

      case 'tech_spec':
        return {
          title: 'Technical Architecture Specification',
          content: `# Technical Architecture Specification

## Architecture Overview
The system employs an event-driven decoupled architecture:
1. **Client SDK:** Zero-gas React Native and TypeScript client backed by encrypted local SQLite storage.
2. **Core Ingestion Engine:** High-throughput Rust service validating cryptographic signatures in under 10ms.
3. **Payment Gateway:** Asynchronous webhook worker processing virtual account events via AWS SQS dead-letter retry queues.
4. **On-Chain Settlement Rail:** Circle CCTP smart contracts deployed on Ethereum L2s with account abstraction paymasters.

## Fault Tolerance & Concurrency
- Idempotent transaction keys prevent double-spends under concurrent spikes.
- Redis-backed distributed locks keep ledger balances consistent.
- Offline SMS / BLE gossip fallback handles intermittent mobile connectivity.`,
        };
    }
  };

  const doc = getDocContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
    setIsCopied(true);
    toast.success('Markdown copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#065F46] flex items-center justify-center flex-shrink-0"
            >
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#18181B] tracking-tight">
                Document & Proposal Generator
              </h3>
              <p className="text-xs text-[#52525B] mt-0.5 max-w-[60ch]">
                Draft structured executive summaries, commercial proposals, and milestone budgets from your project details.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="btn-tactile-secondary px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 min-h-[38px]"
            >
              {isCopied ? (
                <Check aria-hidden="true" className="w-3.5 h-3.5 text-emerald-700 stroke-[2.25]" />
              ) : (
                <Copy aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75]" />
              )}
              <span>{isCopied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button
              type="button"
              onClick={() => toast.success('Prepared document PDF')}
              className="btn-tactile-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 min-h-[38px]"
            >
              <Download aria-hidden="true" className="w-3.5 h-3.5 stroke-[2]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Document Format Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5" role="group" aria-label="Proposal template">
          {[
            { id: 'executive_1pager', label: '1-Pager Summary', icon: Layers },
            { id: 'business_proposal', label: 'Business Proposal', icon: Building2 },
            { id: 'grant_statement', label: 'Grant Application', icon: FileCheck2 },
            { id: 'tech_spec', label: 'Tech Whitepaper', icon: FileText },
          ].map((tab) => {
            const isSelected = docType === tab.id;
            const Icon = tab.icon;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setDocType(tab.id as DocType)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl text-start transition-[transform,background-color,color] duration-150 active:scale-[0.96] min-h-[40px] ${
                  isSelected ? 'btn-tactile-primary font-semibold' : 'btn-tactile-secondary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon aria-hidden="true" className="w-3.5 h-3.5 stroke-[1.75] flex-shrink-0" />
                  <span className="text-xs truncate">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendered Document View */}
      <div className="surface-card p-6 sm:p-10 rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200/70">
          <h4 className="text-sm sm:text-base font-bold text-[#18181B]">
            {doc.title}
          </h4>

          <div className="flex items-center gap-1 bg-[#F4F4F6] p-1 rounded-xl self-start sm:self-auto" role="group" aria-label="Document preview format">
            <button
              type="button"
              onClick={() => setViewMode('formatted')}
              aria-pressed={viewMode === 'formatted'}
              className={`px-3 py-1 rounded-lg text-xs font-medium min-h-[28px] ${
                viewMode === 'formatted' ? 'bg-white shadow-border text-[#18181B] font-semibold' : 'text-[#52525B]'
              }`}
            >
              Formatted
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              aria-pressed={viewMode === 'markdown'}
              className={`px-3 py-1 rounded-lg text-xs font-medium min-h-[28px] ${
                viewMode === 'markdown' ? 'bg-white shadow-border text-[#18181B] font-semibold' : 'text-[#52525B]'
              }`}
            >
              Markdown
            </button>
          </div>
        </div>

        {viewMode === 'formatted' ? (
          <MarkdownContent content={doc.content} />
        ) : (
          <pre className="font-mono text-xs text-[#52525B] leading-relaxed whitespace-pre-wrap select-all bg-[#F4F4F6] p-4 rounded-xl">
            {doc.content}
          </pre>
        )}
      </div>
    </div>
  );
};
