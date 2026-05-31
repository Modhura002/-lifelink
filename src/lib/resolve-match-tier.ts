import { prisma } from '@/lib/prisma';

export async function resolveMatchTier(
  pinCode: string | null,
  city: string | null,
  country: string | null
): Promise<number> {
  const base = {
    role: 'DRIVER' as const,
    driverStatus: 'AVAILABLE' as const,
  };
  const normalize = (s: string | null | undefined) => s?.trim().toLowerCase() ?? '';

  const nPin = normalize(pinCode);
  const nCity = normalize(city);
  const nCountry = normalize(country);

  const availableDrivers = await prisma.user.findMany({
    where: base,
    select: { pinCode: true, city: true, country: true },
  });

  let bestTier = 0;

  for (const d of availableDrivers) {
    const dPin = normalize(d.pinCode);
    const dCity = normalize(d.city);
    const dCountry = normalize(d.country);

    // Tier 1: exact PIN + city + country
    if (dPin && dCity && dCountry && dPin === nPin && dCity === nCity && dCountry === nCountry) {
      return 1; // 1 is the best possible, return early
    }

    // Tier 2: PIN + country only
    if (dPin && dCountry && dPin === nPin && dCountry === nCountry) {
      if (bestTier === 0 || bestTier > 2) bestTier = 2;
    }
    
    // Tier 3: city + country only
    if (dCity && dCountry && dCity === nCity && dCountry === nCountry) {
      if (bestTier === 0 || bestTier > 3) bestTier = 3;
    }

    // Tier 4: country only (last resort)
    if (dCountry && dCountry === nCountry) {
      if (bestTier === 0 || bestTier > 4) bestTier = 4;
    }
  }

  return bestTier; // 0 means no drivers at all
}
