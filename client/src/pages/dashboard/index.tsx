import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  GraduationCap,
  Stethoscope,
  CheckCircle2,
  Clock,
  AlertCircle,
  Shield,
} from "lucide-react";
import type { UserProfile } from "@shared/schema";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

const baseMenuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: User, label: "My Profile", path: "/dashboard/profile" },
  { icon: FileText, label: "Documents", path: "/dashboard/documents" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const adminMenuItem = { icon: Shield, label: "Admin Panel", path: "/admin" };

function calculateProgress(profile: UserProfile | null): number {
  if (!profile) return 10;
  let progress = 20;
  if (profile.fullName) progress += 10;
  if (profile.dateOfBirth) progress += 10;
  if (profile.gender) progress += 10;
  if (profile.nationality) progress += 10;
  if (profile.address) progress += 10;
  if (profile.phoneNumber) progress += 10;
  if (profile.isProfileComplete) progress += 20;
  return Math.min(progress, 100);
}

function getStatusBadge(status: string) {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Approved</Badge>;
    case "in_review":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">In Review</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "resubmission_required":
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Resubmission Required</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: adminCheck } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    enabled: !!user,
  });

  const isAdmin = adminCheck?.isAdmin ?? false;
  const menuItems = isAdmin ? [...baseMenuItems, adminMenuItem] : baseMenuItems;

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, authLoading, toast]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const progress = calculateProgress(profile || null);
  const showProfileBanner = !profile || !profile.isProfileComplete;

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="ConsultAfrique" className="h-10 w-auto" />
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        onClick={() => setLocation(item.path)}
                        isActive={location === item.path}
                        data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-4">
              <SidebarGroupLabel>Application Progress</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-2 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Completion</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>
                  {user.firstName?.[0] || user.email?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => logout()} data-testid="button-logout">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="w-5 h-5" />
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 p-6 overflow-auto">
            {showProfileBanner && (
              <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please complete your profile and upload required documents to proceed with your application.
                  </p>
                </div>
                <Button size="sm" onClick={() => setLocation("/dashboard/profile")} data-testid="button-complete-profile">
                  Complete Profile
                </Button>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card rounded-xl p-6 border border-card-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Application Status</h3>
                  {getStatusBadge(profile?.applicationStatus || "pending")}
                </div>
                <div className="flex items-center gap-3">
                  {profile?.userType === "student" ? (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-primary" />
                    </div>
                  ) : profile?.userType === "patient" ? (
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-accent" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium capitalize">{profile?.userType || "Not Set"}</p>
                    <p className="text-sm text-muted-foreground">Application Type</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 border border-card-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Profile Completion</h3>
                  <span className="text-2xl font-bold text-primary">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {progress < 100 
                    ? "Complete your profile to proceed with the application"
                    : "Your profile is complete!"
                  }
                </p>
              </div>

              <div className="bg-card rounded-xl p-6 border border-card-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Documents</h3>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard/documents")} data-testid="button-view-documents">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload required documents</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setLocation("/dashboard/profile")}
                  data-testid="button-edit-profile"
                >
                  <User className="w-5 h-5" />
                  <span>Edit Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setLocation("/dashboard/documents")}
                  data-testid="button-upload-docs"
                >
                  <FileText className="w-5 h-5" />
                  <span>Upload Documents</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  asChild
                >
                  <a 
                    href="https://wa.me/923114888878?text=Hello%20ConsultAfrique!%20I%20need%20assistance."
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="button-contact-support"
                  >
                    <Bell className="w-5 h-5" />
                    <span>Contact Support</span>
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2"
                  onClick={() => setLocation("/dashboard/settings")}
                  data-testid="button-settings"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
