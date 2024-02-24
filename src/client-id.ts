export const clientIdKey = '__drcid';

export const getClientId = async () => {
  let clientId = localStorage.getItem(clientIdKey);

  if (!clientId) {
    try {
      // Dynamically import the UUID module to reduce initial load time.
      const { default: uuidv4 } = await import('https://cdn.jsdelivr.net/npm/uuid@8.3.2/dist/esm-browser/v4.js');

      clientId = uuidv4();

      localStorage.setItem(clientIdKey, `${clientId}`);
    } catch (error) {
      console.error('[Driplane] Error loading UUID module:', error);

      return '0';
    }
  }

  return clientId;
};
