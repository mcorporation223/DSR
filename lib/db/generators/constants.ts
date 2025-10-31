// Shared constants for DR Congo contextual data generation

export const LOCATIONS = [
  "Goma",
  "Bukavu",
  "Kinshasa",
  "Lubumbashi",
  "Kisangani",
  "Mbuji-Mayi",
  "Kananga",
  "Butembo",
  "Rutshuru",
  "Masisi",
  "Beni",
  "Uvira",
  "Kalemie",
  "Kolwezi",
  "Tshikapa",
];

export const NEIGHBORHOODS = [
  "Quartier Himbi",
  "Quartier Majengo",
  "Quartier Ndosho",
  "Quartier Kyeshero",
  "Quartier Mabanga Nord",
  "Quartier Mabanga Sud",
  "Quartier Vulindi",
  "Quartier Volcanologique",
  "Centre Ville",
  "Quartier Industriel",
  "Quartier Keshero",
  "Quartier Mugunga",
];

export const PROVINCES = [
  "Nord-Kivu",
  "Sud-Kivu",
  "Kinshasa",
  "Katanga",
  "Kasaï",
  "Équateur",
  "Orientale",
];

export const RELIGIONS = [
  "Catholique",
  "Protestante",
  "Adventiste",
  "Pentecôtiste",
  "Musulmane",
  "Kimbanguiste",
  "Traditionnelle",
];

export const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];

export const EDUCATION_LEVELS = [
  "Primaire",
  "Secondaire incomplet",
  "Secondaire complet",
  "Graduat",
  "Licence",
  "Master",
  "Doctorat",
  "Formation technique",
  "École de Police",
];

export const POLICE_FUNCTIONS = [
  "Commissaire Principal",
  "Commissaire",
  "Commissaire Adjoint",
  "Inspecteur Principal",
  "Inspecteur",
  "Sous-Inspecteur",
  "Agent de Police",
  "Sergent",
  "Caporal",
  "Agent",
];

export const CRIME_REASONS = [
  "Vol à main armée",
  "Fraude financière",
  "Agression et coups et blessures",
  "Homicide",
  "Viol",
  "Détournement de fonds",
  "Trafic de drogue",
  "Contrebande",
  "Kidnapping",
  "Cambriolage",
  "Escroquerie",
  "Violence domestique",
  "Vol de véhicule",
  "Corruption",
];

export const SEIZURE_TYPES = [
  "cars",
  "motorcycles",
  "objects",
  "weapons",
  "drugs",
  "money",
];

export const SEIZURE_ITEMS = {
  cars: [
    "Toyota Hilux",
    "Toyota Corolla",
    "Nissan Patrol",
    "Mitsubishi Pajero",
    "Honda CRV",
  ],
  motorcycles: [
    "Yamaha DT 125",
    "Honda CB 125",
    "Bajaj Boxer",
    "TVS Apache",
    "Suzuki GN",
  ],
  objects: [
    "Sac d'argent",
    "Bijoux",
    "Téléphones portables",
    "Ordinateurs",
    "Appareils électroniques",
  ],
  weapons: ["Pistolet", "Fusil de chasse", "Machette", "Couteau", "Grenades"],
  drugs: [
    "Cannabis",
    "Cocaïne",
    "Héroïne",
    "Amphétamines",
    "Drogues synthétiques",
  ],
  money: [
    "Argent liquide USD",
    "Argent liquide CDF",
    "Chèques",
    "Cartes bancaires",
  ],
};

export const INCIDENT_TYPES = [
  "Assassinats",
  "Attaque armée",
  "Fusillades",
  "Explosions",
  "Émeutes",
  "Accidents graves",
];

export const CAUSES_OF_DEATH = [
  "Balles - arme à feu",
  "Arme blanche - machette",
  "Arme blanche - couteau",
  "Explosion",
  "Strangulation",
];

// Utility functions
export const getRandomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const getRandomDate = (start: Date, end: Date): Date =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
