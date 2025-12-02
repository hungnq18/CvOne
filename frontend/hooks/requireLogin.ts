import { useRouter } from "next/navigation";

export function useRequireLogin() {
    const router = useRouter();

    const requireLogin = () => {
        const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("token="))
            ?.split("=")[1];

        if (!token) {
            const currentUrl = window.location.pathname + window.location.search;
            router.push(`/login?callbackUrl=${encodeURIComponent(currentUrl)}`);
            return false;
        }

        return true;
    };

    return requireLogin;
}
