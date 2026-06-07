import React, { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player/dist/shaka-player.ui.js';
import 'shaka-player/dist/controls.css';

interface ShakaPlayerProps {
  url: string;
  clearKeyId?: string;
  clearKey?: string;
  licenseUrl?: string;
  token?: string;
  title?: string;
}

export default function ShakaPlayer({ url, clearKeyId, clearKey, licenseUrl, token, title }: ShakaPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let player: any = null;
    let ui: any = null;
    let isMounted = true;

    const initPlayer = async () => {
      if (!isMounted) return;
      if (!videoRef.current || !containerRef.current) return;

      shaka.polyfill.installAll();

      if (!shaka.Player.isBrowserSupported()) {
        setError('Browser not supported.');
        return;
      }

      player = new shaka.Player();
      await player.attach(videoRef.current);
      if (!isMounted) return;

      ui = new shaka.ui.Overlay(player, containerRef.current, videoRef.current);

      player.configure({
        streaming: {
          bufferingGoal: 30,
          bufferBehind: 15,
          retryParameters: { maxAttempts: 5, baseDelay: 1000, backoffFactor: 2 },
        },
        manifest: {
          retryParameters: { maxAttempts: 5, baseDelay: 1000, backoffFactor: 2 },
        },
      });

      if (clearKeyId && clearKey) {
        player.configure({
          drm: {
            clearKeys: { [clearKeyId]: clearKey },
            preferredKeySystems: ['org.w3.clearkey'],
          },
        });
      } else if (licenseUrl) {
        player.configure({
          drm: {
            servers: {
              'org.w3.clearkey': licenseUrl,
              'com.widevine.alpha': licenseUrl,
            },
          },
        });
      }

      if (token) {
        player.getNetworkingEngine()?.registerRequestFilter((type: any, request: any) => {
          if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) return;
          if (request.uris && request.uris[0] && !request.uris[0].startsWith('data:')) {
            if (!request.uris[0].includes('__hdnea__')) {
              const separator = request.uris[0].includes('?') ? '&' : '?';
              request.uris[0] += `${separator}${token}`;
            }
          }
        });
      }

      player.addEventListener('error', (e: any) => {
        if (!isMounted) return;
        if (e.detail && e.detail.code === 7000) return;
        console.error('Shaka Error:', e.detail);
        setError(`Error code ${e.detail?.code}`);
      });

      try {
        setError(null);
        await player.load(url);
        if (isMounted && videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        if (!isMounted || e.code === 7000) return;
        console.error('Shaka Load Error:', e);
        setError(`Playback error: ${e.message || 'Failed to load stream'}`);
      }
    };

    initPlayer();

    return () => {
      isMounted = false;
      if (ui) ui.destroy();
      if (player) player.destroy();
    };
  }, [url, clearKeyId, clearKey, licenseUrl, token]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
      <div ref={containerRef} className="w-full h-full relative z-10">
        <video ref={videoRef} className="w-full h-full" autoPlay />
      </div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
        </div>
      )}
      {title && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 opacity-0 group-hover:opacity-100 transition-opacity">
          <h2 className="text-white font-medium drop-shadow-md">{title}</h2>
        </div>
      )}
      {/* Watermark */}
      <div className="absolute top-3 right-3 z-30 pointer-events-none select-none">
        <span className="text-sm font-bold text-white/25 tracking-wide drop-shadow" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
          nikshep uvylive
        </span>
      </div>
    </div>
  );
}
