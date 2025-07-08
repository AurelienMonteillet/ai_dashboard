'use client';

import { useEffect, useRef } from 'react';

/**
 * Interface for chart data points
 * x: cycle number
 * y: value (staking ratio or issuance rate)
 */
interface ChartData {
  x: number;
  y: number;
}

/**
 * Interface for the TezosCharts global object
 */
interface TezosChartsGlobal {
  setCurrentCycle: (cycle: number) => void;
  createHistoricalChart: (
    containerId: string,
    title: string,
    data: ChartData[],
    dataMapper: (d: ChartData) => ChartData,
    tickPositions: number[]
  ) => void;
}

/**
 * Extend Window interface to include TezosCharts
 */
declare global {
  interface Window {
    TezosCharts: TezosChartsGlobal;
  }
}

/**
 * Props interface for the SimulationChart component
 * @property {string} title - Chart title
 * @property {any[]} historicalData - Array of historical data points
 * @property {Function} dataMapper - Function to transform data points into ChartData format
 * @property {number[]} tickPositions - Array of x-axis tick positions for protocol upgrades
 * @property {string} containerId - DOM element ID for the chart
 * @property {number} currentCycle - Current Tezos cycle number
 * @property {number} yMax - Maximum value for y-axis
 * @property {string} tooltipLabel - Label to display in tooltip
 * @property {number} simulationValue - Current simulation value
 * @property {Function} onSimulationChange - Callback for simulation value changes
 * @property {boolean} isInteractive - Whether the chart allows user interaction
 */
interface SimulationChartProps {
  title: string;
  historicalData: any[];
  dataMapper: (d: any) => ChartData;
  tickPositions: number[];
  containerId: string;
  currentCycle: number;
  yMax: number;
  tooltipLabel: string;
  simulationValue: number;
  onSimulationChange?: (value: number) => void;
  isInteractive?: boolean;
}

/**
 * SimulationChart Component
 * Renders a Highcharts chart combining historical data with simulation capabilities
 * Uses TezosCharts global object for chart creation and management
 * Supports both historical visualization and interactive simulation
 */
const SimulationChart = ({
  title,
  historicalData,
  dataMapper,
  tickPositions,
  containerId,
  currentCycle,
  yMax,
  tooltipLabel,
  simulationValue,
  onSimulationChange,
  isInteractive = false
}: SimulationChartProps) => {
  useEffect(() => {
    // Ensure TezosCharts is available in browser environment
    if (typeof window === 'undefined' || !window.TezosCharts) return;

    // Filter historical data up to current cycle
    const historicalSeries = historicalData.map(dataMapper).filter(point => point.x <= currentCycle);
    const lastHistoricalPoint = historicalSeries[historicalSeries.length - 1];
    
    // Create dense series of points for smooth simulation line
    const numberOfPoints = 100;
    const cycleRange = 400;
    const stepSize = cycleRange / (numberOfPoints - 1);
    
    // Generate simulation data points with constant value
    const simulationSeries = Array.from({ length: numberOfPoints }, (_, index) => ({
      x: currentCycle + index * stepSize,
      y: simulationValue
    }));

    // Ensure smooth transition between historical and simulation data
    simulationSeries[0] = {
      ...lastHistoricalPoint
    };

    // Initialize and create chart using TezosCharts global object
    window.TezosCharts.setCurrentCycle(currentCycle);
    window.TezosCharts.createHistoricalChart(
      containerId,
      title,
      [...historicalSeries, ...simulationSeries],
      (d: ChartData) => ({ x: d.x, y: d.y }),
      tickPositions
    );
  }, [title, historicalData, dataMapper, currentCycle, yMax, tooltipLabel, isInteractive, containerId, onSimulationChange, simulationValue]);

  return (
    <figure className="relative w-full max-w-[800px] h-[450px] p-6 border border-white/5 mb-6 box-border block bg-white/[0.02] rounded-xl backdrop-blur-md">
      <div id={containerId} />
    </figure>
  );
};

export default SimulationChart; 