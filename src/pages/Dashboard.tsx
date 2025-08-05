import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Eye, Calendar, MapPin, Users, AlertCircle } from "lucide-react";

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
  status: string;
}

interface Application {
  id: string;
  nume: string;
  prenume: string;
  email: string;
  link_social: string;
  mesaj: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<{ [key: string]: Application[] }>({});
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch organization info
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      setOrganization(orgData);

      // Fetch opportunities
      const { data: oppsData, error: oppsError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('author_id', user?.id)
        .order('created_at', { ascending: false });

      if (oppsError) {
        console.error('Error fetching opportunities:', oppsError);
        toast.error('Eroare la încărcarea oportunităților');
      } else {
        setOpportunities(oppsData || []);
        
        // Fetch applications for each opportunity
        if (oppsData && oppsData.length > 0) {
          const opportunityIds = oppsData.map(opp => opp.id);
          const { data: appsData, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .in('opportunity_id', opportunityIds)
            .order('created_at', { ascending: false });

          if (appsError) {
            console.error('Error fetching applications:', appsError);
          } else {
            // Group applications by opportunity ID
            const appsByOpportunity: { [key: string]: Application[] } = {};
            appsData?.forEach(app => {
              if (!appsByOpportunity[app.opportunity_id]) {
                appsByOpportunity[app.opportunity_id] = [];
              }
              appsByOpportunity[app.opportunity_id].push(app);
            });
            setApplications(appsByOpportunity);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Eroare la încărcarea datelor');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această oportunitate?')) return;

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Eroare la ștergerea oportunității');
      } else {
        toast.success('Oportunitatea a fost ștearsă cu succes');
        setOpportunities(opportunities.filter(opp => opp.id !== id));
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Eroare neașteptată');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-muted animate-pulse rounded w-48" />
            <div className="h-10 bg-muted animate-pulse rounded w-36" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted animate-pulse rounded" />
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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            {organization && (
              <p className="text-muted-foreground">
                Bine ai venit, {organization.nume_organizatie}!
              </p>
            )}
          </div>
          
          <Link to="/adauga">
            <Button variant="neon" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Adaugă Oportunitate
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Oportunități Active</p>
                  <p className="text-2xl font-bold text-primary">
                    {opportunities.filter(opp => opp.status === 'active').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Oportunități</p>
                  <p className="text-2xl font-bold text-primary">{opportunities.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Aplicații</p>
                  <p className="text-2xl font-bold text-primary">
                    {Object.values(applications).flat().length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">
            Oportunitățile tale
          </h2>
          
          {opportunities.length === 0 ? (
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nu ai încă oportunități</h3>
                <p className="text-muted-foreground mb-4">
                  Începe să postezi oportunități pentru tineri din comunitate.
                </p>
                <Link to="/adauga">
                  <Button variant="neon">
                    <Plus className="w-4 h-4 mr-2" />
                    Adaugă prima oportunitate
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.id} className="bg-gradient-card border-border">
                  <CardHeader className="space-y-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {opportunity.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={opportunity.status === 'active' ? 'default' : 'secondary'}
                          className={opportunity.status === 'active' ? 'bg-primary/10 text-primary border-primary/20' : ''}
                        >
                          {opportunity.status === 'active' ? 'Activă' : 'Inactivă'}
                        </Badge>
                        <Badge variant="outline" className="border-border">
                          {opportunity.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm line-clamp-2">
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
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {applications[opportunity.id]?.length || 0} aplicații
                      </div>
                    </div>

                    {/* Applications Preview */}
                    {applications[opportunity.id] && applications[opportunity.id].length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-foreground">Aplicații recente:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {applications[opportunity.id].slice(0, 3).map((app) => (
                            <div key={app.id} className="text-xs p-2 bg-dark-surface rounded border border-border">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{app.nume} {app.prenume}</span>
                                <span className="text-muted-foreground">{formatDate(app.created_at)}</span>
                              </div>
                              <div className="text-muted-foreground">{app.email}</div>
                            </div>
                          ))}
                          {applications[opportunity.id].length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{applications[opportunity.id].length - 3} aplicații în plus
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/editeaza/${opportunity.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editează
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteOpportunity(opportunity.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Șterge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}