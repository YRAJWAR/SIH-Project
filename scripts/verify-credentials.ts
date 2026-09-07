import { computeCredentialHash, verifyCredentialHash } from '../src/lib/credentials';
import { buildStudentCredentialPDF } from '../src/lib/credentialPdf';

async function main() {
    console.log('🎓 Starting NEP 2020 Student Credential & PDF Generator Verification...\n');

    // 1. Test hash computation
    const studentId = 'arjun-profile-hero';
    const challengeId = 'hero-challenge-pakur';
    const creditPoints = 4;
    const issuedAt = '2026-09-01T12:00:00.000Z';

    const hash = computeCredentialHash(studentId, challengeId, creditPoints, issuedAt);
    console.log(`✅ Credential SHA-256 Hash: ${hash}`);

    // 2. Test verification function
    const verifyClean = verifyCredentialHash(hash, studentId, challengeId, creditPoints, issuedAt);
    console.log(`✅ Integrity Verification (Clean): ${verifyClean.valid ? 'VERIFIED' : 'FAILED'}`);
    if (!verifyClean.valid) {
        console.error('❌ Clean verification failed!');
        process.exit(1);
    }

    // 3. Test tampered verification
    const tamperedHash = hash.slice(0, -2) + '99';
    const verifyTampered = verifyCredentialHash(tamperedHash, studentId, challengeId, creditPoints, issuedAt);
    console.log(`🛡️ Tamper Detection (Modified Hash): ${!verifyTampered.valid ? 'TAMPER DETECTED (Success)' : 'FAILED'}`);
    if (verifyTampered.valid) {
        console.error('❌ Tamper detection failed to catch modified hash!');
        process.exit(1);
    }

    // 4. Test PDF Generation
    console.log('\n📄 Testing jsPDF Server-side Certificate Generation...');
    const pdfDoc = buildStudentCredentialPDF({
        credentialId: 'cred-arjun-test-01',
        studentName: 'Arjun Sharma',
        branch: 'Environmental Engineering',
        year: 3,
        universityName: 'National Institute of Technology Jamshedpur',
        challengeTitle: 'Arsenic Contamination in Drinking Water, Pakur',
        district: 'Pakur',
        sdgTags: [6, 3],
        durationWeeks: 16,
        hoursContributed: 120,
        creditPoints: 4,
        facultyName: 'Prof. Anjali Sharma',
        submitterName: 'Amrapara Gram Panchayat Node',
        beneficiariesCount: 15400,
        challengeStatus: 'DEPLOYED & COMPLETED',
        hashValue: hash,
        issuedAt: new Date(issuedAt),
    });

    const pdfBytes = pdfDoc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfBytes);
    console.log(`✅ Certificate PDF generated successfully! Byte size: ${pdfBuffer.length} bytes`);

    if (pdfBuffer.length < 1000) {
        console.error('❌ PDF buffer too small, generation issue suspected.');
        process.exit(1);
    }

    // Check PDF magic header %PDF
    const magicHeader = pdfBuffer.slice(0, 4).toString('ascii');
    if (magicHeader === '%PDF') {
        console.log(`✅ Valid PDF binary format confirmed (Magic header: "${magicHeader}")`);
    } else {
        console.error(`❌ Invalid PDF header: "${magicHeader}"`);
        process.exit(1);
    }

    // 5. Test Composite Rating Calculation
    const facultyRating = 4.5;
    const ngoRating = 3.5;
    const communityRating = 3.0;
    const composite = (facultyRating * 0.40) + (ngoRating * 0.40) + (communityRating * 0.20);
    console.log(`\n⭐ Composite Rating Formula Check:`);
    console.log(`   Faculty (40% of ${facultyRating}) + NGO (40% of ${ngoRating}) + Community (20% of ${communityRating}) = ${composite.toFixed(2)} / 5.0`);

    console.log('\n🎉 ALL NEP 2020 CREDENTIAL AND PDF CHECKS PASSED!\n');
}

main().catch((err) => {
    console.error('Error running verification script:', err);
    process.exit(1);
});
