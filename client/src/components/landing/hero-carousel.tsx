import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import heroEducation from "@/assets/images/hero-education.jpg";
import heroMedical from "@/assets/images/hero-medical.jpg";
import heroGraduation from "@/assets/images/hero-graduation.jpg";

const slides = [
  {
    id: 1,
    image: heroEducation,
    title: "Your Gateway to Quality Education",
    subtitle: "Study in Pakistan's Top Universities",
    description: "Access world-class education with affordable tuition, recognized degrees, and comprehensive support from application to graduation.",
    cta: "Get Started",
    icon: GraduationCap,
    accent: "education",
  },
  {
    id: 2,
    image: heroMedical,
    title: "World-Class Healthcare Awaits",
    subtitle: "Medical Tourism Made Simple",
    description: "Connect with leading hospitals and specialists in Pakistan. Quality treatment at competitive rates with full logistical support.",
    cta: "Start Your Journey",
    icon: Stethoscope,
    accent: "medical",
  },
  {
    id: 3,
    image: heroGraduation,
    title: "From Dream to Degree",
    subtitle: "Your Success is Our Mission",
    description: "Join thousands of African students who have achieved their academic dreams through ConsultAfrique's trusted guidance.",
    cta: "Register With Us",
    icon: GraduationCap,
    accent: "education",
  },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showChoiceDialog, setShowChoiceDialog] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <>
      <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        {slides.map((s, index) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 transition-all duration-500 ${
                  slide.accent === "education"
                    ? "bg-primary/20 text-primary-foreground"
                    : "bg-accent/20 text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{slide.subtitle}</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {slide.title}
              </h1>

              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
                {slide.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className={`text-lg px-8 py-6 ${
                    slide.accent === "education"
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-accent hover:bg-accent/90 text-white"
                  }`}
                  onClick={() => setShowChoiceDialog(true)}
                  data-testid={`button-hero-cta-${currentSlide}`}
                >
                  {slide.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => {
                    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={() => {
              setIsAutoPlaying(false);
              prevSlide();
            }}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentSlide(index);
                }}
                data-testid={`button-carousel-dot-${index}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={() => {
              setIsAutoPlaying(false);
              nextSlide();
            }}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </section>

      <Dialog open={showChoiceDialog} onOpenChange={setShowChoiceDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">How can we help you?</DialogTitle>
            <DialogDescription className="text-center">
              Choose the option that best describes your needs
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <a
              href="/api/login"
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
              data-testid="button-choice-student"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Student</span>
              <span className="text-xs text-muted-foreground text-center">Study in Pakistan's top universities</span>
            </a>
            <a
              href="/api/login"
              className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
              data-testid="button-choice-patient"
            >
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Stethoscope className="w-8 h-8 text-accent" />
              </div>
              <span className="font-semibold text-foreground">Patient</span>
              <span className="text-xs text-muted-foreground text-center">Access world-class healthcare</span>
            </a>
          </div>
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/api/login" className="text-primary font-medium hover:underline" data-testid="link-dialog-login">
                Log In
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
