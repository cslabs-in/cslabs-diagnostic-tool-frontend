import { apiClient } from "./client";
import type { RawThemeResponse } from "./types";
import type { Question } from "../types/diagnostic";

export type ThemeId = "grammar" | "data_representation";

/**
 * Frontend theme ids are lowercase/snake; the real `theme` column in
 * diagnostic.concepts is stored capitalized-with-a-space ("Grammar",
 * "Data Representation"), matching fixtures.py and the design reference.
 *
 * "both" is intentionally NOT supported here -- there's no combined
 * endpoint, and merging two theme responses client-side was deferred
 * rather than built speculatively (per Atul's call: individual themes
 * only for now, hardcoding removed later). ThemeSelector.tsx stays
 * hardcoded until real user testing, so this map only needs to cover the
 * two real, individually-fetchable themes.
 */
const THEME_DB_VALUE: Record<ThemeId, string> = {
  grammar: "Grammar",
  data_representation: "Data Representation",
};

export interface ThemeQuestionsResult {
  questions: Question[];
  conceptNames: Record<string, string>;
}

/** Display name for a theme id, as stored in the backend (`theme` column
 * of diagnostic.concepts): "Grammar", "Data Representation". This is what
 * the Header shows under "Current Theme". */
export function getThemeDisplayName(theme: ThemeId): string {
  return THEME_DB_VALUE[theme];
}

export async function getThemeQuestions(theme: ThemeId): Promise<ThemeQuestionsResult> {
  const dbTheme = THEME_DB_VALUE[theme];
  const { data } = await apiClient.get<RawThemeResponse>(
    `/themes/${encodeURIComponent(dbTheme)}/questions`,
  );

  const conceptNames: Record<string, string> = {};
  const questions: Question[] = [];

  for (const concept of data.concepts) {
    conceptNames[concept.id] = concept.name;
    for (const q of concept.questions) {
      questions.push({
        questionId: q.question_id,
        conceptId: concept.id,
        conceptName: concept.name,
        type: "MCQ", // v1 is MCQ-only; themes.py doesn't return a type column
        stem: q.stem,
        options: q.options,
        // no `code` field -- themes.py's question query has no code
        // column, so real questions never populate CodeBlock for now.
      });
    }
  }

  return { questions, conceptNames };
}