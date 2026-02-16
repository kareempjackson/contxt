/**
 * Supabase Edge Function - Generate embeddings using OpenAI
 * Called when entries are pushed to generate semantic search embeddings
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface EmbedRequest {
  entryIds: string[];
}

interface EmbedResponse {
  success: boolean;
  embedded: number;
  errors: string[];
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Validate environment
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment not configured');
    }

    // Parse request
    const { entryIds }: EmbedRequest = await req.json();

    if (!entryIds || entryIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'entryIds array required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Limit batch size to prevent timeouts and control costs
    if (entryIds.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Maximum 100 entries per batch' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch entries
    const { data: entries, error: fetchError } = await supabase
      .from('memory_entries')
      .select('id, title, content')
      .in('id', entryIds);

    if (fetchError) {
      throw new Error(`Failed to fetch entries: ${fetchError.message}`);
    }

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ success: true, embedded: 0, errors: [] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result: EmbedResponse = {
      success: true,
      embedded: 0,
      errors: [],
    };

    // Generate embeddings for each entry
    for (const entry of entries) {
      try {
        // Combine title and content for embedding
        const text = `${entry.title}\n\n${entry.content}`;

        // Call OpenAI API
        const embeddingResponse = await fetch(
          'https://api.openai.com/v1/embeddings',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'text-embedding-3-small',
              input: text,
              dimensions: 1536, // Match pgvector dimension
            }),
          }
        );

        if (!embeddingResponse.ok) {
          const error = await embeddingResponse.text();
          throw new Error(`OpenAI API error: ${error}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Update entry with embedding
        const { error: updateError } = await supabase.rpc(
          'update_entry_embedding',
          {
            entry_id: entry.id,
            new_embedding: embedding,
          }
        );

        if (updateError) {
          throw new Error(`Failed to update embedding: ${updateError.message}`);
        }

        result.embedded++;
      } catch (error) {
        result.errors.push(
          `Entry ${entry.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Embed function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
