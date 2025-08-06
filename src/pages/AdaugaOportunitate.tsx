import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, Link, FileText, Tag, Loader2 } from "lucide-react";

export default function AdaugaOportunitate() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
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

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("opportunities")
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
          link_extern: formData.link_extern,
          location: formData.location || null,
          author_id: user.id,
          status: "active"
        });

      if (error) throw error;

      toast({
        title: "Succes!",
        description: "Oportunitatea a fost adăugată cu succes."
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error adding opportunity:", error);
      toast({
        title: "Eroare",
        description: "A apărut o eroare la adăugarea oportunității.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Adaugă Oportunitate
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
                  Adaugă Oportunitatea
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