import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowRightLeft, Loader, AlertTriangle, TrendingUp } from 'lucide-react';
import { getCurrencyForecast } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'https://open.exchangerate-api.com/v6/latest';

const currencyNames: { [key: string]: string } = {
  AED: 'United Arab Emirates Dirham',
  AFN: 'Afghan Afghani',
  ALL: 'Albanian Lek',
  AMD: 'Armenian Dram',
  ANG: 'Netherlands Antillean Guilder',
  AOA: 'Angolan Kwanza',
  ARS: 'Argentine Peso',
  AUD: 'Australian Dollar',
  AWG: 'Aruban Florin',
  AZN: 'Azerbaijani Manat',
  BAM: 'Bosnia-Herzegovina Convertible Mark',
  BBD: 'Barbadian Dollar',
  BDT: 'Bangladeshi Taka',
  BGN: 'Bulgarian Lev',
  BHD: 'Bahraini Dinar',
  BIF: 'Burundian Franc',
  BMD: 'Bermudan Dollar',
  BND: 'Brunei Dollar',
  BOB: 'Bolivian Boliviano',
  BRL: 'Brazilian Real',
  BSD: 'Bahamian Dollar',
  BTN: 'Bhutanese Ngultrum',
  BWP: 'Botswanan Pula',
  BYN: 'Belarusian Ruble',
  BZD: 'Belize Dollar',
  CAD: 'Canadian Dollar',
  CDF: 'Congolese Franc',
  CHF: 'Swiss Franc',
  CLP: 'Chilean Peso',
  CNY: 'Chinese Yuan',
  COP: 'Colombian Peso',
  CRC: 'Costa Rican Colón',
  CUP: 'Cuban Peso',
  CVE: 'Cape Verdean Escudo',
  CZK: 'Czech Republic Koruna',
  DJF: 'Djiboutian Franc',
  DKK: 'Danish Krone',
  DOP: 'Dominican Peso',
  DZD: 'Algerian Dinar',
  EGP: 'Egyptian Pound',
  ERN: 'Eritrean Nakfa',
  ETB: 'Ethiopian Birr',
  EUR: 'Euro',
  FJD: 'Fijian Dollar',
  FKP: 'Falkland Islands Pound',
  GBP: 'British Pound Sterling',
  GEL: 'Georgian Lari',
  GGP: 'Guernsey Pound',
  GHS: 'Ghanaian Cedi',
  GIP: 'Gibraltar Pound',
  GMD: 'Gambian Dalasi',
  GNF: 'Guinean Franc',
  GTQ: 'Guatemalan Quetzal',
  GYD: 'Guyanaese Dollar',
  HKD: 'Hong Kong Dollar',
  HNL: 'Honduran Lempira',
  HRK: 'Croatian Kuna',
  HTG: 'Haitian Gourde',
  HUF: 'Hungarian Forint',
  IDR: 'Indonesian Rupiah',
  ILS: 'Israeli New Sheqel',
  IMP: 'Manx pound',
  INR: 'Indian Rupee',
  IQD: 'Iraqi Dinar',
  IRR: 'Iranian Rial',
  ISK: 'Icelandic Króna',
  JEP: 'Jersey Pound',
  JMD: 'Jamaican Dollar',
  JOD: 'Jordanian Dinar',
  JPY: 'Japanese Yen',
  KES: 'Kenyan Shilling',
  KGS: 'Kyrgystani Som',
  KHR: 'Cambodian Riel',
  KMF: 'Comorian Franc',
  KPW: 'North Korean Won',
  KRW: 'South Korean Won',
  KWD: 'Kuwaiti Dinar',
  KYD: 'Cayman Islands Dollar',
  KZT: 'Kazakhstani Tenge',
  LAK: 'Laotian Kip',
  LBP: 'Lebanese Pound',
  LKR: 'Sri Lankan Rupee',
  LRD: 'Liberian Dollar',
  LSL: 'Lesotho Loti',
  LYD: 'Libyan Dinar',
  MAD: 'Moroccan Dirham',
  MDL: 'Moldovan Leu',
  MGA: 'Malagasy Ariary',
  MKD: 'Macedonian Denar',
  MMK: 'Myanma Kyat',
  MNT: 'Mongolian Tugrik',
  MOP: 'Macanese Pataca',
  MRU: 'Mauritanian Ouguiya',
  MUR: 'Mauritian Rupee',
  MVR: 'Maldivian Rufiyaa',
  MWK: 'Malawian Kwacha',
  MXN: 'Mexican Peso',
  MYR: 'Malaysian Ringgit',
  MZN: 'Mozambican Metical',
  NAD: 'Namibian Dollar',
  NGN: 'Nigerian Naira',
  NIO: 'Nicaraguan Córdoba',
  NOK: 'Norwegian Krone',
  NPR: 'Nepalese Rupee',
  NZD: 'New Zealand Dollar',
  OMR: 'Omani Rial',
  PAB: 'Panamanian Balboa',
  PEN: 'Peruvian Nuevo Sol',
  PGK: 'Papua New Guinean Kina',
  PHP: 'Philippine Peso',
  PKR: 'Pakistani Rupee',
  PLN: 'Polish Zloty',
  PYG: 'Paraguayan Guarani',
  QAR: 'Qatari Rial',
  RON: 'Romanian Leu',
  RSD: 'Serbian Dinar',
  RUB: 'Russian Ruble',
  RWF: 'Rwandan Franc',
  SAR: 'Saudi Riyal',
  SBD: 'Solomon Islands Dollar',
  SCR: 'Seychellois Rupee',
  SDG: 'Sudanese Pound',
  SEK: 'Swedish Krona',
  SGD: 'Singapore Dollar',
  SHP: 'Saint Helena Pound',
  SLL: 'Sierra Leonean Leone',
  SOS: 'Somali Shilling',
  SRD: 'Surinamese Dollar',
  SSP: 'South Sudanese Pound',
  STN: 'São Tomé and Príncipe Dobra',
  SVC: 'Salvadoran Colón',
  SYP: 'Syrian Pound',
  SZL: 'Swazi Lilangeni',
  THB: 'Thai Baht',
  TJS: 'Tajikistani Somoni',
  TMT: 'Turkmenistani Manat',
  TND: 'Tunisian Dinar',
  TOP: 'Tongan Paʻanga',
  TRY: 'Turkish Lira',
  TTD: 'Trinidad and Tobago Dollar',
  TWD: 'New Taiwan Dollar',
  TZS: 'Tanzanian Shilling',
  UAH: 'Ukrainian Hryvnia',
  UGX: 'Ugandan Shilling',
  USD: 'United States Dollar',
  UYU: 'Uruguayan Peso',
  UZS: 'Uzbekistan Som',
  VES: 'Venezuelan Bolívar Soberano',
  VND: 'Vietnamese Dong',
  VUV: 'Vanuatu Vatu',
  WST: 'Samoan Tala',
  XAF: 'CFA Franc BEAC',
  XCD: 'East Caribbean Dollar',
  XDR: 'Special Drawing Rights',
  XOF: 'CFA Franc BCEAO',
  XPF: 'CFP Franc',
  YER: 'Yemeni Rial',
  ZAR: 'South African Rand',
  ZMW: 'Zambian Kwacha',
  ZWL: 'Zimbabwean Dollar'
};

interface RatesData {
  rates: Record<string, number>;
  time_last_update_utc: string;
}

const CurrencyConverter: React.FC = () => {
  const [amountFrom, setAmountFrom] = useState('100');
  const [amountTo, setAmountTo] = useState('');
  
  const [fromCurrency, setFromCurrency] = useState(() => {
    try {
      return localStorage.getItem('fromCurrency') || 'USD';
    } catch {
      return 'USD';
    }
  });
  const [toCurrency, setToCurrency] = useState(() => {
    try {
      return localStorage.getItem('toCurrency') || 'EUR';
    } catch {
      return 'EUR';
    }
  });
  
  const [ratesData, setRatesData] = useState<RatesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isForecastLoading, setIsForecastLoading] = useState(false);
  const [forecast, setForecast] = useState<string | null>(null);

  const [historicalData, setHistoricalData] = useState<any[] | null>(null);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data: RatesData = await response.json();
        setRatesData(data);
      } catch (e: any) {
        setError('Failed to fetch latest exchange rates. Please try again later.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('fromCurrency', fromCurrency);
      localStorage.setItem('toCurrency', toCurrency);
    } catch (error) {
      console.error("Failed to save currency preferences to localStorage:", error);
    }
  }, [fromCurrency, toCurrency]);

  const currencyOptions = useMemo(() => {
    if (!ratesData) return [];
    return Object.keys(ratesData.rates).sort();
  }, [ratesData]);

  const calculateConversion = useCallback((amount: string, from: string, to: string, direction: 'from' | 'to') => {
      if (!ratesData || !amount) {
          return '';
      }
      
      const inputAmount = parseFloat(amount);
      if (isNaN(inputAmount)) return '';

      const rateFrom = ratesData.rates[from];
      const rateTo = ratesData.rates[to];

      if (!rateFrom || !rateTo) return '';

      let result: number;
      if (direction === 'from') {
          const amountInUSD = inputAmount / rateFrom;
          result = amountInUSD * rateTo;
      } else {
          const amountInUSD = inputAmount / rateTo;
          result = amountInUSD * rateFrom;
      }

      return result.toFixed(2);

  }, [ratesData]);

  useEffect(() => {
      const result = calculateConversion(amountFrom, fromCurrency, toCurrency, 'from');
      setAmountTo(result);
  }, [amountFrom, fromCurrency, toCurrency, calculateConversion]);


  const handleAmountFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmountFrom(value);
  };

  const handleAmountToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmountTo(value);
      const result = calculateConversion(value, fromCurrency, toCurrency, 'to');
      setAmountFrom(result);
  };
  
  const swapCurrencies = () => {
    const oldFrom = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(oldFrom);
  };
  
  const exchangeRateText = useMemo(() => {
    if (!ratesData) return '...';
    const rateFrom = ratesData.rates[fromCurrency];
    const rateTo = ratesData.rates[toCurrency];
    if (!rateFrom || !rateTo) return 'N/A';
    const rate = rateTo / rateFrom;
    return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
  }, [fromCurrency, toCurrency, ratesData]);

  const handleGetForecast = async () => {
      if (!fromCurrency || !toCurrency) return;
      setIsForecastLoading(true);
      setForecast(null);
      const analysis = await getCurrencyForecast(fromCurrency, toCurrency);
      setForecast(analysis);
      setIsForecastLoading(false);
  };

  const fetchHistoricalData = useCallback(async () => {
    if (fromCurrency === toCurrency) {
        setHistoricalData(null);
        setChartError(null);
        return;
    }

    setIsChartLoading(true);
    setChartError(null);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const startStr = formatDate(startDate);
    const endStr = formatDate(endDate);

    try {
        const response = await fetch(`https://api.frankfurter.app/${startStr}..${endStr}?from=${fromCurrency}&to=${toCurrency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch historical data.');
        }
        const data = await response.json();

        if (!data.rates) {
            throw new Error('Historical data not available for the selected currency pair.');
        }

        const formattedData = Object.entries(data.rates)
            .map(([date, ratesObj]) => ({
                date,
                rate: (ratesObj as Record<string, number>)[toCurrency]
            }))
            .filter(item => item.rate !== undefined)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (formattedData.length < 2) {
             throw new Error('Not enough historical data to draw a chart.');
        }

        setHistoricalData(formattedData);
    } catch (e: any) {
        setChartError(e.message || 'Could not load chart data.');
        setHistoricalData(null);
    } finally {
        setIsChartLoading(false);
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
      fetchHistoricalData();
  }, [fetchHistoricalData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="animate-spin text-brand-primary" size={48} />
        <p className="mt-4 text-brand-text-secondary">Fetching latest exchange rates...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-64 bg-red-900/50 p-6 rounded-lg">
        <AlertTriangle className="text-red-400" size={48} />
        <p className="mt-4 font-semibold text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-brand-primary">Currency Converter</h2>
      <div className="bg-brand-surface/50 p-6 rounded-lg">
        <div className="text-center text-sm text-brand-text-secondary mb-4">
          Last updated: {ratesData ? new Date(ratesData.time_last_update_utc).toLocaleString() : 'N/A'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="amount-from" className="block text-sm font-medium text-brand-text-secondary mb-1">From</label>
            <input
              id="amount-from"
              type="number"
              value={amountFrom}
              onChange={handleAmountFromChange}
              className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg focus:ring-brand-primary focus:border-brand-primary"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full mt-2 bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              {currencyOptions.map(c => (
                <option key={c} value={c}>
                  {currencyNames[c] ? `${c} - ${currencyNames[c]}` : c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button onClick={swapCurrencies} className="p-3 bg-brand-primary/80 hover:bg-brand-primary rounded-full transition-transform transform hover:rotate-180">
              <ArrowRightLeft size={20} />
            </button>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="amount-to" className="block text-sm font-medium text-brand-text-secondary mb-1">To</label>
            <input
                id="amount-to"
                type="number"
                value={amountTo}
                onChange={handleAmountToChange}
                className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg focus:ring-brand-primary focus:border-brand-primary"
            />
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full mt-2 bg-gray-900/70 border-gray-600 rounded-md p-2 focus:ring-brand-primary focus:border-brand-primary"
            >
              {currencyOptions.map(c => (
                <option key={c} value={c}>
                  {currencyNames[c] ? `${c} - ${currencyNames[c]}` : c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-center font-mono text-brand-accent mt-6">
          {exchangeRateText}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleGetForecast}
            disabled={isForecastLoading}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-brand-primary/20 text-brand-primary rounded-lg hover:bg-brand-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isForecastLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <TrendingUp size={16} />
                <span>Get AI Analysis of Factors</span>
              </>
            )}
          </button>
          {forecast && !isForecastLoading && (
            <div className="mt-4 p-4 bg-brand-bg text-brand-text-secondary text-sm rounded-lg animate-fade-in-down text-left max-w-2xl mx-auto">
              <p className="font-semibold text-brand-text mb-2">General Analysis:</p>
              <p>{forecast}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-center">30-Day Trend: {fromCurrency} to {toCurrency}</h3>
        
        {isChartLoading && (
            <div className="flex items-center justify-center h-80 bg-brand-bg/30 rounded-lg">
                <Loader className="animate-spin text-brand-primary" size={32} />
            </div>
        )}

        {chartError && !isChartLoading && (
            <div className="flex flex-col items-center justify-center h-80 bg-red-900/30 text-red-300 p-4 rounded-lg">
                <AlertTriangle size={32} />
                <p className="mt-2 font-semibold">{chartError}</p>
            </div>
        )}

        {!isChartLoading && !chartError && historicalData && (
            <div className="h-80 w-full bg-brand-surface/50 p-4 rounded-lg">
                <ResponsiveContainer>
                    <LineChart data={historicalData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--color-text-secondary)" />
                        <YAxis
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(tick) => typeof tick === 'number' ? tick.toPrecision(4) : tick}
                            tick={{ fontSize: 12 }}
                            stroke="var(--color-text-secondary)"
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--color-surface)',
                                borderColor: 'var(--color-border)'
                            }}
                            formatter={(value: number) => [`1 ${fromCurrency} = ${value.toFixed(5)} ${toCurrency}`, 'Rate']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="var(--color-accent)"
                            strokeWidth={2}
                            dot={false}
                            name={`Exchange Rate`}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
      </div>

    </div>
  );
};

export default CurrencyConverter;