export type DraftSelectedChoices = Record<string, string>;

export function normalizeDraftSelectedChoices(
  value: unknown,
  validChoicesByQuestionId: Map<string, Set<string>>,
): DraftSelectedChoices {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const selectedChoices: DraftSelectedChoices = {};

  for (const [questionId, choiceId] of Object.entries(value)) {
    if (typeof choiceId !== "string") {
      continue;
    }

    const validChoiceIds = validChoicesByQuestionId.get(questionId);

    if (!validChoiceIds?.has(choiceId)) {
      continue;
    }

    selectedChoices[questionId] = choiceId;
  }

  return selectedChoices;
}

export function readDraftSelectedChoices(value: unknown): DraftSelectedChoices {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const selectedChoices = "selectedChoices" in value ? (value as { selectedChoices?: unknown }).selectedChoices : value;

  if (!selectedChoices || typeof selectedChoices !== "object" || Array.isArray(selectedChoices)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(selectedChoices).filter(
      (entry): entry is [string, string] => typeof entry[0] === "string" && typeof entry[1] === "string",
    ),
  );
}
