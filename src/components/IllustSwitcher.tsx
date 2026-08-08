import { useState } from 'react';

interface Illustration {
  src: string;
  alt: string;
}

interface Props {
  illustrations: Illustration[];
  themeColor: string;
  themeLightColor: string;
  themeDarkColor: string;
  name: string;
}

export default function IllustSwitcher({
  illustrations,
  themeColor,
  themeLightColor,
  themeDarkColor,
  name,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  const handleSelect = (index: number) => {
    if (index === current || fading) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 180);
  };

  const handlePrev = () => handleSelect((current - 1 + illustrations.length) % illustrations.length);
  const handleNext = () => handleSelect((current + 1) % illustrations.length);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Main image */}
      <div
        className="relative w-full max-w-xs mx-auto rounded-3xl overflow-hidden shadow-lg"
        style={{ backgroundColor: themeLightColor }}
      >
        <div className="aspect-square flex items-center justify-center overflow-hidden">
          {illustrations[current]?.src ? (
            <img
              key={current}
              src={illustrations[current].src}
              alt={illustrations[current].alt}
              className="w-full h-full object-cover object-top"
              style={{
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.18s ease',
              }}
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-40">
              <p className="text-xs text-center px-4" style={{ color: themeDarkColor }}>
                イラストを追加してください
              </p>
            </div>
          )}
        </div>

        {/* Prev / Next arrows */}
        {illustrations.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
              aria-label="前のイラスト"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center shadow hover:bg-white transition-colors"
              aria-label="次のイラスト"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Index indicator */}
        {illustrations.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {illustrations.map((_, i) => (
              <span
                key={i}
                className="block rounded-full transition-all"
                style={{
                  width: i === current ? '16px' : '6px',
                  height: '6px',
                  backgroundColor: i === current ? themeDarkColor : `${themeColor}80`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {illustrations.length > 1 && (
        <div className="flex gap-2 flex-wrap justify-center">
          {illustrations.map((illust, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                width: '56px',
                height: '56px',
                border: `2px solid ${idx === current ? themeDarkColor : 'transparent'}`,
                opacity: idx === current ? 1 : 0.5,
                transform: idx === current ? 'scale(1.1)' : 'scale(1)',
                background: `${themeLightColor}`,
              }}
              aria-label={`${name} イラスト ${idx + 1}`}
              aria-pressed={idx === current}
            >
              <img
                src={illust.src}
                alt={illust.alt}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
