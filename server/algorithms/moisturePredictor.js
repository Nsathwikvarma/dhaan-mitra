/**
 * Deterministic Agronomic Field Drying Calculator
 * Calculates minimum drying days required for harvested grain to reach procurement limit.
 * NO Machine Learning / AI training required.
 */

export function calculateDryingDays({
  measuredMoisture = 16.5,
  targetMoisture = 14.0,
  temperature = 31.0,
  humidity = 55.0,
  rainfallProbability = 10,
  village = 'Gundlapally'
}) {
  const measured = parseFloat(measuredMoisture);
  const target = parseFloat(targetMoisture);

  const excessMoisture = measured - target;

  if (excessMoisture <= 0) {
    return {
      dryingDaysRequired: 0,
      excessMoisture: 0,
      isAcceptable: true,
      explanation: `Measured grain moisture (${measured}%) is within acceptable procurement limit (${target}%). Ready for intake.`
    };
  }

  // Calculate daily sun drying rate (% moisture reduction per sunny day)
  let dailyDryingRate = 0.6; // Default 0.6% per day

  if (temperature >= 32 && humidity <= 60 && rainfallProbability <= 15) {
    dailyDryingRate = 0.85; // High sun drying rate
  } else if (temperature >= 28 && humidity <= 70 && rainfallProbability <= 30) {
    dailyDryingRate = 0.65; // Good drying conditions
  } else if (humidity > 75 || rainfallProbability > 40) {
    dailyDryingRate = 0.30; // Slow drying due to damp air/clouds
  }

  // Minimum required drying days (rounded up to full days)
  const dryingDaysRequired = Math.max(1, Math.ceil(excessMoisture / dailyDryingRate));

  const lockedUntilDate = new Date();
  lockedUntilDate.setDate(lockedUntilDate.getDate() + dryingDaysRequired);
  const lockedUntilStr = lockedUntilDate.toISOString().split('T')[0];

  const explanation = `Grain moisture measured at ${measured}% (${excessMoisture.toFixed(1)}% above ${target}% limit). ` +
    `Under current ${village} weather (${temperature}°C sun, ${humidity}% humidity), ` +
    `minimum ${dryingDaysRequired} day(s) of tarpaulin sun drying are required. Slots before ${lockedUntilStr} are locked.`;

  return {
    measuredMoisture: measured,
    targetMoisture: target,
    excessMoisture: parseFloat(excessMoisture.toFixed(1)),
    dailyDryingRate,
    dryingDaysRequired,
    lockedUntilDate: lockedUntilStr,
    isAcceptable: false,
    explanation
  };
}

export function predictMoisture({
  currentMoisture = 14.0,
  temperature = 30,
  humidity = 60,
  rainfallProbability = 10,
  daysToSlot = 1
}) {
  const result = calculateDryingDays({
    measuredMoisture: currentMoisture,
    targetMoisture: 14.0,
    temperature,
    humidity,
    rainfallProbability
  });

  return {
    predictedMoisture: parseFloat((currentMoisture - (result.dailyDryingRate * daysToSlot)).toFixed(1)),
    currentMoisture,
    dailyDryingRate: result.dailyDryingRate,
    explanation: result.explanation
  };
}
