import axios from 'axios';

// Detect environment
const isLocal = window.location.hostname === "local.test" || window.location.hostname === "localhost";

// Base URLs
export const API_BASE = isLocal
  ? "http://local.test:8000/api"
  : "https://g8pitch.g8brooks.com/api";

export const SANCTUM_BASE = isLocal
  ? "http://local.test:8000"
  : "https://g8pitch.g8brooks.com";

// API client
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
  });

// const api = axios.create({
//   baseURL: 'http://local.test:8000/api',
//   withCredentials: false,
//   headers: {
//     'X-Requested-With': 'XMLHttpRequest',
//     'Content-Type': 'application/json'
//     },
// });

// Sanctum client (no /api prefix)
const sanctum = axios.create({
    baseURL: SANCTUM_BASE,
    withCredentials: true,
  });
// const sanctum = axios.create({
//   baseURL: 'http://local.test:8000', // no /api prefix here
//   withCredentials: false,
// });

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add this helper function to get headers with organization
const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    const orgId = localStorage.getItem('currentOrganizationId');

    const headers = {
        'Authorization': `Bearer ${token}`,
    };

    // Only add organization header if it exists
    if (orgId) {
        headers['X-Organization-ID'] = orgId;
    }

    return headers;
};


// -------------------- Proposal APIs --------------------
// export async function fetchProposals() {
//     const token = localStorage.getItem('authToken');
//     return api.get('/proposals', {
//       headers: { Authorization: `Bearer ${token}` }
//     });
// }
export async function fetchProposals() {
    return api.get('/proposals', {
      headers: getHeaders() // Use the new helper
    });
  }

// export async function fetchProposal(id) {
//     const token = localStorage.getItem('authToken');
//     return api.get(`/proposals/${id}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
// }
export async function fetchProposal(id) {
return api.get(`/proposals/${id}`, {
    headers: getHeaders() // Use the new helper
});
}

// export async function createProposal(data) {
//     const token = localStorage.getItem('authToken');
//     return api.post('/proposals', data, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
// }
export async function createProposal(data) {
return api.post('/proposals', data, {
    headers: getHeaders() // Use the new helper
});
}

// export async function updateProposal(id, data) {
// //   return api.put(`/proposals/${id}`, data);
//   const token = localStorage.getItem('authToken');
//   return api.put(`/proposals/${id}`, data, {
//     headers: { Authorization: `Bearer ${token}` }
//   });
// }
export async function updateProposal(id, data) {
return api.put(`/proposals/${id}`, data, {
    headers: getHeaders() // Use the new helper
});
}

// export async function deleteProposal(id) {
//     const token = localStorage.getItem('authToken');
//     return api.delete(`/proposals/${id}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
// }
export async function deleteProposal(id) {
    return api.delete(`/proposals/${id}`, {
        headers: getHeaders() // Use the new helper
    });
}

// export async function generatePdf(id) {
//     const token = localStorage.getItem('authToken');
//     return api.get(`/proposals/${id}/pdf`, {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: 'blob', // required for PDFs
//     });
// }

export async function generatePdf(id) {
    return api.get(`/proposals/${id}/pdf`, {
        headers: getHeaders(), // Use the new helper
        responseType: 'blob',
    });
}

export { sanctum, api };
export default api;