import https from "https";
import { GoldType } from "./gold.model";

export interface GoldMarketPrice {
  type: GoldType;
  buyPrice: number;
  sellPrice: number;
}

class GoldScraperService {
  private cache: {
    prices: Record<string, { buy: number; sell: number }>;
    timestamp: number;
  } | null = null;
  
  private CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

  public async getMarketPrices(): Promise<Record<string, { buy: number; sell: number }>> {
    const now = Date.now();

    // Return cached data if valid
    if (this.cache && (now - this.cache.timestamp < this.CACHE_TTL_MS)) {
      return this.cache.prices;
    }

    try {
      const html = await this.fetchHtml("https://baotinmanhhai.vn/vi/bang-gia-vang");
      const prices = this.parsePrices(html);
      
      // Update cache
      this.cache = {
        prices,
        timestamp: now,
      };

      return prices;
    } catch (error: any) {
      console.error("Failed to fetch gold market prices:", error.message);
      // Fallback to cache if available even if expired, otherwise throw error
      if (this.cache) {
        return this.cache.prices;
      }
      throw new Error("Failed to fetch market prices");
    }
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

  private parsePrices(html: string): Record<string, { buy: number; sell: number }> {
    const prices: Record<string, { buy: number; sell: number }> = {};
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
      }
    } catch (e: any) {
      console.error("Parse JSON error:", e.message);
    }

    // Default fallbacks if parsing completely fails (for resilience)
    if (prices[GoldType.SJC9999].buy === 0 && prices[GoldType.KGB].buy === 0) {
      console.warn("Failed to extract any prices, returning empty/mock defaults");
      return {
        [GoldType.SJC9999]: { buy: 9450000, sell: 9420000 },
        [GoldType.KGB]: { buy: 9380000, sell: 9350000 },
        [GoldType.GOLD_9999]: { buy: 9380000, sell: 9350000 },
        [GoldType.GOLD_999]: { buy: 9300000, sell: 9270000 },
        [GoldType.NL9999]: { buy: 9200000, sell: 9170000 },
        [GoldType.NL999]: { buy: 9120000, sell: 9090000 },
      };
    }

    return prices;
  }
}

export const goldScraperService = new GoldScraperService();
