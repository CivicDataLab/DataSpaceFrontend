/**
 * The single source of truth for the user-facing label of the Publication
 * entity. The backend calls it "Publication" (the code name `Resource` was
 * already taken by the file-inside-a-dataset), but users only ever see
 * "Resource". Import from here — never hard-code the word in a component.
 */
export const RESOURCE_LABEL = 'Resource';
export const RESOURCE_LABEL_PLURAL = 'Resources';

/** The Explore / dashboard URL path for resources. */
export const RESOURCE_PATH = '/publications';
