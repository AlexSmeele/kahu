import { User, Dog, Settings, CreditCard, Share, Download, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-image.jpg";

const menuItems = [
  { icon: Settings, label: "Account Settings", action: "settings" },
  { icon: CreditCard, label: "Subscription", action: "billing", badge: "Pro" },
  { icon: Share, label: "Invite Family", action: "invite" },
  { icon: Download, label: "Export Data", action: "export" },
  { icon: HelpCircle, label: "Help & Support", action: "help" },
];

export function ProfileScreen() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="safe-top p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-hover rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Account & settings</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* User Profile Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder-user.jpg" alt="Alex" />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                AK
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">Alex Kim</h2>
              <p className="text-muted-foreground">alex@example.com</p>
              <Badge variant="outline" className="mt-1 text-primary border-primary/30">
                Pro Member
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </div>

        {/* Dogs Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Your Dogs</h3>
            <Button variant="outline" size="sm">
              Add Dog
            </Button>
          </div>
          
          <div className="card-soft p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                <img 
                  src={heroImage} 
                  alt="Kira" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Kira</h4>
                <p className="text-sm text-muted-foreground">Shiba Inu • 2 years old • 12.4kg</p>
              </div>
              <Dog className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-foreground">{item.label}</span>
                {item.badge && (
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="p-4 border-t border-border">
          <h3 className="font-semibold text-foreground mb-3">Your Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="card-soft p-3">
              <div className="text-lg font-bold text-primary">7</div>
              <div className="text-xs text-muted-foreground">Days Active</div>
            </div>
            <div className="card-soft p-3">
              <div className="text-lg font-bold text-accent">12</div>
              <div className="text-xs text-muted-foreground">AI Chats</div>
            </div>
            <div className="card-soft p-3">
              <div className="text-lg font-bold text-success">3</div>
              <div className="text-xs text-muted-foreground">Tricks Learned</div>
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-4 pb-20">
          <Button 
            variant="outline" 
            className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}