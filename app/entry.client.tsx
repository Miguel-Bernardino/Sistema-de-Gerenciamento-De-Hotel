import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

// Start MSW before hydration (client-side only)
async function prepare() {
  if (typeof window !== 'undefined' && import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: false, // Mostra logs para debug
    });
    console.log('[MSW] Service Worker iniciado');
    return;
  }
  return Promise.resolve();
}

prepare().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>
    );
  });
});
