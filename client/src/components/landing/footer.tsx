import { Link } from "wouter";
import { SiLinkedin, SiInstagram, SiFacebook } from "react-icons/si";
import logoImg from "@assets/LOGO_1769841000681.jpeg";

const footerLinks = {
  services: [
    { label: "Study Abroad", href: "#services" },
    { label: "Medical Tourism", href: "#services" },
    { label: "Visa Assistance", href: "#services" },
    { label: "Travel Coordination", href: "#services" },
  ],
  company: [
    { label: "About Us", href: "#about" },
    { label: "Our Team", href: "#team" },
    { label: "Contact", href: "#contact" },
  ],
  resources: [
    { label: "FAQs", href: "#" },
    { label: "University Partners", href: "#" },
    { label: "Hospital Partners", href: "#" },
  ],
};

const socialLinks = [
  { icon: SiLinkedin, href: "https://www.linkedin.com/company/consultafrique/", label: "LinkedIn" },
  { icon: SiInstagram, href: "https://www.instagram.com/consult_afrique/", label: "Instagram" },
  { icon: SiFacebook, href: "https://www.facebook.com/people/ConsultAfrique/61585775796347/", label: "Facebook" },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <img src={logoImg} alt="ConsultAfrique" className="h-12 w-auto bg-white rounded-lg p-1" />
            </Link>
            <p className="text-background/70 mb-6 max-w-sm leading-relaxed">
              Bridging Africa and Pakistan for quality education and world-class healthcare. 
              Your trusted partner for a brighter future.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-background/70 hover:text-background transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-background/70 hover:text-background transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-background/70">
              <li>
                <a href="tel:+2347079119101" className="hover:text-background transition-colors">
                  +234 707 911 9101
                </a>
              </li>
              <li>
                <a href="tel:+923114888878" className="hover:text-background transition-colors">
                  +92 311 488 8878
                </a>
              </li>
              <li>
                <a href="mailto:info@consultafrique.com" className="hover:text-background transition-colors">
                  info@consultafrique.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/60 text-sm">
            &copy; {new Date().getFullYear()} ConsultAfrique. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-background/60">
            <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
