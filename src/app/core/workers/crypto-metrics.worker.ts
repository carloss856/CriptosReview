/// <reference lib="webworker" />

export type CryptoWorkerRequest = {
  type: 'CALC';
  payload: { assetId: string; prices: number[] };
};

export type CryptoWorkerResponse = {
  type: 'RESULT';
  payload: { assetId: string; movingAverage: number; volatility: number };
};

const calculateMovingAverage = (prices: number[]): number => {
  if (!prices.length) {
    return 0;
  }

  const sum = prices.reduce((acc, value) => acc + value, 0);
  return sum / prices.length;
};

const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) {
    return 0;
  }

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i += 1) {
    const prev = prices[i - 1];
    const curr = prices[i];
    if (prev === 0) {
      continue;
    }

    returns.push((curr - prev) / prev);
  }

  if (returns.length < 2) {
    return 0;
  }

  const mean = returns.reduce((acc, value) => acc + value, 0) / returns.length;
  const variance =
    returns.reduce((acc, value) => acc + (value - mean) ** 2, 0) / returns.length;

  return Math.sqrt(variance);
};

self.onmessage = (event: MessageEvent<CryptoWorkerRequest>) => {
  const message = event.data;
  if (message?.type !== 'CALC') {
    return;
  }

  try {
    const { assetId, prices } = message.payload;
    const movingAverage = calculateMovingAverage(prices);
    const volatility = calculateVolatility(prices);

    const response: CryptoWorkerResponse = {
      type: 'RESULT',
      payload: { assetId, movingAverage, volatility }
    };

    self.postMessage(response);
  } catch {
    const response: CryptoWorkerResponse = {
      type: 'RESULT',
      payload: { assetId: message.payload.assetId, movingAverage: 0, volatility: 0 }
    };

    self.postMessage(response);
  }
};
