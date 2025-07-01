'use client';

import { useState, useEffect } from 'react';

interface SimulatorData {
  stakingRatio: number;
  staticRate: number;
  dynamicRate: number;
  totalRate: number;
  minRate: number;
  maxRate: number;
  cycle: number;
}

export default function AdaptiveIssuanceSimulator() {
  const [stakingRatio, setStakingRatio] = useState(50);
  const [currentCycle, setCurrentCycle] = useState(748);
  const [simulationData, setSimulationData] = useState<SimulatorData[]>([]);

  // Calcul des taux d'issuance adaptive
  const calculateAdaptiveIssuance = (ratio: number, cycle: number): SimulatorData => {
    // Périodes de transition
    const initialPeriod = 10; // cycles 748-758
    const transitionPeriod = 50; // cycles 758-808
    const finalPeriod = 808; // après cycle 808

    let minRate, maxRate;

    if (cycle < 748 + initialPeriod) {
      // Période initiale : taux proches du taux actuel (~5.5%)
      minRate = 5.0;
      maxRate = 6.0;
    } else if (cycle < 748 + initialPeriod + transitionPeriod) {
      // Période de transition : élargissement linéaire
      const progress = (cycle - (748 + initialPeriod)) / transitionPeriod;
      minRate = 5.0 - (progress * 2.5); // 5.0% -> 2.5%
      maxRate = 6.0 + (progress * 2.5); // 6.0% -> 8.5%
    } else {
      // Période finale : bornes définitives
      minRate = 2.5;
      maxRate = 8.5;
    }

    // Taux statique (Dutch auction)
    const staticRate = Math.max(0, 10 - (ratio * 0.15));

    // Taux dynamique (ajustement vers la cible 50%)
    let dynamicRate = 0;
    if (ratio < 48) {
      dynamicRate = (48 - ratio) * 0.1; // Augmentation si < 48%
    } else if (ratio > 52) {
      dynamicRate = (ratio - 52) * -0.1; // Diminution si > 52%
    }

    // Taux total avec clipping
    let totalRate = staticRate + dynamicRate;
    totalRate = Math.max(minRate, Math.min(maxRate, totalRate));

    return {
      stakingRatio: ratio,
      staticRate,
      dynamicRate,
      totalRate,
      minRate,
      maxRate,
      cycle
    };
  };

  // Générer données de simulation
  useEffect(() => {
    const data: SimulatorData[] = [];
    for (let cycle = 748; cycle <= 850; cycle++) {
      data.push(calculateAdaptiveIssuance(stakingRatio, cycle));
    }
    setSimulationData(data);
  }, [stakingRatio]);

  const currentData = calculateAdaptiveIssuance(stakingRatio, currentCycle);

  return (
    <div className="max-w-xl mx-auto bg-gradient-to-r from-tezos-blue to-tezos-purple rounded-2xl shadow-2xl p-8 text-center">
      <h2 className="text-2xl font-bold text-white mb-2">Adaptive Issuance Simulator</h2>
      <p className="text-[#BEDFFF] mb-6">Move the slider to see how staking impacts issuance</p>
      <div className="flex justify-center mt-6 mb-4">
        <input
          type="range"
          min="20"
          max="80"
          value={stakingRatio}
          onChange={(e) => setStakingRatio(Number(e.target.value))}
          className="slider w-80 mx-auto"
        />
      </div>
      <div className="text-white text-lg mt-2">Staking Ratio: <span className="font-bold">{stakingRatio}%</span></div>
      <div className="flex flex-col md:flex-row justify-center gap-8 mb-6">
        <div>
          <div className="text-[#AEB1B9] text-xs">Static Rate</div>
          <div className="text-2xl font-bold text-[#3B82F6]">{currentData.staticRate.toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-[#AEB1B9] text-xs">Dynamic Rate</div>
          <div className="text-2xl font-bold text-[#f59e0b]">{currentData.dynamicRate.toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-[#AEB1B9] text-xs">Total Issuance</div>
          <div className="text-2xl font-bold text-white">{currentData.totalRate.toFixed(2)}%</div>
        </div>
      </div>
      <div className="text-[#AEB1B9] text-xs mb-4">
        Target: 50% &nbsp;|&nbsp; Min: 0.05% &nbsp;|&nbsp; Max: 5%
      </div>
      <p className="text-[#BEDFFF] text-sm mt-6">
        The more tez are staked (locked as bonds), the lower the issuance. If staking drops below the target, issuance increases to incentivize more staking.
      </p>
    </div>
  );
} 