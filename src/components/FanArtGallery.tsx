import { useState } from 'react';

interface FanArt {
  id: string;
  src: string;
  alt: string;
  artist: string;
  artistLink?: string;
  tags?: string[];
}

interface Props {
  artworks: FanArt[];
}

export default function FanArtGallery({ artworks }: Props) {
  const [selected, setSelected] = useState<FanArt | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  const open = (art: FanArt, idx: number) => {
    setSelected(art);
    setSelectedIdx(idx);
  };

  const close = () => setSelected(null);

  const goPrev = () => {
    const newIdx = (selectedIdx - 1 + artworks.length) % artworks.length;
    setSelected(artworks[newIdx]);
    setSelectedIdx(newIdx);
  };

  const goNext = () => {
    const newIdx = (selectedIdx + 1) % artworks.length;
    setSelected(artworks[newIdx]);
    setSelectedIdx(newIdx);
  };

  return (
    <>
      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {artworks.map((art, idx) => (
          <div
            key={art.id}
            className="break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-pointer group relative shadow-sm hover:shadow-lg transition-shadow"
            onClick={() => open(art, idx)}
          >
            <img
              src={art.src}
              alt={art.alt}
              className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const wrapper = (e.currentTarget as HTMLImageElement).parentElement;
                if (wrapper) {
                  wrapper.style.background = '#FFE4EC';
                  wrapper.style.minHeight = '160px';
                  wrapper.style.display = 'flex';
                  wrapper.style.alignItems = 'center';
                  wrapper.style.justifyContent = 'center';
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  const placeholder = document.createElement('span');
                  placeholder.style.display = 'block';
                  wrapper.appendChild(placeholder);
                }
              }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-end pointer-events-none">
              <div
                className="w-full bg-gradient-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
              >
                <p className="text-white text-xs font-medium">by {art.artist}</p>
                {art.tags && art.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {art.tags.map((tag) => (
                      <span key={tag} className="text-white/70 text-xs">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={close}
        >
          {/* Prev button */}
          {artworks.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="前のイラスト"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image card */}
          <div
            className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors text-sm"
              onClick={close}
              aria-label="閉じる"
            >
              ✕
            </button>
            <img
              src={selected.src}
              alt={selected.alt}
              className="w-full max-h-[75vh] object-contain block"
            />
            <div className="px-5 py-3 bg-white text-center">
              {selected.artistLink ? (
                <a
                  href={selected.artistLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#EE3F87] font-medium hover:underline"
                >
                  by {selected.artist} ↗
                </a>
              ) : (
                <span className="text-sm text-[#444444]">by {selected.artist}</span>
              )}
              {selected.tags && selected.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="text-xs text-[#444444] bg-[#FFE1EE] px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Next button */}
          {artworks.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="次のイラスト"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
