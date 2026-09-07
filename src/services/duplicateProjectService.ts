import prisma from '@/lib/prisma';

export class DuplicateProjectService {
    static async checkDuplicate(description: string, orgId: string) {
        const projects = await prisma.project.findMany({
            where: { organization_id: orgId },
            include: { sdg_tags: true }
        });

        const newDesc = description.toLowerCase();

        for (const proj of projects) {
            const similarity = this.calculateSimilarity(newDesc, proj.description.toLowerCase());

            // Check similarity and same location/SDG logic later
            // Here: basic text similarity threshold
            if (similarity > 0.8) {
                return {
                    duplicateDeteced: true,
                    similarProjectId: proj.id,
                    similarityScore: Number(similarity.toFixed(2)),
                    message: `This project is very similar to an existing project: ${proj.title}. Please review for duplication.`
                };
            }
        }

        return { duplicateDeteced: false };
    }

    private static calculateSimilarity(s1: string, s2: string): number {
        // Basic words intersection similarity
        const set1 = new Set(s1.split(' '));
        const set2 = new Set(s2.split(' '));
        const intersect = Array.from(set1).filter(w => set2.has(w)).length;
        const total = Math.max(set1.size, set2.size);
        return intersect / total;
    }
}
