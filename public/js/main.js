/**
 * Core constants for Tezos adaptive issuance calculations
 * TRANSITION_PERIOD: Number of cycles for transition between initial and final values
 * INITIAL_PERIOD: Number of cycles before transition begins
 * AI_ACTIVATION_CYCLE: Cycle when adaptive issuance was activated
 */
const TRANSITION_PERIOD = 50;
const INITIAL_PERIOD = 10;
const AI_ACTIVATION_CYCLE = 748;
let currentCycle, forecasted, tmp = 0, tmp1;

/**
 * Computes value transition between initial and final states
 * Used for both minimum and maximum ratio calculations
 * @param {number} cycle - Current cycle number
 * @param {number} initialValue - Starting value before transition
 * @param {number} finalValue - Target value after transition
 * @returns {number} Computed value for the given cycle
 */
function computeExtremum(cycle, initialValue, finalValue) {
  const initialLimit = AI_ACTIVATION_CYCLE + INITIAL_PERIOD;
  const transLimit = initialLimit + TRANSITION_PERIOD + 1;
  
  if (cycle <= initialLimit) return initialValue;
  if (cycle >= transLimit) return finalValue;
  
  const t = cycle - initialLimit;
  return (t * (finalValue - initialValue) / (TRANSITION_PERIOD + 1)) + initialValue;
}

/**
 * Core ratio calculation functions
 * minimumRatio: Computes minimum staking ratio (0.045 to 0.0025)
 * maximumRatio: Computes maximum staking ratio (0.055 to 0.1)
 * stakedRatio: Returns current staking ratio
 * clip: Utility to clamp value between min and max
 */
function minimumRatio(cycle) { return computeExtremum(cycle, 0.045, 0.0025); }
function maximumRatio(cycle) { return computeExtremum(cycle, 0.055, 0.1); }
function stakedRatio(cycle, value) { return value; }
function clip(value, minValue, maxValue) { return Math.max(minValue, Math.min(value, maxValue)); }

/**
 * Calculates the static issuance rate based on staking ratio
 * Uses inverse square relationship: 1/1600 * (1/value^2)
 * @param {number} cycle - Current cycle
 * @param {number} value - Current staking ratio
 * @returns {number} Clamped static rate
 */
function staticRate(cycle, value) {
  const staticRateValue = 1 / 1600 * (1 / (value ** 2));
  return clip(staticRateValue, minimumRatio(cycle), maximumRatio(cycle));
}

/**
 * Applies bonus rate based on distance from target ratio
 * Implements the bonus mechanism of adaptive issuance
 * @param {number} cycle - Current cycle
 * @param {number} value - Current staking ratio
 * @param {number} targetRatio - Target staking ratio (0.5)
 * @param {number} tmp1 - Previous staking ratio
 * @returns {number} Computed bonus rate
 */
function applyBonus(cycle, value, targetRatio, tmp1) {
  if (cycle <= AI_ACTIVATION_CYCLE) {
    tmp = 0;
    return 0;
  }
  
  const previousBonus = tmp;
  const stakedRatioValue = tmp1;
  const ratioMax = maximumRatio(cycle + 1);
  const staticRateValue = staticRate(cycle, value);
  const staticRateDistToMax = ratioMax - staticRateValue;
  const udist = Math.max(0, Math.abs(stakedRatioValue - targetRatio) - 0.02);
  const dist = stakedRatioValue >= targetRatio ? -udist : udist;
  const maxNewBonus = Math.min(staticRateDistToMax, 0.05);
  const newBonus = previousBonus + dist * 0.01 * (cycle==858)?(245760 / 86400):1;
  const res = clip(newBonus, 0, maxNewBonus);
  
  tmp = res;
  return res;
}

/**
 * Dynamic rate calculation wrapper
 * Calls applyBonus with fixed target ratio of 0.5
 */
function dyn(cycle, value, tmp1) {
  return applyBonus(cycle, value, 0.5, tmp1);
}

/**
 * Calculates adaptive maximum rate based on staking ratio
 * Implements quadratic relationship for smooth transitions
 * @param {number} r - Current staking ratio
 * @returns {number} Adaptive maximum rate
 */
function adaptiveMaximum(r) {
  if (r >= 0.5) return 0.01;
  if (r <= 0.05) return 0.1;
  
  const y = (1 + 9 * Math.pow((50 - 100 * r) / 42, 2)) / 100;
  return clip(y, 0.01, 0.1);
}

/**
 * Calculates final issuance rate for Quebec protocol
 * Combines static rate, bonus, and applies adaptive maximum
 * @param {number} cycle - Current cycle
 * @param {number} value - Current staking ratio
 * @returns {number} Final issuance rate as percentage
 */
function issuanceRateQ(cycle, value) {
  const adjustedCycle = cycle - 2;
  tmp1 = value;
  const staticRateRatio = staticRate(adjustedCycle, value);
  const bonus = dyn(adjustedCycle, value, tmp1);
  const ratioMin = minimumRatio(adjustedCycle);
  const ratioMax = cycle >= 823 ? 
    Math.min(maximumRatio(adjustedCycle), adaptiveMaximum(value)) : 
    maximumRatio(adjustedCycle);
  
  const totalRate = staticRateRatio + bonus;
  return clip(totalRate, ratioMin, ratioMax) * 100;
}

/**
 * Creates interactive Highcharts chart for historical data
 * Supports both issuance and staking ratio visualizations
 * @param {string} containerId - DOM element ID for chart
 * @param {string} title - Chart title
 * @param {Array} data - Historical data points
 * @param {Function} dataMapper - Function to transform data points
 * @param {Array} tickPositions - X-axis tick positions
 */
function createHistoricalChart(containerId, title, data, dataMapper, tickPositions) {
  const chartConfig = {
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
      events: {
        load: function() { 
          this.customGroup = this.renderer.g('custom-lines').add();
          this.addCustomLines = function() {
            this.customGroup.destroy();
            this.customGroup = this.renderer.g('custom-lines').add();
            
            const chartData = data.map(dataMapper);
            [428, 743, 823, currentCycle].forEach(position => {
              const dataPoint = chartData.find(point => point.x === position);
              if (dataPoint) {
                const xPixel = this.xAxis[0].toPixels(position);
                const yPixel = this.yAxis[0].toPixels(dataPoint.y);
                const bottomPixel = this.plotTop + this.plotHeight;
                
                if (yPixel < bottomPixel) {
                  this.renderer.path([
                    'M', xPixel, bottomPixel,
                    'L', xPixel, yPixel
                  ])
                  .attr({
                    'stroke-width': 1,
                    stroke: '#ffffff',
                    'stroke-dasharray': '5,5'
                  })
                  .add(this.customGroup);
                }
              }
            });
          };
          
          this.addCustomLines();
        },
        redraw: function() {
          if (this.addCustomLines) {
            this.addCustomLines();
          }
        }
      }
    },
    title: {
      text: title,
      style: { color: '#ffffff' }
    },
    xAxis: {
      lineColor: '#ffffff',
      labels: {
        formatter: function() {
          if (this.value === 428) return 'Hangzhou';
          if (this.value === 743) return 'P';
          if (this.value === 823) return 'Q';
          if (this.value === currentCycle) return 'Now';
          return '';
        },
        style: { color: '#ffffff' }
      },
      title: { text: null },
      tickInterval: 1,
      tickPositions: tickPositions
    },
    yAxis: {
      labels: { enabled: false },
      gridLineWidth: 0,
      title: { text: null },
      min: 0,
      max: containerId === 'issuanceh' ? 10 : 50,
      tickInterval: 1
    },
    tooltip: {
      formatter: function() {
        const label = containerId === 'issuanceh' ? 'Issuance' : 'Staking (frozen tez)';
        return `Cycle: ${this.x}<br><span style="color:${this.point.color}">●</span> ${label}: <b>${this.y.toFixed(2)}%</b><br/>`;
      }
    },
    series: [{
      zoneAxis: 'x',
      zones: [{ value: (currentCycle + 1) }, { dashStyle: 'ShortDot' }],
      showInLegend: false,
      shadow: {
        color: 'rgba(255, 255, 0, 0.7)',
        offsetX: 0, offsetY: 0,
        opacity: 1, width: 10
      },
      color: {
        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
        stops: containerId === 'issuanceh' ? 
          [[0, '#ff6961'], [1, '#77dd77']] : 
          [[0, '#77dd77'], [1, '#ff6961']]
      },
      name: title,
      data: data.map(dataMapper),
      lineWidth: 3,
      dataLabels: {
        enabled: true,
        formatter: function() {
          if (this.point.index === this.series.data.length - 1 || this.point.x === currentCycle) {
            return `${this.y.toFixed(2)}%`;
          }
          return null;
        },
        align: 'right',
        verticalAlign: 'bottom',
      },
      marker: { enabled: false },
    }],
    credits: { enabled: false }
  };

  if (containerId === 'stakingh') {
    chartConfig.plotOptions = {
      series: {
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [[0, '#77dd77'], [1, '#ff6961']]
        },
        stickyTracking: true,
        dragDrop: {
          draggableY: true,
          dragMaxY: 100,
          dragMinY: 0,
          liveRedraw: true
        },
        point: {
          events: {
            drag: function(e) {
              const point = e.target;
              if (point.x <= currentCycle + 1) {
                e.newPoint.y = point.y;
                return;
              }
              const newValue = e.newPoint.y;
              const series = point.series;
              const updatedData = series.data.map((p, i) => ({
                x: p.x,
                y: i >= point.index ? parseFloat(newValue) : p.y
              }));
              series.setData(updatedData, true, {
                duration: 800,
                easing: 'easeOutBounce'
              });
              updateIssuanceChart(updatedData);
            }
          }
        }
      }
    };
  }

  Highcharts.chart(containerId, chartConfig);
}

function updateIssuanceChart(newStakingData) {
  const issuanceChart = Highcharts.charts.find(chart => 
    chart && chart.renderTo && chart.renderTo.id === 'issuanceh'
  );
  
  if (!issuanceChart) return;
  
  const originalData = issuanceChart.series[0].options.data;
  
  const updatedData = originalData.map(point => {
    if (point.x > currentCycle) {
      const stakingPoint = newStakingData.find(sp => sp.x === point.x);
      if (stakingPoint) {
        return {
          x: point.x,
          y: issuanceRateQ(point.x, stakingPoint.y / 100)
        };
      }
    }
    return point;
  });
  
  issuanceChart.series[0].setData(updatedData, true);
}

// Export functions for use in React components
window.TezosCharts = {
  createHistoricalChart,
  updateIssuanceChart,
  issuanceRateQ,
  setCurrentCycle: (cycle) => { currentCycle = cycle; }
}; 