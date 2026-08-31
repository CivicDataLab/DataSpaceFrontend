import assam_geojson from "./assam_geojson";
import assam_revenue_circle from "./assam_revenue_circle";
import type { GeoJsonData } from "./types";

const geojsonMapping: Record<string, GeoJsonData> = {
    'assam_district': assam_geojson,
    'assam_rc': assam_revenue_circle,
};

export const renderGeoJSON = (chartType: string): GeoJsonData | undefined => {
    console.log(chartType);
    
    return geojsonMapping[chartType.toLowerCase()] ;
};
