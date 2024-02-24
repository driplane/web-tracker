import UAParser from 'ua-parser-js';
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

const ua = new UAParser();

const parseUrl = (url) => new URL(url);

let driplaneServer = 'https://data.driplane.io';
let token;

export const setServer = (server) => {
  driplaneServer = server;
}

export const setToken = (driplaneToken) => {
  token = window.btoa(`${driplaneToken}:`);
}

const webVitals: {
  cls?: number,
  fcp?: number,
  fid?: number,
  lcp?: number,
  ttfb?: number,
  inp?: number,
} = {};

const setVital = (name) => ({ delta }) => webVitals[name] = ~~delta;

onCLS(setVital('cls'));
onFCP(setVital('fcp'));
onFID(setVital('fid'));
onLCP(setVital('lcp'));
onTTFB(setVital('ttfb'));
onINP(setVital('inp'));

// const eventQueue: {event:string, body: string}[] = [];
const eventQueue = new Set<{event:string, body: Object}>();

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
    cid,
  };

  const body = {
    ...commonTags,
    ...tags
  };

  eventQueue.add({ event, body });
}

export const trackPageview = async (tags = {}) => trackEvent('page_view', tags);

function flushQueue() {
  if (eventQueue.size > 0) {
    eventQueue.forEach(({ event, body }) => {
      const endpoint = `${driplaneServer}/events/${event}`;

      // add web vitals to the event
      Object.assign(body, webVitals);
      
      // TODO: use navigator.sendBeacon() once it's possible to set token as query param
      const headers = new Headers();
      headers.append('Content-Type', 'application/json');
      headers.set('Authorization', `Basic ${token}`);
    
      fetch(endpoint, {
        method: 'POST',
        keepalive: true,
        headers,
        body: JSON.stringify(body),
      });
    });

    eventQueue.clear();
  }
}

// Report all available metrics whenever the page is backgrounded or unloaded.
addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    flushQueue();
  }
});

// NOTE: Safari does not reliably fire the `visibilitychange` event when the
// page is being unloaded. As a workaround, we also listen for `pagehide`.
addEventListener('pagehide', flushQueue);
