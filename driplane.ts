const script = document.querySelector('script[data-driplane]') as HTMLScriptElement;
let config = {
    server: 'https://driplane.io',
    auth: ''
};

if (script) {
    config = {
        ...config,
        ...script.dataset
    }
}

const headers = new Headers();

headers.append('Content-Type', 'text/json');
headers.append('Authorization', `Basic ${config.auth}`);

fetch(`${config.server}/events/page_view`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
        url: location.href
    })
});

console.log(config);
