"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True once the component has hydrated on the client. Used to defer
 * client-only APIs (e.g. `document.body` for a portal) past the SSR pass.
 * Implemented via `useSyncExternalStore` rather than `useState` + `useEffect`
 * so it never triggers a synchronous setState-in-effect render cascade.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
