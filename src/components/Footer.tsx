import { Mail, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              DiveIn
            </div>
            <span className="text-muted-foreground">- Oportunități pentru tineri</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="mailto:diveinbuzau@gmail.com"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">diveinbuzau@gmail.com</span>
            </a>
            
            <a 
              href="https://instagram.com/diveinbuzau"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-sm">@diveinbuzau</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 DiveIn. Toate drepturile rezervate.
        </div>
      </div>
    </footer>
  );
}