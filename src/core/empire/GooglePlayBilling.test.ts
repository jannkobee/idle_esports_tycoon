import { describe, expect, it } from 'vitest';
import { cosmeticProductId, googlePlayBillingAvailable, purchaseGooglePlayCosmetic } from './GooglePlayBilling';

describe('Google Play cosmetic boundary', () => {
  it('uses a stable Play product ID', () => {
    expect(cosmeticProductId('wall_cyberpunk')).toBe('com.dynasty.esports.cosmetic.wall_cyberpunk');
  });

  it('never offers checkout in a non-Android test browser', async () => {
    expect(googlePlayBillingAvailable()).toBe(false);
    expect(await purchaseGooglePlayCosmetic('wall_cyberpunk')).toBe(false);
  });
});
