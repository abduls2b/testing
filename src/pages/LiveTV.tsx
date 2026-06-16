import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Search, ChevronRight, Play, Signal, Instagram, Tv2, Zap, Star, ExternalLink } from 'lucide-react';
import { fetchChannels, fetchToken, groupByCategory, slugify, Channel } from '../lib/liveChannelsApi';

const ROW_LIMIT = 12;

const CATEGORY_ORDER: { key: string; label: string }[] = [
  { key: 'Sports',        label: 'Star Sports' },
  { key: 'Entertainment', label: 'Entertainment' },
  { key: 'Movies',        label: 'Movies' },
  { key: 'English',       label: 'English' },
  { key: 'Gujarati',      label: 'Gujarati' },
  { key: 'Infotainment',  label: 'Infotainment' },
  { key: 'Urdu',          label: 'Urdu' },
  { key: 'Kids',          label: 'Kids' },
  { key: 'Music',         label: 'Music' },
  { key: 'News',          label: 'News' },
];

function PageFooter() {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-5 px-5 py-4 border-t border-white/5 text-[11px] text-zinc-500 mt-2">
      <div className="flex items-center gap-1.5">
        <Instagram size={11} className="text-pink-500 shrink-0" />
        <span>Follow Nikshep on Instagram</span>
        <a href="https://instagram.com/nikkk.exe" target="_blank" rel="noopener noreferrer" className="text-pink-400 font-bold hover:text-pink-300 transition-colors">@nikkk.exe</a>
      </div>
      <span className="hidden sm:inline text-zinc-800">·</span>
      <div className="flex items-center gap-1">
        <span>movies &amp; more →</span>
        <a href="https://zestyyflix.vercel.app" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-0.5">
          zestyyflix.vercel.app <ExternalLink size={9} />
        </a>
      </div>
      <span className="hidden sm:inline text-zinc-800">·</span>
      <span className="text-zinc-700">adfree by Nikshep</span>
    </div>
  );
}

export default function LiveTV() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchChannels(), fetchToken()])
      .then(([ch]) => setChannels(ch))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => groupByCategory(channels), [channels]);

  const filteredChannels = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return channels.filter(c => c.name.toLowerCase().includes(q));
  }, [channels, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-white/20" />
        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[8px]">Loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 px-4 md:px-8 py-5">
        {filteredChannels ? (
          <div>
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 mb-5 focus-within:border-white/20 transition-colors">
              <Search size={13} className="text-zinc-600 shrink-0" />
              <input
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-zinc-700 focus:outline-none w-full"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[5px] mb-4">
              {filteredChannels.length} results for &quot;{search}&quot;
            </p>
            {filteredChannels.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-3">
                <Signal size={32} className="text-zinc-800" />
                <p className="text-zinc-600 text-sm">No channels found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-11 gap-3">
                {filteredChannels.map(ch => (
                  <ChannelCard key={ch.id} channel={ch} onClick={() => navigate(`/channel/${ch.id}`)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">

            {/* ── Hero ── */}
            <div className="relative rounded-xl overflow-hidden border border-white/5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black px-5 py-5 md:px-8 md:py-6">
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />

              <div className="relative flex items-center justify-between gap-4">
                {/* Left: text */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none mb-1">
                    uvylive
                  </h1>
                  <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-2">
                    All Indian channels in{' '}
                    <span className="text-white font-semibold">HD</span>,{' '}
                    <span className="text-white font-semibold">Ad-free</span>,{' '}
                    <span className="text-white font-semibold">4K</span> — free.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-0">
                    {[
                      { icon: <Tv2 size={10} />, label: 'Star Sports' },
                      { icon: <Star size={10} />, label: 'Entertainment' },
                      { icon: <Zap size={10} />, label: 'Movies' },
                    ].map(pill => (
                      <span key={pill.label} className="flex items-center gap-1 text-[9px] font-semibold text-zinc-600 bg-white/5 border border-white/6 rounded-full px-2 py-0.5">
                        {pill.icon}{pill.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: instagram + stats */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <a
                    href="https://instagram.com/nikkk.exe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-[11px] font-bold px-3 py-2 rounded-lg transition-all hover:scale-[1.03] active:scale-[0.97] shadow-md shadow-pink-900/30 whitespace-nowrap"
                  >
                    <Instagram size={12} />
                    @nikkk.exe
                  </a>

                  <div className="flex gap-3">
                    {[
                      { value: `${channels.length}+`, label: 'Channels' },
                      { value: 'HD', label: 'Quality' },
                      { value: '0₹', label: 'Cost' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center">
                        <p className="text-base font-black text-white">{stat.value}</p>
                        <p className="text-[8px] text-zinc-700 uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Search (below hero) ── */}
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5 -mt-4 focus-within:border-white/20 transition-colors">
              <Search size={13} className="text-zinc-600 shrink-0" />
              <input
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-zinc-600 focus:outline-none w-full"
              />
            </div>

            {/* ── Category Rows ── */}
            {CATEGORY_ORDER.map(({ key, label }) => {
              const chs = grouped[key];
              if (!chs || chs.length === 0) return null;
              return (
                <CategoryRow
                  key={key}
                  category={key}
                  label={label}
                  channels={chs}
                  onChannelClick={id => navigate(`/channel/${id}`)}
                  onShowMore={() => navigate(`/${slugify(key)}`)}
                />
              );
            })}
          </div>
        )}
      </div>

      <PageFooter />
    </div>
  );
}

function CategoryRow({
  label, channels, onChannelClick, onShowMore
}: {
  category: string;
  label: string;
  channels: Channel[];
  onChannelClick: (id: string) => void;
  onShowMore: () => void;
}) {
  const visible = channels.slice(0, ROW_LIMIT);
  const hasMore = channels.length > ROW_LIMIT;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold text-white tracking-tight uppercase">{label}</h2>
        {hasMore && (
          <button onClick={onShowMore} className="flex items-center gap-0.5 text-[10px] font-semibold text-zinc-600 hover:text-white transition-colors group">
            See all {channels.length}
            <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 md:-mx-8 px-4 md:px-8">
        {visible.map(ch => (
          <ChannelCard
            key={ch.id}
            channel={ch}
            onClick={() => onChannelClick(ch.id)}
            className="shrink-0 w-[90px] md:w-[108px]"
          />
        ))}
        {hasMore && (
          <button
            onClick={onShowMore}
            className="shrink-0 w-[90px] md:w-[108px] aspect-video rounded-lg bg-zinc-900/60 border border-white/5 flex flex-col items-center justify-center gap-1.5 text-zinc-600 hover:text-white hover:bg-zinc-800/60 transition-all group"
          >
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[8px] font-bold uppercase tracking-widest">See all</span>
          </button>
        )}
      </div>
    </div>
  );
}

function ChannelCard({
  channel, onClick, className = ''
}: {
  channel: Channel;
  onClick: () => void;
  className?: string;
}) {
  return (
    <div onClick={onClick} className={`group cursor-pointer ${className}`}>
      <div className="aspect-video rounded-lg bg-zinc-900 border border-white/5 overflow-hidden relative flex items-center justify-center hover:border-white/15 transition-all hover:scale-[1.03] active:scale-[0.97]">
        <img
          src={channel.logo}
          alt={channel.name}
          className="w-[68%] h-[68%] object-contain group-hover:scale-105 transition-transform duration-300"
          onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
            <Play size={10} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <p className="text-[9px] text-zinc-600 group-hover:text-zinc-300 mt-1 truncate transition-colors font-medium">{channel.name}</p>
    </div>
  );
}
