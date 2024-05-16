export const fetchDatasets = async (variables: any) => {
  const response = await fetch(
    `https://dev.backend.idp.civicdatalab.in/facets/${variables}`
  );
  const data = await response.json();
  return data;
};

export const fetchFacets = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/dataset/`
  );
  const data = await response.json();
  return data;
};
