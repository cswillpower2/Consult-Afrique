import { Check, Award, Users, Globe } from "lucide-react";

const stats = [
  { value: "500+", label: "Students Placed" },
  { value: "50+", label: "Partner Universities" },
  { value: "15+", label: "Countries Served" },
  { value: "98%", label: "Success Rate" },
];

const features = [
  "Expert guidance from experienced consultants",
  "Dedicated support throughout your journey",
  "Strong university and hospital partnerships",
  "Affordable and transparent pricing",
  "Comprehensive visa assistance",
  "Cultural integration support",
];

export function About() {
  return (
    <section id="about" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              About ConsultAfrique
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Bridging Africa and Pakistan for a Brighter Future
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              ConsultAfrique was founded with a clear mission: to provide African students and patients 
              access to world-class education and healthcare in Pakistan. We understand the challenges 
              of studying or seeking medical treatment abroad, and we're here to make that journey seamless.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our team of experienced consultants, with deep ties to both African and Pakistani 
              institutions, ensures that every client receives personalized attention and support 
              from initial inquiry to successful completion of their goals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl ${
                    index % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-accent text-white"
                  } ${index === 1 ? "translate-y-4" : ""} ${index === 3 ? "translate-y-4" : ""}`}
                  data-testid={`stat-${index}`}
                >
                  <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full -z-10" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-accent/10 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
