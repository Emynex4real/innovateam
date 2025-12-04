/**
 * API Service with backend integration (Fixed for File Uploads)
 */
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.csrfToken = null;
  }

  async getCSRFToken() {
    if (!this.csrfToken) {
      try {
        const response = await fetch(`${this.baseURL}/api/csrf-token`);
        const data = await response.json();
        this.csrfToken = data.csrfToken;
      } catch (error) {
        console.warn('CSRF token fetch failed:', error);
      }
    }
    return this.csrfToken;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // 1. Get Authentication Token
    let token = localStorage.getItem('auth_token');
    if (!token) {
      const supabaseSession = localStorage.getItem('sb-jdedscbvbkjvqmmdabig-auth-token');
      if (supabaseSession) {
        try {
          const sessionData = JSON.parse(supabaseSession);
          token = sessionData.access_token;
        } catch (e) {
          console.warn('Failed to parse Supabase session');
        }
      }
    }
    
    // 2. Prepare Headers
    const headers = { ...options.headers };

    // FIX: Only set JSON content type if we are NOT sending a file (FormData)
    // The browser sets the correct boundary header for FormData automatically.
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Skip CSRF for AI Examiner endpoints (temporarily disabled on backend)
    if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method) && !endpoint.includes('/ai-examiner')) {
      const csrfToken = await this.getCSRFToken();
      if (csrfToken) {
        headers['x-csrf-token'] = csrfToken;
      }
    }

    try {
      // Add timeout support
      const timeout = options.timeout || 30000; // Default 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // 3. Handle Response
      if (!response.ok) {
        // Try to parse the error message from the server if possible
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) { /* ignore JSON parse error on error responses */ }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // FIX: Updated to accept options and handle FormData correctly
  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      // FIX: Do not stringify FormData
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  // FIX: Updated to accept options and handle FormData correctly
  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async healthCheck() {
    try {
      return await this.get('/health');
    } catch (error) {
      return { healthy: false, error: error.message };
    }
  }
}

const apiService = new ApiService();
export default apiService;