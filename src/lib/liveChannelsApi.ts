export interface Channel {
  id: string;
  name: string;
  category: string;
  url: string;
  keyId?: string;
  key?: string;
  licenseUrl?: string;
  logo: string;
  iframeEmbed?: boolean;
}

let _cache: Channel[] | null = null;
let _tokenCache: string | null = null;

const ALLOWED_CATEGORIES = new Set([
  'English', 'Entertainment', 'Movies', 'Telugu', 'News', 'Sports', 'Kannada',
]);

export async function fetchChannels(): Promise<Channel[]> {
  if (_cache) return _cache;
  try {
    // Fetch JioTV channels + Star Sports in parallel
    const [jioRes, starRes] = await Promise.allSettled([
      fetch('/api/proxy/jio-channels').then(r => r.ok ? r.json() : Promise.reject()),
      fetch('/api/star-sports').then(r => r.ok ? r.json() : Promise.reject()),
    ]);

    let jioChannels: Channel[] = [];
    if (jioRes.status === 'fulfilled') {
      jioChannels = jioRes.value;
    } else {
      // fallback direct
      try {
        const r = await fetch('https://raw.githubusercontent.com/sonuug5/newtest/refs/heads/main/json/jstr4web.json');
        if (r.ok) jioChannels = await r.json();
      } catch { /* ignore */ }
    }

    // Filter to allowed categories + MTV from Music
    const filtered = (jioChannels as Channel[]).filter(ch => {
      if (ALLOWED_CATEGORIES.has(ch.category)) return true;
      if (ch.category === 'Music' && ch.name && ch.name.toLowerCase().includes('mtv')) return true;
      return false;
    });

    // Move MTV into Entertainment so it shows in that row
    const withMtv = filtered.map(ch =>
      ch.category === 'Music' ? { ...ch, category: 'Entertainment' } : ch
    );

    const starChannels: Channel[] = starRes.status === 'fulfilled' ? starRes.value : [];

    _cache = [...withMtv, ...starChannels];
    return _cache;
  } catch {
    return [];
  }
}

export async function fetchToken(): Promise<string> {
  if (_tokenCache) return _tokenCache;
  try {
    const res = await fetch('/api/proxy/token');
    if (!res.ok) throw new Error();
    const data = await res.json();
    const cookieObj = data.find((item: any) => item.cookie);
    _tokenCache = cookieObj ? cookieObj.cookie : '';
    return _tokenCache!;
  } catch {
    try {
      const direct = await fetch('https://allinonereborn.online/jstrweb2/cookies.json');
      if (!direct.ok) throw new Error();
      const data = await direct.json();
      const cookieObj = data.find((item: any) => item.cookie);
      _tokenCache = cookieObj ? cookieObj.cookie : '';
      return _tokenCache!;
    } catch {
      return '';
    }
  }
}

export function getChannelById(channels: Channel[], id: string): Channel | undefined {
  return channels.find(c => c.id === id);
}

export function groupByCategory(channels: Channel[]): Record<string, Channel[]> {
  return channels.reduce((acc, ch) => {
    const cat = ch.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {} as Record<string, Channel[]>);
}

export function slugify(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export function deslugify(slug: string, categories: string[]): string | undefined {
  return categories.find(c => slugify(c) === slug);
}
