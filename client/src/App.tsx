import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Landing from "@/pages/landing";
import EligibilityCalculator from "@/pages/eligibility-calculator";
import Dashboard from "@/pages/dashboard/index";
import Profile from "@/pages/dashboard/profile";
import Documents from "@/pages/dashboard/documents";
import Settings from "@/pages/dashboard/settings";
import AdminDashboard from "@/pages/admin/index";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/eligibility-calculator" component={EligibilityCalculator} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/profile" component={Profile} />
      <Route path="/dashboard/documents" component={Documents} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="consultafrique-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
