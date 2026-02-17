'use client';

import { useEffect, useState } from 'react';

type Status = 'loading' | 'success' | 'error';

export default function CLIAuthPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('Completing authentication...');

  useEffect(() => {
    async function handleToken() {
      // Parse the hash fragment: #access_token=...&refresh_token=...
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      if (error) {
        setStatus('error');
        setMessage(errorDescription ?? error);
        return;
      }

      if (!accessToken) {
        setStatus('error');
        setMessage('No access token found in callback.');
        return;
      }

      // Forward the token to the CLI's local server
      try {
        await fetch('http://localhost:54321/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: accessToken, refresh_token: refreshToken }),
        });
        setStatus('success');
        setMessage('You can close this window and return to your terminal.');
      } catch {
        // Local server not running — show token for manual paste
        setStatus('error');
        setMessage(
          'Could not reach the CLI. Make sure `contxt auth login` is running, then paste this token:\n\n' +
          accessToken
        );
      }
    }

    handleToken();
  }, []);

  return (
    <div style={{
      fontFamily: 'sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{message}</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Authentication Successful!</h1>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Authentication Failed</h1>
            <pre style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '8px',
              fontSize: '0.75rem',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>{message}</pre>
          </>
        )}
      </div>
    </div>
  );
}
