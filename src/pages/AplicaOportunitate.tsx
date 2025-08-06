import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Link, Loader2, ExternalLink } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  link_extern: string;
  author_id: string;
}

export default function AplicaOportunitate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    nume: "",
    prenume: "",
    email: "",
    link_social: ""
  });

  useEffect(() => {
    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id, title, description, link_extern, author_id")
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error) throw error;
      setOpportunity(data);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      toast({
        title: "Eroare",
        description: "Oportunitatea nu a fost găsită.",
        variant: "destructive"
      });
      navigate("/");
    } finally {
      setLoadingOpportunity(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opportunity) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("applications")
        .insert({
          opportunity_id: opportunity.id,
          applicant_id: crypto.randomUUID(), // Generate a random ID for non-authenticated users
          nume: formData.nume,
          prenume: formData.prenume,
          email: formData.email,
          link_social: formData.link_social || null,
          status: "pending"
        });

      if (error) throw error;

      setApplicationSubmitted(true);
      
      toast({
        title: "Succes!",
        description: "Aplicația ta a fost trimisă cu succes!"
      });

      // Redirect to external link after a short delay
      setTimeout(() => {
        window.open(opportunity.link_extern, "_blank");
        navigate("/");
      }, 2000);

    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la trimiterea aplicației.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (loadingOpportunity) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!opportunity) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Oportunitatea nu a fost găsită</h1>
          <Button onClick={() => navigate("/")} variant="neon">
            Înapoi la pagina principală
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Opportunity Info */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">
              {opportunity.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{opportunity.description}</p>
            {applicationSubmitted && (
              <Button variant="outline" size="sm" asChild>
                <a href={opportunity.link_extern} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Vezi detaliile complete
                </a>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Application Form */}
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Aplică la această oportunitate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nume" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nume *
                  </Label>
                  <Input
                    id="nume"
                    value={formData.nume}
                    onChange={handleChange("nume")}
                    placeholder="Nume de familie"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenume" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Prenume *
                  </Label>
                  <Input
                    id="prenume"
                    value={formData.prenume}
                    onChange={handleChange("prenume")}
                    placeholder="Prenume"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_social" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Link Social Media (opțional)
                </Label>
                <Input
                  id="link_social"
                  type="url"
                  value={formData.link_social}
                  onChange={handleChange("link_social")}
                  placeholder="https://linkedin.com/in/numele-tau"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                  variant="neon"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Trimite Aplicația
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  disabled={loading}
                >
                  Anulează
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}