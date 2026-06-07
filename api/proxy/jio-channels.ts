export default async function handler(req: any, res: any) {
  try {
    const response = await fetch(
      'https://raw.githubusercontent.com/sonuug5/newtest/refs/heads/main/json/jstr4web.json',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      }
    );
    if (!response.ok) throw new Error('Fetch failed');
    const data = await response.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Jio Proxy Error:', error);
    res.status(500).json({ error: 'Failed to fetch Jio channels' });
  }
}
