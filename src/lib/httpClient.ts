import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry, { isNetworkError, isIdempotentRequestError, exponentialDelay } from 'axios-retry';
// --- Helper Functions ---

/**
 * Checks if an error status code should trigger a retry.
 * We want to retry on 429 (Rate Limit) and common temporary 5xx/network errors.
 * @param error The AxiosError object.
 * @returns boolean
 */
const shouldRetryCondition = (error: AxiosError): boolean => {
    // 1. Check for Rate Limiting (429) - CRITICAL for this project
    if (error.response?.status === 429) {
        console.warn(`[API Client] Rate limit hit (429). Retrying...`);
        return true;
    }

    // 2. Check for standard network/idempotent errors (e.g., 500, 503, connection issues)
    return isNetworkError(error) || isIdempotentRequestError(error);
};


// --- HTTP Client Setup ---

const httpClient: AxiosInstance = axios.create({
    // Optional: Set a global timeout to prevent infinite hangs
    timeout: 10000, 
});


// Apply the axios-retry interceptor to the instance
axiosRetry(httpClient, {
    retries: 5, // Total attempts will be 6 (1 initial + 5 retries)
    retryDelay: (retryCount: number, error: AxiosError) => {
        // Use exponential backoff to increase the delay with each retry: 2^n seconds
        const delay = exponentialDelay(retryCount);
        console.log(`[API Client] Attempt ${retryCount}: Waiting ${delay}ms before next retry.`);
        return delay;
    },
    // The custom function defined above
    retryCondition: shouldRetryCondition,
});

export default httpClient;