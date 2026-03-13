import type { Metadata } from 'next';
import { Instrument_Serif, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { StoreProvider } from '../lib/store/store-provider';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mycontxt.ai'),
  title: {
    default: 'Contxt — Memory for AI Agents',
    template: '%s | Contxt',
  },
  description:
    'Persistent, versioned, project-scoped memory for AI coding agents. Push context once — your tools remember it forever.',
  keywords: [
    'AI coding agent',
    'AI memory',
    'Claude Code',
    'Cursor',
    'Windsurf',
    'MCP server',
    'context management',
    'developer tools',
    'AI context',
    'project memory',
  ],
  authors: [{ name: 'Contxt', url: 'https://mycontxt.ai' }],
  creator: 'Contxt',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Contxt — Memory for AI Agents',
    description: 'Your AI forgets. Contxt remembers. Persistent, project-scoped memory for Claude Code, Cursor, and Windsurf.',
    url: 'https://mycontxt.ai',
    siteName: 'Contxt',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Contxt — Memory for AI Agents' }],
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contxt — Memory for AI Agents',
    description: 'Your AI forgets. Contxt remembers.',
    images: ['/opengraph-image'],
    creator: '@mycontxt',
  },
  alternates: {
    canonical: 'https://mycontxt.ai',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable} ${jetBrainsMono.variable}`}>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
