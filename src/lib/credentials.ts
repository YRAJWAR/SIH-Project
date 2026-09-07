import CryptoJS from 'crypto-js';

/**
 * Computes the NEP 2020 student credential SHA-256 hash.
 * Formula: SHA256(`${studentId}|${challengeId}|${creditPoints}|${issuedAt.toISOString()}`)
 */
export function computeCredentialHash(
    studentId: string,
    challengeId: string,
    creditPoints: number,
    issuedAt: string | Date
): string {
    const timeIso = typeof issuedAt === 'string' ? new Date(issuedAt).toISOString() : issuedAt.toISOString();
    const payload = `${studentId}|${challengeId}|${creditPoints}|${timeIso}`;
    return CryptoJS.SHA256(payload).toString();
}

/**
 * Verifies if the stored hash matches the recomputed SHA-256 hash.
 */
export function verifyCredentialHash(
    storedHash: string,
    studentId: string,
    challengeId: string,
    creditPoints: number,
    issuedAt: string | Date
): { valid: boolean; computedHash: string } {
    const computedHash = computeCredentialHash(studentId, challengeId, creditPoints, issuedAt);
    return {
        valid: storedHash.trim().toLowerCase() === computedHash.trim().toLowerCase(),
        computedHash,
    };
}
