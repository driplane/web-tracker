import { setToken, trackPageview } from './event';

const script = document?.querySelector<HTMLElement>('script[data-driplane-token]');

if (script?.dataset.driplaneToken) {
  setToken(script?.dataset.driplaneToken);
  trackPageview();
} else {
  console.warn('[Driplane] No token given');
}

export { setToken, trackPageview };
