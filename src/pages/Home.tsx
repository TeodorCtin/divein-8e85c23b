import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, ExternalLink, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  data_oportunitate: string;
  contact_email: string;
  link_extern: string;
  image_url: string;
  created_at: string;
}

export default function Home() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("toate");

  const categories = ["toate", "Educație", "ONG", "Stagii", "Evenimente", "Altele"];

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching opportunities:', error);
      } else {
        setOpportunities(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "toate" || opportunity.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DiveIn
            </h1>
            <p className="text-xl text-muted-foreground">
              Oportunități pentru tineri în Buzău și nu numai
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-20 bg-muted animate-pulse rounded" />
                    <div className="flex space-x-2">
                      <div className="h-6 bg-muted animate-pulse rounded w-16" />
                      <div className="h-6 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            DiveIn
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Platformă dedicată tinerilor din Buzău pentru descoperirea oportunităților de dezvoltare
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Caută oportunități..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-dark-surface border-border"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 bg-dark-surface border-border">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent className="bg-dark-surface border-border">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-foreground">
                    {category === "toate" ? "Toate categoriile" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opportunities Grid */}
        {filteredOpportunities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {opportunities.length === 0 
                ? "Nu există încă oportunități publicate." 
                : "Nu am găsit oportunități care să corespundă căutării tale."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="bg-gradient-card border-border hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
                <CardHeader className="space-y-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-foreground line-clamp-2">
                      {opportunity.title}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {opportunity.category}
                    </Badge>
                  </div>
                  
                  {opportunity.image_url && (
                    <div className="w-full h-32 rounded-lg overflow-hidden">
                      <img 
                        src={opportunity.image_url} 
                        alt={opportunity.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {opportunity.description}
                  </p>
                  
                  <div className="space-y-2">
                    {opportunity.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {opportunity.location}
                      </div>
                    )}
                    
                    {opportunity.data_oportunitate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(opportunity.data_oportunitate)}
                      </div>
                    )}
                  </div>
                  
                  <Link to={`/aplica/${opportunity.id}`}>
                    <Button className="w-full" variant="neon">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Aplică acum
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}