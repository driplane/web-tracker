import { init } from './event';

const scripts = document?.querySelectorAll<HTMLElement>('script[data-driplane-token]');
scripts?.forEach(async (script) => {
  const { driplaneServer: server, driplaneToken: token, driplaneModules = '' } = script?.dataset;

  if (token) {
    const modules = driplaneModules.split(',');

    const { trackPageview } = init({ token, server, modules });
    await trackPageview();
  }
});

export { init };
