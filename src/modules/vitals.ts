import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

let driplane;

export const initModule = (driplaneInstance) => {
  driplane = driplaneInstance;
}

const bufferedTrackEvent = (callback, bufferTime = 0) => {
  let buffer = {};
  let timeout;

  return (eventName, params) => {
    // Merge new params into the buffer
    buffer = { ...buffer, ...params };

    // Clear any existing timeout to reset the buffer period
    if (timeout) clearTimeout(timeout);

    // Set a new timeout for the buffer period
    timeout = setTimeout(() => {
      callback(eventName, buffer);  // Execute callback with merged params
      buffer = {};                  // Reset buffer after call
      timeout = null;                // Clear timeout reference
    }, bufferTime);
  };
};

const trackEvenCollector = bufferedTrackEvent((eventName, params) => {
  driplane.trackEvent(eventName, params);
}, 100);

const setVital = (name, multiplier = 1) => ({ value }) => {
  trackEvenCollector('page_perf', { [name]: ~~(value * multiplier) });
};

onCLS(setVital('cls', 10000));
onFCP(setVital('fcp'));
onLCP(setVital('lcp'));
onTTFB(setVital('ttfb'));
onINP(setVital('inp'));
