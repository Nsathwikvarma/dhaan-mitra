class WeatherService {
  constructor() {
    this.districtWeather = {
      Warangal: { temperature: 29.5, humidity: 62.0, rainfallProbability: 15, condition: 'Partly Cloudy / Good Sun' },
      Nalgonda: { temperature: 31.0, humidity: 55.0, rainfallProbability: 10, condition: 'Clear Sunny' },
      Karimnagar: { temperature: 28.0, humidity: 68.0, rainfallProbability: 35, condition: 'Light Humidity / Moderate Dry' }
    };
  }

  getWeather(district = 'Warangal', date = null) {
    const targetDateStr = date || new Date().toISOString().split('T')[0];
    const forecast = this.getVillageForecast('Gundlapally', district);
    const matched = forecast.forecast.find(d => d.date === targetDateStr);
    
    if (matched) {
      return {
        district,
        date: targetDateStr,
        dayName: matched.dayName,
        temperature: matched.temperature,
        humidity: matched.humidity,
        rainfallProbability: matched.rainfallProbability,
        condition: matched.condition,
        icon: matched.icon,
        dryingAdvice: matched.dryingAdvice,
        suitability: matched.suitability,
        dryingSuitabilityIndex: matched.humidity < 65 ? 'High (Optimal)' : 'Moderate'
      };
    }

    const data = this.districtWeather[district] || this.districtWeather.Warangal;
    return {
      district,
      date: targetDateStr,
      dayName: 'Scheduled Day',
      temperature: data.temperature,
      humidity: data.humidity,
      rainfallProbability: data.rainfallProbability,
      condition: data.condition,
      icon: '☀️',
      dryingAdvice: 'Ideal for Field Sun-Drying',
      suitability: 'HIGH',
      dryingSuitabilityIndex: data.humidity < 65 ? 'High (Optimal)' : 'Moderate'
    };
  }

  getVillageForecast(village = 'Gundlapally', district = 'Warangal') {
    const base = this.districtWeather[district] || this.districtWeather.Warangal;
    const days = [];
    const today = new Date();

    const conditionPool = [
      { condition: 'Clear Sunny', tempDelta: 1.5, rain: 5, humidity: 52, icon: '☀️' },
      { condition: 'Good Sunlight / Moderate Breeze', tempDelta: 0.5, rain: 10, humidity: 56, icon: '🌤️' },
      { condition: 'Partly Cloudy', tempDelta: -0.5, rain: 20, humidity: 62, icon: '⛅' },
      { condition: 'Dry & Warm Afternoon', tempDelta: 2.0, rain: 5, humidity: 48, icon: '☀️' },
      { condition: 'Scattered Clouds', tempDelta: -1.0, rain: 25, humidity: 66, icon: '🌥️' },
      { condition: 'Clear Sunny', tempDelta: 1.0, rain: 10, humidity: 54, icon: '☀️' },
      { condition: 'Optimal Harvest Sun', tempDelta: 2.2, rain: 0, humidity: 50, icon: '🌞' }
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toISOString().split('T')[0];
      const poolItem = conditionPool[i % conditionPool.length];

      const temp = parseFloat((base.temperature + poolItem.tempDelta).toFixed(1));
      const rain = Math.max(0, Math.min(100, base.rainfallProbability + (poolItem.rain - 15)));
      const hum = Math.max(30, Math.min(95, base.humidity + (poolItem.humidity - 60)));

      let dryingAdvice = 'Ideal for Field Sun-Drying';
      let suitability = 'HIGH';
      if (rain > 30 || hum > 70) {
        dryingAdvice = 'Rain / High Humidity Risk - Keep Grain Covered';
        suitability = 'POOR';
      } else if (rain > 15 || hum > 62) {
        dryingAdvice = 'Moderate Drying - Monitor Evening Dew';
        suitability = 'MODERATE';
      }

      days.push({
        dayName,
        date: dateStr,
        temperature: temp,
        rainfallProbability: rain,
        humidity: hum,
        condition: poolItem.condition,
        icon: poolItem.icon,
        dryingAdvice,
        suitability
      });
    }

    return {
      village,
      district,
      currentCondition: days[0],
      forecast: days
    };
  }
}

export const weatherService = new WeatherService();

