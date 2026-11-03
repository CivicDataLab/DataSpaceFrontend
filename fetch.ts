async function readSearchResponse(response: Response) {
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.text();
      detail = body.slice(0, 300);
    } catch {
      // ignore body read failures
    }
    throw new Error(
      `Search API returned ${response.status}${detail ? `: ${detail}` : ''}`
    );
  }

  return response.json();
}

export const fetchDatasets = async (variables: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/dataset/${variables}`
  );
  return readSearchResponse(response);
};

export const fetchData = async (type: string, variables: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/search/${type}/${variables}`
  );
  return readSearchResponse(response);
};
