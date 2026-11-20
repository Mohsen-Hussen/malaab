export const sports = ["football", "padel", "basketball", "tennis"] as const;
export type Sport = (typeof sports)[number];

export const cities = ["riyadh", "jeddah", "dammam"] as const;
export type City = (typeof cities)[number];

export const amenities = ["parking", "showers", "lights", "cafe", "indoor"] as const;
export type Amenity = (typeof amenities)[number];

type Localized = { ar: string; en: string };

export interface Venue {
  id: string;
  name: Localized;
  district: Localized;
  city: City;
  sport: Sport;
  /** Price per hour in halalas (1 SAR = 100 halalas), before peak surcharge and VAT. */
  pricePerHour: number;
  rating: number;
  /** Opening hours, 24h clock. `close` may be 24 (midnight). */
  open: number;
  close: number;
  amenities: Amenity[];
}

export const venues: Venue[] = [
  {
    id: "al-nakheel-arena",
    name: { ar: "ملعب النخيل", en: "Al Nakheel Arena" },
    district: { ar: "حي النخيل", en: "Al Nakheel" },
    city: "riyadh",
    sport: "football",
    pricePerHour: 350_00,
    rating: 4.8,
    open: 16,
    close: 24,
    amenities: ["parking", "showers", "lights"],
  },
  {
    id: "padel-hub-olaya",
    name: { ar: "بادل هب العليا", en: "Padel Hub Olaya" },
    district: { ar: "العليا", en: "Olaya" },
    city: "riyadh",
    sport: "padel",
    pricePerHour: 240_00,
    rating: 4.9,
    open: 8,
    close: 24,
    amenities: ["parking", "showers", "cafe", "indoor"],
  },
  {
    id: "hoops-court-malqa",
    name: { ar: "ملعب هوبس الملقا", en: "Hoops Court Al Malqa" },
    district: { ar: "الملقا", en: "Al Malqa" },
    city: "riyadh",
    sport: "basketball",
    pricePerHour: 200_00,
    rating: 4.5,
    open: 14,
    close: 23,
    amenities: ["lights", "indoor"],
  },
  {
    id: "corniche-padel",
    name: { ar: "بادل الكورنيش", en: "Corniche Padel Club" },
    district: { ar: "الكورنيش", en: "Corniche" },
    city: "jeddah",
    sport: "padel",
    pricePerHour: 260_00,
    rating: 4.7,
    open: 9,
    close: 24,
    amenities: ["parking", "cafe", "lights"],
  },
  {
    id: "jeddah-five-a-side",
    name: { ar: "ملاعب جدة الخماسية", en: "Jeddah Five-a-Side" },
    district: { ar: "الروضة", en: "Al Rawdah" },
    city: "jeddah",
    sport: "football",
    pricePerHour: 280_00,
    rating: 4.4,
    open: 15,
    close: 24,
    amenities: ["parking", "lights"],
  },
  {
    id: "ace-tennis-center",
    name: { ar: "مركز إيس للتنس", en: "Ace Tennis Center" },
    district: { ar: "الشاطئ", en: "Al Shati" },
    city: "jeddah",
    sport: "tennis",
    pricePerHour: 180_00,
    rating: 4.6,
    open: 7,
    close: 22,
    amenities: ["parking", "showers", "lights"],
  },
  {
    id: "eastern-stadium-dammam",
    name: { ar: "ملعب الشرقية", en: "Eastern Stadium" },
    district: { ar: "الفيصلية", en: "Al Faisaliyah" },
    city: "dammam",
    sport: "football",
    pricePerHour: 300_00,
    rating: 4.3,
    open: 16,
    close: 24,
    amenities: ["parking", "showers", "lights", "cafe"],
  },
  {
    id: "gulf-hoops-dammam",
    name: { ar: "ملعب الخليج لكرة السلة", en: "Gulf Hoops" },
    district: { ar: "الشاطئ", en: "Al Shati" },
    city: "dammam",
    sport: "basketball",
    pricePerHour: 170_00,
    rating: 4.2,
    open: 12,
    close: 23,
    amenities: ["indoor", "lights"],
  },
];

export function getVenue(id: string): Venue | undefined {
  return venues.find((venue) => venue.id === id);
}

export interface VenueFilter {
  query?: string;
  sport?: Sport;
  city?: City;
}

/** Search matches Arabic and English names and districts, case-insensitively. */
export function filterVenues(list: Venue[], { query = "", sport, city }: VenueFilter): Venue[] {
  const needle = query.trim().toLowerCase();
  return list.filter((venue) => {
    if (sport && venue.sport !== sport) return false;
    if (city && venue.city !== city) return false;
    if (!needle) return true;
    return [venue.name.ar, venue.name.en, venue.district.ar, venue.district.en].some((text) =>
      text.toLowerCase().includes(needle),
    );
  });
}
