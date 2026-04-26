-- Enable pgvector extension (run this first if not enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for Knowledge Base
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384), -- 384 for all-MiniLM-L6-v2
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note for future testing:
-- We will use this table to match questions from users mathematically using pgvector
-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(384),
  match_count int DEFAULT 5,
  filter_agent_id uuid DEFAULT NULL
) returns table (
  id uuid,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where documents.agent_id = filter_agent_id
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
