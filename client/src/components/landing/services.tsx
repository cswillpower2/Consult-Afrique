import { Link } from "wouter";
import { GraduationCap, Stethoscope, Plane, FileCheck, Users, Globe, Calculator } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: GraduationCap,
    title: "University Admissions",
    description: "Full support for admission to accredited Pakistani universities. From application to acceptance, we handle everything.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Stethoscope,
    title: "Medical Tourism",
    description: "Connect with top hospitals and specialists. Comprehensive packages including treatment, accommodation, and follow-up care.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: FileCheck,
    title: "Visa Processing",
    description: "Expert guidance through visa applications. High success rate with proper documentation and embassy coordination.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Plane,
    title: "Travel Coordination",
    description: "Complete travel arrangements including flights, airport pickup, and local transportation throughout your stay.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Student Support",
    description: "Ongoing mentorship, integration assistance, and community building for students throughout their academic journey.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Access to our extensive network of universities, hospitals, and student communities across Pakistan and beyond.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Services
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Comprehensive Support for Your Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From initial consultation to successful completion, we provide end-to-end services for education and medical tourism.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover-elevate border-card-border bg-card transition-all duration-300"
              data-testid={`card-service-${index}`}
            >
              <CardHeader className="p-6">
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${service.bgColor} ${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <service.icon className="w-7 h-7" />
                </div>
                <CardTitle className="text-xl font-semibold mb-2">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mt-12 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5" data-testid="card-eligibility-cta">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8">
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                <Calculator className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Check Your Eligibility</h3>
                <p className="text-muted-foreground">
                  Instantly find out if your WAEC/NECO results meet Pakistani admission standards
                </p>
              </div>
            </div>
            <Link href="/eligibility-calculator">
              <Button size="lg" className="whitespace-nowrap" data-testid="button-eligibility-calculator">
                <Calculator className="mr-2 h-5 w-5" />
                Use Free Calculator
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
