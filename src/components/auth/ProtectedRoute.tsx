import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { getSafeReturnPath } from '@/utils/authReturnTo';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-shell-surface">
                <Loader2 className="animate-spin text-shell-accent" size={32} />
            </div>
        );
    }

    if (!user) {
        const returnTo = getSafeReturnPath(
            `${location.pathname}${location.search}${location.hash}`
        );

        return (
            <Navigate
                to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                replace
            />
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;
