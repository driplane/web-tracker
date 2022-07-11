export const clientIdKey = '__drcid';

export const getClientId = async () => {

  if (!localStorage.getItem(clientIdKey)) {
    const { default: uuidv4 } = await import('https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/esm-browser/v4.js');

    localStorage.setItem(clientIdKey, uuidv4());
  }

  return localStorage.getItem(clientIdKey);

}
