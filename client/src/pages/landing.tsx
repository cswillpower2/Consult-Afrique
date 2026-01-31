import { Navbar } from "@/components/landing/navbar";
import { HeroCarousel } from "@/components/landing/hero-carousel";
import { Services } from "@/components/landing/services";
import { About } from "@/components/landing/about";
import { Team } from "@/components/landing/team";
import { Contact } from "@/components/landing/contact";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/landing/whatsapp-button";

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroCarousel />
      <Services />
      <About />
      <Team />
      <Contact />
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
