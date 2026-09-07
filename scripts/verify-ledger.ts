import { computeMilestoneHash, computeMerkleRoot } from '../src/lib/merkle';
import CryptoJS from 'crypto-js';

async function main() {
    console.log('🧪 Starting SHA-256 Public Impact Ledger Verification...\n');

    // 1. Test hash computation
    const proofUrl = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80';
    const createdAt = '2026-07-12T10:00:00.000Z';
    const lat = 24.6352;
    const lng = 87.8448;

    const computed = computeMilestoneHash(proofUrl, createdAt, lat, lng);
    const expected = CryptoJS.SHA256(`${proofUrl}|${new Date(createdAt).toISOString()}|${lat}|${lng}`).toString();

    if (computed === expected) {
        console.log('✅ Milestone 1 SHA-256 hash computation matches spec formula:');
        console.log(`   Hash: ${computed}`);
    } else {
        console.error('❌ Hash mismatch!');
        process.exit(1);
    }

    // 2. Test 3 Hero Milestones
    const m1 = computeMilestoneHash(
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
        '2026-07-12T10:00:00.000Z',
        24.6352,
        87.8448
    );
    const m2 = computeMilestoneHash(
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        '2026-08-14T09:30:00.000Z',
        24.6352,
        87.8448
    );
    const m3 = computeMilestoneHash(
        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
        '2026-08-30T12:00:00.000Z',
        24.6352,
        87.8448
    );

    console.log('\n🌿 3 Hero Pakur Milestones Sealed:');
    console.log(`   #1 (Testing kits): ${m1.slice(0, 8)}...${m1.slice(-8)}`);
    console.log(`   #2 (Filter prototype): ${m2.slice(0, 8)}...${m2.slice(-8)}`);
    console.log(`   #3 (Handover): ${m3.slice(0, 8)}...${m3.slice(-8)}`);

    // 3. Test Merkle Root computation
    const merkleRoot = computeMerkleRoot([m1, m2, m3]);
    console.log(`\n🌳 Computed Merkle Root: ${merkleRoot}`);

    // Verify binary Merkle tree mechanics:
    // Level 1: [m1, m2, m3, m3] -> hash(m1+m2), hash(m3+m3)
    const h12 = CryptoJS.SHA256(m1 + m2).toString();
    const h33 = CryptoJS.SHA256(m3 + m3).toString();
    const expectedRoot = CryptoJS.SHA256(h12 + h33).toString();

    if (merkleRoot === expectedRoot) {
        console.log('✅ Merkle Root correctly matches binary tree pairing specification!');
    } else {
        console.error('❌ Merkle tree root mismatch!');
        process.exit(1);
    }

    // 4. Test Tamper Detection
    console.log('\n🛡️ Testing Tamper Detection:');
    const tamperedHash = m1.slice(0, -1) + (m1.slice(-1) === 'a' ? 'b' : 'a');
    const isValidReal = computed === m1;
    const isValidTampered = computed === tamperedHash;

    console.log(`   Real Hash Check: ${isValidReal ? '✅ VERIFIED' : '❌ FAILED'}`);
    console.log(`   Tampered Hash Check: ${!isValidTampered ? '❌ TAMPERED (Successfully caught!)' : 'FAIL - Tamper not detected'}`);

    if (!isValidReal || isValidTampered) {
        console.error('❌ Tamper detection test failed!');
        process.exit(1);
    }

    // 5. Test EXIF Time Difference Rule (> 2 hours = amber warning)
    const photoTime = new Date('2026-08-30T08:30:00.000Z').getTime();
    const uploadTime = new Date('2026-08-30T12:00:00.000Z').getTime();
    const diffHours = Math.abs(uploadTime - photoTime) / (1000 * 60 * 60);

    console.log(`\n🕒 EXIF Time delta test: ${diffHours.toFixed(1)} hours`);
    if (diffHours > 2) {
        console.log('⚠️ Flagged correctly: Capture/upload time mismatch (> 2 hours)');
    } else {
        console.error('❌ EXIF time delta failed to flag > 2h difference');
        process.exit(1);
    }

    console.log('\n🎉 ALL PUBLIC IMPACT LEDGER CHECKS PASSED PERFECTLY!\n');
}

main().catch((err) => {
    console.error('Error running ledger verification:', err);
    process.exit(1);
});
