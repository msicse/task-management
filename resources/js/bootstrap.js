import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Set up CSRF token for axios requests
const token = document.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
} else {
    console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

// Axios interceptor to handle 419 CSRF errors automatically
window.axios.interceptors.response.use(
    response => response,
    async error => {
        // Handle 419 Page Expired errors
        if (error.response?.status === 419) {
            console.warn('CSRF token expired (419), attempting to refresh and retry...');

            try {
                // Get fresh CSRF cookie from server
                await window.axios.get('/sanctum/csrf-cookie');

                // Try to get fresh token from a lightweight endpoint or reload meta
                const tokenMeta = document.querySelector('meta[name="csrf-token"]');
                if (tokenMeta) {
                    // Make a simple HEAD request to get updated headers/session
                    const headResponse = await window.axios.head('/');

                    // If server supports returning token in header, use it
                    // Otherwise, reload the page to get fresh token
                    const newToken = headResponse.headers['x-csrf-token'] || tokenMeta.getAttribute('content');

                    if (newToken && newToken !== tokenMeta.getAttribute('content')) {
                        tokenMeta.setAttribute('content', newToken);
                        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;

                        // Update the failed request with new token
                        if (error.config.headers) {
                            error.config.headers['X-CSRF-TOKEN'] = newToken;
                        }

                        // Retry the original request
                        return window.axios.request(error.config);
                    }
                }

                // If we couldn't refresh token automatically, reload the page
                console.log('Could not refresh token automatically, reloading page...');
                window.location.reload();
                return Promise.reject(error);

            } catch (refreshError) {
                console.error('Failed to refresh CSRF token:', refreshError);
                // Last resort: redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
