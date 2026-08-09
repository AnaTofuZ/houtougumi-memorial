import type { APIRoute } from 'astro';
import { historyEntries, historyPageCount, historyPageSize } from '../../data/historyArchive';

export function getStaticPaths() {
  return Array.from({ length: historyPageCount - 1 }, (_, index) => {
    const page = index + 2;
    return {
      params: { page: String(page) },
      props: { entries: historyEntries.slice((page - 1) * historyPageSize, page * historyPageSize) },
    };
  });
}

export const GET: APIRoute = ({ props }) => new Response(JSON.stringify(props.entries), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
