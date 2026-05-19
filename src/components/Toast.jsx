import { useNotification } from "../Context/NotificationContext";

function Toast() {
  const { notifications, removeNotification } = useNotification();

  const getStyles = (type) => {
    const baseStyles =
      "flex items-center gap-3 p-4 rounded-lg shadow-lg border-l-4 animate-pulse-in";
    switch (type) {
      case "error":
        return `${baseStyles} bg-red-100 dark:bg-red-900/30 border-red-500 text-red-800 dark:text-red-200`;
      case "success":
        return `${baseStyles} bg-green-100 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200`;
      case "warning":
        return `${baseStyles} bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500 text-yellow-800 dark:text-yellow-200`;
      case "info":
      default:
        return `${baseStyles} bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "error":
        return "❌";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 pointer-events-none space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getStyles(notification.type)} pointer-events-auto`}
        >
          <span className="text-xl flex-shrink-0">
            {getIcon(notification.type)}
          </span>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          {notification.actionLabel && notification.onAction && (
            <button
              onClick={() => {
                notification.onAction();
                removeNotification(notification.id);
              }}
              className="px-3 py-1 text-xs font-semibold bg-opacity-20 bg-gray-800 dark:bg-gray-100 rounded hover:bg-opacity-30 transition-all whitespace-nowrap"
            >
              {notification.actionLabel}
            </button>
          )}
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-lg opacity-60 hover:opacity-100 flex-shrink-0 leading-none"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default Toast;
