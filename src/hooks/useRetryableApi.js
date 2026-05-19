import { useCallback } from "react";
import { useNotification } from "../Context/NotificationContext";

export function useRetryableApi() {
  const { showError, showInfo, removeNotification, addNotification } =
    useNotification();

  const fetchWithRetry = useCallback(
    async (
      apiCall,
      componentName = "Data",
      maxRetries = 3,
      delayMs = 1000,
      onRetry = null
    ) => {
      let lastError = null;
      let notificationId = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await apiCall();
          if (notificationId) removeNotification(notificationId);
          if (attempt > 1) {
            showInfo(`${componentName} loaded successfully after retry`);
          }
          return result;
        } catch (error) {
          lastError = error;
          console.error(
            `Attempt ${attempt}/${maxRetries} failed for ${componentName}:`,
            error
          );

          if (attempt < maxRetries) {
            const waitTime = delayMs * Math.pow(2, attempt - 1); // Exponential backoff
            if (onRetry) onRetry(attempt, maxRetries, waitTime);

            // Show or update notification
            if (!notificationId) {
              notificationId = addNotification(
                `${componentName} temporarily unavailable. Retrying...`,
                "warning",
                0 // No auto-dismiss
              );
            }

            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      // All retries failed
      if (notificationId) removeNotification(notificationId);
      showError(
        `Failed to load ${componentName} after ${maxRetries} attempts. Please try again or check your connection.`,
        8000,
        "Retry",
        () => fetchWithRetry(apiCall, componentName, maxRetries, delayMs, onRetry)
      );

      throw lastError;
    },
    [showError, showInfo, removeNotification, addNotification]
  );

  return { fetchWithRetry };
}
