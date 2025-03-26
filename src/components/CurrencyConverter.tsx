import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import {
  FiArrowRight,
  FiTrendingUp,
  FiDollarSign,
  FiRefreshCw,
} from "react-icons/fi";
import {
  CurrencyRate,
  ExchangeRateResponse,
  LatestRatesResponse,
} from "../types";

const CurrencyConverter: React.FC = () => {
  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [convertedAmount, setConvertedAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [topCurrencies, setTopCurrencies] = useState<CurrencyRate[]>([]);

  // List of popular currencies
  const currencies: string[] = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "MXN",
    "SGD",
    "HKD",
    "NOK",
    "KRW",
    "TRY",
    "INR",
    "BRL",
    "ZAR",
    "RUB",
    "AED",
    "SAR",
    "MYR",
    "THB",
  ];

  // Fetch exchange rates
  const fetchExchangeRate = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey: string = import.meta.env.VITE_API_KEY || "";
      const response = await axios.get<ExchangeRateResponse>(
        `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}/${amount}`
      );

      setExchangeRate(response.data.conversion_rate);
      setConvertedAmount(response.data.conversion_result);
      setLastUpdated(new Date().toLocaleTimeString());

      // Fetch top currencies by value (compared to USD)
      const topCurrenciesResponse = await axios.get<LatestRatesResponse>(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      );

      const rates = topCurrenciesResponse.data.conversion_rates;
      const topCurrenciesList: CurrencyRate[] = Object.entries(rates)
        .filter(([currency]) => currencies.includes(currency))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([currency, rate]) => ({ currency, rate }));

      setTopCurrencies(topCurrenciesList);
    } catch (err) {
      const error = err as AxiosError;
      console.error("Error fetching exchange rate:", error);
      setError("Failed to fetch exchange rates. Please try again later.");
      // Fallback data
      setExchangeRate(0.85);
      setConvertedAmount(amount * 0.85);
      setLastUpdated(new Date().toLocaleTimeString());
      setTopCurrencies([
        { currency: "KWD", rate: 0.31 },
        { currency: "BHD", rate: 0.38 },
        { currency: "OMR", rate: 0.38 },
        { currency: "JOD", rate: 0.71 },
        { currency: "GBP", rate: 0.77 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromCurrency, toCurrency]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseFloat(e.target.value);
    setAmount(isNaN(value) ? 0 : value);
  };

  const handleFromCurrencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setFromCurrency(e.target.value);
  };

  const handleToCurrencyChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setToCurrency(e.target.value);
  };

  const swapCurrencies = (): void => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatCurrency = (value: number, currency: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 bg-white rounded-2xl p-4 md:p-6">
            <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-800 to-blue-800 mb-2">
              Currency FX
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              Real-time exchange rates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            {/* Main Converter Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-dark mb-2 sm:mb-0">
                    Currency FX
                  </h2>
                  <div className="flex items-center text-xs md:text-sm text-gray-500">
                    <FiRefreshCw className="mr-1" />
                    <span>Updated: {lastUpdated}</span>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 md:p-4 mb-4 md:mb-6">
                    <div className="flex">
                      <div className="ml-3">
                        <p className="text-xs md:text-sm text-red-700">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="amount"
                        className="block text-xs md:text-sm font-medium text-gray-700 mb-1"
                      >
                        Amount
                      </label>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
                    <div className="flex-1">
                      <label
                        htmlFor="fromCurrency"
                        className="block text-xs md:text-sm font-medium text-gray-700 mb-1"
                      >
                        From
                      </label>
                      <select
                        id="fromCurrency"
                        value={fromCurrency}
                        onChange={handleFromCurrencyChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                      >
                        {currencies.map((currency) => (
                          <option key={`from-${currency}`} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-center mt-0 sm:mt-6">
                      <button
                        onClick={swapCurrencies}
                        className="p-2 md:p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label="Swap currencies"
                      >
                        <FiArrowRight className="text-gray-600" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <label
                        htmlFor="toCurrency"
                        className="block text-xs md:text-sm font-medium text-gray-700 mb-1"
                      >
                        To
                      </label>
                      <select
                        id="toCurrency"
                        value={toCurrency}
                        onChange={handleToCurrencyChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm md:text-base"
                      >
                        {currencies.map((currency) => (
                          <option key={`to-${currency}`} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-8">
                    <div className="bg-gray-50 p-4 md:p-6 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs md:text-sm text-gray-500 mb-1">
                          Conversion Result
                        </p>
                        {isLoading ? (
                          <div className="animate-pulse flex justify-center">
                            <div className="h-6 md:h-8 w-32 md:w-48 bg-gray-200 rounded"></div>
                          </div>
                        ) : (
                          <h3 className="text-xl md:text-3xl font-bold text-dark">
                            {formatCurrency(convertedAmount, toCurrency)}
                          </h3>
                        )}
                        <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500">
                          1 {fromCurrency} = {exchangeRate.toFixed(6)}{" "}
                          {toCurrency}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Currencies Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center mb-4 md:mb-6">
                  <FiTrendingUp className="text-secondary text-lg md:text-xl mr-2" />
                  <h2 className="text-xl md:text-2xl font-semibold text-dark">
                    Top Currencies
                  </h2>
                </div>

                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">
                  Highest value currencies compared to USD
                </p>

                <div className="space-y-2 md:space-y-4">
                  {topCurrencies.map((item, index) => (
                    <div
                      key={item.currency}
                      className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <span className="text-xs md:text-sm font-medium text-gray-500 mr-2">
                          {index + 1}.
                        </span>
                        <span className="text-sm md:text-base font-medium text-dark">
                          {item.currency}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FiDollarSign className="text-green-500 mr-1 text-sm md:text-base" />
                        <span className="text-sm md:text-base font-semibold">
                          {item.rate.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 md:mt-8">
                  <h3 className="text-sm md:text-lg font-semibold text-dark mb-2 md:mb-3">
                    Common Currencies
                  </h3>
                  <div className="grid grid-cols-3 gap-1 md:gap-2">
                    {["USD", "EUR", "GBP", "JPY", "CAD", "AUD"].map(
                      (currency) => (
                        <button
                          key={`quick-${currency}`}
                          onClick={() => {
                            setFromCurrency("USD");
                            setToCurrency(currency);
                          }}
                          className="px-2 py-1 md:px-3 md:py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs md:text-sm font-medium transition-colors"
                        >
                          {currency}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs md:text-sm text-gray-500">
            <p>Exchange rates are for demonstration purposes only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
