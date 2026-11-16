// Names whose label isn't derivable from the enum name alone.
const LICENSE_LABELS: Record<string, string> = {
  GOVERNMENT_OPEN_DATA_LICENSE: 'Government Open Data License',
  CC_BY_4_0_ATTRIBUTION: 'CC BY 4.0 (Attribution)',
  CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE: 'CC BY-SA 4.0 (Attribution-ShareAlike)',
  OPEN_DATA_COMMONS_BY_ATTRIBUTION: 'Open Data Commons By Attribution',
  OPEN_DATABASE_LICENSE: 'Open Database License',
};

const LICENSE_TERMS_URLS: Record<string, string> = {
  GOVERNMENT_OPEN_DATA_LICENSE:
    'https://data.gov.in/government-open-data-license-india',
  CC_BY_4_0_ATTRIBUTION: 'https://creativecommons.org/licenses/by/4.0/',
  CC_BY_SA_4_0_ATTRIBUTION_SHARE_ALIKE:
    'https://creativecommons.org/licenses/by-sa/4.0/',
  OPEN_DATA_COMMONS_BY_ATTRIBUTION: 'https://opendatacommons.org/licenses/by/1.0/',
  OPEN_DATABASE_LICENSE: 'https://opendatacommons.org/licenses/odbl/1-0/',
};

/** Page with the full terms for a licence, or null when we have none on file. */
export function datasetLicenseTermsUrl(name?: string | null): string | null {
  return name ? (LICENSE_TERMS_URLS[name] ?? null) : null;
}

/**
 * Human label for a DatasetLicense enum name, e.g.
 * CC_BY_NC_SA_3_0_DE -> "CC BY-NC-SA 3.0 DE", CC0_1_0 -> "CC0 1.0".
 */
export function datasetLicenseLabel(name?: string | null): string {
  if (!name) return '';
  if (LICENSE_LABELS[name]) return LICENSE_LABELS[name];

  const tokens = name.split('_');
  const versionStart = tokens.findIndex((token) => /^\d+$/.test(token));
  const nameTokens = versionStart === -1 ? tokens : tokens.slice(0, versionStart);
  const versionTokens: string[] = [];
  let index = versionStart === -1 ? tokens.length : versionStart;
  while (index < tokens.length && /^\d+$/.test(tokens[index])) {
    versionTokens.push(tokens[index]);
    index += 1;
  }
  const suffix = tokens.slice(index);

  const [family, ...clauses] = nameTokens;
  return [
    family,
    clauses.join('-'),
    versionTokens.join('.'),
    suffix.join(' '),
  ]
    .filter(Boolean)
    .join(' ');
}
