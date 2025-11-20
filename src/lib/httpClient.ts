import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry, { isNetworkError, isIdempotentRequestError, exponentialDelay } from 'axios-retry';


/**
 * @param error 
 * @returns 
 */
const shouldRetryCondition = (error: AxiosError): boolean => {

    if (error.response?.status === 429) {
        console.warn(`[API Client] Rate limit hit (429). Retrying...`);
        return true;
    }


    return isNetworkError(error) || isIdempotentRequestError(error);
};



const httpClient: AxiosInstance = axios.create({

    timeout: 10000, 
});


axiosRetry(httpClient, {
    retries: 5, 
    retryDelay: (retryCount: number, error: AxiosError) => {

        const delay = exponentialDelay(retryCount);
        console.log(`[API Client] Attempt ${retryCount}: Waiting ${delay}ms before next retry.`);
        return delay;
    },

    retryCondition: shouldRetryCondition,
});

export default httpClient;