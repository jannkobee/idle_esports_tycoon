import { AdPlacement, AdRewardResult } from '../../core/types/ad.types';

export interface IAdService {
  initialize(): Promise<void>;
  isAdAvailable(placement: AdPlacement): Promise<boolean>;
  showRewardedVideo(placement: AdPlacement): Promise<AdRewardResult>;
}
