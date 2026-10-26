export const plans = [
  {
    id: "essai",
    name: "Découverte",
    price: 5,
    duration: "7 jours",
    days: 7,
    months: 0,
    club: false,
    description: "Le premier module, pour commencer en confiance.",
    renewal: null,
  },
  {
    id: "mensuel",
    name: "Mensuel",
    price: 29,
    duration: "1 mois",
    days: 0,
    months: 1,
    club: true,
    description: "Apprenez à votre rythme, avec le Club IA.",
    renewal: 29,
  },
  {
    id: "flexible",
    name: "Flexible",
    price: 79,
    duration: "3 mois",
    days: 0,
    months: 3,
    club: false,
    description: "Prenez le temps de construire vos bases.",
    renewal: 15,
  },
  {
    id: "flexible_club",
    name: "Flexible + Club",
    price: 99,
    duration: "3 mois",
    days: 0,
    months: 3,
    club: true,
    description: "Le parcours et un espace pour échanger.",
    renewal: null,
  },
  {
    id: "integrale",
    name: "Intégrale",
    price: 119,
    duration: "12 mois",
    days: 0,
    months: 12,
    club: false,
    description: "Une année pour aller jusqu’au bout.",
    renewal: 10,
  },
  {
    id: "integrale_club",
    name: "Intégrale + Club",
    price: 149,
    duration: "12 mois",
    days: 0,
    months: 12,
    club: true,
    description: "Tout le parcours, avec la communauté.",
    renewal: null,
  },
] as const;
export const findPlan = (id: string) => plans.find((plan) => plan.id === id);
export const euro = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
export const dateLabel = (date: number) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);

export function expiresAt(id: string, now = Date.now()) {
  const plan = findPlan(id);
  if (!plan) throw new Error("Offre inconnue");
  const date = new Date(now);
  if (plan.days) return now + plan.days * 86_400_000;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + plan.months);
  const last = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
  ).getUTCDate();
  date.setUTCDate(Math.min(day, last));
  return date.getTime();
}
