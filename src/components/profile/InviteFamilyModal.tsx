import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Mail, Users, Shield, Eye, UserCheck, Trash2, AlertCircle, Loader2, Link, Plus, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFamilyManagement } from "@/hooks/useFamilyManagement";

interface InviteFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteFamilyModal: React.FC<InviteFamilyModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const {
    currentFamily,
    familyMembers,
    pendingInvitations,
    loading,
    userRole,
    sendInvitation,
    updateMemberRole,
    removeMember,
    generateShareLink
  } = useFamilyManagement();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);

  const handleInviteByEmail = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    if (userRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only family admins can send invitations",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      await sendInvitation(inviteEmail, inviteRole);
      setInviteEmail('');
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setIsInviting(false);
    }
  };

  const copyShareLink = () => {
    const shareLink = generateShareLink();
    if (!shareLink) {
      toast({
        title: "Error",
        description: "Unable to generate share link",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied!",
      description: "Family invite link copied to clipboard",
    });
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    if (userRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only family admins can change member roles",
        variant: "destructive",
      });
      return;
    }

    setUpdatingMember(memberId);
    try {
      await updateMemberRole(memberId, newRole);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (userRole !== 'admin') {
      toast({
        title: "Error",
        description: "Only family admins can remove members",
        variant: "destructive",
      });
      return;
    }

    setUpdatingMember(memberId);
    try {
      await removeMember(memberId);
    } catch (error) {
      // Error is already handled in the hook
    } finally {
      setUpdatingMember(null);
    }
  };

  const getRoleColor = (role: 'admin' | 'member' | 'viewer') => {
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

  const getRoleIcon = (role: 'admin' | 'member' | 'viewer') => {
    switch (role) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'member':
        return <UserCheck className="w-3 h-3" />;
      case 'viewer':
        return <Eye className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading family data...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentFamily) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="w-8 h-8 text-warning" />
            <span className="ml-2">No family found. Please create a family first.</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[min(95vw,900px)] max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Invite Family Members to {currentFamily.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Admin Controls */}
          {userRole === 'admin' && (
            <>
              {/* Invite by Email */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Invite by Email</h3>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                    disabled={isInviting}
                  />
                  <Select 
                    value={inviteRole} 
                    onValueChange={(value) => setInviteRole(value as 'admin' | 'member' | 'viewer')}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleInviteByEmail} 
                    disabled={!inviteEmail.trim() || isInviting}
                  >
                    {isInviting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Invite
                  </Button>
                </div>

                {/* Role Descriptions */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-destructive/5 rounded border">
                    <div className="font-medium text-destructive flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Admin
                    </div>
                    <div className="text-muted-foreground">Full access & management</div>
                  </div>
                  <div className="p-2 bg-primary/5 rounded border">
                    <div className="font-medium text-primary flex items-center gap-1">
                      <UserCheck className="w-3 h-3" />
                      Member
                    </div>
                    <div className="text-muted-foreground">Add records & view data</div>
                  </div>
                  <div className="p-2 bg-muted/5 rounded border">
                    <div className="font-medium text-muted-foreground flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Viewer
                    </div>
                    <div className="text-muted-foreground">View only access</div>
                  </div>
                </div>
              </div>

              {/* Share Link */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-primary" />
                  <h3 className="font-medium">Share Invite Link</h3>
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={generateShareLink()}
                    readOnly
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={copyShareLink}>
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can join your family. Share responsibly.
                </p>
              </div>
            </>
          )}

          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-warning" />
                Pending Invitations ({pendingInvitations.length})
              </h3>
              
              <div className="space-y-2">
                {pendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-3 bg-warning/5 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                        <Mail className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{invitation.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={`${getRoleColor(invitation.role)} text-xs`}>
                      {getRoleIcon(invitation.role)}
                      {invitation.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Family Members */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Family Members ({familyMembers.length})
            </h3>
            
            <div className="space-y-2">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {member.profiles?.display_name?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">
                        {member.profiles?.display_name || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Member since {new Date(member.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(member.status)} text-xs`}>
                      <Check className="w-3 h-3 mr-1" />
                      {member.status}
                    </Badge>
                    
                    {userRole === 'admin' ? (
                      <Select 
                        value={member.role} 
                        onValueChange={(value) => handleUpdateMemberRole(member.id, value as 'admin' | 'member' | 'viewer')}
                        disabled={updatingMember === member.id}
                      >
                        <SelectTrigger className="w-24 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`${getRoleColor(member.role)} text-xs`}>
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                    )}

                    {userRole === 'admin' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={updatingMember === member.id}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        {updatingMember === member.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {familyMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No family members yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Family Plan Benefits */}
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h4 className="font-medium text-primary mb-2">Family Sharing Benefits</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Share dog profiles with family members</li>
              <li>• Collaborative health tracking and meal planning</li>
              <li>• Real-time notifications for all family members</li>
              <li>• Centralized training progress and vet records</li>
              <li>• Role-based access control for privacy</li>
            </ul>
          </div>
        </div>

        <div className="pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFamilyModal;