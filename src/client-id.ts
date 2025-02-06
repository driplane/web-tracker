import { v4 } from 'uuid';

export const clientIdKey = '__drcid';

function isLocalStorageAvailable(){
  var test = 'test';
  try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
  } catch(e) {
      return false;
  }
}

export const getClientId = async () => {
  // Check doNotTrack
  if (navigator.doNotTrack === '1') {
    return ['0', 'dnt']; // Do Not Track
  }

  // check if localStorage is available
  if (!isLocalStorageAvailable()) {
    return ['0', 'nls']; // No LocalStorage
  }

  let clientId = localStorage.getItem(clientIdKey);

  if (!clientId) {
    try {
      // Dynamically import the UUID module to reduce initial load time.
      

      clientId = v4();

      localStorage.setItem(clientIdKey, `${clientId}`);
    } catch (error) {
      console.error('[Driplane] Error loading UUID module:', error);

      return ['0', 'mle']; // Module load error
    }
  }

  return [clientId, 'ok'];
};
