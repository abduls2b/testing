import type { VercelRequest, VercelResponse } from '@vercel/node';

const NIKKITV_SOURCE = 'https://raw.githubusercontent.com/babumani1/jiotv2/refs/heads/main/primary.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const response = await fetch(NIKKITV_SOURCE, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Upstream fetch failed');

    const raw: any[] = await response.json();

    // Filter only Star Sports channels
    const starSports = raw
      .filter(
        (ch) =>
          ch.name &&
          ch.name.toLowerCase().includes('star sport') &&
          ch.status !== 'offline'
      )
      .map((ch) => ({
        id: `ss-${ch.id}`,
        name: ch.name,
        category: 'Sports',
        logo: ch.logo || '',
        url: `https://joplay.lrl45.workers.dev/${ch.id}`,
        iframeEmbed: true,
      }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(starSports);
  } catch (error) {
    console.error('Star Sports fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch Star Sports channels' });
  }
}
