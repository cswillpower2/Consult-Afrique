import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Settings, 
  LogOut,
  ArrowLeft,
  Loader2,
  Save,
  GraduationCap,
  Stethoscope,
} from "lucide-react";
import type { UserProfile } from "@shared/schema";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: User, label: "My Profile", path: "/dashboard/profile" },
  { icon: FileText, label: "Documents", path: "/dashboard/documents" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const fieldOfStudyOptions = [
  "Medicine & Surgery (MBBS)",
  "Dental Surgery (BDS)",
  "Pharmacy (Pharm.D)",
  "Nursing (BSN)",
  "Engineering (Various)",
  "Computer Science / IT",
  "Business Administration (BBA/MBA)",
  "Law (LLB)",
  "Architecture",
  "Agriculture",
  "Arts & Humanities",
  "Social Sciences",
  "Natural Sciences",
  "Education",
  "Media & Communication",
  "Other",
];

const profileSchema = z.object({
  userType: z.enum(["student", "patient"]),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  nationality: z.string().min(2, "Nationality is required"),
  address: z.string().min(10, "Please enter a complete address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  preferredFieldOfStudy: z.string().optional(),
  secondFieldOfStudy: z.string().optional(),
  medicalHistory: z.string().optional(),
  diagnosis: z.string().optional(),
  symptoms: z.string().optional(),
  pastTreatments: z.string().optional(),
  reasonForPakistan: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userType: "student",
      fullName: "",
      dateOfBirth: "",
      gender: "male",
      nationality: "",
      address: "",
      phoneNumber: "",
      preferredFieldOfStudy: "",
      secondFieldOfStudy: "",
      medicalHistory: "",
      diagnosis: "",
      symptoms: "",
      pastTreatments: "",
      reasonForPakistan: "",
    },
  });

  const userType = form.watch("userType");

  useEffect(() => {
    if (profile) {
      form.reset({
        userType: profile.userType as "student" | "patient",
        fullName: profile.fullName || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: (profile.gender as "male" | "female" | "other") || "male",
        nationality: profile.nationality || "",
        address: profile.address || "",
        phoneNumber: profile.phoneNumber || "",
        preferredFieldOfStudy: profile.preferredFieldOfStudy || "",
        secondFieldOfStudy: profile.secondFieldOfStudy || "",
        medicalHistory: profile.medicalHistory || "",
        diagnosis: profile.diagnosis || "",
        symptoms: profile.symptoms || "",
        pastTreatments: profile.pastTreatments || "",
        reasonForPakistan: profile.reasonForPakistan || "",
      });
    }
  }, [profile, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
    }
  }, [user, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
              <h1 className="text-lg font-semibold">My Profile</h1>
            </div>
            <ThemeToggle />
          </header>

          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Complete your profile to proceed with your application. All fields are required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="userType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>I am applying as a</FormLabel>
                              <div className="grid grid-cols-2 gap-4">
                                <button
                                  type="button"
                                  onClick={() => field.onChange("student")}
                                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                                    field.value === "student"
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                  data-testid="button-type-student"
                                >
                                  <GraduationCap className={`w-8 h-8 ${field.value === "student" ? "text-primary" : "text-muted-foreground"}`} />
                                  <span className={`font-medium ${field.value === "student" ? "text-primary" : ""}`}>Student</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => field.onChange("patient")}
                                  className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                                    field.value === "patient"
                                      ? "border-accent bg-accent/5"
                                      : "border-border hover:border-accent/50"
                                  }`}
                                  data-testid="button-type-patient"
                                >
                                  <Stethoscope className={`w-8 h-8 ${field.value === "patient" ? "text-accent" : "text-muted-foreground"}`} />
                                  <span className={`font-medium ${field.value === "patient" ? "text-accent" : ""}`}>Patient</span>
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} data-testid="input-fullname" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date of Birth</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-dob" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-gender">
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nationality</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Nigerian" {...field} data-testid="input-nationality" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+234..." {...field} data-testid="input-phone" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Your full address" 
                                  className="resize-none" 
                                  {...field} 
                                  data-testid="input-address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {userType === "student" && (
                          <>
                            <div className="border-t pt-6">
                              <h3 className="font-medium mb-4">Field of Study</h3>
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="preferredFieldOfStudy"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Preferred Field of Study</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-field-of-study">
                                            <SelectValue placeholder="Select your preferred field" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {fieldOfStudyOptions.map((option) => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="secondFieldOfStudy"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Alternative Field of Study (Optional)</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value || ""}>
                                        <FormControl>
                                          <SelectTrigger data-testid="select-second-field-of-study">
                                            <SelectValue placeholder="Select an alternative field" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {fieldOfStudyOptions.map((option) => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {userType === "patient" && (
                          <>
                            <div className="border-t pt-6">
                              <h3 className="font-medium mb-4">Medical Information</h3>
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="diagnosis"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Current Diagnosis</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Describe your current medical diagnosis" 
                                          className="resize-none" 
                                          {...field} 
                                          data-testid="input-diagnosis"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="symptoms"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Symptoms</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Describe your symptoms" 
                                          className="resize-none" 
                                          {...field} 
                                          data-testid="input-symptoms"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="pastTreatments"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Past Treatments</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Describe any past treatments" 
                                          className="resize-none" 
                                          {...field} 
                                          data-testid="input-treatments"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="reasonForPakistan"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Reason for Choosing Pakistan</FormLabel>
                                      <FormControl>
                                        <Textarea 
                                          placeholder="Why are you seeking treatment in Pakistan?" 
                                          className="resize-none" 
                                          {...field} 
                                          data-testid="input-reason"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full"
                          disabled={mutation.isPending}
                          data-testid="button-save-profile"
                        >
                          {mutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Profile
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
