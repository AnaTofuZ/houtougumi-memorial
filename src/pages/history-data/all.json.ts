import type { APIRoute } from 'astro';
import { historyReviewEntries } from '../../data/historyArchive';

export const GET: APIRoute = () => new Response(JSON.stringify(historyReviewEntries), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
