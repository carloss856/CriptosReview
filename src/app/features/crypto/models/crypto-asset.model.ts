export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  threshold?: number;
}
