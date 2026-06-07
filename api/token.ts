import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const response = await fetch('https://allinonereborn.online/jstrweb2/cookies.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
        Referer: 'https://allinonereborn.online/',
      },
    });
    if (!response.ok) throw new Error('Upstream failed');
    const data = await response.json();
    const cookieObj = data.find((item: any) => item.cookie);
    const token = cookieObj ? cookieObj.cookie : null;

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.status(200).json({ token });
  } catch {
    res.status(500).json({ error: 'Failed to fetch token' });
  }
}
