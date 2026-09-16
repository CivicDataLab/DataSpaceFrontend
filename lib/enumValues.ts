/**
 * Schema enums come from codegen, not from a runtime `__type` introspection
 * query: the values are fixed at build time, and four introspection queries
 * fired together on form load could be aborted by the browser, leaving the
 * dropdowns permanently empty because the failure was cached.
 */
export const enumValues = (schemaEnum: Record<string, string>): string[] =>
  Object.values(schemaEnum);
