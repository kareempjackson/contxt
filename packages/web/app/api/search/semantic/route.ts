import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';

async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings error: ${err}`);
  }

  const json = await res.json();
  return json.data[0].embedding as number[];
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the user is on a paid plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_id, status')
    .eq('user_id', user.id)
    .single();

  const isPaid = sub?.status === 'active' && sub?.plan_id !== 'free';
  if (!isPaid) {
    // Also check user_profiles as fallback
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan_id')
      .eq('id', user.id)
      .single();
    if (!profile?.plan_id || profile.plan_id === 'free') {
      return NextResponse.json({ error: 'Semantic search requires a paid plan' }, { status: 403 });
    }
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const projectId = searchParams.get('project'); // null = search all projects

  if (!query?.trim()) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Semantic search not configured' }, { status: 503 });
  }

  try {
    const queryEmbedding = await embedText(query.trim());

    const { data: { session } } = await supabase.auth.getSession();
    const db = new SupabaseDatabase({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      accessToken: session?.access_token,
    });

    let results;
    if (projectId && projectId !== 'all') {
      results = await db.semanticSearch(projectId, queryEmbedding, { limit: 30, minSimilarity: 0.5 });
    } else {
      results = await db.semanticSearchAll(user.id, queryEmbedding, { limit: 30, minSimilarity: 0.5 });
    }

    // If vector search returns nothing, fall back to FTS so users always get results
    if (results.length === 0) {
      if (projectId && projectId !== 'all') {
        results = await db.searchEntries(projectId, query.trim(), { limit: 30 });
      } else {
        results = await db.searchAllEntries(user.id, query.trim(), { limit: 30 });
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error('Semantic search error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Search failed' },
      { status: 500 }
    );
  }
}
