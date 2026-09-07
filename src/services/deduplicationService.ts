import natural from 'natural';
import prisma from '@/lib/prisma';

export interface CheckDuplicateInput {
    title: string;
    description: string;
    district: string;
}

export interface CheckDuplicateResult {
    isDuplicate: boolean;
    similarChallengeId?: string;
    similarityScore?: number;
    similarChallengeTitle?: string;
    similarChallengeDaysAgo?: number;
}

// Minimal English and Hindi stopwords as specified in SIH 26043 Engine 6 spec
const STOPWORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'shall', 'may', 'might',
    'can', 'could', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about',
    'from', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'up', 'down', 'and', 'but', 'or', 'nor', 'not', 'if',
    'then', 'else', 'while', 'where', 'when', 'how', 'what', 'which', 'who',
    'whom',
    // Hindi stopwords
    'यह', 'वह', 'में', 'से', 'के', 'की', 'को', 'है', 'हैं', 'था', 'थे',
]);

// Fallback seed challenges for offline / pre-migration testing
const SEED_FALLBACK_CHALLENGES = [
    {
        id: 'ch-khunti-07',
        title: 'Forest encroachment monitoring in Khunti',
        description: 'Community-reported illegal logging and forest encroachment monitoring near Murhu block reserved forests.',
        district: 'Khunti',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-pakur-01',
        title: 'Fluoride & arsenic in ground drinking water — Littipara block',
        description: 'Community-reported high fluoride and arsenic contamination in borehole water across 6 village habitations.',
        district: 'Pakur',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-simdega-01',
        title: 'Open defecation in Simdega tribal hamlets',
        description: 'Lack of functional community sanitation units and greywater treatment in Bano block.',
        district: 'Simdega',
        createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-latehar-01',
        title: 'Road connectivity to 8 villages in Latehar',
        description: 'Unpaved seasonal roads cutting off medical emergency transport during monsoons.',
        district: 'Latehar',
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-gumla-01',
        title: 'Primary health centre equipment failure in Gumla',
        description: 'Frequent power outages damaging vaccine storage and primary healthcare equipment.',
        district: 'Gumla',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-garhwa-01',
        title: 'Crop pest management for kharif season in Garhwa',
        description: 'Stem borer outbreak in paddy crops across 150 acres without biological pest control.',
        district: 'Garhwa',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-palamu-01',
        title: 'Lack of vocational training in Palamu block',
        description: 'Absence of renewable energy and vocational maintenance training programs in Daltonganj.',
        district: 'Palamu',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-bokaro-01',
        title: 'Child malnutrition tracking in Bokaro anganwadis',
        description: 'Manual growth monitoring chart errors leading to delayed SAM identification.',
        district: 'Bokaro',
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-ranchi-01',
        title: 'Digital literacy for Panchayat officials in Ranchi',
        description: 'Lack of hands-on digital tools for village development plan recording.',
        district: 'Ranchi',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'ch-lohardaga-01',
        title: 'Erosion of agricultural land near Koel river, Lohardaga',
        description: 'Runoff from mining zones degrading adjacent agricultural terraces.',
        district: 'Lohardaga',
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
];

export class DeduplicationService {
    /**
     * Clean and tokenize input text, removing stopwords
     */
    private static tokenizeAndClean(text: string): string[] {
        if (!text) return [];
        // Replace non-alphanumeric (keeping Devanagari Unicode characters) with spaces
        const cleaned = text
            .toLowerCase()
            .replace(/[^\w\s\u0900-\u097F]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        const words = cleaned.split(' ');
        return words.filter((w) => w.length > 1 && !STOPWORDS.has(w));
    }

    /**
     * Compute cosine similarity between two texts using natural.TfIdf
     * Includes reference corpus documents so topical terms receive proper IDF discrimination.
     */
    public static computeCosineSimilarity(tokens1: string[], tokens2: string[]): number {
        if (tokens1.length === 0 || tokens2.length === 0) return 0;

        const tfidf = new natural.TfIdf();
        tfidf.addDocument(tokens1); // doc 0
        tfidf.addDocument(tokens2); // doc 1

        // Add background reference corpus across diverse districts/domains
        for (const seed of SEED_FALLBACK_CHALLENGES) {
            const seedTokens = this.tokenizeAndClean(`${seed.title} ${seed.description}`);
            tfidf.addDocument(seedTokens);
        }

        // Collect all unique terms between candidate and target
        const allTerms = Array.from(new Set([...tokens1, ...tokens2]));

        let dotProduct = 0;
        let mag1 = 0;
        let mag2 = 0;

        for (const term of allTerms) {
            let score1 = 0;
            let score2 = 0;

            tfidf.tfidfs(term, (docIndex, score) => {
                if (docIndex === 0) score1 = score;
                if (docIndex === 1) score2 = score;
            });

            dotProduct += score1 * score2;
            mag1 += score1 * score1;
            mag2 += score2 * score2;
        }

        const denominator = Math.sqrt(mag1) * Math.sqrt(mag2);
        if (denominator === 0) return 0;

        return dotProduct / denominator;
    }

    /**
     * Core Algorithm:
     * 1. Accept { title, description, district }
     * 2. Combine title + first 150 chars of description into single text
     * 3. Strip common English and Hindi stopwords
     * 4. Compute TF-IDF vector using natural library
     * 5. Query existing challenges in same district
     * 6. Compute cosine similarity for each
     * 7. If similarity > 0.75 => isDuplicate = true
     */
    public static async checkDuplicate(input: CheckDuplicateInput): Promise<CheckDuplicateResult> {
        const { title, description, district } = input;

        // 1 & 2: Combine title + first 150 chars of description
        const combinedText = `${title || ''} ${(description || '').slice(0, 150)}`.trim();
        const candidateTokens = this.tokenizeAndClean(combinedText);

        if (candidateTokens.length === 0) {
            return { isDuplicate: false };
        }

        // 5: Query existing challenges in the same district from DB
        let existingChallenges: { id: string; title: string; description: string; createdAt: Date }[] = [];
        try {
            existingChallenges = await prisma.challenge.findMany({
                where: {
                    district: {
                        equals: district.trim(),
                        mode: 'insensitive',
                    },
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    createdAt: true,
                },
            });
        } catch {
            // Database is offline or not yet migrated, fall back to seed data
        }

        // If DB returned nothing or error, check fallback seed challenges for that district
        if (!existingChallenges || existingChallenges.length === 0) {
            existingChallenges = SEED_FALLBACK_CHALLENGES.filter(
                (c) => c.district.toLowerCase() === district.trim().toLowerCase()
            );
        }

        if (existingChallenges.length === 0) {
            return { isDuplicate: false };
        }

        let maxSimilarity = 0;
        let mostSimilarChallenge: (typeof existingChallenges)[0] | null = null;

        // 6: Compute cosine similarity for each existing challenge
        for (const ch of existingChallenges) {
            const chCombined = `${ch.title || ''} ${(ch.description || '').slice(0, 150)}`.trim();
            const chTokens = this.tokenizeAndClean(chCombined);

            const similarity = this.computeCosineSimilarity(candidateTokens, chTokens);

            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                mostSimilarChallenge = ch;
            }
        }

        const SIMILARITY_THRESHOLD = 0.75;
        const isDuplicate = maxSimilarity > SIMILARITY_THRESHOLD;

        if (isDuplicate && mostSimilarChallenge) {
            const daysAgo = Math.max(
                1,
                Math.round(
                    (Date.now() - new Date(mostSimilarChallenge.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                )
            );

            return {
                isDuplicate: true,
                similarChallengeId: mostSimilarChallenge.id,
                similarityScore: Math.round(maxSimilarity * 100) / 100,
                similarChallengeTitle: mostSimilarChallenge.title,
                similarChallengeDaysAgo: daysAgo,
            };
        }

        return {
            isDuplicate: false,
            similarityScore: Math.round(maxSimilarity * 100) / 100,
            similarChallengeId: mostSimilarChallenge?.id,
            similarChallengeTitle: mostSimilarChallenge?.title,
        };
    }
}

export default DeduplicationService;
