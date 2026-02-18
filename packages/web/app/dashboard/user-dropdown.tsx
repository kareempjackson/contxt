'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

interface UserDropdownProps {
  initials: string;
}

export function UserDropdown({ initials }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-[11px] font-bold text-white cursor-pointer focus:outline-none"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-black/[0.06] py-1 z-50">
          <a
            href="/dashboard/settings"
            className="block px-3.5 py-2 text-[13px] text-text-1 hover:bg-black/[0.04] transition-colors"
            onClick={() => setOpen(false)}
          >
            Settings
          </a>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3.5 py-2 text-[13px] text-red-500 hover:bg-black/[0.04] transition-colors"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
