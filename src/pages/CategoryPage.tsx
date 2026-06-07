import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Signal, Play, Loader2 } from 'lucide-react';
import { fetchChannels, fetchToken, groupByCategory, deslugify, slugify, Channel } from '../lib/liveChannelsApi';

export default function CategoryPage() {
  const { category: slug } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchChannels()
      .then(setChannels)
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => groupByCategory(channels), [channels]);
  const categories = Object.keys(grouped);
  const categoryName = slug ? deslugify(slug, categories) : undefined;
  const categoryChannels = categoryName ? (grouped[categoryName] ?? []) : [];

  const filtered = useMemo(() => {
    if (!search.trim()) return categoryChannels;
    const q = search.toLowerCase();
    return categoryChannels.filter(c => c.name.toLowerCase().includes(q));
  }, [categoryChannels, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/20" />
      </div>
    );
  }

  if (!categoryName) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Signal size={40} className="text-zinc-800" />
        <p className="text-zinc-500 text-sm">Category not found</p>
        <button onClick={() => navigate('/')} className="text-xs text-zinc-600 hover:text-white mt-2 transition-colors">
          ← Back home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-5 md:px-10 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
            >
              <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs font-medium hidden sm:inline">uvylive</span>
            </button>
            <span className="text-zinc-800">/</span>
            <span className="text-xs font-bold text-white">{categoryName}</span>
            <span className="text-[10px] text-zinc-700 font-medium ml-1">{categoryChannels.length}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 w-44 md:w-56 focus-within:border-white/20 transition-colors">
            <Search size={13} className="text-zinc-600 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-zinc-700 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Other categories nav */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-5 md:px-10 py-3 border-b border-white/5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { navigate(`/${slugify(cat)}`); setSearch(''); }}
            className={`shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all ${
              cat === categoryName
                ? 'bg-white text-black'
                : 'text-zinc-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-5 md:px-10 py-8">
        {filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <Signal size={40} className="text-zinc-800" />
            <p className="text-zinc-600 text-sm">No channels found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
            {filtered.map(ch => (
              <div
                key={ch.id}
                onClick={() => navigate(`/channel/${ch.id}`)}
                className="group cursor-pointer"
              >
                <div className="aspect-video rounded-xl bg-zinc-900 border border-white/5 overflow-hidden relative flex items-center justify-center hover:border-white/15 hover:scale-[1.03] active:scale-[0.97] transition-all">
                  <img
                    src={ch.logo}
                    alt={ch.name}
                    className="w-[70%] h-[70%] object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                      <Play size={12} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 group-hover:text-zinc-300 mt-1.5 truncate transition-colors font-medium">{ch.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
