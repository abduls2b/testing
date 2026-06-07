import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/sonuug5/newtest/refs/heads/main/json/jstr4web.json',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    if (!response.ok) throw new Error('Upstream failed');
    const data: any[] = await response.json();

    const { category } = req.query;

    // If ?category= param is provided, return channels in that category
    if (category && typeof category === 'string') {
      const channels = data.filter(
        (c) => c.category?.toLowerCase() === category.toLowerCase()
      );
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
      return res.status(200).json({
        category: category,
        total: channels.length,
        channels,
      });
    }

    // Default: return sorted list of unique categories
    const cats = [...new Set(data.map((c) => c.category).filter(Boolean))].sort();
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate');
    res.status(200).json({ total: cats.length, categories: cats });
  } catch {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
