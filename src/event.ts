import UAParser from 'ua-parser-js';

const ua = new UAParser();

const headers = new Headers();
headers.append('Content-Type', 'application/json');

const parseUrl = (url) => new URL(url);

let driplaneServer = 'https://data.driplane.io';

export const setServer = (server) => {
  driplaneServer = server;
}

export const setToken = (driplaneToken) => {
  const token = window.btoa(`${driplaneToken}:`);
  headers.set('Authorization', `Basic ${token}`);
}

export const trackEvent = async (event, tags = {}) => {
  const { href: url, host: url_host, pathname: url_path, protocol: url_prot } = parseUrl(location.href);
  const { href: ref, host: ref_host } = document.referrer ? parseUrl(document.referrer) : { href: '', host: ''};

  const { getClientId } = await import('./client-id');
  const cid = await getClientId();

  const { name: ua_br, version: ua_br_v } = ua.getBrowser();
  const { name: ua_os, version: ua_os_v } = ua.getOS();
  const { model: ua_dv, type: ua_dv_t } = ua.getDevice();
  
  const { width: sw, height: sh } = screen;

  const commonTags = {
    ua_br,
    ua_br_v,
    ua_os,
    ua_os_v,
    ua_dv,
    ua_dv_t,
    url,
    url_host,
    url_path,
    url_prot,
    lang: navigator.language,
    sh,
    sw,
    ref,
    ref_host,
    ref_ext: url_host !== ref_host ? 1 : 0,
    cid
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
