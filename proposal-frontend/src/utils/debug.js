export const debugRequest = (config, type = 'Request') => {
    console.log(`🚀 ${type}:`, {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers,
      data: config.data
    });
  };
  
  export const debugResponse = (response, type = 'Response') => {
    console.log(`✅ ${type}:`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    });
  };
  
  export const debugError = (error, type = 'Error') => {
    console.error(`❌ ${type}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
  };
  
  export const checkCookies = () => {
    const cookies = document.cookie.split(';');
    console.log('🍪 Current cookies:', cookies);
  };