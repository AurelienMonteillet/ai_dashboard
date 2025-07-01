'use client';

import { FC } from 'react';
import dynamic from 'next/dynamic';

const HighchartsReact = dynamic(() => import('highcharts-react-official'), {
  ssr: false,
  loading: () => <div className="text-white">Chargement du graphique...</div>
});

interface HistoricalChartProps {
  title: string;
  data: any[];
  dataMapper: (d: any) => { x: number; y: number };
  tickPositions: number[];
  containerId: string;
  currentCycle: number;
  yMax: number;
  tooltipLabel: string;
}

const HistoricalChart: FC<HistoricalChartProps> = ({
  title,
  data,
  dataMapper,
  tickPositions,
  containerId,
  currentCycle,
  yMax,
  tooltipLabel
}) => {
  // Highcharts doit être importé côté client
  const Highcharts = (typeof window !== 'undefined') ? require('highcharts') : null;

  const chartOptions = {
    chart: {
      type: 'spline',
      backgroundColor: 'rgba(0,0,0,0)',
      height: 309,
      events: {
        load: function (this: any) {
          const chart = this;
          const xAxis = chart.xAxis[0];
          const yAxis = chart.yAxis[0];
          const verticalLines = [428, 743, 823, currentCycle];
          
          verticalLines.forEach((cycle: number) => {
            const dataPoint = chart.series[0].data.find((point: any) => point.x === cycle);
            if (dataPoint) {
              const yValue = dataPoint.y;
              const xPos = xAxis.toPixels(cycle);
              const yPosTop = yAxis.toPixels(yValue);
              const yPosBottom = yAxis.toPixels(0);
              
              // Dessiner la ligne pointillée
              chart.renderer.path(['M', xPos, yPosTop, 'L', xPos, yPosBottom])
                .attr({
                  'stroke-width': 1.5,
                  stroke: '#ffffff',
                  dashstyle: 'Dash',
                  zIndex: 1
                })
                .add();
            }
          });
        }
      }
    },
    title: {
      text: title,
      style: {
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      lineColor: '#ffffff',
      labels: {
        formatter: function (this: any) {
          if (this.value === 428) return 'Hangzhou';
          if (this.value === 743) return 'P';
          if (this.value === 823) return 'Q';
          if (this.value === currentCycle) return 'Now';
          return '';
        },
        style: {
          color: '#ffffff'
        }
      },
      title: {
        text: null
      },
      tickInterval: 1,
      tickPositions: tickPositions,
      gridLineWidth: 0
    },
    yAxis: {
      labels: {
        enabled: false
      },
      gridLineWidth: 0,
      title: {
        text: null
      },
      min: 0,
      max: yMax,
      tickInterval: 1
    },
    tooltip: {
      formatter: function (this: any) {
        return `Cycle: ${this.x}<br><span style=\"color:${this.point.color}\">●</span> ${tooltipLabel}: <b>${(this.y as number)?.toFixed(2)}%</b><br/>`;
      },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      style: {
        color: '#ffffff'
      }
    },
    series: [{
      type: 'spline',
      zoneAxis: 'x',
      showInLegend: false,
      color: {
        linearGradient: {
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1
        },
        stops: containerId === 'issuanceh'
          ? [[0, '#ff6961'], [1, '#77dd77']]
          : [[0, '#77dd77'], [1, '#ff6961']]
      },
      name: title,
      data: data.map(dataMapper),
      lineWidth: 3,
      dataLabels: {
        enabled: true,
        formatter: function (this: any) {
          if (this.point && this.series && (this.point.index === this.series.data.length - 1 || this.point.x === currentCycle)) {
            return `${(this.y as number)?.toFixed(2)}%`;
          }
          return null;
        },
        align: 'right',
        verticalAlign: 'bottom',
        style: {
          color: '#ffffff',
          textOutline: 'none'
        }
      },
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: true
          }
        }
      },
    }],
    credits: {
      enabled: false
    },
    plotOptions: {
      series: {
        states: {
          hover: {
            enabled: true,
            lineWidth: 3
          }
        }
      }
    }
  };

  if (!Highcharts) {
    return null;
  }

  return (
    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
  );
};

export default HistoricalChart; 