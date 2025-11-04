export const fetchWithRetry = async (url: string, options?: RequestInit, retries = 5, delay = 800) => {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...(options?.headers || {}),
        },
        mode: 'cors',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      if (response.ok) return response;
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries reached');
};

export const isWorkingHours = () => {
  const now = new Date();
  const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  const hours = moscowTime.getHours();
  return hours >= 6 && hours < 19;
};
