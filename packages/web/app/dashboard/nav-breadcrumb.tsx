'use client';

import { usePathname } from 'next/navigation';

const LABELS: Record<string, string> = {
  '/dashboard': 'Projects',
  '/dashboard/search': 'Search',
  '/dashboard/activity': 'Activity',
  '/dashboard/review': 'Review',
  '/dashboard/settings': 'Settings',
};

export function NavBreadcrumb() {
  const path = usePathname();

  if (path.startsWith('/dashboard/projects/')) {
    const slug = decodeURIComponent(path.split('/')[3] ?? '');
    return (
      <div className="flex items-center gap-1.5 text-[13px]">
        <a href="/dashboard" className="text-text-2 font-medium hover:text-text-0 transition-colors">
          Projects
        </a>
        <span className="text-text-3">/</span>
        <span className="text-text-0 font-semibold truncate max-w-[200px]">{slug}</span>
      </div>
    );
  }

  return (
    <span className="text-text-0 font-semibold text-[13px]">
      {LABELS[path] ?? 'Dashboard'}
    </span>
  );
}
