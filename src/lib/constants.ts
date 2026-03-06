export const SITE_NAME = "Wanted Society";
export const SITE_DESCRIPTION =
  "Organizacja tworząca eventy motoryzacyjne (stance meets) w województwie lubelskim.";
export const INSTAGRAM_URL = "https://instagram.com/wanted_society_";
export const FACEBOOK_URL = "https://facebook.com/fp.wanted.society";
export const INSTAGRAM_HANDLE = "@wanted_society_";

export const NAV_LINKS = [
  { href: "/", label: "Strona główna" },
  { href: "/zgloszenia", label: "Zgłoszenia" },
  { href: "/sklep", label: "Sklep" },
  { href: "/galeria", label: "Galeria" },
  { href: "/kontakt", label: "Kontakt" },
] as const;

export const APPLICATION_TYPES = {
  exhibitor: "Wystawca",
  media: "Media",
  partner: "Partner",
} as const;

export const APPLICATION_STATUSES = {
  pending: "Oczekujące",
  accepted: "Zaakceptowane",
  rejected: "Odrzucone",
} as const;

export const CABIN_ELIGIBLE_TYPES: import("@/lib/types").ApplicationType[] = [
  "exhibitor",
  "media",
];

export const EMAIL_STATUSES = {
  unread: "Nieprzeczytane",
  read: "Przeczytane",
  linked: "Powiązane",
  archived: "Zarchiwizowane",
} as const;
