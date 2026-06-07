import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/sonuug5/newtest/refs/heads/main/json/jstr4web.json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );
    if (!response.ok) throw new Error('Upstream fetch failed');
    let data: any[] = await response.json();

    const { category, search, limit, offset } = req.query;

    if (category && typeof category === 'string') {
      data = data.filter((c) => c.category?.toLowerCase() === category.toLowerCase());
    }
    if (search && typeof search === 'string') {
      data = data.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));
    }

    const total = data.length;
    const off = parseInt((offset as string) || '0', 10);
    const lim = parseInt((limit as string) || String(total), 10);
    data = data.slice(off, off + lim);

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json({
      total,
      offset: off,
      limit: lim,
      channels: data,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
}
