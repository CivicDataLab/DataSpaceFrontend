export const PROMPT_FILE_NAME_MAX_LENGTH = 120;

export const PROMPT_FORMAT_OPTIONS = [
  { label: 'Instruction', value: 'INSTRUCTION' },
  { label: 'Chat', value: 'CHAT' },
  { label: 'Completion', value: 'COMPLETION' },
  { label: 'Few-shot', value: 'FEW_SHOT' },
  { label: 'Chain of thought', value: 'CHAIN_OF_THOUGHT' },
  { label: 'Zero-shot', value: 'ZERO_SHOT' },
  { label: 'Other', value: 'OTHER' },
] as const;

export function promptFormatLabel(value?: string | null): string | null {
  if (!value) return null;
  return (
    PROMPT_FORMAT_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

export function promptFileTags(details?: {
  promptFormat?: string | null;
  hasSystemPrompt?: boolean | null;
  hasExampleResponses?: boolean | null;
} | null): string[] {
  const tags: string[] = [];
  const format = promptFormatLabel(details?.promptFormat);
  if (format) tags.push(format);
  if (details?.hasSystemPrompt) tags.push('System prompt');
  if (details?.hasExampleResponses) tags.push('Example responses');
  return tags;
}
