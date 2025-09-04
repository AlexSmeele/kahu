import { useState } from "react";
import { User, Dog, Settings, CreditCard, Share, Download, HelpCircle, LogOut, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { useToast } from "@/hooks/use-toast";
import { DogProfileModal } from "@/components/dogs/DogProfileModal";
import type { Dog as DogType } from "@/hooks/useDogs";

const menuItems = [
  { icon: Settings, label: "Account Settings", action: "settings" },
  { icon: CreditCard, label: "Subscription", action: "billing", badge: "Pro" },
  { icon: Share, label: "Invite Family", action: "invite" },
  { icon: Download, label: "Export Data", action: "export" },
  { icon: HelpCircle, label: "Help & Support", action: "help" },
];

export function ProfileScreen() {
  const { signOut, user } = useAuth();
  const { dogs, loading: dogsLoading, deleteDog } = useDogs();
  const { toast } = useToast();
  const [dogModalOpen, setDogModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<DogType | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const handleAddDog = () => {
    setEditingDog(null);
    setModalMode('add');
    setDogModalOpen(true);
  };

  const handleEditDog = (dog: DogType) => {
    setEditingDog(dog);
    setModalMode('edit');
    setDogModalOpen(true);
  };

  const handleDeleteDog = async (dogId: string, dogName: string) => {
    const success = await deleteDog(dogId);
    if (success) {
      toast({
        title: 'Profile deleted',
        description: `${dogName}'s profile has been removed`,
      });
    }
  };
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
        <div className="pb-24">
          {/* User Profile Section */}
          <div className="p-4 border-b border-border">
...
          </div>

          {/* Sign Out */}
          <div className="p-4">
            <Button 
              variant="outline" 
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Dog Profile Modal */}
      <DogProfileModal
        isOpen={dogModalOpen}
        onClose={() => setDogModalOpen(false)}
        dog={editingDog}
        mode={modalMode}
      />
    </div>
  );
}