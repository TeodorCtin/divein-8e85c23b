-- Create organizations table (for users/organizations)
CREATE TABLE public.organizations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    nume_organizatie TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create opportunities table
CREATE TABLE public.opportunities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    titlu TEXT NOT NULL,
    descriere TEXT NOT NULL CHECK (LENGTH(descriere) <= 1000),
    categorie TEXT NOT NULL CHECK (categorie IN ('Educație', 'ONG', 'Stagii', 'Evenimente', 'Altele')),
    data_oportunitate DATE NOT NULL,
    locatie TEXT NOT NULL,
    contact_email TEXT,
    link_extern TEXT,
    imagine_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create applications table
CREATE TABLE public.applications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    oportunitate_id UUID NOT NULL,
    nume TEXT NOT NULL,
    prenume TEXT NOT NULL,
    email TEXT NOT NULL,
    link_social TEXT NOT NULL,
    mesaj TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Organizations can view their own data" 
ON public.organizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Organizations can update their own data" 
ON public.organizations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for opportunities
CREATE POLICY "Everyone can view opportunities" 
ON public.opportunities 
FOR SELECT 
USING (true);

CREATE POLICY "Organizations can create opportunities" 
ON public.opportunities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizations can update their own opportunities" 
ON public.opportunities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Organizations can delete their own opportunities" 
ON public.opportunities 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for applications
CREATE POLICY "Anyone can create applications" 
ON public.applications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Organizations can view applications for their opportunities" 
ON public.applications 
FOR SELECT 
USING (
    auth.uid() IN (
        SELECT user_id FROM public.opportunities 
        WHERE id = applications.oportunitate_id
    )
);

-- Add foreign key constraints
ALTER TABLE public.opportunities 
ADD CONSTRAINT fk_opportunities_user_id 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.applications 
ADD CONSTRAINT fk_applications_oportunitate_id 
FOREIGN KEY (oportunitate_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic organization profile creation
CREATE TRIGGER on_auth_user_created_organization
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organization_user();