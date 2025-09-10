import { useState } from "react";
import { Share, Plus, Mail, Link, Copy, X, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
}

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data
const mockFamilyMembers: FamilyMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    role: "admin",
    status: "active",
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike.j@email.com", 
    role: "member",
    status: "active",
  },
  {
    id: "3",
    name: "Emma Johnson",
    email: "emma.j@email.com",
    role: "viewer",
    status: "pending",
  },
];

export function InviteFamilyModal({ isOpen, onClose }: InviteFamilyModalProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(mockFamilyMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<FamilyMember['role']>("member");
  const [shareLink] = useState("https://dogapp.com/invite/abc123xyz");
  const { toast } = useToast();

  const handleInviteByEmail = () => {
    if (!inviteEmail) return;
    
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
    };

    setFamilyMembers(prev => [...prev, newMember]);
    setInviteEmail("");
    
    toast({
      title: "Invitation sent!",
      description: `Invite sent to ${inviteEmail}`,
    });
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard",
    });
  };

  const updateMemberRole = (memberId: string, newRole: FamilyMember['role']) => {
    setFamilyMembers(prev => prev.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    ));
  };

  const removeMember = (memberId: string) => {
    setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const getRoleColor = (role: FamilyMember['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/10 text-destructive';
      case 'member':
        return 'bg-primary/10 text-primary';
      case 'viewer':
        return 'bg-muted/10 text-muted-foreground';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusColor = (status: FamilyMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'inactive':
        return 'bg-muted/10 text-muted-foreground';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,800px)] h-[min(90vh,600px)] max-h-[min(90vh,600px)] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Invite Family Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite by Email */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Invite by Email</h3>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as FamilyMember['role'])}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInviteByEmail} disabled={!inviteEmail}>
                <Plus className="w-4 h-4 mr-1" />
                Invite
              </Button>
            </div>

            {/* Role Descriptions */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-destructive/5 rounded border">
                <div className="font-medium text-destructive">Admin</div>
                <div className="text-muted-foreground">Full access & management</div>
              </div>
              <div className="p-2 bg-primary/5 rounded border">
                <div className="font-medium text-primary">Member</div>
                <div className="text-muted-foreground">Add records & view data</div>
              </div>
              <div className="p-2 bg-muted/5 rounded border">
                <div className="font-medium text-muted-foreground">Viewer</div>
                <div className="text-muted-foreground">View only access</div>
              </div>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-primary" />
              <h3 className="font-medium">Share Invite Link</h3>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
              />
              <Button variant="outline" onClick={copyShareLink}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join as a Viewer. Admins can change roles later.
            </p>
          </div>

          {/* Current Family Members */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Family Members ({familyMembers.length})
            </h3>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="text-xs">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-muted-foreground">{member.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(member.status)} text-xs border`}>
                      {member.status === 'active' && <Check className="w-3 h-3 mr-1" />}
                      {member.status}
                    </Badge>
                    
                    <Select 
                      value={member.role} 
                      onValueChange={(value) => updateMemberRole(member.id, value as FamilyMember['role'])}
                    >
                      <SelectTrigger className="w-20 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>

                    {member.status !== 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {familyMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No family members added yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Family Plan Benefits */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-2">Family Plan Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Share dog profiles with up to 10 family members</li>
              <li>• Collaborative health tracking and meal planning</li>
              <li>• Real-time notifications for all family members</li>
              <li>• Centralized training progress and vet records</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}