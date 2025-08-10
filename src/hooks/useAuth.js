/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAuth.ts
import { useState, useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { login as loginService } from '@/services/auth';
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // ✅ updated param name
    const signIn = async (username, password) => {
        var _a, _b;
        setLoading(true);
        setError(null);
        try {
            // ✅ pass username to service
            const data = await loginService(username, password);
            if ((data === null || data === void 0 ? void 0 : data.token) && (data === null || data === void 0 ? void 0 : data.user)) {
                await context.login(data.token, { id: data.user.id, role: data.user.role });
            }
            else {
                setError('Login failed: Invalid response.');
                throw new Error('Invalid login response');
            }
        }
        catch (err) {
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || 'Login failed');
            throw err;
        }
        finally {
            setLoading(false);
        }
    };
    return Object.assign(Object.assign({}, context), { loading,
        error,
        signIn });
};
