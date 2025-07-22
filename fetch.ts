export const fetchDatasets = async (variables: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/dataset/${variables}`
  );
  const data = await response.json();
  return data;
};

export const fetchUseCases = async (variables: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/usecase/${variables}`
  );
  const data = await response.json();
  return data;
};