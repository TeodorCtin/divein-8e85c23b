import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Mail, Lock, Building, AlertCircle } from "lucide-react";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [numeOrganizatie, setNumeOrganizatie] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Parolele nu coincid');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Parola trebuie să aibă cel puțin 6 caractere');
          setLoading(false);
          return;
        }

        if (!numeOrganizatie.trim()) {
          setError('Numele organizației este obligatoriu');
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/dashboard`;
        
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              nume_organizatie: numeOrganizatie.trim()
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('Această adresă de email este deja înregistrată');
          } else {
            setError(signUpError.message);
          }
        } else {
          toast.success('Cont creat cu succes! Te poți conecta acum.');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
          setNumeOrganizatie('');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Email sau parolă incorectă');
          } else {
            setError(signInError.message);
          }
        } else {
          toast.success('Conectare reușită!');
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      setError('A apărut o eroare neașteptată');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Introdu adresa de email pentru resetarea parolei');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setResetEmailSent(true);
        toast.success('Email de resetare trimis! Verifică-ți inbox-ul.');
      }
    } catch (error: any) {
      setError('A apărut o eroare la trimiterea emailului');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md bg-gradient-card border-border">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
              {mode === 'signup' ? 'Înregistrare Organizație' : 'Conectare'}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {mode === 'signup' 
                ? 'Creează un cont pentru organizația ta' 
                : 'Conectează-te pentru a gestiona oportunitățile'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resetEmailSent && (
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Am trimis un email cu instrucțiunile de resetare a parolei.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@organizatia.ro"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-dark-surface border-border"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="organizatie">Numele Organizației</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="organizatie"
                      type="text"
                      placeholder="Numele organizației tale"
                      value={numeOrganizatie}
                      onChange={(e) => setNumeOrganizatie(e.target.value)}
                      className="pl-10 bg-dark-surface border-border"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Parola</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-dark-surface border-border"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmă Parola</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-dark-surface border-border"
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                variant="neon"
                disabled={loading}
              >
                {loading ? 'Se procesează...' : mode === 'signup' ? 'Înregistrează-te' : 'Conectează-te'}
              </Button>
            </form>

            <div className="space-y-4">
              {mode === 'login' && (
                <Button 
                  variant="ghost" 
                  className="w-full text-sm text-muted-foreground"
                  onClick={handleResetPassword}
                  disabled={loading}
                >
                  Am uitat parola
                </Button>
              )}

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError('');
                    setResetEmailSent(false);
                  }}
                  className="text-sm text-primary hover:text-primary/80 underline"
                >
                  {mode === 'login' 
                    ? 'Nu ai cont? Înregistrează-te aici' 
                    : 'Ai deja cont? Conectează-te aici'
                  }
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}