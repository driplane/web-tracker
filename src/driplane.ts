import { setToken, setServer, trackEvent, trackPageview } from './event';

const script = document?.querySelector<HTMLElement>('script[data-driplane-token]');

if (script?.dataset.driplaneServer) {
  setServer(script?.dataset.driplaneServer);
}

if (script?.dataset.driplaneToken) {
  setToken(script?.dataset.driplaneToken);
  trackPageview();
} else {
  console.warn('[Driplane] No token given');
}

export { setToken, setServer, trackEvent, trackPageview };
