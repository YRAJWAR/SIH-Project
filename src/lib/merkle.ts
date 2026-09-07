import CryptoJS from 'crypto-js';

/**
 * Standard SHA-256 hashing for Milestone proof sealing
 * hash = SHA256(`${primaryProofUrl}|${createdAtIso}|${lat}|${lng}`)
 */
export function computeMilestoneHash(
    proofUrl: string = '',
    createdAt: string | Date = '',
    lat: number | string = '',
    lng: number | string = ''
): string {
    const isoString = createdAt instanceof Date ? createdAt.toISOString() : (createdAt ? new Date(createdAt).toISOString() : new Date().toISOString());
    const latStr = lat !== undefined && lat !== null ? String(lat) : '';
    const lngStr = lng !== undefined && lng !== null ? String(lng) : '';
    const hashInput = `${proofUrl || ''}|${isoString}|${latStr}|${lngStr}`;
    return CryptoJS.SHA256(hashInput).toString();
}

/**
 * Computes the binary Merkle Root from an array of SHA-256 hashes
 */
export function computeMerkleRoot(hashes: string[]): string {
    const validHashes = (hashes || []).map((h) => (h ? h.trim() : '')).filter(Boolean);
    if (validHashes.length === 0) {
        return CryptoJS.SHA256('empty-ledger-root').toString();
    }
    if (validHashes.length === 1) {
        return validHashes[0];
    }

    let currentLevel = [...validHashes];

    while (currentLevel.length > 1) {
        const nextLevel: string[] = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
            const combined = CryptoJS.SHA256(`${left}${right}`).toString();
            nextLevel.push(combined);
        }
        currentLevel = nextLevel;
    }

    return currentLevel[0];
}
