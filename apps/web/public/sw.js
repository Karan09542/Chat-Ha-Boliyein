/* self.addEventListener("message", (event) => {
  event.notification.close();

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification(event.data.message);
  }
}); */


self.addEventListener("message", (event) => {

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    self.registration.showNotification("📨 New Message", {
      body: event.data.message,
      data: { url: "/" }, // 🔁 Customize this if needed
    });
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

