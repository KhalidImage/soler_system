export interface Planet {
  id: string;
  name: string;
  order: number; // 1 = closest to the Sun
  type: "Terrestrial" | "Gas giant" | "Ice giant";
  /** [highlight, base, shadow] surface tones used for sphere shading */
  colors: [string, string, string];
  /** UI accent color (rings, bars, selection) */
  accent: string;
  diameterKm: number;
  earthMult: number; // diameter as a multiple of Earth's
  distanceMkm: number; // mean distance from the Sun, million km
  au: number;
  periodDays: number; // sidereal orbital period
  periodYears: string;
  rotationText: string; // length of day
  moons: number;
  tempText: string; // mean surface / cloud-top temperature
  velocityKmS: number; // mean orbital velocity
  a0: number; // initial orbital angle (rad) so planets start spread out
  drawRadius: number; // rendered radius in px (not to scale)
  banded?: boolean;
  rings?: boolean;
  hasMoon?: boolean;
  note: string;
}

export const PLANETS: Planet[] = [
  {
    id: "mercury",
    name: "Mercury",
    order: 1,
    type: "Terrestrial",
    colors: ["#cfc4b6", "#9c8f82", "#574e45"],
    accent: "#c8b8a4",
    diameterKm: 4879,
    earthMult: 0.38,
    distanceMkm: 57.9,
    au: 0.39,
    periodDays: 88,
    periodYears: "0.24 yr",
    rotationText: "58.6 days",
    moons: 0,
    tempText: "167 °C mean",
    velocityKmS: 47.4,
    a0: 0.6,
    drawRadius: 4,
    note: "A solar day on Mercury — sunrise to sunrise — lasts 176 Earth days: two of its years pass before the Sun returns to the same spot in the sky.",
  },
  {
    id: "venus",
    name: "Venus",
    order: 2,
    type: "Terrestrial",
    colors: ["#f7ddb0", "#e3b57e", "#8f6a38"],
    accent: "#eec289",
    diameterKm: 12104,
    earthMult: 0.95,
    distanceMkm: 108.2,
    au: 0.72,
    periodDays: 224.7,
    periodYears: "0.62 yr",
    rotationText: "243 days · retrograde",
    moons: 0,
    tempText: "464 °C",
    velocityKmS: 35.0,
    a0: 2.3,
    drawRadius: 6,
    note: "Venus spins backwards, so its Sun rises in the west — and its day is so slow that a single rotation outlasts its entire year.",
  },
  {
    id: "earth",
    name: "Earth",
    order: 3,
    type: "Terrestrial",
    colors: ["#8fc0ef", "#3f7fd4", "#16305f"],
    accent: "#6fb1f2",
    diameterKm: 12742,
    earthMult: 1.0,
    distanceMkm: 149.6,
    au: 1.0,
    periodDays: 365.25,
    periodYears: "1.00 yr",
    rotationText: "23.9 hours",
    moons: 1,
    tempText: "15 °C",
    velocityKmS: 29.8,
    a0: 4.1,
    drawRadius: 6.5,
    hasMoon: true,
    note: "The only world known to hold liquid water on its surface — and, so far, the only one known to host life. Handle with care.",
  },
  {
    id: "mars",
    name: "Mars",
    order: 4,
    type: "Terrestrial",
    colors: ["#f0a276", "#d1683f", "#6e2c12"],
    accent: "#ee8a5c",
    diameterKm: 6779,
    earthMult: 0.53,
    distanceMkm: 227.9,
    au: 1.52,
    periodDays: 687,
    periodYears: "1.88 yr",
    rotationText: "24.6 hours",
    moons: 2,
    tempText: "−63 °C",
    velocityKmS: 24.1,
    a0: 5.5,
    drawRadius: 5,
    note: "Olympus Mons rises 22 km above the Martian plains — nearly three Mount Everests stacked on top of one another.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    order: 5,
    type: "Gas giant",
    colors: ["#f2d3a6", "#d9a066", "#7c5226"],
    accent: "#e5b183",
    diameterKm: 139820,
    earthMult: 10.97,
    distanceMkm: 778.5,
    au: 5.2,
    periodDays: 4333,
    periodYears: "11.9 yr",
    rotationText: "9.9 hours",
    moons: 95,
    tempText: "−108 °C",
    velocityKmS: 13.1,
    a0: 1.3,
    drawRadius: 14,
    banded: true,
    note: "The Great Red Spot is a storm wider than Earth that has been raging for at least 190 years — and possibly for centuries more.",
  },
  {
    id: "saturn",
    name: "Saturn",
    order: 6,
    type: "Gas giant",
    colors: ["#f6e2b8", "#e0bd85", "#8a6734"],
    accent: "#eccf9b",
    diameterKm: 116460,
    earthMult: 9.14,
    distanceMkm: 1434,
    au: 9.58,
    periodDays: 10759,
    periodYears: "29.4 yr",
    rotationText: "10.7 hours",
    moons: 146,
    tempText: "−139 °C",
    velocityKmS: 9.7,
    a0: 3.4,
    drawRadius: 12,
    banded: true,
    rings: true,
    note: "Saturn is the least dense planet — lighter than water. In a sufficiently large bathtub, it would float.",
  },
  {
    id: "uranus",
    name: "Uranus",
    order: 7,
    type: "Ice giant",
    colors: ["#cdeef0", "#8fd5d9", "#3f7d85"],
    accent: "#9fdde1",
    diameterKm: 50724,
    earthMult: 3.98,
    distanceMkm: 2871,
    au: 19.2,
    periodDays: 30687,
    periodYears: "84.0 yr",
    rotationText: "17.2 hours · retrograde",
    moons: 28,
    tempText: "−195 °C",
    velocityKmS: 6.8,
    a0: 0.9,
    drawRadius: 9,
    note: "Uranus rolls around the Sun on its side, tilted 98 degrees — most likely knocked over by a colossal impact long ago.",
  },
  {
    id: "neptune",
    name: "Neptune",
    order: 8,
    type: "Ice giant",
    colors: ["#93b2f0", "#4a6fd4", "#1b2c66"],
    accent: "#7d9cec",
    diameterKm: 49244,
    earthMult: 3.86,
    distanceMkm: 4495,
    au: 30.05,
    periodDays: 60190,
    periodYears: "164.8 yr",
    rotationText: "16.1 hours",
    moons: 16,
    tempText: "−201 °C",
    velocityKmS: 5.4,
    a0: 5.1,
    drawRadius: 8.5,
    note: "Supersonic winds top 2,000 km/h here — the fastest ever measured anywhere in the solar system.",
  },
];

export const SUN = {
  id: "sun",
  name: "The Sun",
  type: "G-type star",
  accent: "#ffb454",
  colors: ["#fff6d8", "#ffcf6e", "#ff8a3d"] as [string, string, string],
  stats: [
    ["Diameter", "1,392,700 km · 109× Earth"],
    ["Spectral class", "G2V main-sequence"],
    ["Surface temp", "5,505 °C"],
    ["Core temp", "≈ 15,000,000 °C"],
    ["Age", "≈ 4.6 billion years"],
    ["Mass share", "99.86 % of the system"],
  ] as [string, string][],
  note: "Every second the Sun fuses roughly 600 million tonnes of hydrogen into helium. The light warming your screen left its surface about 8 minutes ago.",
};

export const NEPTUNE_AU = 30.05;
export const MERCURY_PERIOD = 88;
export const NEPTUNE_PERIOD = 60190;
export const EARTH_YEAR_DAYS = 365.25;
