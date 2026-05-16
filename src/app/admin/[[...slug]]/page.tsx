import { notFound } from 'next/navigation';

/** Decoy route: /admin* always 404 (real dashboard is /budasevo). */
export default function AdminDecoyNotFound() {
  notFound();
}
