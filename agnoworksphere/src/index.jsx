import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);

// Service worker temporarily disabled for development
// Register service worker for PWA functionality
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);

//         // Check for updates
//         registration.addEventListener('updatefound', () => {
//           const newWorker = registration.installing;
//           newWorker.addEventListener('statechange', () => {
//             if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
//               // New content is available, show update notification
//               if (window.confirm('New version available! Reload to update?')) {
//                 newWorker.postMessage({ type: 'SKIP_WAITING' });
//                 window.location.reload();
//               }
//             }
//           });
//         });
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }
