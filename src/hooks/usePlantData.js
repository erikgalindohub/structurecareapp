import { useEffect, useState } from 'react';
import { GOOGLE_SHEET_URL, PLACEHOLDER_BASE } from '../constants';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        if (response.status === 429 && attempt < retries - 1) {
          await delay(2 ** attempt * 1000 + Math.random() * 800);
          continue;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      if (attempt === retries - 1) {
        throw error;
      }
      await delay(2 ** attempt * 1000 + Math.random() * 800);
    }
  }
  return null;
};

const usePlantData = () => {
  const [dbPlants, setDbPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPlants = async () => {
      try {
        const response = await fetchWithRetry(GOOGLE_SHEET_URL, { signal: controller.signal });
        if (!response) {
          return;
        }
        const tsv = await response.text();
        const rows = tsv.trim().split('\n').map((row) => row.split('\t'));
        rows.shift();

        const data = rows
          .map((columns, index) => ({
            id: `db-${index + 1}`,
            name: columns[1]?.trim() || 'Unknown Plant',
            scientific: columns[2]?.trim() || '',
            type: columns[3]?.trim() || 'Perennial',
            size: columns[4]?.trim() || 'Medium',
            aesthetic: columns[5]?.trim() || 'Description Missing',
            light: columns[6]?.trim() || 'Varies',
            soil: columns[7]?.trim() || 'Varies',
            water: columns[8]?.trim() || 'Varies',
            benefits: columns[9]?.trim() || 'Varies',
            subType: columns[10]?.trim() || 'General',
            imageUrl: `${PLACEHOLDER_BASE}${encodeURIComponent(columns[1]?.trim() || 'Plant')}`,
          }))
          .filter((plant) => plant.name !== 'Unknown Plant');

        setDbPlants(data);
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error('Failed to load plant data:', error);
        setDbPlants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlants();

    return () => {
      controller.abort();
    };
  }, []);

  return { dbPlants, isLoading };
};

export default usePlantData;
