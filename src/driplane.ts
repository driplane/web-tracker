import { init } from './event';
import { getVitals } from './vitals';

const scripts = document?.querySelectorAll<HTMLElement>('script[data-driplane-token]');
scripts?.forEach(async (script) => {
  const { driplaneServer, driplaneToken } = script?.dataset;

  if (driplaneToken) {
    const { trackPageview, trackEvent } = init(driplaneToken, driplaneServer);
    await trackPageview();
    trackEvent('page_perf', () => getVitals());
  }
});

export { init };
