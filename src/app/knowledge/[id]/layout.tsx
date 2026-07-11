import type { ReactNode } from 'react';

export function generateStaticParams() {
  return Array.from({ length: 18 }, (_, index) => ({ id: String(index + 1) }));
}

export default function DiseaseLayout({ children }: { children: ReactNode }) {
  return children;
}
