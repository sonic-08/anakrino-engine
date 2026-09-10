export async function searchWithAnakrino(query) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    let errorMsg = 'Failed to synthesize platform data.';
    try {
      const errorData = await response.json();
      if (errorData?.error) errorMsg = errorData.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  const toolData = await response.json();
  return toolData;
}