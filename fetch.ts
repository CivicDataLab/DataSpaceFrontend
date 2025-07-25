export const fetchDatasets = async (variables: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/dataset/${variables}`
  );
  const data = await response.json();
  return data;
};


export const fetchData = async (type: string, variables: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/${type}/${variables}`
  );
  const data = await response.json();
  return data;
};