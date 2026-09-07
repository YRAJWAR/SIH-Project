import crypto from 'crypto';

/**
 * SDG Nexus — Blockchain Trust Service
 * Provides cryptographic proof of impact by hashing activity payloads.
 * In a production environment, this would integrate with a public ledger (e.g., Polygon).
 */
export class BlockchainService {
    /**
     * Generates a unique SHA-256 hash for a project activity.
     * This hash serves as an immutable "receipt" for the impact data.
     */
    static generateImpactHash(payload: {
        projectId: string;
        activityTitle: string;
        description: string;
        timestamp: number;
    }): string {
        const dataString = JSON.stringify(payload);
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Simulates "anchoring" the hash to a public blockchain.
     * Logs the transaction and returns a mock transaction ID.
     */
    static async anchorToLedger(hash: string): Promise<string> {
        // Simulating the 1-2s delay of a lightweight chain like Polygon
        await new Promise(resolve => setTimeout(resolve, 500));

        const txnId = `txn_${crypto.randomBytes(16).toString('hex')}`;

        return txnId;
    }

    /**
     * Verifies if a given payload matches a stored hash.
     */
    static verifyImpact(payload: any, storedHash: string): boolean {
        const currentHash = this.generateImpactHash(payload);
        return currentHash === storedHash;
    }
}
