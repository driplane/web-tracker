import uuid4 from 'https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/esm-browser/v4.js';

const script = document.querySelector('script[data-driplane-token]');
let config = {
  driplaneServer: 'https://driplane.io',
  driplaneToken: ''
};

if (script) {
  config = {
    ...config,
    ...script.dataset
  }
  // const baseUrl = script.src.split('/').slice(0, -1).join('/');
}

if (!config.driplaneToken) {
  console.warn('Missing token for Driplane!');
}

const clientIdKey = '__drcid';

if (!localStorage.getItem(clientIdKey)) {
  localStorage.setItem(clientIdKey, uuid4());
}

const clientId = localStorage.getItem(clientIdKey);

const headers = new Headers();

const token = btoa(`${config.driplaneToken}:`);

headers.append('Content-Type', 'application/json');
headers.append('Authorization', `Basic ${token}`);

const parseUrl = (url) => new URL(url);

const url = parseUrl(location.href);
const ref = document.referrer ? parseUrl(document.referrer) : '';

const commonTags = {
  ua: navigator.userAgent,
  url,
  url_host: url.host,
  url_path: url.pathname,
  url_prot: url.protocol,
  lang: navigator.language,
  sh: `${screen.height}`,
  sw: `${screen.width}`,
  ref,
  ref_host: ref ? ref.host : '',
  cid: clientId
};

fetch(`${config.driplaneServer}/events/page_view`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    ...commonTags
  })
});

console.log(config);
