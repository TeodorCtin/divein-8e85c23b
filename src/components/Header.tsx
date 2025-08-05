import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { LogOut, Plus, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card shadow-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              DiveIn
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Acasă
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
          ) : user ? (
            <div className="flex items-center space-x-2">
              <Link to="/dashboard">
                <Button variant="dark" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link to="/adauga">
                <Button variant="neon" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Oportunitate
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Conectare
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button variant="neon" size="sm">
                  Înregistrare
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}