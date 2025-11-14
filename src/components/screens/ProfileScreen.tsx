import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Dog, Settings, CreditCard, Share, Download, HelpCircle, LogOut, Plus, Edit, Trash2, Package, MessageSquare, ChevronUp, ChevronDown, Stethoscope, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/headers/PageHeader";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationsDrawer } from "@/components/notifications/NotificationsDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { useDogs, calculateAge } from "@/hooks/useDogs";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { DogProfileModal } from "@/components/dogs/DogProfileModal";
import { OrderHistoryModal } from "@/components/marketplace/OrderHistoryModal";
import { UserEditModal } from "@/components/profile/UserEditModal";
import InviteFamilyModal from "@/components/profile/InviteFamilyModal";
import { BillingModal } from "@/components/profile/BillingModal";
import { ExportDataModal } from "@/components/profile/ExportDataModal";
import { FeedbackModal } from "@/components/profile/FeedbackModal";
import { NotificationPreferencesModal } from "@/components/profile/NotificationPreferencesModal";
import type { Dog as DogType } from "@/hooks/useDogs";

const menuItems = [
  { icon: Settings, label: "Account Settings", action: "settings" },
  { icon: Bell, label: "Notification Settings", action: "notifications" },
  { icon: Stethoscope, label: "Veterinary Clinics", action: "vet-clinics" },
  { icon: CreditCard, label: "Billing & Payments", action: "billing" },
  { icon: Package, label: "Order History", action: "orders" },
  { icon: Share, label: "Invite Family", action: "invite" },
  { icon: Download, label: "Export Data", action: "export" },
  { icon: MessageSquare, label: "Send Feedback", action: "feedback" },
  { icon: HelpCircle, label: "Help & Support", action: "help" },
];

export function ProfileScreen() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { dogs, loading: dogsLoading, deleteDog, reorderDogs } = useDogs();
  const { profile, refetch: refetchProfile } = useProfile();
  const { toast } = useToast();
  const [dogModalOpen, setDogModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<DogType | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [isInviteFamilyOpen, setIsInviteFamilyOpen] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

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

  const handleReorder = (items: Array<{ id: string; name: string; price: number; quantity: number; imageUrl: string; supplier: string; }>) => {
    toast({
      title: "Items added to cart",
      description: `${items.length} items from your previous order have been added to cart. Go to Marketplace to checkout.`,
    });
  };

  const moveDogUp = async (index: number) => {
    if (index === 0) return;
    
    const newOrder = [...dogs];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    
    await reorderDogs(newOrder);
  };

  const moveDogDown = async (index: number) => {
    if (index === dogs.length - 1) return;
    
    const newOrder = [...dogs];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    await reorderDogs(newOrder);
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case "orders":
        setIsOrderHistoryOpen(true);
        break;
      case "vet-clinics":
        navigate('/services');
        break;
      case "notifications":
        setIsNotificationsOpen(true);
        break;
      case "billing":
        setIsBillingOpen(true);
        break;
      case "settings":
        navigate('/account-settings');
        break;
      case "invite":
        setIsInviteFamilyOpen(true);
        break;
      case "export":
        setIsExportDataOpen(true);
        break;
      case "feedback":
        setIsFeedbackOpen(true);
        break;
      default:
        console.log(action);
    }
  };
  return (
    <div className="flex flex-col h-full relative">
      <PageHeader
        title="Profile"
        actions={
          <>
            <NotificationsDrawer />
            <ThemeToggle />
          </>
        }
      />

      <div className="flex-1 overflow-y-auto pt-2">
          {/* User Profile Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={profile?.avatar_url ? `${profile.avatar_url}?t=${Date.now()}` : undefined} 
                  alt="Profile" 
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {profile?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge variant="outline" className="mt-1 text-primary border-primary/30">
                  Pro Member
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsUserEditOpen(true)}
              >
                Edit
              </Button>
            </div>
          </div>

          {/* Dogs Section */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Your Dogs</h3>
              <div className="flex gap-2">
                {dogs.length > 1 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsReordering(!isReordering)}
                  >
                    {isReordering ? 'Done' : 'Reorder'}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleAddDog}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Dog
                </Button>
              </div>
            </div>
            
            {dogsLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="card-soft p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-20 mb-1"></div>
                        <div className="h-3 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dogs.length === 0 ? (
              <div className="card-soft p-6 text-center">
                <Dog className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground mb-3">No dogs added yet</p>
                <Button onClick={handleAddDog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Dog
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {dogs.map((dog, index) => (
                  <div key={dog.id} className={`card-soft p-4 ${isReordering ? 'ring-2 ring-primary/20' : ''}`}>
                    <div className="flex items-center gap-3">
                      {isReordering && dogs.length > 1 && (
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDogUp(index)}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveDogDown(index)}
                            disabled={index === dogs.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={dog.avatar_url} alt={dog.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {dog.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{dog.name}</h4>
                        {dog.breed?.breed && (
                          <p className="text-sm text-muted-foreground">
                            {dog.breed.breed}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {[
                            dog.birthday && calculateAge(dog.birthday),
                            dog.weight && `${dog.weight}kg`
                          ].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      {!isReordering && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditDog(dog)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {dog.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {dog.name}'s profile and all associated training data. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteDog(dog.id, dog.name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                 <button
                  key={item.action}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary transition-colors text-left"
                  onClick={() => handleMenuClick(item.action)}
                >
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-foreground">{item.label}</span>
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

      {/* Dog Profile Modal */}
      <DogProfileModal
        isOpen={dogModalOpen}
        onClose={() => setDogModalOpen(false)}
        dog={editingDog}
        mode={modalMode}
      />

      {/* All Profile Modals */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onReorder={handleReorder}
      />
      
      <UserEditModal
        isOpen={isUserEditOpen}
        onClose={() => {
          setIsUserEditOpen(false);
          // Refresh profile data when closing the edit modal to ensure consistency
          refetchProfile();
        }}
      />
      
      <InviteFamilyModal
        isOpen={isInviteFamilyOpen}
        onClose={() => setIsInviteFamilyOpen(false)}
      />
      
      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
      />
      
      <ExportDataModal
        isOpen={isExportDataOpen}
        onClose={() => setIsExportDataOpen(false)}
      />
      
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />

      <NotificationPreferencesModal
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />
    </div>
  );
}