import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, Link, FileText, Tag, Loader2, Edit } from "lucide-react";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  expires_at: string | null;
  link_extern: string;
  location: string | null;
  author_id: string;
}

export default function EditeazaOportunitate() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    expires_at: "",
    link_extern: "",
    location: ""
  });

  // Redirect if not authenticated
  if (!authLoading && !user) {
    navigate("/auth");
    return null;
  }

  useEffect(() => {
    if (id && user) {
      fetchOpportunity();
    }
  }, [id, user]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .eq("author_id", user!.id)
        .single();

      if (error) throw error;
      
      setOpportunity(data);
      setFormData({
        title: data.title,
        description: data.description,
        category: data.category,
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString().slice(0, 16) : "",
        link_extern: data.link_extern,
        location: data.location || ""
      });
    } catch (error) {
      console.error("Error fetching opportunity:", error);
      toast({
        title: "Eroare",
        description: "Nu ai permisiunea să editezi această oportunitate sau ea nu există.",
        variant: "destructive"
      });
      navigate("/dashboard");
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
        .from("opportunities")
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
          link_extern: formData.link_extern,
          location: formData.location || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", opportunity.id)
        .eq("author_id", user!.id);

      if (error) throw error;

      toast({
        title: "Succes!",
        description: "Oportunitatea a fost actualizată cu succes."
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating opportunity:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la actualizarea oportunității.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (authLoading || loadingOpportunity) {
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
          <Button onClick={() => navigate("/dashboard")} variant="neon">
            Înapoi la Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="w-6 h-6 text-primary" />
              Editează Oportunitatea
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Titlu *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleChange("title")}
                  placeholder="Ex: Internship în Marketing Digital"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descriere *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange("description")}
                  placeholder="Descrie oportunitatea în detaliu..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Categorie *
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={handleChange("category")}
                  placeholder="Ex: Marketing, IT, Educație"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Deadline
                </Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={handleChange("expires_at")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_extern" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Link extern *
                </Label>
                <Input
                  id="link_extern"
                  type="url"
                  value={formData.link_extern}
                  onChange={handleChange("link_extern")}
                  placeholder="https://example.com/apply"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Locație (opțional)
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={handleChange("location")}
                  placeholder="Ex: București, Remote, Hibrid"
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
                  Salvează Modificările
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
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