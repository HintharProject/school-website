import { CampusRecord } from "../supabase/types";

export const DEFAULT_CAMPUSES: CampusRecord[] = [
  {
    id: "ywarma-campus",
    name: "Ywarma Campus",
    city: "Yangon",
    tagline: "Flagship Academic Center & Pearson Examination Hall",
    address: "No. 23B, Ywar Ma Kyaung Lane, Hlaing Township, Yangon, Myanmar (11051)",
    phone: "+95 9 894 332200 / +95 9 894 332211",
    email: "ywarma.admissions@hinthar.education",
    office_hours: "Mon–Sat: 08:30 AM – 05:00 PM",
    grades_served: "Year 7–9 · Pearson IGCSE · Pearson IAL",
    facilities: [
      "Pearson Official Examination Center",
      "Turing High-Performance Computer Lab",
      "Newton Physics & Franklin Chemistry Labs",
      "British Council Testing Suite",
      "Academic Auditorium & British Library"
    ],
    image_url: "/images/heroImg.png",
    is_active: true,
  },
  {
    id: "shwe-padauk-campus",
    name: "Shwe Padauk Campus",
    city: "Yangon",
    tagline: "Senior STEM, AI & Robotics Innovation Center",
    address: "Shwe Padauk Road, Yangon, Myanmar",
    phone: "+95 9 894 332222",
    email: "shwepadauk@hinthar.education",
    office_hours: "Mon–Sat: 08:30 AM – 05:00 PM",
    grades_served: "Pearson IGCSE & Pearson IAL (STEM Specialized)",
    facilities: [
      "AI, IoT & Robotics Studio",
      "Advanced Molecular Chemistry Lab",
      "Bio-Science Research Incubator",
      "Collaborative Study Pods & Seminar Hall",
      "Student Innovation & Recreation Hub"
    ],
    image_url: "/images/specialisations/stemSpecialisation.png",
    is_active: true,
  },
  {
    id: "shwe-pone-nyet-campus",
    name: "Shwe Pone Nyet Campus",
    city: "Yangon",
    tagline: "Lower Secondary & Creative Arts Hub",
    address: "Shwe Pone Nyet Street, Yangon, Myanmar",
    phone: "+95 9 894 332233",
    email: "shweponenyet@hinthar.education",
    office_hours: "Mon–Sat: 08:30 AM – 05:00 PM",
    grades_served: "Lower Secondary (Year 7–9) & Foundation Arts",
    facilities: [
      "Digital Media & Graphic Arts Lab",
      "Music & Performing Arts Studio",
      "Badminton & Physical Fitness Arena",
      "English Language Immersion Lounge",
      "Junior Science Inquiry Lab"
    ],
    image_url: "/images/specialisations/creativeSpecialisation.png",
    is_active: true,
  },
  {
    id: "mawlamyine-campus",
    name: "Mawlamyine Campus",
    city: "Mawlamyine",
    tagline: "Mon State Regional Center of Academic Excellence",
    address: "Main Strand Road, Mawlamyine, Mon State, Myanmar",
    phone: "+95 9 894 332288 / +95 32 202 888",
    email: "mawlamyine@hinthar.education",
    office_hours: "Mon–Sat: 08:30 AM – 05:00 PM",
    grades_served: "Year 7–9 · Pearson IGCSE · Pearson IAL",
    facilities: [
      "Full-Scale Physics, Chem & Bio Labs",
      "Modern Computer Lab & High-Speed Fiber",
      "Extensive Curated British Library",
      "Multi-Purpose Outdoor Sports Arena",
      "Student Residence & Pastoral Support"
    ],
    image_url: "/images/specialisations/businessSpecialisation.png",
    is_active: true,
  },
];
