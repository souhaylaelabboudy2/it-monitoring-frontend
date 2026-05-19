import { useNotification } from "../Context/NotificationContext";

function Toast() {
  const { notifications, removeNotification } = useNotification();
  
  // Only show critical errors and warnings, plus critical info messages
  // Limit to 1 notification at a time for clean, professional UI
  const criticalNotifications = notifications.filter(
    (n) => n.type === "error" || n.type === "warning" || (n.type === "info" && n.message?.includes("🔴"))
  );
  const displayNotification = criticalNotifications.length > 0 ? criticalNotifications[0] : null;

  const getStyles = (type) => {
    const baseStyles =
      "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border-l-4";
    switch (type) {
      case "error":
        return `${baseStyles} bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-200`;
      case "warning":
        return `${baseStyles} bg-yellow-100 dark:bg-yellow-900/40 border-yellow-500 text-yellow-800 dark:text-yellow-200`;
      case "info":
      default:
        return `${baseStyles} bg-blue-100 dark:bg-blue-900/40 border-blue-500 text-blue-800 dark:text-blue-200`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none">
      {displayNotification && (
        <div
          key={displayNotification.id}
          className={`${getStyles(displayNotification.type)} pointer-events-auto max-w-sm`}
        >
          <span className="text-lg flex-shrink-0">
            {getIcon(displayNotification.type)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium line-clamp-2">{displayNotification.message}</p>
          </div>
          {displayNotification.actionLabel && displayNotification.onAction && (
            <button
              onClick={() => {
                displayNotification.onAction();
                removeNotification(displayNotification.id);
              }}
              className="ml-2 px-2 py-1 text-xs font-semibold bg-opacity-20 bg-gray-800 dark:bg-gray-100 rounded hover:bg-opacity-30 transition-all whitespace-nowrap flex-shrink-0"
            >
              {displayNotification.actionLabel}
            </button>
          )}
          <button
            onClick={() => removeNotification(displayNotification.id)}
            className="ml-2 text-lg opacity-60 hover:opacity-100 flex-shrink-0 leading-none"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default Toast;
