import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Users, FileText, Mail, ArrowLeft, CheckCircle, XCircle, 
  Clock, Eye, RefreshCw, ChevronDown, User, Phone, Calendar,
  FileCheck, AlertCircle, Newspaper, Plus, Pencil, Trash2,
  Upload, X
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  images: string[] | null;
  isPublished: boolean;
  publishedAt: string | null;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
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
  const [newsDialogOpen, setNewsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [newsForm, setNewsForm] = useState({ title: "", summary: "", content: "", isPublished: false });
  const [newsImageFiles, setNewsImageFiles] = useState<File[]>([]);
  const [newsImagePreviews, setNewsImagePreviews] = useState<{ src: string; isExisting: boolean; path?: string }[]>([]);

  // Check if user is admin
  const { data: adminCheck, isLoading: adminCheckLoading } = useQuery<{ isAdmin: boolean }>({
    queryKey: ["/api/admin/check"],
    enabled: !!user,
  });

  const isAdmin = adminCheck?.isAdmin ?? false;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [authLoading, user]);

  const { data: profiles = [], isLoading: profilesLoading, refetch: refetchProfiles } = useQuery<UserProfile[]>({
    queryKey: ["/api/admin/profiles"],
    enabled: !!user && isAdmin,
  });

  const { data: inquiries = [], isLoading: inquiriesLoading, refetch: refetchInquiries } = useQuery<ContactInquiry[]>({
    queryKey: ["/api/admin/inquiries"],
    enabled: !!user && isAdmin,
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

  const { data: newsArticles = [], isLoading: newsLoading, refetch: refetchNews } = useQuery<NewsArticle[]>({
    queryKey: ["/api/admin/news"],
    enabled: !!user && isAdmin,
  });

  const createNewsMutation = useMutation({
    mutationFn: async ({ data, imageFiles }: { data: typeof newsForm; imageFiles: File[] }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("summary", data.summary);
      formData.append("content", data.content);
      formData.append("isPublished", String(data.isPublished));
      imageFiles.forEach((file) => formData.append("images", file));
      const res = await fetch("/api/admin/news", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Failed to create article");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setNewsDialogOpen(false);
      resetNewsForm();
      toast({ title: "Article created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create article", variant: "destructive" });
    },
  });

  const updateNewsMutation = useMutation({
    mutationFn: async ({ id, data, imageFiles, existingImages }: { id: string; data: typeof newsForm; imageFiles: File[]; existingImages: string[] }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("summary", data.summary);
      formData.append("content", data.content);
      formData.append("isPublished", String(data.isPublished));
      formData.append("existingImages", JSON.stringify(existingImages));
      imageFiles.forEach((file) => formData.append("images", file));
      const res = await fetch(`/api/admin/news/${id}`, { method: "PATCH", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("Failed to update article");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      setNewsDialogOpen(false);
      setEditingArticle(null);
      resetNewsForm();
      toast({ title: "Article updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update article", variant: "destructive" });
    },
  });

  const deleteNewsMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/news/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Article deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete article", variant: "destructive" });
    },
  });

  const resetNewsForm = () => {
    setNewsForm({ title: "", summary: "", content: "", isPublished: false });
    setNewsImageFiles([]);
    setNewsImagePreviews([]);
  };

  const openNewArticle = () => {
    setEditingArticle(null);
    resetNewsForm();
    setNewsDialogOpen(true);
  };

  const openEditArticle = (article: NewsArticle) => {
    setEditingArticle(article);
    setNewsForm({
      title: article.title,
      summary: article.summary,
      content: article.content,
      isPublished: article.isPublished,
    });
    setNewsImageFiles([]);
    const existingPreviews = (article.images || []).map((img: string) => ({
      src: img,
      isExisting: true,
      path: img,
    }));
    if (existingPreviews.length === 0 && article.imageUrl) {
      existingPreviews.push({ src: article.imageUrl, isExisting: true, path: article.imageUrl });
    }
    setNewsImagePreviews(existingPreviews);
    setNewsDialogOpen(true);
  };

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 10 - newsImagePreviews.length;
    if (remaining <= 0) return;
    if (files.length > remaining) {
      files = files.slice(0, remaining);
      toast({ title: `Only ${remaining} more image(s) can be added (max 10)` });
    }
    const newFiles = [...newsImageFiles, ...files];
    setNewsImageFiles(newFiles);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewsImagePreviews((prev) => [...prev, { src: ev.target?.result as string, isExisting: false }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const preview = newsImagePreviews[index];
    if (!preview.isExisting) {
      const newFileIndex = newsImagePreviews.slice(0, index).filter((p) => !p.isExisting).length;
      setNewsImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
    }
    setNewsImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewsSubmit = () => {
    if (!newsForm.title || !newsForm.summary || !newsForm.content) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (editingArticle) {
      const existingImages = newsImagePreviews.filter((p) => p.isExisting).map((p) => p.path!);
      updateNewsMutation.mutate({ id: editingArticle.id, data: newsForm, imageFiles: newsImageFiles, existingImages });
    } else {
      createNewsMutation.mutate({ data: newsForm, imageFiles: newsImageFiles });
    }
  };

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

  if (authLoading || adminCheckLoading) {
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-4 rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
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
            <TabsTrigger value="news" data-testid="tab-news">
              <Newspaper className="mr-2 h-4 w-4" />
              News ({newsArticles.length})
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
          <TabsContent value="news">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle>News & Updates</CardTitle>
                  <CardDescription>Manage articles displayed on the landing page</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchNews()} data-testid="button-refresh-news">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button size="sm" onClick={openNewArticle} data-testid="button-create-news">
                    <Plus className="mr-2 h-4 w-4" />
                    New Article
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {newsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : newsArticles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Newspaper className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No articles yet</p>
                    <Button variant="outline" className="mt-4" onClick={openNewArticle}>
                      Create your first article
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newsArticles.map((article) => (
                        <TableRow key={article.id} data-testid={`row-news-${article.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{article.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{article.summary}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={article.isPublished ? "default" : "outline"}>
                              {article.isPublished ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditArticle(article)}
                                data-testid={`button-edit-news-${article.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this article?")) {
                                    deleteNewsMutation.mutate(article.id);
                                  }
                                }}
                                data-testid={`button-delete-news-${article.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
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
        </Tabs>
      </main>

      <Dialog open={newsDialogOpen} onOpenChange={setNewsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              {editingArticle ? "Edit Article" : "New Article"}
            </DialogTitle>
            <DialogDescription>
              {editingArticle ? "Update the article details below" : "Create a new news article"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="news-title">Title *</Label>
              <Input
                id="news-title"
                value={newsForm.title}
                onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Article title"
                data-testid="input-news-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-summary">Summary *</Label>
              <Textarea
                id="news-summary"
                value={newsForm.summary}
                onChange={(e) => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary shown on the landing page"
                rows={2}
                data-testid="input-news-summary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-content">Content *</Label>
              <Textarea
                id="news-content"
                value={newsForm.content}
                onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Full article content"
                rows={8}
                data-testid="input-news-content"
              />
            </div>
            <div className="space-y-2">
              <Label>Images (optional, up to 10)</Label>
              {newsImagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {newsImagePreviews.map((preview, index) => (
                    <div key={index} className="relative group/img">
                      <img
                        src={preview.src}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                        data-testid={`img-news-preview-${index}`}
                      />
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-1 right-1 h-6 w-6 invisible group-hover/img:visible"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                        data-testid={`button-remove-news-image-${index}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {newsImagePreviews.length < 10 && (
                <label
                  htmlFor="news-image-upload"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer border-muted-foreground/25 hover-elevate"
                  data-testid="label-news-image-upload"
                >
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Click to add images</span>
                  <span className="text-xs text-muted-foreground">JPG, PNG, GIF, WebP (max 5MB each)</span>
                  <input
                    id="news-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImagesSelect}
                    multiple
                    data-testid="input-news-image"
                  />
                </label>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="news-published"
                checked={newsForm.isPublished}
                onCheckedChange={(checked) => setNewsForm(prev => ({ ...prev, isPublished: checked }))}
                data-testid="switch-news-published"
              />
              <Label htmlFor="news-published">Publish immediately</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setNewsDialogOpen(false)} data-testid="button-cancel-news">
                Cancel
              </Button>
              <Button
                onClick={handleNewsSubmit}
                disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                data-testid="button-save-news"
              >
                {(createNewsMutation.isPending || updateNewsMutation.isPending) && (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingArticle ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
