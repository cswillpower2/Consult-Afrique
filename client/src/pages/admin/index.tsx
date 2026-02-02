import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, FileText, Mail, ArrowLeft, CheckCircle, XCircle, 
  Clock, Eye, RefreshCw, ChevronDown, User, Phone, Calendar,
  FileCheck, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

type ApplicationStatus = "pending" | "in_review" | "approved" | "rejected" | "resubmission_required";
type DocumentStatus = "pending" | "verified" | "rejected";

interface UserProfile {
  id: number;
  userId: string;
  userType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  applicationStatus: ApplicationStatus;
  createdAt: string;
}

interface Document {
  id: number;
  userId: string;
  documentType: string;
  originalName: string;
  status: DocumentStatus;
  uploadedAt: string;
}

interface ContactInquiry {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  in_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  resubmission_required: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const docStatusColors: Record<DocumentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  verified: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/api/login";
    }
  }, [authLoading, user]);

  const { data: profiles = [], isLoading: profilesLoading, refetch: refetchProfiles } = useQuery<UserProfile[]>({
    queryKey: ["/api/admin/profiles"],
    enabled: !!user,
  });

  const { data: inquiries = [], isLoading: inquiriesLoading, refetch: refetchInquiries } = useQuery<ContactInquiry[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: !!user,
  });

  const { data: userDocuments = [], isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/admin/documents", selectedUserId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/documents?userId=${selectedUserId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: ApplicationStatus }) => {
      return apiRequest("PATCH", `/api/admin/profiles/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profiles"] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  const updateDocStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: DocumentStatus }) => {
      return apiRequest("PATCH", `/api/admin/documents/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/documents", selectedUserId] });
      toast({ title: "Document status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update document status", variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirecting to login...</span>
      </div>
    );
  }

  const pendingCount = profiles.filter(p => p.applicationStatus === "pending").length;
  const inReviewCount = profiles.filter(p => p.applicationStatus === "in_review").length;
  const approvedCount = profiles.filter(p => p.applicationStatus === "approved").length;

  const viewDocuments = (userId: string) => {
    setSelectedUserId(userId);
    setDocumentsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2" data-testid="link-home">
              <img src={logoImg} alt="ConsultAfrique Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-primary">ConsultAfrique</span>
            </Link>
            <Badge variant="outline" className="ml-2">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" data-testid="button-user-dashboard">
                <User className="mr-2 h-4 w-4" />
                User Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage applications, documents, and inquiries</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card data-testid="stat-total">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-pending">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-in-review">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Review</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inReviewCount}</div>
            </CardContent>
          </Card>
          <Card data-testid="stat-approved">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList data-testid="admin-tabs">
            <TabsTrigger value="applications" data-testid="tab-applications">
              <Users className="mr-2 h-4 w-4" />
              Applications ({profiles.length})
            </TabsTrigger>
            <TabsTrigger value="inquiries" data-testid="tab-inquiries">
              <Mail className="mr-2 h-4 w-4" />
              Inquiries ({inquiries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Applications</CardTitle>
                  <CardDescription>Review and manage student/patient applications</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchProfiles()} data-testid="button-refresh-profiles">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {profilesLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No applications yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id} data-testid={`row-profile-${profile.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{profile.firstName} {profile.lastName}</div>
                              <div className="text-sm text-muted-foreground">{profile.nationality || "Not specified"}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {profile.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{profile.email}</div>
                              {profile.phone && (
                                <div className="text-muted-foreground">{profile.phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[profile.applicationStatus]}>
                              {profile.applicationStatus.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Select
                                value={profile.applicationStatus}
                                onValueChange={(value) =>
                                  updateStatusMutation.mutate({ id: profile.id, status: value as ApplicationStatus })
                                }
                              >
                                <SelectTrigger className="w-[140px]" data-testid={`select-status-${profile.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_review">In Review</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="resubmission_required">Resubmission Required</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewDocuments(profile.userId)}
                                data-testid={`button-view-docs-${profile.id}`}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contact Inquiries</CardTitle>
                  <CardDescription>Messages from the contact form</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchInquiries()} data-testid="button-refresh-inquiries">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent>
                {inquiriesLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No inquiries yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <Card key={inquiry.id} className="bg-muted/30" data-testid={`card-inquiry-${inquiry.id}`}>
                        <CardContent className="pt-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold">{inquiry.name}</span>
                                <Badge variant="outline">{inquiry.subject}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{inquiry.message}</p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {inquiry.email}
                                </div>
                                {inquiry.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {inquiry.phone}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(inquiry.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={documentsDialogOpen} onOpenChange={setDocumentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              User Documents
            </DialogTitle>
            <DialogDescription>
              Review and verify uploaded documents
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {documentsLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : userDocuments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No documents uploaded</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userDocuments.map((doc) => (
                    <TableRow key={doc.id} data-testid={`row-doc-${doc.id}`}>
                      <TableCell>
                        <div className="font-medium">{doc.originalName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {doc.documentType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={docStatusColors[doc.status]}>
                          {doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={doc.status}
                          onValueChange={(value) =>
                            updateDocStatusMutation.mutate({ id: doc.id, status: value as DocumentStatus })
                          }
                        >
                          <SelectTrigger className="w-[120px]" data-testid={`select-doc-status-${doc.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
