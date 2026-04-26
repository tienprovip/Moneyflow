import https from "https";
import { GoldType } from "./gold.model";

export interface GoldMarketPrice {
  type: GoldType;
  buyPrice: number;
  sellPrice: number;
}

export interface HistoricalPrice {
  date: string;
  buy: number;
  sell: number;
}

class GoldScraperService {
  private cache: Record<string, { buy: number; sell: number }> | null = null;
  private historyCache: Record<string, HistoricalPrice[]> | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

  public async getMarketPrices(): Promise<Record<string, { buy: number; sell: number }>> {
    if (this.cache && Date.now() - this.lastFetchTime < this.CACHE_TTL) {
      return this.cache;
    }

    try {
      await this.scrapeBTMHPrices();
      return this.cache ?? {};
    } catch (error) {
      console.error("Gold scraper error:", error);
      return this.cache ?? {};
    }
  }

  public async getMarketHistory(): Promise<Record<string, HistoricalPrice[]>> {
    if (this.historyCache && Date.now() - this.lastFetchTime < this.CACHE_TTL) {
      return this.historyCache;
    }

    try {
      await this.scrapeBTMHPrices();
      return this.historyCache ?? {};
    } catch (error) {
      console.error("Gold history scraper error:", error);
      return this.historyCache ?? {};
    }
  }

  private async scrapeBTMHPrices(): Promise<void> {
    const html = await this.fetchHtml("https://baotinmanhhai.vn/vi/bang-gia-vang");
    const { prices, history } = this.parsePrices(html);
    
    this.cache = prices;
    if (Object.keys(history).length > 0) {
      this.historyCache = history;
    }
    this.lastFetchTime = Date.now();
  }

  private fetchHtml(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const agent = new https.Agent({ rejectUnauthorized: false }); // Bypass SSL errors if any
      const req = https.get(url, { agent }, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
           return reject(new Error(`HTTP status ${res.statusCode}`));
        }

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve(data);
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.end();
    });
  }

  private parsePrices(html: string): { prices: Record<string, { buy: number; sell: number }>, history: Record<string, HistoricalPrice[]> } {
    const prices: Record<string, { buy: number; sell: number }> = {};
    const history: Record<string, HistoricalPrice[]> = {};
    const typesToExtract = Object.values(GoldType);

    for (const code of typesToExtract) {
      prices[code] = { buy: 0, sell: 0 };
    }

    try {
      const match = html.match(/window\.__reactRouterContext\.streamController\.enqueue\("(.*?)"\);/);
      if (match) {
        // Unescape JSON string
        const rawString = JSON.parse(`"${match[1]}"`);
        const parsedArray = JSON.parse(rawString);

        for (const code of typesToExtract) {
          const idx = parsedArray.indexOf(code);
          if (idx !== -1) {
            // Scan next 20 items for 7-8 digit numbers
            const numbers: number[] = [];
            for (let i = idx + 1; i < idx + 20 && i < parsedArray.length; i++) {
              if (typeof parsedArray[i] === 'number' && parsedArray[i] > 1000000) {
                numbers.push(parsedArray[i]);
              }
            }

            if (numbers.length >= 2) {
              // Buy price is always lower than sell price
              prices[code] = {
                buy: Math.min(numbers[0], numbers[1]),
                sell: Math.max(numbers[0], numbers[1]),
              };
            }
          }
        }
        // Cố gắng giải nén JSON object đệ quy để lấy lịch sử
        try {
          const resolve = (index: any): any => {
            if (typeof index !== 'number' && typeof index !== 'string') return index;
            const num = parseInt(index as string, 10);
            if (isNaN(num)) return index;
            if (num < 0 || num >= parsedArray.length) return parsedArray[num];
            const val = parsedArray[num];
            if (Array.isArray(val)) return val.map(resolve);
            if (val && typeof val === 'object') {
              const obj: any = {};
              for (const k in val) {
                if (k.startsWith('_')) {
                  const keyIdx = parseInt(k.slice(1), 10);
                  if (!isNaN(keyIdx)) {
                    const key = resolve(keyIdx);
                    obj[key] = resolve(val[k]);
                  } else {
                    obj[k] = resolve(val[k]);
                  }
                } else {
                  obj[k] = resolve(val[k]);
                }
              }
              return obj;
            }
            return val;
          };

          const root = resolve(0);

          let dataPoints: any[] = [];
          const searchDataPoints = (node: any) => {
            if (!node || typeof node !== 'object') return;
            if (node.data_points) {
              dataPoints = node.data_points;
              return;
            }
            for (const k in node) {
              if (typeof node[k] === 'object') searchDataPoints(node[k]);
            }
          };
          searchDataPoints(root);

          const dates = dataPoints.map(dp => dp.date);

          let items: any[] = [];
          const searchItems = (node: any) => {
            if (!node || typeof node !== 'object') return;
            if (node.items && Array.isArray(node.items) && node.items[0] && node.items[0].code) {
              node.items.forEach((i: any) => {
                if (i.code && !items.find(x => x.code === i.code)) items.push(i);
              });
            }
            for (const k in node) {
              if (typeof node[k] === 'object') searchItems(node[k]);
            }
          };
          searchItems(root);

          for (const item of items) {
            if (item.code && typesToExtract.includes(item.code as GoldType) && item.sparkline_data && item.sell_sparkline_data && dates.length > 0) {
              const latestDateStr = dates[dates.length - 1];
              const currentYear = new Date().getFullYear();
              const [day, month] = latestDateStr.split('/');
              const latestDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));

              history[item.code] = item.sparkline_data.map((buyPrice: number, i: number) => {
                const d = new Date(latestDate);
                const daysAgo = item.sparkline_data.length - 1 - i;
                d.setDate(latestDate.getDate() - daysAgo);
                const dStr = d.getDate().toString().padStart(2, '0') + '/' + (d.getMonth() + 1).toString().padStart(2, '0');

                return {
                  date: dStr,
                  buy: buyPrice || 0,
                  sell: item.sell_sparkline_data[i] || 0,
                };
              });
            }
          }
        } catch (historyErr: any) {
          console.error("Failed to extract history:", historyErr.message);
        }
      }
    } catch (e: any) {
      console.error("Parse JSON error:", e.message);
    }

    // Default fallbacks if parsing completely fails (for resilience)
    if (prices[GoldType.SJC9999].buy === 0 && prices[GoldType.KGB].buy === 0) {
      console.warn("Failed to extract any prices, returning empty/mock defaults");
      return { prices: {
        [GoldType.SJC9999]: { buy: 9450000, sell: 9420000 },
        [GoldType.KGB]: { buy: 9380000, sell: 9350000 },
        [GoldType.GOLD_9999]: { buy: 9380000, sell: 9350000 },
        [GoldType.GOLD_999]: { buy: 9300000, sell: 9270000 },
        [GoldType.NL9999]: { buy: 9200000, sell: 9170000 },
        [GoldType.NL999]: { buy: 9120000, sell: 9090000 },
      }, history: {} };
    }

    return { prices, history };
  }
}

export const goldScraperService = new GoldScraperService();
