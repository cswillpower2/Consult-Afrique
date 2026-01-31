import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Settings, 
  LogOut,
  ArrowLeft,
  Loader2,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  File,
  Trash2,
} from "lucide-react";
import type { UserProfile, Document } from "@shared/schema";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: User, label: "My Profile", path: "/dashboard/profile" },
  { icon: FileText, label: "Documents", path: "/dashboard/documents" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const studentDocuments = [
  { type: "passport", label: "International Passport Copy", description: "Min. 12 months validity", required: true },
  { type: "academic_primary", label: "Primary School Certificate", description: "Original certificate", required: true },
  { type: "academic_secondary", label: "Junior Secondary Certificate", description: "Original certificate", required: true },
  { type: "academic_waec", label: "WAEC/NECO Certificate", description: "Original results", required: true },
  { type: "sponsorship_bank", label: "Bank Statements", description: "Proof of sponsorship", required: false },
  { type: "sponsorship_affidavit", label: "Affidavit of Support", description: "Notarized document", required: false },
  { type: "medical_vaccination", label: "Yellow Fever Vaccination", description: "Required for Pakistan visa", required: true },
];

const patientDocuments = [
  { type: "passport", label: "International Passport Copy", description: "Valid passport", required: true },
  { type: "referral_letter", label: "Referral Letter", description: "From current physician", required: false },
  { type: "medical_reports", label: "Medical Reports & Diagnostics", description: "Lab reports, imaging, MRI/CT scans", required: true },
  { type: "prescriptions", label: "Current Prescriptions", description: "Medication list", required: false },
  { type: "emergency_contact", label: "Emergency Contact Passport", description: "Accompanying person's passport", required: true },
];

function getStatusIcon(status: string) {
  switch (status) {
    case "verified":
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Clock className="w-4 h-4 text-yellow-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Verified</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
}

export default function Documents() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    enabled: !!user,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", type);
      
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload document");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully.",
      });
      setUploading(null);
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
      setUploading(null);
    },
  });

  const handleFileChange = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(type);
      uploadMutation.mutate({ type, file });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/api/login";
    }
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const documentTypes = profile?.userType === "patient" ? patientDocuments : studentDocuments;

  const getUploadedDocument = (type: string) => {
    return documents.find((doc) => doc.documentType === type);
  };

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
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
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
              <Button variant="ghost" size="icon" onClick={() => logout()}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">Documents</h1>
            </div>
            <ThemeToggle />
          </header>

          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto">
              {!profile?.userType ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium text-lg mb-2">Complete Your Profile First</h3>
                    <p className="text-muted-foreground mb-4">
                      Please complete your profile and select whether you're a student or patient to see required documents.
                    </p>
                    <Button onClick={() => setLocation("/dashboard/profile")} data-testid="button-go-to-profile">
                      Complete Profile
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Required Documents</CardTitle>
                    <CardDescription>
                      Upload the required documents for your {profile.userType} application. 
                      Documents marked as required must be uploaded before your application can be processed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {documentsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {documentTypes.map((docType) => {
                          const uploadedDoc = getUploadedDocument(docType.type);
                          const isUploading = uploading === docType.type;

                          return (
                            <div
                              key={docType.type}
                              className="flex items-start gap-4 p-4 border rounded-lg"
                            >
                              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                {uploadedDoc ? (
                                  getStatusIcon(uploadedDoc.status)
                                ) : (
                                  <File className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium">{docType.label}</h4>
                                  {docType.required && (
                                    <Badge variant="outline" className="text-xs">Required</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{docType.description}</p>
                                {uploadedDoc && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-sm text-muted-foreground truncate">
                                      {uploadedDoc.fileName}
                                    </span>
                                    {getStatusBadge(uploadedDoc.status)}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0">
                                {isUploading ? (
                                  <Button variant="outline" size="sm" disabled>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                  </Button>
                                ) : (
                                  <label>
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                      onChange={(e) => handleFileChange(docType.type, e)}
                                      data-testid={`input-upload-${docType.type}`}
                                    />
                                    <Button
                                      variant={uploadedDoc ? "outline" : "default"}
                                      size="sm"
                                      asChild
                                    >
                                      <span className="cursor-pointer">
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploadedDoc ? "Replace" : "Upload"}
                                      </span>
                                    </Button>
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
