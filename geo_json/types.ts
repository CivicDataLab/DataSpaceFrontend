export type GeoJsonData = {
  type: string;
  features: Array<{
    type: string;
    geometry: unknown;
    properties?: unknown;
  }>;
};
