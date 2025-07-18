// src/lib/moderation.ts
import { OpenAI } from "openai";
import { Database } from "@/types/supabase";
import { supabaseAdmin } from "@/lib/supabase";  // Fix the import path

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type DefinitionStatus = Database["public"]["Enums"]["definition_status"];

export interface ModerationResult {
  flagged: boolean;
  categories: {
    sexual: boolean;
    hate: boolean;
    harassment: boolean;
    'self-harm': boolean;
    'sexual/minors': boolean;
    'hate/threatening': boolean;
    'violence/graphic': boolean;
    'self-harm/intent': boolean;
    'self-harm/instructions': boolean;
    'harassment/threatening': boolean;
    violence: boolean;
  };
  categoryScores: {
    sexual: number;
    hate: number;
    harassment: number;
    'self-harm': number;
    'sexual/minors': number;
    'hate/threatening': number;
    'violence/graphic': number;
    'self-harm/intent': number;
    'self-harm/instructions': number;
    'harassment/threatening': number;
    violence: number;
  };
  status: DefinitionStatus;
  flaggedAt: string | null;
}

// Add threshold constants
const THRESHOLDS = {
  SEVERE: 0.95,    // Auto-reject
  HIGH: 0.85,      // Send to moderation queue
};

export async function moderateContent(text: string): Promise<ModerationResult> {
  const response = await openai.moderations.create({ input: text });
  const result = response.results[0];
  
  const now = new Date().toISOString();
  
  // Calculate highest score across all categories
  const maxScore = Math.max(
    result.category_scores.violence,
    result.category_scores.hate,
    result.category_scores.sexual,
    result.category_scores.harassment,
    result.category_scores['self-harm'],
    result.category_scores['hate/threatening'],
    result.category_scores['violence/graphic']
  );

  // Determine status based on thresholds
  let status: DefinitionStatus = 'clean';
  if (maxScore >= THRESHOLDS.SEVERE) {
    status = 'removed';
  } else if (maxScore >= THRESHOLDS.HIGH) {
    status = 'ai_flagged';
  }

  console.log('Moderation Results:', {
    text,
    maxScore,
    status,
    allScores: result.category_scores,
    thresholds: THRESHOLDS
  });
  
  return {
    flagged: status !== 'clean',
    categories: result.categories,
    categoryScores: result.category_scores,
    status,
    flaggedAt: status !== 'clean' ? now : null
  };
}

export async function logModerationAction(definitionId: string, result: ModerationResult) {
  if (result.flagged && result.status === 'ai_flagged') {  // Only queue if status is ai_flagged
    await supabaseAdmin
      .from('moderation_queue')
      .insert({
        definition_id: definitionId,
        status: 'pending',
        flagged_at: result.flaggedAt,
        admin_notes: `AI Moderation Score: ${result.categoryScores.violence + result.categoryScores.hate + result.categoryScores.sexual}
Categories: ${Object.entries(result.categories)
  .filter(([_, value]) => value)
  .map(([key, _]) => key)
  .join(', ')}`
      });
  }
}