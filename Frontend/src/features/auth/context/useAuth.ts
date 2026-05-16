import { createContext, useContext } from "react";

/**
 * Auth context value shape and consumer hook.
 *
 * Why this lives in its own file (not inside AuthContext.tsx):
 *   ESLint's `react-refresh/only-export-components` rule requires that any
 *   file exporting React components export *only* components. Co-locating
 *   `useAuth` + `AuthContext` with `AuthProvider` violates that and breaks
 *   Vite's Fast Refresh — every edit would force a full module reload.
 *   Splitting non-component exports out keeps HMR coherent.
 */
export interface AuthContextValue {
    authed: boolean;
    encryptionKey: CryptoKey | null;
    login: (key: CryptoKey) => void;
    logout: () => Promise<void>;
    clearKey: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Consumer hook. Throws when called outside the provider so wiring bugs
 * fail loudly at render time instead of surfacing later as undefined reads.
 */
export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}
