// app/pages/highlights/ClientHighlights.js
'use client'
import dynamic from 'next/dynamic';

const HighlightsDisplay = dynamic(
  () => import('../../components/HighlightsDisplay'),
  { ssr: false }
);

export default function ClientHighlights() {
  return <HighlightsDisplay />;
}

