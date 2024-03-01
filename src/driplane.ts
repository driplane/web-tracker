import { init } from './event';

const scripts = document?.querySelectorAll<HTMLElement>('script[data-driplane-token]');
scripts?.forEach((script) => {
  const { driplaneServer, driplaneToken } = script?.dataset;

  if (driplaneToken) {
    const { trackPageview } = init(driplaneToken, driplaneServer);
    trackPageview();
  }
});

export { init };
