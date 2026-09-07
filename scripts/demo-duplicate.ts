/**
 * SDG Nexus — Engine 6 Deduplication Demo Script
 * Demonstrates TF-IDF vector cosine similarity detecting duplicate challenge submissions.
 *
 * Test Case: Submits a challenge similar to Challenge #7 (Forest encroachment in Khunti)
 * Run with: npx tsx scripts/demo-duplicate.ts
 */

import { DeduplicationService } from '../src/services/deduplicationService';

async function main() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  SDG Nexus — Engine 6: Deduplication Engine Demonstration');
    console.log('  Smart India Hackathon 2026 • SIH26043 (Govt of Jharkhand)');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Duplicate candidate (targets Challenge #7: Forest encroachment in Khunti)
    const duplicateCandidate = {
        title: 'Forest encroachment monitoring in Khunti',
        description: 'Community-reported illegal tree felling and forest encroachment monitoring near Murhu forest block.',
        district: 'Khunti',
    };

    console.log('TEST 1: Submitting candidate similar to Challenge #7 in Khunti...');
    console.log(`Title:       "${duplicateCandidate.title}"`);
    console.log(`District:    ${duplicateCandidate.district}`);
    console.log(`Description: "${duplicateCandidate.description}"\n`);

    const result1 = await DeduplicationService.checkDuplicate(duplicateCandidate);

    console.log('Result 1:');
    console.log(`• isDuplicate:            ${result1.isDuplicate ? '🚨 TRUE (DUPLICATE DETECTED)' : '✅ FALSE'}`);
    console.log(`• Similarity Score:       ${(Number(result1.similarityScore) * 100).toFixed(1)}% (Threshold: 75%)`);
    console.log(`• Matched Challenge ID:   ${result1.similarChallengeId}`);
    console.log(`• Matched Original Title: "${result1.similarChallengeTitle}"`);
    console.log(`• Submissions Elapsed:    ~${result1.similarChallengeDaysAgo || 14} days ago\n`);

    if (!result1.isDuplicate) {
        console.error('❌ FAILED: Expected Test 1 to be flagged as duplicate!');
        process.exit(1);
    }
    console.log('✓ PASS: Duplicate successfully caught by TF-IDF cosine similarity engine.\n');

    // 2. Distinct candidate (different problem in Khunti)
    const distinctCandidate = {
        title: 'Primary school roof leakage and plaster falling in Torpa',
        description: 'Monsoon rainwater leaking through classroom ceilings in Torpa block government school creating hazards.',
        district: 'Khunti',
    };

    console.log('TEST 2: Submitting distinct problem in Khunti...');
    console.log(`Title:       "${distinctCandidate.title}"`);
    console.log(`District:    ${distinctCandidate.district}\n`);

    const result2 = await DeduplicationService.checkDuplicate(distinctCandidate);

    console.log('Result 2:');
    console.log(`• isDuplicate:      ${result2.isDuplicate ? '🚨 TRUE' : '✅ FALSE (CLEARED FOR INGESTION)'}`);
    console.log(`• Similarity Score: ${(Number(result2.similarityScore || 0) * 100).toFixed(1)}%`);

    if (result2.isDuplicate) {
        console.error('❌ FAILED: Expected Test 2 to NOT be a duplicate!');
        process.exit(1);
    }
    console.log('✓ PASS: Distinct challenge passed without duplicate alert.\n');

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  Engine 6 (Deduplication) Verification: ALL TESTS PASSED ✓');
    console.log('═══════════════════════════════════════════════════════════════');
}

main().catch((err) => {
    console.error('Error running deduplication demo:', err);
    process.exit(1);
});
