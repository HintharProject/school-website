import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Specialisations", href: "#specialisations" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const programs = [
  { label: "Primary Education", href: "#" },
  { label: "Secondary Education", href: "#" },
  { label: "O Level / A Level", href: "#" },
  { label: "BCS Preparation", href: "#" },
  { label: "Specialized Courses", href: "#" },
];

const contactInfo = [
  {
    icon: "location_on",
    text: "No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar, 11051",
  },
  { icon: "mail", text: "info@hinthar.education", href: "mailto:info@hinthar.education" },
  { icon: "call", text: "+95 9 894 332200", href: "tel:+959894332200" },
];

export default function FooterSection() {
  return (
    <footer
      id="contact"
      className="bg-oxford-blue text-white pt-[80px] pb-[40px] md:pt-[120px] scroll-mt-20 relative overflow-hidden"
    >
      {/* Decorative gradient top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-academic-gold to-primary" />

      {/* Decorative background blur */}
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] bg-primary rounded-full blur-[150px] opacity-20 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
        {/* Brand column */}
        <div className="space-y-6 lg:pr-8">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12">
              <Image
                src="/images/logo.png"
                alt="Hinthar Education Logo"
                fill
                className="object-contain"
              />
            </div>
            <h4 className="text-xl font-extrabold text-white tracking-tight">
              Hinthar <span className="text-academic-gold">Education</span>
            </h4>
          </div>
          <p className="opacity-70 text-sm md:text-base leading-relaxed font-light">
            Dedicated to empowering students with high-quality learning
            experiences that inspire confidence and success in a globalized world.
          </p>
          <div className="flex gap-3 pt-2">
            {[
              { icon: 'public', label: 'Website', href: '#' },
              { icon: 'mail', label: 'Email', href: 'mailto:info@hinthar.education' },
              { icon: 'call', label: 'Call', href: 'tel:+959894332200' }
            ].map((social) => (
              <a
                key={social.icon}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-academic-gold hover:text-oxford-blue hover:border-academic-gold hover:-translate-y-1 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-[20px]">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em]">
            Quick Links
          </h4>
          <ul className="space-y-3 opacity-80 text-sm md:text-base font-light">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="hover:text-academic-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Programs */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em]">
            Our Programs
          </h4>
          <ul className="space-y-3 opacity-80 text-sm md:text-base font-light">
            {programs.map((prog) => (
              <li key={prog.label}>
                <a
                  href={prog.href}
                  className="hover:text-academic-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  {prog.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Portals */}
          <div className="pt-6 mt-6 border-t border-white/10">
            <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-4">
              Portals
            </h4>
            <ul className="space-y-3 opacity-80 text-sm md:text-base font-light">
              <li>
                <Link
                  href="/admission"
                  className="hover:text-academic-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  Admission Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/yearbook"
                  className="hover:text-academic-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  Year Book
                </Link>
              </li>
              <li>
                <Link
                  href="/activities"
                  className="hover:text-academic-gold hover:translate-x-1 inline-block transition-all duration-300"
                >
                  Activities &amp; Announcements
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-white uppercase tracking-[0.15em]">
            Contact Info
          </h4>
          <div className="space-y-5 text-sm md:text-base font-light opacity-90">
            {contactInfo.map((item) => (
              <div key={item.icon} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-academic-gold transition-colors duration-300">
                  <span className="material-symbols-outlined text-white text-[20px] group-hover:text-oxford-blue transition-colors">
                    {item.icon}
                  </span>
                </div>
                {item.href ? (
                  <a href={item.href} className="self-center hover:text-academic-gold transition-colors leading-relaxed">
                    {item.text}
                  </a>
                ) : (
                  <p className="self-center leading-relaxed">{item.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm font-light opacity-60">
        <p>© {new Date().getFullYear()} Hinthar International School. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
