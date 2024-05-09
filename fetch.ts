export const fetchDatasets = async (variables: any) => {
  const response = await fetch(
    `https://dev.backend.idp.civicdatalab.in/facets/${variables}`
  );
  const data = await response.json();
  return data;
};
