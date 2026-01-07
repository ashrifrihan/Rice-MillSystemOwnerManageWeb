import FirebaseDataService from './firebaseDataService';

class DemandPredictionService {
  constructor() {
    this.lastData = null;
    this.lastPredictionResult = null;
  }

  async preprocessHistoricalData(data) {
    const source = data || await FirebaseDataService.fetchAllData();
    this.lastData = source;

    const sales = source.sales || [];
    const inventory = source.inventory || [];

    const dataPointsUsed = sales.length;
    let confidenceTier = 'LOW';
    if (dataPointsUsed >= 90) confidenceTier = 'HIGH';
    else if (dataPointsUsed >= 30) confidenceTier = 'MEDIUM';

    return {
      dataPointsUsed,
      confidenceTier,
      sales,
      inventory
    };
  }

  async forecastDemand(options = {}) {
    const { timeframe = 'month' } = options;
    const pre = await this.preprocessHistoricalData(this.lastData);
    const { sales, inventory, confidenceTier, dataPointsUsed } = pre;

    const horizonDays = this.#mapTimeframeToDays(timeframe);

    const dailyTotals = this.#aggregateDailySales(sales);
    const movingAvg = this.#weightedMovingAverage(dailyTotals);
    const trend = this.#estimateTrend(dailyTotals);

    const overallDaily = Math.max(movingAvg * (1 + trend), 0);
    const overallProjection = overallDaily * horizonDays;

    const productTotals = this.#aggregateProductSales(sales);
    const totalQty = Object.values(productTotals).reduce((a, b) => a + b, 0) || 1;

    const priceIndex = this.#buildPriceIndex(inventory);

    const productForecasts = Object.keys(productTotals).map(product => {
      const share = productTotals[product] / totalQty;
      const projectedDemand = overallProjection * share;
      const price = priceIndex[product] || 100;
      const projectedDemandValue = projectedDemand * price;
      return {
        product,
        share,
        projectedDemand,
        projectedDemandValue,
        trend,
        confidencePct: this.#confidencePct(confidenceTier)
      };
    }).sort((a, b) => b.projectedDemandValue - a.projectedDemandValue);

    const projectedRevenueImpact = productForecasts.reduce((sum, p) => sum + p.projectedDemandValue, 0);

    const result = {
      timeframe,
      horizonDays,
      dataPointsUsed,
      confidenceTier,
      trend,
      overallDaily,
      overallProjection,
      projectedRevenueImpact,
      productForecasts
    };

    this.lastPredictionResult = result;
    return result;
  }

  getVisualizationData(prediction = this.lastPredictionResult) {
    if (!prediction) return null;
    const { horizonDays, overallDaily, trend, productForecasts } = prediction;

    const labels = Array.from({ length: horizonDays }, (_, i) => `Day ${i + 1}`);
    const baseline = overallDaily;
    const series = labels.map((_, i) => Math.max(baseline * (1 + trend * (i / Math.max(horizonDays - 1, 1))), 0));

    return {
      demandTrend: {
        labels,
        datasets: [
          {
            label: 'Projected Demand (units)',
            data: series,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.3)'
          }
        ]
      },
      productDistribution: {
        labels: productForecasts.map(p => p.product),
        datasets: [
          {
            label: 'Projected Value (Rs.)',
            data: productForecasts.map(p => Math.round(p.projectedDemandValue)),
            backgroundColor: productForecasts.map((_, i) => this.#color(i))
          }
        ]
      }
    };
  }

  getConfidenceExplanation(prediction = this.lastPredictionResult) {
    if (!prediction) return {
      tier: 'LOW',
      message: 'No prediction available yet'
    };
    const map = {
      HIGH: 'High confidence: ample historical data and consistent patterns.',
      MEDIUM: 'Medium confidence: reasonable data, patterns moderately stable.',
      LOW: 'Low confidence: limited data or volatile patterns.'
    };
    return {
      tier: prediction.confidenceTier,
      message: map[prediction.confidenceTier] || map.LOW
    };
  }

  getLimitations() {
    return [
      'Assumes historical patterns persist over the forecast horizon',
      'External shocks (prices, weather, regulation) not modeled',
      'Product mapping uses recent sales distribution; niche items may be underrepresented'
    ];
  }

  #mapTimeframeToDays(tf) {
    switch (tf) {
      case 'week': return 7;
      case 'quarter': return 90;
      case 'year': return 365;
      case 'month':
      default: return 30;
    }
  }

  #aggregateDailySales(sales) {
    const map = {};
    for (const s of sales) {
      const d = new Date(s.date).toISOString().split('T')[0];
      map[d] = (map[d] || 0) + (parseFloat(s.quantity) || parseFloat(s.amount) || 0);
    }
    const entries = Object.entries(map).sort((a, b) => a[0] < b[0] ? -1 : 1);
    return entries.map(([, v]) => v);
  }

  #weightedMovingAverage(series) {
    if (!series || series.length === 0) return 0;
    const n = series.length;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      const w = 1 + (i / n); // slightly higher weight for recent points
      num += series[i] * w;
      den += w;
    }
    return num / den;
  }

  #estimateTrend(series) {
    if (!series || series.length < 2) return 0;
    const n = series.length;
    const xMean = (n - 1) / 2;
    const yMean = series.reduce((a, b) => a + b, 0) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) {
      num += (i - xMean) * (series[i] - yMean);
      den += (i - xMean) * (i - xMean);
    }
    const slope = den === 0 ? 0 : num / den;
    const norm = yMean === 0 ? 0 : slope / yMean; // normalized trend per step
    return Math.max(-0.15, Math.min(norm, 0.25));
  }

  #aggregateProductSales(sales) {
    const map = {};
    for (const s of sales) {
      const p = s.product || 'Unknown';
      map[p] = (map[p] || 0) + (parseFloat(s.quantity) || 0);
    }
    return map;
  }

  #buildPriceIndex(inventory) {
    const idx = {};
    for (const i of inventory) {
      const p = i.name || i.product || 'Unknown';
      const price = parseFloat(i.pricePerKg) || 100;
      if (!idx[p]) idx[p] = price;
    }
    return idx;
  }

  #confidencePct(tier) {
    switch (tier) {
      case 'HIGH': return 90;
      case 'MEDIUM': return 75;
      default: return 60;
    }
  }

  #color(i) {
    const palette = [
      'rgba(59, 130, 246, 0.6)', // blue
      'rgba(16, 185, 129, 0.6)', // emerald
      'rgba(245, 158, 11, 0.6)', // amber
      'rgba(244, 63, 94, 0.6)',  // rose
      'rgba(99, 102, 241, 0.6)', // indigo
      'rgba(20, 184, 166, 0.6)'  // teal
    ];
    return palette[i % palette.length];
  }
}

export default new DemandPredictionService();
