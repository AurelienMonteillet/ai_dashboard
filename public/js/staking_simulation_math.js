

const TRANSITION_PERIOD = 50;
const INITIAL_PERIOD = 10;
const AI_ACTIVATION_CYCLE = 748;


function computeExtremum(cycle, initialValue, finalValue) {
  const initialLimit = AI_ACTIVATION_CYCLE + INITIAL_PERIOD;
  const transLimit = initialLimit + TRANSITION_PERIOD + 1;
  if (cycle <= initialLimit) return initialValue;
  if (cycle >= transLimit) return finalValue;
  const t = cycle - initialLimit;
  return (t * (finalValue - initialValue) / (TRANSITION_PERIOD + 1)) + initialValue;
}

function minimumRatio(cycle) { return computeExtremum(cycle, 0.045, 0.0025); }
function maximumRatio(cycle) { return computeExtremum(cycle, 0.055, 0.1); }

function clip(value, minValue, maxValue) {
  return Math.max(minValue, Math.min(value, maxValue));
}


function staticRate(cycle, value) {
  const staticRateValue = 1 / 1600 * (1 / (value ** 2));
  return clip(staticRateValue, minimumRatio(cycle), maximumRatio(cycle));
}


let tmp = 0; 
function applyBonus(cycle, value, targetRatio, stakedRatioValue) {
  if (cycle <= AI_ACTIVATION_CYCLE) {
    tmp = 0;
    return 0;
  }
  const previousBonus = tmp;
  const ratioMax = maximumRatio(cycle + 1);
  const staticRateValue = staticRate(cycle, value);
  const staticRateDistToMax = ratioMax - staticRateValue;
  const udist = Math.max(0, Math.abs(stakedRatioValue - targetRatio) - 0.02);
  const dist = stakedRatioValue >= targetRatio ? -udist : udist;
  const maxNewBonus = Math.min(staticRateDistToMax, 0.05);
  const newBonus = previousBonus + dist * 0.01 * ((cycle==858)?(245760 / 86400):1);
  const res = clip(newBonus, 0, maxNewBonus);
  tmp = res;
  return res;
}

function dyn(cycle, value, stakedRatioValue) {
  return applyBonus(cycle, value, 0.5, stakedRatioValue);
}


function adaptiveMaximum(r) {
  if (r >= 0.5) return 0.01;
  if (r <= 0.05) return 0.1;
  const y = (1 + 9 * Math.pow((50 - 100 * r) / 42, 2)) / 100;
  return clip(y, 0.01, 0.1);
}


function issuanceRateQ(cycle, value) {
  const adjustedCycle = cycle - 2;
  const staticRateRatio = staticRate(adjustedCycle, value);
  const bonus = dyn(adjustedCycle, value, value);
  const ratioMin = minimumRatio(adjustedCycle);
  const ratioMax = cycle >= 823 ? 
    Math.min(maximumRatio(adjustedCycle), adaptiveMaximum(value)) : 
    maximumRatio(adjustedCycle);
  const totalRate = staticRateRatio + bonus;
  return clip(totalRate, ratioMin, ratioMax) * 100; 
}

function calculateAverageDifference(arr) {
  return arr.reduce((sum, val, idx, array) => 
    idx > 0 ? sum + Math.abs(val - array[idx - 1]) : sum, 0) / (arr.length - 1);
}

function slowIncrement(current, avgDiff) {
  const center = 0.5;
  const scale = 6; 
  return avgDiff * 0.2 / (1 + Math.exp((Math.abs(current - center) - center) / scale));
}


function exempleProjection() {
  let ratios = [0.1, 0.12, 0.15, 0.18, 0.2, 0.22, 0.25, 0.3, 0.35, 0.4];
  let cycleStart = 750;
  let resultats = ratios.map((ratio, i) => {
    return {
      cycle: cycleStart + i,
      staking: ratio,
      issuance: issuanceRateQ(cycleStart + i, ratio)
    };
  });
  console.table(resultats);
  return resultats;
}
