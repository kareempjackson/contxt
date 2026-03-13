import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Contxt — Memory for AI Agents';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'sans-serif',
            fontSize: '420px',
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '-8px',
          }}
        >
          c
        </span>
      </div>
    ),
    { ...size }
  );
}
