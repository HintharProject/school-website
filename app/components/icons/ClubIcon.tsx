"use client";

import {
  Robot,
  Scales,
  Flask,
  Palette,
  TennisBall,
  UsersThree,
  BookOpenText,
  Trophy,
  GlobeHemisphereEast,
  Cpu,
  MusicNotes,
} from "@phosphor-icons/react";

export function ClubIcon({
  name,
  className = "w-5 h-5",
}: {
  name?: string | null;
  className?: string;
}) {
  const key = (name ?? "").trim().toLowerCase();
  switch (key) {
    case "robot":
    case "smart_toy":
      return <Robot className={className} weight="duotone" />;
    case "cpu":
    case "code":
      return <Cpu className={className} weight="duotone" />;
    case "scales":
    case "gavel":
      return <Scales className={className} weight="duotone" />;
    case "flask":
    case "science":
      return <Flask className={className} weight="duotone" />;
    case "palette":
      return <Palette className={className} weight="duotone" />;
    case "music":
      return <MusicNotes className={className} weight="duotone" />;
    case "racquet":
    case "sports":
    case "sports_tennis":
      return <TennisBall className={className} weight="duotone" />;
    case "trophy":
      return <Trophy className={className} weight="duotone" />;
    case "globe":
      return <GlobeHemisphereEast className={className} weight="duotone" />;
    case "book":
      return <BookOpenText className={className} weight="duotone" />;
    default:
      return <UsersThree className={className} weight="duotone" />;
  }
}

