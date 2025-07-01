export interface CycleData {
  cycle: number;
  totalSupply: string;
  timestamp: string;
  totalFrozen: string;
}

export interface IssuanceData {
  cycle: number;
  issuance: number;
}

export interface CurrentCycleInfo {
  currentCycle: number;
  totalCycles: number;
}

// Fonction de lissage des dips (copiée de l'original)
function recursivelyRemoveDips(data: [number, number][], threshold = 0.2): [number, number][] {
  let hasChanges = true;
  let result = [...data];
  while (hasChanges) {
    hasChanges = false;
    const newResult: [number, number][] = [];
    for (let i = 0; i < result.length; i++) {
      if (i === 0) {
        newResult.push(result[i]);
        continue;
      }
      const prevValue = newResult[newResult.length - 1][1];
      const currentValue = result[i][1];
      const dipPercent = (prevValue - currentValue) / prevValue;
      if (dipPercent > threshold) {
        hasChanges = true;
      } else {
        newResult.push(result[i]);
      }
    }
    result = newResult;
  }
  return result;
}

export class TzktApiService {
  private static readonly BASE_URL = 'https://api.tzkt.io/v1';
  private static readonly KUKAI_URL = 'https://kukai.api.tzkt.io/v1';

  /**
   * Récupère le nombre total de cycles
   */
  static async getCyclesCount(): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/cycles/count`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching cycles count:', error);
      throw error;
    }
  }

  /**
   * Récupère les données cycliques pour le calcul de l'issuance
   */
  static async getCycleData(): Promise<CycleData[]> {
    const response = await fetch('https://kukai.api.tzkt.io/v1/statistics/cyclic?limit=10000');
    return response.json();
  }

  /**
   * Récupère les informations du cycle actuel
   */
  static async getCurrentCycleInfo(): Promise<CurrentCycleInfo> {
    try {
      const totalCycles = await this.getCyclesCount();
      return {
        currentCycle: totalCycles - 1,
        totalCycles
      };
    } catch (error) {
      console.error('Error fetching current cycle info:', error);
      throw error;
    }
  }

  /**
   * Calcule l'issuance basée sur les données cycliques
   */
  static processIssuanceData(data: any[]): {
    ratios: IssuanceData[];
    currentCycle: number;
  } {
    const ratios = [];
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const curr = data[i];

      const prevSupply = parseFloat(prev.totalSupply);
      const currSupply = parseFloat(curr.totalSupply);

      const supplyDiff = currSupply - prevSupply;
      const growthRate = supplyDiff / prevSupply;

      const timeDiffSec = (new Date(curr.timestamp) - new Date(prev.timestamp)) / 1000;

      const secondsInYear = 365.25 * 24 * 60 * 60;
      const annualized = (growthRate * (secondsInYear / timeDiffSec)) * 100;

      ratios.push({
        cycle: curr.cycle,
        issuance: annualized
      });
    }

    return {
      ratios,
      currentCycle: data[data.length - 1].cycle
    };
  }

  /**
   * Calcule le staking basé sur les données cycliques
   */
  static processStakingData(data: any[]): {
    ratios: { cycle: number; staking: number }[];
    currentCycle: number;
  } {
    return {
      ratios: data.slice(1).map(curr => ({
        cycle: curr.cycle,
        staking: parseFloat(curr.totalFrozen) / parseFloat(curr.totalSupply)
      })),
      currentCycle: data[data.length - 1].cycle
    };
  }
} 