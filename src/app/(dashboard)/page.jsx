'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Container from '@/components/container';
import ProfessionalDashboard from '@/components/chart-blocks/charts/average-tickets-created';
export default function Home() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [isLoading, user, router]);
    if (isLoading || !user) {
        return (<div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>);
    }
    return (<div>
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-3 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-6 laptop:col-span-4">
          <ProfessionalDashboard />
        </Container>
      </div>
    </div>);
}
