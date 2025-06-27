import assam_geojson from "./assam_geojson";
import assam_revenue_circle from "./assam_revenue_circle";

// Define a mapping of chart types to GeoJSON data
const geojsonMapping: { [key: string]: any } = {
    'assam_district': assam_geojson,
    'assam_rc': assam_revenue_circle,
    // Add more mappings as needed
};

// Function to render the appropriate GeoJSON based on chartType
export const renderGeoJSON = (chartType: string): any  => {
    console.log(chartType);
    
    return geojsonMapping[chartType.toLowerCase()] ;
};
