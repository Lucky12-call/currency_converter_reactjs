export interface CurrencyRate {
  currency: string;
  rate: number;
}

export interface ExchangeRateResponse {
  conversion_rate: number;
  conversion_result: number;
  base_code: string;
  target_code: string;
}

export interface LatestRatesResponse {
  conversion_rates: Record<string, number>;
}
