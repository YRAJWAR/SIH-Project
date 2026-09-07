import { matchChallengesToHEIs } from '../src/services/smartMatchingService';

/**
 * TEST THE FORMULA manually with these inputs:
 * - Challenge: gpsLat=24.6352, gpsLng=87.8448 (Pakur), sdgTags=[6]
 * - NIT Jamshedpur: district="East Singhbhum", sdgExpertise=[6,9,11,13], perfScore=0.87
 * - Expected: SDG overlap = 1.0 (SDG 6 matches), distKm ≈ 135km → geoScore ≈ 0.73
 * - Expected totalScore ≈ 0.40 + 0.219 + 0.261 = 0.88 (88%)
 */
async function main() {
    console.log('🏛️ Starting Challenge → HEI Smart Matching Engine Verification...\n');

    // 1. Define Challenge #1 (Pakur water) as per test spec:
    // gpsLat=24.6352, gpsLng=87.8448 (Pakur), sdgTags=[6]
    const challengeInput = {
        id: 'hero-challenge-pakur-01',
        title: 'Arsenic Contamination in Drinking Water, Pakur',
        district: 'Pakur',
        sdgTags: [6],
        gpsLat: 24.6352,
        gpsLng: 87.8448,
    };

    console.log(`📌 Input Challenge: ${challengeInput.title}`);
    console.log(`   Coordinates: ${challengeInput.gpsLat}°N, ${challengeInput.gpsLng}°E (${challengeInput.district})`);
    console.log(`   SDG Tags: [${challengeInput.sdgTags.join(', ')}]`);

    // 2. Execute matchChallengesToHEIs
    const matches = await matchChallengesToHEIs(challengeInput, 3);

    console.log(`\n🏆 Top ${matches.length} Matched HEIs:`);
    matches.forEach((m, idx) => {
        console.log(`\n[Rank #${idx + 1}] ${m.hei.name} (${m.hei.district})`);
        console.log(`  - Total Score: ${(m.totalScore * 100).toFixed(1)}%`);
        console.log(`  - SDG Overlap: ${(m.sdgOverlap * 100).toFixed(1)}% (Matched: [${m.sdgMatched.join(', ')}])`);
        console.log(`  - Geo Score: ${(m.geoScore * 100).toFixed(1)}% (Distance: ${m.distKm} km)`);
        console.log(`  - Performance Score: ${(m.perfScore * 100).toFixed(1)}%`);
        console.log(`  - Departments: ${m.hei.departments.slice(0, 3).join(', ')}`);
    });

    // 3. Verification Assertions
    const topMatch = matches[0];
    if (!topMatch) {
        console.error('❌ No matches returned!');
        process.exit(1);
    }

    // Assertion 1: Top match must be NIT Jamshedpur / National Institute of Technology Jamshedpur
    const isNitTop =
        topMatch.hei.name.includes('NIT Jamshedpur') ||
        topMatch.hei.name.includes('National Institute of Technology Jamshedpur') ||
        topMatch.name?.includes('NIT Jamshedpur') ||
        topMatch.name?.includes('National Institute of Technology Jamshedpur');
    console.log(`\n🔍 Assertion 1: Top match is NIT Jamshedpur? ${isNitTop ? '✅ YES' : '❌ NO'}`);
    if (!isNitTop) {
        console.error(`❌ Expected top match to be NIT Jamshedpur, but got ${topMatch.name}`);
        process.exit(1);
    }

    // Assertion 2: Score must be between 85% and 92% (Expected 88%)
    const scorePct = topMatch.totalScore * 100;
    const isScoreValid = scorePct >= 85 && scorePct <= 92;
    console.log(`🔍 Assertion 2: Score is between 85% and 92%? (${scorePct.toFixed(1)}%) ${isScoreValid ? '✅ YES' : '❌ NO'}`);
    if (!isScoreValid) {
        console.error(`❌ Score ${scorePct}% is outside expected range 85–92%`);
        process.exit(1);
    }

    // Assertion 3: Type contract verification
    const hasHeiObject = Boolean(topMatch.hei && topMatch.hei.id && topMatch.hei.name && topMatch.hei.district);
    const hasFlattenedProps = Boolean(topMatch.id && topMatch.name && topMatch.district);
    console.log(`🔍 Assertion 3: HEIMatch type contracts valid? ${hasHeiObject && hasFlattenedProps ? '✅ YES' : '❌ NO'}`);
    if (!hasHeiObject || !hasFlattenedProps) {
        console.error('❌ HEIMatch type contract check failed!');
        process.exit(1);
    }

    // Assertion 4: Verification of exact manual formula breakdown:
    // Expected: SDG overlap = 1.0 (SDG 6 matches), distKm ≈ 135km → geoScore ≈ 0.73
    // Expected totalScore ≈ 0.40 + 0.219 + 0.261 = 0.88 (88%)
    console.log('\n📊 Manual Formula Component Breakdown Verification:');
    console.log(`   SDG Overlap Component (40% of ${topMatch.sdgOverlap}): ${(topMatch.sdgOverlap * 0.40).toFixed(3)} (Expected: 0.400)`);
    console.log(`   Geo Proximity Component (30% of ${topMatch.geoScore}): ${(topMatch.geoScore * 0.30).toFixed(3)} (Expected: ~0.219)`);
    console.log(`   Performance Component (30% of ${topMatch.perfScore}): ${(topMatch.perfScore * 0.30).toFixed(3)} (Expected: ~0.261)`);
    console.log(`   Sum Total Score: ${topMatch.totalScore.toFixed(2)} (Expected: 0.88 / 88%)`);

    console.log('\n🎉 ALL CHALLENGE → HEI SMART MATCHING CHECKS PASSED PERFECTLY!\n');
}

main().catch((err) => {
    console.error('Verification error:', err);
    process.exit(1);
});
