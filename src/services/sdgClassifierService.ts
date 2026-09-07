// ──────────────────────────────────────────────────────────────
// SDG Classifier Service (Backend)
// OpenAI-first → local keyword fallback
// Returns top 3 SDGs with confidence scores
// ──────────────────────────────────────────────────────────────

// ─── Types ───────────────────────────────────────────────────

export interface SDGClassification {
    sdg_id: number;
    sdg_name: string;
    confidence: number; // 0.0 – 1.0
}

export interface ClassificationResult {
    sdg_tags: number[];
    classifications: SDGClassification[];
    reasoning: string;
    source: 'openai' | 'local';
}

// ─── SDG Reference Data ──────────────────────────────────────

const SDG_NAMES: Record<number, string> = {
    1: 'No Poverty', 2: 'Zero Hunger', 3: 'Good Health and Well-Being',
    4: 'Quality Education', 5: 'Gender Equality', 6: 'Clean Water and Sanitation',
    7: 'Affordable and Clean Energy', 8: 'Decent Work and Economic Growth',
    9: 'Industry, Innovation and Infrastructure', 10: 'Reduced Inequalities',
    11: 'Sustainable Cities and Communities', 12: 'Responsible Consumption and Production',
    13: 'Climate Action', 14: 'Life Below Water', 15: 'Life on Land',
    16: 'Peace, Justice and Strong Institutions', 17: 'Partnerships for the Goals',
};

// ─── Keyword Map for Local Fallback ──────────────────────────

const SDG_KEYWORDS: Record<number, string[]> = {
    1: ['poverty', 'poor', 'income', 'livelihood', 'economic empowerment', 'slum', 'welfare', 'microfinance', 'social protection'],
    2: ['hunger', 'food', 'nutrition', 'agriculture', 'farming', 'crop', 'meal', 'malnutrition', 'food security'],
    3: ['health', 'medical', 'hospital', 'clinic', 'disease', 'vaccine', 'healthcare', 'sanitation', 'maternal', 'mortality', 'telemedicine', 'mental health'],
    4: ['education', 'school', 'learning', 'literacy', 'student', 'training', 'skill', 'teacher', 'digital literacy', 'scholarship', 'vocational'],
    5: ['gender', 'women', 'girl', 'female', 'equality', 'empowerment', 'maternal', 'domestic violence', 'reproductive'],
    6: ['water', 'sanitation', 'hygiene', 'drinking', 'purification', 'clean water', 'well', 'borewell', 'watershed', 'sewage'],
    7: ['energy', 'solar', 'renewable', 'electricity', 'power', 'fuel', 'clean energy', 'biogas', 'wind energy', 'electrification'],
    8: ['employment', 'job', 'work', 'labour', 'economic growth', 'entrepreneur', 'livelihood', 'self-employment', 'startup', 'msme'],
    9: ['infrastructure', 'innovation', 'industry', 'technology', 'manufacturing', 'iot', 'digital', 'broadband', 'connectivity', 'r&d'],
    10: ['inequality', 'discrimination', 'inclusion', 'tribal', 'marginalized', 'vulnerable', 'disability', 'caste', 'refugee'],
    11: ['urban', 'city', 'sustainable city', 'housing', 'transport', 'waste', 'smart city', 'slum rehabilitation', 'public space'],
    12: ['consumption', 'recycling', 'waste management', 'sustainable', 'circular economy', 'reuse', 'e-waste', 'plastic reduction'],
    13: ['climate', 'carbon', 'emission', 'global warming', 'environment', 'green', 'decarbonization', 'adaptation', 'resilience'],
    14: ['ocean', 'marine', 'fish', 'coastal', 'sea', 'aquatic', 'plastic pollution', 'coral', 'mangrove'],
    15: ['forest', 'biodiversity', 'land', 'wildlife', 'ecosystem', 'tree', 'plantation', 'reforestation', 'desertification'],
    16: ['peace', 'justice', 'governance', 'institution', 'law', 'corruption', 'transparency', 'accountability', 'human rights'],
    17: ['partnership', 'collaboration', 'cooperation', 'international', 'development', 'multi-stakeholder', 'capacity building'],
};

// ─── OpenAI Classification ───────────────────────────────────

const OPENAI_SYSTEM_PROMPT = `You are an expert UN Sustainable Development Goals (SDG) classifier. Given a project description, classify it into the top 3 most relevant SDGs (numbered 1–17).

For each SDG, assign a confidence score between 0.0 and 1.0 indicating how strongly the project aligns with that goal.

Return ONLY valid JSON in this exact format:
{
  "classifications": [
    { "sdg_id": <number 1-17>, "confidence": <float 0.0-1.0> },
    { "sdg_id": <number 1-17>, "confidence": <float 0.0-1.0> },
    { "sdg_id": <number 1-17>, "confidence": <float 0.0-1.0> }
  ],
  "reasoning": "<one paragraph explaining why these SDGs were selected>"
}

Rules:
- Return exactly 3 SDGs
- Sort by confidence descending
- confidence must be between 0.0 and 1.0
- Do not include any text outside the JSON object`;

async function classifyWithOpenAI(description: string): Promise<ClassificationResult | null> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: OPENAI_SYSTEM_PROMPT },
                    { role: 'user', content: `Classify this project:\n\n${description}` },
                ],
                temperature: 0.2,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) return null;

        // Parse JSON — handle potential markdown code fences
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        // Validate structure
        if (!parsed.classifications || !Array.isArray(parsed.classifications) || parsed.classifications.length === 0) {
            return null;
        }

        const classifications: SDGClassification[] = parsed.classifications
            .slice(0, 3)
            .map((c: { sdg_id: number; confidence: number }) => ({
                sdg_id: Math.min(17, Math.max(1, Math.round(c.sdg_id))),
                sdg_name: SDG_NAMES[Math.min(17, Math.max(1, Math.round(c.sdg_id)))] || 'Unknown',
                confidence: Math.min(1, Math.max(0, parseFloat(String(c.confidence)))),
            }));

        return {
            sdg_tags: classifications.map(c => c.sdg_id),
            classifications,
            reasoning: parsed.reasoning || 'Classified by AI.',
            source: 'openai',
        };
    } catch (error) {
        console.error('OpenAI classification failed:', error);
        return null;
    }
}

// ─── Local Keyword Classifier ────────────────────────────────

function classifyLocally(description: string): ClassificationResult {
    const desc = description.toLowerCase();
    const scores: { sdg: number; score: number; maxPossible: number }[] = [];

    for (const [sdgId, keywords] of Object.entries(SDG_KEYWORDS)) {
        let score = 0;
        for (const kw of keywords) {
            if (desc.includes(kw)) score += 1;
        }
        if (score > 0) {
            scores.push({
                sdg: parseInt(sdgId),
                score,
                maxPossible: keywords.length,
            });
        }
    }

    scores.sort((a, b) => b.score - a.score);
    const top3 = scores.slice(0, 3);

    // Fallback if nothing matched
    if (top3.length === 0) {
        top3.push(
            { sdg: 17, score: 1, maxPossible: 1 },
            { sdg: 1, score: 1, maxPossible: 1 },
        );
    }

    const classifications: SDGClassification[] = top3.map(s => ({
        sdg_id: s.sdg,
        sdg_name: SDG_NAMES[s.sdg],
        confidence: parseFloat(Math.min(0.95, 0.5 + (s.score / s.maxPossible) * 0.45).toFixed(3)),
    }));

    const sdg_tags = classifications.map(c => c.sdg_id);
    const reasons = classifications.map(c => `SDG ${c.sdg_id} (${c.sdg_name})`);

    return {
        sdg_tags,
        classifications,
        reasoning: `This project aligns with ${reasons.join(', ')} based on keyword analysis of its focus areas, target population, and expected outcomes.`,
        source: 'local',
    };
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Classify a project description into top 3 UN SDGs.
 * Tries OpenAI first (if OPENAI_API_KEY is set), falls back to local keyword classifier.
 * Returns SDG IDs, confidence scores, reasoning, and source.
 */
export async function classifyProjectSDGs(description: string): Promise<ClassificationResult> {
    if (!description || description.trim().length < 10) {
        throw new Error('Project description must be at least 10 characters');
    }

    // 1. Try OpenAI
    const openaiResult = await classifyWithOpenAI(description);
    if (openaiResult) return openaiResult;

    // 2. Fallback to local
    return classifyLocally(description);
}

/**
 * Get SDG name by ID
 */
export function getSDGName(id: number): string {
    return SDG_NAMES[id] || 'Unknown';
}
