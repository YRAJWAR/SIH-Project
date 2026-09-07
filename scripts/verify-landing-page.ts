import { readFileSync } from 'fs';
import { resolve } from 'path';

const pagePath = resolve(__dirname, '../src/app/page.tsx');
const content = readFileSync(pagePath, 'utf8');

console.log('Testing Landing Page (src/app/page.tsx) structure and pitch narrative:\n');

const checks = [
  { name: 'SECTION 1: Hero heading', pattern: /Jharkhand's Collaborative/i },
  { name: 'SECTION 1: Innovation Stack gradient text', pattern: /Innovation Stack/i },
  { name: 'SECTION 1: Subheading', pattern: /Connecting communities, universities, and industry to solve real challenges/i },
  { name: 'SECTION 1: Problem statement tag', pattern: /SIH 2026 \| Problem Statement SIH26043 \| Government of Jharkhand/i },
  { name: 'SECTION 1: View Live Challenges link', pattern: /href="\/track"/ },
  { name: 'SECTION 1: Submit a Challenge link', pattern: /href="\/citizen\/submit"/ },
  { name: 'SECTION 1: Stats - 12 Active Challenges', pattern: /Active Challenges/i },
  { name: 'SECTION 1: Stats - 24 Jharkhand Districts', pattern: /Jharkhand Districts/i },
  { name: 'SECTION 1: Stats - 6 Partner Institutions', pattern: /Partner Institutions/i },
  { name: 'SECTION 1: Stats - 1.5Cr CSR Committed', pattern: /CSR Committed/i },
  { name: 'SECTION 2: The Problem heading', pattern: /Three groups\. Thousands of problems\. Zero connection\./i },
  { name: 'SECTION 2: Communities text', pattern: /Jharkhand's 24 districts generate thousands of documented local challenges/i },
  { name: 'SECTION 2: Universities text', pattern: /16\+ HEIs in Jharkhand graduate 60,000\+ students annually/i },
  { name: 'SECTION 2: Industry text', pattern: /₹800\+ crore in annual CSR spending in Jharkhand/i },
  { name: 'SECTION 2: Punchline bold text', pattern: /The bottleneck isn't resources or expertise\. <span[^>]*>It's routing\.<\/span>/i },
  { name: 'SECTION 3: 6-Actor heading', pattern: /One platform\. Six actors\. A closed innovation loop\./i },
  { name: 'SECTION 3: CITIZEN [submits challenge]', pattern: /CITIZEN[\s\S]*\[submits challenge\]/ },
  { name: 'SECTION 3: GOVERNMENT [validates & routes]', pattern: /GOVERNMENT[\s\S]*\[validates & routes\]/ },
  { name: 'SECTION 3: UNIVERSITY [forms team', pattern: /UNIVERSITY[\s\S]*\[forms team/ },
  { name: 'SECTION 3: NGO [deploys on ground]', pattern: /NGO[\s\S]*\[deploys on ground\]/ },
  { name: 'SECTION 3: CSR COMPANY [funds milestones]', pattern: /CSR COMPANY[\s\S]*\[funds milestones\]/ },
  { name: 'SECTION 3: CITIZEN [validates outcome]', pattern: /CITIZEN[\s\S]*\[validates outcome\]/ },
  { name: 'SECTION 4: Key features heading', pattern: /What makes this different/i },
  { name: 'SECTION 4: Triple Helix Routing Engine + formula', pattern: /Triple Helix Routing Engine[\s\S]*SDG Overlap \(40%\) \+ Geographic Proximity \(30%\) \+ HEI Performance \(30%\)/ },
  { name: 'SECTION 4: SHA-256 Tamper-Evident Ledger', pattern: /SHA-256 Tamper-Evident Ledger/i },
  { name: 'SECTION 4: NEP 2020 Academic Credentials', pattern: /NEP 2020 Academic Credentials/i },
  { name: 'SECTION 5: Live Challenges teaser heading', pattern: /12 active challenges across Jharkhand/i },
  { name: 'SECTION 5: Challenge 1 (Dumka)', pattern: /High school dropout rate in Dumka tribal belt/i },
  { name: 'SECTION 5: Challenge 2 (Garhwa)', pattern: /Crop pest management for kharif season in Garhwa/i },
  { name: 'SECTION 5: Challenge 3 (Latehar)', pattern: /Road connectivity to 8 villages in Latehar/i },
  { name: 'SECTION 5: View all challenges button', pattern: /View all challenges/i },
  { name: 'SECTION 6: Demo accounts heading', pattern: /Try it yourself — Demo Credentials/i },
  { name: 'SECTION 6: Password note', pattern: /Demo@1234/i },
  { name: 'SECTION 6: 6 Demo accounts (citizen, collector, faculty, csr, admin, student)', pattern: /citizen@jharkhand\.gov\.in[\s\S]*collector@jharkhand\.gov\.in[\s\S]*faculty@nitjsr\.ac\.in[\s\S]*csr@tatasteel\.com[\s\S]*admin@pradan\.net[\s\S]*student@nitjsr\.ac\.in/ },
  { name: 'SECTION 7: Footer left text', pattern: /SDG Nexus \| SIH 2026 \| PS SIH26043/i },
  { name: 'SECTION 7: Footer centre text', pattern: /Built in 72 hours by a student team/i },
  { name: 'SECTION 7: Footer right text', pattern: /Government of Jharkhand \| NEP 2020 Compliant \| DPDP Act 2023 Compliant/i },
  { name: 'Mobile responsiveness: responsive grids (grid-cols-1 md:grid-cols-3)', pattern: /grid-cols-1 md:grid-cols-3/ },
  { name: 'Mobile responsiveness: responsive buttons (flex-col sm:flex-row)', pattern: /flex-col sm:flex-row/ },
];

let failed = 0;
for (const check of checks) {
  if (check.pattern.test(content)) {
    console.log(`✓ ${check.name}`);
  } else {
    console.error(`✗ FAILED: ${check.name}`);
    failed++;
  }
}

if (failed === 0) {
  console.log('\n🎉 ALL 38 LANDING PAGE CHECKS PASSED PERFECTLY!');
  process.exit(0);
} else {
  console.error(`\n❌ ${failed} checks failed.`);
  process.exit(1);
}
