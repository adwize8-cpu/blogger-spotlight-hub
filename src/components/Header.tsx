import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-foreground">★</span>
            </div>
          </div>
          <span className="text-xl font-bold text-foreground">zorki.pro</span>
        </div>
        
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <User className="w-4 h-4 mr-2" />
          Вход для блогеров
        </Button>
      </div>
    </header>
  );
};