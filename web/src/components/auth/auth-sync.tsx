"use client";

import { useEffect, useRef } from "react";
import { useAuthStore, User } from "@/stores/useAuthStore";

interface AuthSyncProps {
    user: User | null;
    token: string | null;
    children: React.ReactNode;
}

/**
 * Synchronizes server-side authentication state with the client-side Zustand store.
 * Prevents hydration flashes by initializing the store immediately.
 */
export function AuthSync({ user, token, children }: AuthSyncProps) {
    const isHydrated = useRef(false);

    // We hydrate immediately upon render before effects to avoid unauthenticated UI flashes
    if (!isHydrated.current) {
        if (user && token) {
            useAuthStore.getState().setAuth(user, token);
        } else if (!user) {
            // If server says no user, enforce logout state
            useAuthStore.getState().logout();
        }
        isHydrated.current = true;
    }

    // Effect to handle any subsequent changes or just for safety
    useEffect(() => {
        if (user && token) {
            useAuthStore.getState().setAuth(user, token);
        }
    }, [user, token]);

    return <>{children}</>;
}
