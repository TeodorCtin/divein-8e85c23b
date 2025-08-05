-- Add missing columns to opportunities for DiveIn requirements
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS link_extern TEXT,
ADD COLUMN IF NOT EXISTS data_oportunitate DATE;

-- Add missing columns to applications for DiveIn requirements
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS nume TEXT,
ADD COLUMN IF NOT EXISTS prenume TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS link_social TEXT,
ADD COLUMN IF NOT EXISTS mesaj TEXT;

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    nume_organizatie TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on organizations if not already enabled
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organizations
DROP POLICY IF EXISTS "Organizations can view their own data" ON public.organizations;
CREATE POLICY "Organizations can view their own data" 
ON public.organizations 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organizations can update their own data" ON public.organizations;
CREATE POLICY "Organizations can update their own data" 
ON public.organizations 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Organizations can insert their own data" ON public.organizations;
CREATE POLICY "Organizations can insert their own data" 
ON public.organizations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create organization profile
CREATE OR REPLACE FUNCTION public.handle_new_organization_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.organizations (user_id, email, nume_organizatie)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nume_organizatie', 'Organizația mea')
    );
    RETURN NEW;
EXCEPTION WHEN unique_violation THEN
    -- If organization already exists, do nothing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger for organization profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_organization ON auth.users;
CREATE TRIGGER on_auth_user_created_organization
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organization_user();