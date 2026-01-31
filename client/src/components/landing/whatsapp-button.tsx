import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/923114888878?text=Hello%20ConsultAfrique!%20I%20would%20like%20to%20inquire%20about%20your%20services."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="sr-only">Chat on WhatsApp</span>
    </a>
  );
}
