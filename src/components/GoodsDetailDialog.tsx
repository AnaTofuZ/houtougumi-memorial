import { useEffect, useRef, useState } from 'react';

interface GoodsDetail {
  description: string;
  image: string;
  name: string;
  price: string;
  status: string;
  url: string;
}

export default function GoodsDetailDialog() {
  const [selected, setSelected] = useState<GoodsDetail | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const open = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLButtonElement>('[data-goods-detail]');
      const card = button?.closest<HTMLElement>('[data-product]');
      const image = button?.querySelector<HTMLImageElement>('img');
      if (!card || !image) return;

      setSelected({
        description: card.dataset.description ?? '',
        image: image.src,
        name: card.dataset.name ?? '',
        price: card.dataset.price ?? '',
        status: card.dataset.statusLabel ?? '',
        url: card.dataset.url ?? '',
      });
    };

    document.addEventListener('click', open);
    return () => document.removeEventListener('click', open);
  }, []);

  useEffect(() => {
    if (selected && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [selected]);

  const close = () => dialogRef.current?.close();

  return selected && (
    <dialog
      ref={dialogRef}
      aria-labelledby="goods-dialog-title"
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-black/85 p-4 text-inherit backdrop:bg-transparent open:flex items-center justify-center"
      onClose={() => setSelected(null)}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="relative grid max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <button
          type="button"
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-sm text-white transition-colors hover:bg-black/75"
          onClick={close}
          aria-label="閉じる"
          autoFocus
        >
          ✕
        </button>

        <div className="flex min-h-64 items-center justify-center bg-[#DDF0FF] p-5 md:min-h-[32rem]">
          <img src={selected.image} alt={selected.name} className="max-h-[70vh] w-full object-contain" />
        </div>

        <div className="flex flex-col p-6 md:p-8">
          <span className="mb-3 w-fit rounded-full bg-[#EAF6FF] px-3 py-1 text-xs font-bold text-[#1D86D9]">
            {selected.status}
          </span>
          <h2 id="goods-dialog-title" className="mb-3 text-2xl font-extrabold leading-snug text-[#35263A]">
            {selected.name}
          </h2>
          <p className="mb-6 text-xl font-bold text-[#1D86D9]">{selected.price}</p>
          <p className="whitespace-pre-line text-sm leading-[1.8] text-[#444444]">{selected.description}</p>
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-fit items-center rounded-full bg-[#1D86D9] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#166bb0]"
          >
            STORESで見る ↗
          </a>
        </div>
      </div>
    </dialog>
  );
}
