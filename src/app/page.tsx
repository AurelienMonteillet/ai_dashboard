"use client";
import { useEffect, useState } from 'react';
import HistoricalChart from './components/HistoricalChart';
import { TzktApiService } from './services/tzkt-api';

export default function HomePage() {
  const [issuanceData, setIssuanceData] = useState<any[]>([]);
  const [stakingData, setStakingData] = useState<any[]>([]);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cycleData = await TzktApiService.getCycleData();
        const processedIssuance = TzktApiService.processIssuanceData(cycleData);
        const processedStaking = TzktApiService.processStakingData(cycleData);
        setIssuanceData(processedIssuance.ratios);
        setStakingData(processedStaking.ratios);
        setCurrentCycle(processedIssuance.currentCycle);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-white text-center p-8">Chargement des données...</div>;
  }
  if (error) {
    return <div className="text-red-500 text-center p-8">Erreur : {error}</div>;
  }

  return (
    <div className="container scrollable-content">
      <div className="row">
        <div className="col-lg-6">
          <figure className="highcharts-figure chart-placeholder">
            <div id="stakingh">
              <HistoricalChart
                title="Staked since genesis"
                data={stakingData}
                dataMapper={d => ({ x: d.cycle, y: d.staking * 100 })}
                tickPositions={[428, 743, 823, currentCycle]}
                containerId="stakingh"
                currentCycle={currentCycle}
                yMax={50}
                tooltipLabel="Staking (frozen tez)"
              />
            </div>
          </figure>
        </div>
        <div className="col-lg-6">
          <figure className="highcharts-figure chart-placeholder">
            <div id="issuanceh">
              <HistoricalChart
                title="Issuance since genesis"
                data={issuanceData}
                dataMapper={d => ({ x: d.cycle, y: d.issuance })}
                tickPositions={[428, 743, 823, currentCycle]}
                containerId="issuanceh"
                currentCycle={currentCycle}
                yMax={11}
                tooltipLabel="Issuance"
              />
            </div>
          </figure>
        </div>
      </div>
    </div>
  );
}
