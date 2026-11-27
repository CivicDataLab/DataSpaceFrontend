/** One SDG goal, ready for the stacked badge row. */
export type SdgGoal = {
  id: string;
  /** API code such as "SDG3"; search filters on this, not the name. */
  code: string;
  number: string;
  name: string;
  description: string | null;
  imageSrc: string | null;
};

type SdgSource = {
  id: string;
  code: string;
  name: string;
  number?: number | null;
  description?: string | null;
};

/** The 17 UN goal titles, by goal number. */
const SDG_NAMES: Record<string, string> = {
  '1': 'No Poverty',
  '2': 'Zero Hunger',
  '3': 'Good Health and Well-being',
  '4': 'Quality Education',
  '5': 'Gender Equality',
  '6': 'Clean Water and Sanitation',
  '7': 'Affordable and Clean Energy',
  '8': 'Decent Work and Economic Growth',
  '9': 'Industry, Innovation and Infrastructure',
  '10': 'Reduced Inequalities',
  '11': 'Sustainable Cities and Communities',
  '12': 'Responsible Consumption and Production',
  '13': 'Climate Action',
  '14': 'Life Below Water',
  '15': 'Life on Land',
  '16': 'Peace, Justice and Strong Institutions',
  '17': 'Partnerships for the Goals',
};

/** "SDG3" → "3. Good Health and Well-being"; an unknown code is shown as is. */
export function sdgCodeLabel(code: string): string {
  const number = code.replace(/\D/g, '').replace(/^0+/, '');
  const name = SDG_NAMES[number];
  return name ? `${number}. ${name}` : code;
}

/**
 * Maps an API goal to a badge, using the image that ships in `/public/SDG`.
 * Only goals 1–17 have an image; anything else gets the plain numbered tile.
 */
export function toSdgGoal(sdg: SdgSource): SdgGoal {
  const number =
    sdg.number != null
      ? String(sdg.number)
      : sdg.code.replace(/\D/g, '').replace(/^0+/, '');
  return {
    id: sdg.id,
    code: sdg.code.trim(),
    number,
    name: sdg.name.trim(),
    description: sdg.description?.trim() || null,
    imageSrc: SDG_NAMES[number] ? `/SDG/SDG${number}.png` : null,
  };
}
