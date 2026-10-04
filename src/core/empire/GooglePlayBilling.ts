import { VIP_ITEMS, type VipItemId } from './EmpireService';

export interface VerifiedGooglePlayEntitlement {
  productId: string;
  verified: boolean;
}

declare global {
  interface Window {
    DynastyGooglePlayBilling?: {
      purchase: (productId: string) => Promise<VerifiedGooglePlayEntitlement>;
    };
  }
}

export function cosmeticProductId(id: VipItemId): string {
  return `com.dynasty.esports.cosmetic.${id}`;
}

export function googlePlayBillingAvailable(): boolean {
  return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent) &&
    typeof window !== 'undefined' && typeof window.DynastyGooglePlayBilling?.purchase === 'function';
}

// The Android host must verify the Play purchase token with its server before
// returning verified=true. A plain web browser never gets this checkout path.
export async function purchaseGooglePlayCosmetic(id: VipItemId): Promise<boolean> {
  if (!googlePlayBillingAvailable() || !VIP_ITEMS.some(item => item.id === id)) return false;
  const productId = cosmeticProductId(id);
  const entitlement = await window.DynastyGooglePlayBilling!.purchase(productId);
  return entitlement.verified === true && entitlement.productId === productId;
}
