import { AxiosError } from "axios";
import toast from "react-hot-toast";

export interface ValidationError {
    message: string;
    path: (string | number)[];
    type: string;
    context?: any;
}

export interface ApiErrorResponse {
    message?: string;
    errors?: ValidationError[];
    error?: string;
}

/**
 * Extracts validation errors from API error response
 */
export function extractValidationErrors(error: unknown): ValidationError[] {
    if (error instanceof AxiosError) {
        const response = error.response?.data as ApiErrorResponse;
        
        if (response?.errors && Array.isArray(response.errors)) {
            return response.errors;
        }
        
        // Handle different error response formats
        if (response?.error) {
            return [{
                message: response.error,
                path: [],
                type: "unknown"
            }];
        }
    }
    
    return [];
}

/**
 * Formats validation error message for display
 */
export function formatValidationError(error: ValidationError): string {
    const field = error.path.length > 0 
        ? error.path.join(".") 
        : "field";
    
    return `${field}: ${error.message}`;
}

/**
 * Handles API errors and displays appropriate toast messages
 * Returns true if validation errors were found and displayed
 */
export function handleApiError(error: unknown, defaultMessage: string = "An error occurred"): boolean {
    const validationErrors = extractValidationErrors(error);
    
    if (validationErrors.length > 0) {
        // Display all validation errors
        validationErrors.forEach((err) => {
            const message = formatValidationError(err);
            toast.error(message, {
                duration: 5000,
            });
        });
        return true;
    }
    
    // Handle other error types
    if (error instanceof AxiosError) {
        const response = error.response?.data as ApiErrorResponse;
        const message = response?.message || error.message || defaultMessage;
        toast.error(message, {
            duration: 5000,
        });
    } else if (error instanceof Error) {
        toast.error(error.message || defaultMessage, {
            duration: 5000,
        });
    } else {
        toast.error(defaultMessage, {
            duration: 5000,
        });
    }
    
    return false;
}


