import UAParser from 'ua-parser-js';
import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

const ua = new UAParser();

const parseUrl = (url) => new URL(url);

const defaultDriplaneServer = 'https://data.driplane.io';

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

const eventQueue = new Set<{endpoint: string, event:string, body: Object}>();

class Driplane {
  server: string;
  token: string;

  constructor(token: string, server: string) {
    this.token = token;
    this.server = server;
  }
  
  async trackEvent(event, tags = {}) {
    const { href: url, host: url_host, pathname: url_path, protocol: url_prot } = parseUrl(location.href);
    const { href: ref, host: ref_host } = document.referrer ? parseUrl(document.referrer) : { href: '', host: ''};

    const { getClientId } = await import('./client-id');
    const [ cid, cid_st ] = await getClientId();

    const {
      browser: { name: ua_br, version: ua_br_v },
      os: { name: ua_os, version: ua_os_v },
      device: { model: ua_dv, type: ua_dv_t = 'desktop', vendor: ua_dv_v }
    } = ua.getResult();

    const { width: sw, height: sh } = screen;

    const commonTags = {
      ua_br,
      ua_br_v,
      ua_os,
      ua_os_v,
      ua_dv,
      ua_dv_t,
      ua_dv_v,
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
      cid_st,
      beacon: 0,
    };

    const body = {
      ...commonTags,
      ...tags
    };

    const endpoint = `${this.server}/events/${event}?api_key=${this.token}`;

    eventQueue.add({ endpoint, event, body });
  }

  async trackPageview(tags = {}) {
    this.trackEvent('page_view', tags);
  }

}

const sendBeacon = (endpoint, body) => {
  Object.assign(body, { beacon: 1 });

  const blob = new Blob([JSON.stringify(body)], { type: "application/json" });

  return navigator.sendBeacon(endpoint, blob);
}

const sendXhr = (endpoint, body) => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  return fetch(endpoint, {
    method: 'POST',
    keepalive: true,
    headers,
    body: JSON.stringify(body)
  });
}

function flushQueue() {
  if (eventQueue.size > 0) {
    eventQueue.forEach(({ endpoint, event, body }) => {
      // add web vitals to the event
      Object.assign(body, webVitals);

      ('sendBeacon' in navigator && sendBeacon(endpoint, body)) || sendXhr(endpoint, body);
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


export const init = function (token: string, server = defaultDriplaneServer) {
  const driplane = new Driplane(token, server);
  return {
    trackPageview: (tags = {}) => {
      driplane.trackPageview(tags);
    },
    trackEvent: (event, tags = {}) => {
      driplane.trackEvent(event, tags);
    }
  }
}
