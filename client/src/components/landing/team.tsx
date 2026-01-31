import { useState } from "react";
import { X, Mail, Phone, Globe, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ibrahimImg from "@assets/ibrahim_1769841000677.png";
import abiolaImg from "@assets/abiola_1769841000680.png";
import akanbiImg from "@assets/akanbi_1769841000679.png";
import hareesImg from "@assets/harees_1769841000681.png";

const teamMembers = [
  {
    id: 1,
    name: "Ibrahim Sulaiman Idris",
    role: "Founder and Director of Strategy",
    image: ibrahimImg,
    bio: "Ibrahim is an ICT and security professional with an MSc in Information Security and extensive experience as ICT Manager at the Nigeria High Commission in Islamabad. He has expertise in ISO 27001 standards, digital transformation, and ICT management.",
    contribution: "As a founding figure, Ibrahim ensures that ConsultAfrique's strategy is grounded in security, structure, and sustainability, safeguarding both student success and organizational growth.",
    responsibilities: [
      "Provides strategic leadership and direction for ConsultAfrique's vision",
      "Builds secure ICT systems for student data, applications, and global networks",
      "Aligns growth strategies with global best practices and educational trends"
    ],
  },
  {
    id: 2,
    name: "Abiola Moshood Atobatele",
    role: "Chief Strategy and Brand Clarity Officer",
    image: abiolaImg,
    bio: "Known as the Clarity Consultant, Abiola is the founder of Abiola.co and creator of the ICE (Identify, Clarify, Execute) framework. With experience in entrepreneurship, consulting, and cross-cultural projects, he specializes in helping individuals and organizations gain clarity, unlock growth, and execute effectively.",
    contribution: "Abiola ensures ConsultAfrique is not just an admissions consultancy, but a clarity-driven ecosystem where students are mentored to succeed academically, personally, and professionally.",
    responsibilities: [
      "Leads on strategy, branding, and clarity-focused mentorship",
      "Designs student success frameworks, career clarity sessions, and workshops",
      "Drives ConsultAfrique's global expansion and positioning"
    ],
  },
  {
    id: 3,
    name: "Akanbi Abdulmutakeem",
    role: "Director of Admissions and University Relations",
    image: akanbiImg,
    bio: "Abdulmutakeem is a student leader and advocate, currently serving as President of the Nigeria Student Union and a core member of the Africa Student Union. His grassroots involvement has made him a powerful voice for African students abroad.",
    contribution: "With his deep ties to student communities and unions, Abdulmutakeem guarantees that ConsultAfrique remains authentically student-centered, addressing real needs beyond paperwork.",
    responsibilities: [
      "Leads admissions operations and direct engagement with universities",
      "Provides mentorship and integration support for students relocating abroad",
      "Ensures the student perspective drives every aspect of ConsultAfrique's services"
    ],
  },
  {
    id: 4,
    name: "Harees Gurashi",
    role: "Director of Partnerships and Operations",
    image: hareesImg,
    bio: "Harees Gurashi is a dynamic entrepreneur and business leader with a strong background in strategic operations, cross-border investments, and educational partnerships. With years of experience across Africa, Pakistan, and the Middle East, Harees plays a key role in expanding ConsultAfrique's university partnerships and operational excellence.",
    contribution: "Harees' ability to bridge academic institutions and business networks ensures that ConsultAfrique remains a trusted partner for universities and students alike, creating win-win opportunities.",
    responsibilities: [
      "Establishes and nurtures partnerships with universities and academic institutions",
      "Oversees operational systems and student onboarding processes",
      "Ensures high-quality service delivery across admissions, mentorship, and student support"
    ],
  },
];

export function Team() {
  const [selectedMember, setSelectedMember] = useState<typeof teamMembers[0] | null>(null);

  return (
    <section id="team" className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Team
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet the Leaders
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our experienced team brings together expertise from education, healthcare, technology, and business to serve you better.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="group text-left bg-card rounded-xl p-6 border border-card-border hover-elevate transition-all duration-300"
              data-testid={`card-team-${member.id}`}
            >
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="text-white text-sm font-medium">View Profile</span>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-1">{member.name}</h3>
              <p className="text-sm text-muted-foreground">{member.role}</p>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedMember && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedMember.image} alt={selectedMember.name} className="object-cover object-top" />
                    <AvatarFallback>{selectedMember.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-serif">{selectedMember.name}</DialogTitle>
                    <p className="text-primary font-medium mt-1">{selectedMember.role}</p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">About</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedMember.bio}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Role at ConsultAfrique</h4>
                  <ul className="space-y-2">
                    {selectedMember.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold text-foreground mb-2">Unique Contribution</h4>
                  <p className="text-muted-foreground leading-relaxed">{selectedMember.contribution}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
