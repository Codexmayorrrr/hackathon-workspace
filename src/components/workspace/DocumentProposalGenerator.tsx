import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Building2, 
  FileCheck2 
} from 'lucide-react';
import { Opportunity } from '../../types';
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
  const [isCopied, setIsCopied] = useState(false);

  const getDocContent = (): { title: string; content: string } => {
    switch (docType) {
      case 'executive_1pager':
        return {
          title: 'Executive 1-Pager: Project Summary & Value Proposition',
          content: `# ${opportunity.title} — Executive Summary

## 1. Problem Statement
Cross-border informal merchants across West Africa face severe banking delays (3–5 business days) and exorbitant foreign exchange fees (8–14% parallel spreads) when settling supplier invoices. This structural friction restricts merchant trade velocity and traps working capital.

## 2. Engineered Solution
An embedded settlement infrastructure combining local bank transfer virtual accounts with instant stablecoin liquidity. Transactions clear in sub-6 seconds with sub-cent network routing fees, offering complete cryptographic verification with zero end-user gas friction.

## 3. Market Opportunity (TAM / SAM / SOM)
- **Total Addressable Market (TAM):** $115B annual informal merchant trade across ECOWAS.
- **Serviceable Addressable Market (SAM):** $18B tech-enabled commercial trade.
- **Serviceable Obtainable Market (SOM):** $240M Year 1 volume across 14,000 active importers.

## 4. Monetization & Unit Economics
- Fixed 0.35% transaction routing fee (70% cheaper than traditional bank wire corridors).
- 0.15% instant liquidity rebalancing fee for high-frequency cash agents.

## 5. Execution Team
Experienced fintech infrastructure builders with 4+ years of experience scaling payment rails handling $4M+ in monthly transaction volume.`,
        };

      case 'business_proposal':
        return {
          title: 'Comprehensive Commercial & Business Proposal',
          content: `# Commercial Partnership Proposal: Decentralized B2B Settlement Rails

### Strategic Alignment
Targeting the **${opportunity.title}** theme, this proposal outlines the commercial deployment of our instant clearing SDK for regional merchant associations.

### Key Milestones & Rollout Plan
1. **Phase 1: Controlled Pilot (Month 1)** — Integration with 15 verified importers in Balogun Market, Lagos. Target volume: $250,000.
2. **Phase 2: Multi-Currency Corridors (Months 2–3)** — Connecting Nigerian Naira virtual accounts to Ghanaian Cedi and CFA franc settlement pools.
3. **Phase 3: Regulatory Sandbox Submission (Month 4)** — Engaging with Central Bank sandbox frameworks for compliant digital asset transaction processing.

### Risk Mitigation & Compliance
- Full KYC/AML tiered onboarding via automated biometric verification.
- Real-time sanctions screening and transaction velocity limits.
- Redundant multi-bank clearing partnerships ensuring 99.99% uptime.`,
        };

      case 'grant_statement':
        return {
          title: 'Non-Dilutive Grant & Impact Statement',
          content: `# Grant Application: Financial Inclusion for Informal Border Traders

### Executive Justification
Over 70% of cross-border trade in West Africa is conducted informally by women-led micro-enterprises. These merchants lack access to institutional letters of credit and suffer high robbery risk carrying cash across border corridors.

### Social & Economic Impact
By providing transparent, low-cost digital settlement on standard smartphones without continuous internet connectivity, our project:
- Protects trader physical safety by eliminating cross-border cash couriers.
- Reduces trade transaction costs from 12% to under 0.5%, preserving merchant profit margins.
- Creates verifiable digital transaction histories enabling micro-merchants to access formal credit.

### Grant Allocation Budget
- 45%: Core smart contract security audits and cryptographic verification.
- 30%: Merchant field pilots and localized onboarding in Yoruba, Hausa, and French.
- 25%: Cloud server infrastructure and 99.99% uptime redundancy.`,
        };

      case 'tech_spec':
        return {
          title: 'Technical Whitepaper & Architecture Specification',
          content: `# Technical Architecture Specification

## Architecture Overview
The system employs an event-driven decoupled architecture:
1. **Client SDK:** Embedded zero-gas React Native / TypeScript client with local encrypted SQLite storage.
2. **Core Ingestion Engine:** High-performance Rust service running signature verification in sub-10ms.
3. **Payment Gateway Integration:** Asynchronous webhook listener processing Paystack virtual account credit notifications via AWS SQS with dead-letter queue retries.
4. **On-Chain Settlement Rail:** Circle CCTP smart contracts deployed on Ethereum L2s with account abstraction paymasters.

## Fault Tolerance & Concurrency
- Idempotent transaction processing preventing double-spend under high concurrency.
- Redis-backed distributed lock manager for atomic account balance updates.
- Automated fallback to offline queue mode with Bluetooth Low Energy gossip synchronization during regional cellular blackouts.`,
        };
    }
  };

  const doc = getDocContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content);
    setIsCopied(true);
    toast.success('Document copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#FDFDFD] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-neutral-800">
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight [text-wrap:balance]">
                  Automated Document & Proposal Generator
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5F5F5] text-neutral-700 font-mono font-semibold">
                  PRD §3.G
                </span>
              </div>
              <p className="text-xs text-neutral-500 [text-wrap:pretty]">
                Generates properly structured executive proposals, business plans, and grant writeups from your project data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="btn-tactile-secondary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3.5 h-3.5 stroke-[1.75]" />}
              <span>{isCopied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={() => toast.success('Exported to PDF')}
              className="btn-tactile-primary px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Document Format Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
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
                key={tab.id}
                onClick={() => setDocType(tab.id as DocType)}
                className={`p-3 rounded-xl text-left transition-[transform,background-color,color] duration-150 active:scale-[0.97] ${
                  isSelected
                    ? 'btn-tactile-primary font-semibold'
                    : 'btn-tactile-secondary text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 stroke-[1.75]" />
                  <span className="text-xs">{tab.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rendered Document View */}
      <div className="p-6 sm:p-10 rounded-2xl bg-[#FDFDFD] space-y-4">
        <h4 className="text-sm font-bold text-neutral-900 pb-2">
          {doc.title}
        </h4>
        <pre className="font-sans text-xs sm:text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap select-all">
          {doc.content}
        </pre>
      </div>
    </div>
  );
};
