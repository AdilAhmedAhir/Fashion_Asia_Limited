-- Run this SQL in your Supabase SQL Editor

-- 1. Submissions Table (Contact, Career, Grievance)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'contact', 'career', 'grievance'
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous users can only INSERT into submissions (Forms)
CREATE POLICY "Allow anonymous inserts to submissions" ON public.submissions FOR INSERT TO anon WITH CHECK (true);

-- Deny public reading (only admin can read)
CREATE POLICY "Deny public read on submissions" ON public.submissions FOR SELECT TO anon USING (false);
