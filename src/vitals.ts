import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

const webVitals: {
  cls?: number,
  fcp?: number,
  fid?: number,
  lcp?: number,
  ttfb?: number,
  inp?: number,
} = {};

const setVital = (name, multiplier = 1) => ({ delta }) => webVitals[name] = ~~(delta * multiplier);

onCLS(setVital('cls', 10000));
onFCP(setVital('fcp'));
onFID(setVital('fid'));
onLCP(setVital('lcp'));
onTTFB(setVital('ttfb'));
onINP(setVital('inp'));

export const getVitals = () => webVitals;
