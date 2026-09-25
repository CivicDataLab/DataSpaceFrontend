export function plainText(value?: string | null) {
  return (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function metadataString(
  metadata: unknown,
  key: string
): string {
  if (typeof metadata !== 'object' || metadata === null) return '';
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
}

export function languageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

export type AIModelEditStep = 'versions' | 'details' | 'publish';

export function firstIncompleteAIModelEditStep(model: {
  displayName?: string | null;
  name?: string | null;
  description?: string | null;
  modelType?: string | null;
  domain?: string | null;
  sectors?: unknown[] | null;
  supportedLanguages?: unknown;
  metadata?: unknown;
  versions?: unknown[] | null;
}): AIModelEditStep {
  if ((model.versions?.length ?? 0) === 0) return 'versions';
  if (!isModelInfoComplete(model)) return 'details';
  return 'publish';
}

export function isModelInfoComplete(model: {
  displayName?: string | null;
  name?: string | null;
  description?: string | null;
  modelType?: string | null;
  domain?: string | null;
  sectors?: unknown[] | null;
  supportedLanguages?: unknown;
  metadata?: unknown;
}) {
  return (
    Boolean((model.displayName || model.name || '').trim()) &&
    Boolean(model.modelType) &&
    plainText(model.description).length > 0 &&
    Boolean(model.domain) &&
    (model.sectors?.length ?? 0) > 0 &&
    languageList(model.supportedLanguages).length > 0 &&
    Boolean(metadataString(model.metadata, 'usageLicense'))
  );
}

export function modelInfoIssues(model: {
  displayName?: string | null;
  name?: string | null;
  description?: string | null;
  modelType?: string | null;
  domain?: string | null;
  sectors?: unknown[] | null;
  supportedLanguages?: unknown;
  metadata?: unknown;
}) {
  const issues: Array<{ id: string; message: string; href: string }> = [];
  if (!(model.displayName || model.name || '').trim()) {
    issues.push({
      id: 'model-name',
      message: 'Enter a model name.',
      href: 'details#model-name',
    });
  }
  if (!model.modelType) {
    issues.push({
      id: 'model-type',
      message: 'Select a model type.',
      href: 'details#model-type',
    });
  }
  if (!model.domain) {
    issues.push({
      id: 'domain',
      message: 'Select a domain.',
      href: 'details#domain',
    });
  }
  if (!plainText(model.description)) {
    issues.push({
      id: 'description',
      message: 'Add a description of the model.',
      href: 'details#description',
    });
  }
  if ((model.sectors?.length ?? 0) === 0) {
    issues.push({
      id: 'sectors',
      message: 'Select at least one sector.',
      href: 'details#sectors',
    });
  }
  if (languageList(model.supportedLanguages).length === 0) {
    issues.push({
      id: 'language-support',
      message: 'Define how language support applies to this model.',
      href: 'details#language-support',
    });
  }
  if (!metadataString(model.metadata, 'usageLicense')) {
    issues.push({
      id: 'usage-license',
      message: 'Select a usage license.',
      href: 'details#usage-license',
    });
  }
  return issues;
}
