import UAParser from 'ua-parser-js';

const ua = new UAParser();

const headers = new Headers();
headers.append('Content-Type', 'application/json');

const parseUrl = (url) => new URL(url);

let driplaneServer = 'https://driplane.io';

export const setServer = (server) => {
  driplaneServer = server;
}

export const setToken = (driplaneToken) => {
  const token = window.btoa(`${driplaneToken}:`);
  headers.set('Authorization', `Basic ${token}`);
}

export const trackEvent = async (event, tags = {}) => {
  const url = parseUrl(location.href);
  const ref = document.referrer ? parseUrl(document.referrer) : '';

  const { getClientId } = await import('./client-id');
  
  const commonTags = {
    ua_br: ua.getBrowser().name,
    ua_br_v: ua.getBrowser().version,
    ua_os: ua.getOS().name,
    ua_os_v: ua.getOS().version,
    ua_dv: ua.getDevice().model,
    ua_dv_t: ua.getDevice().type,
    url,
    url_host: url.host,
    url_path: url.pathname,
    url_prot: url.protocol,
    lang: navigator.language,
    sh: `${screen.height}`,
    sw: `${screen.width}`,
    ref,
    ref_host: ref ? ref.host : '',
    cid: await getClientId()
  };

  return fetch(`${driplaneServer}/events/${event}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      ...commonTags,
      ...tags
    })
  });
}

export const trackPageview = async (tags = {}) => trackEvent('page_view', tags);
