'use client';

import Container from '@/components/container';
import ProfessionalDashboard from '@/components/chart-blocks/charts/average-tickets-created';

export default function Home() {

  return (
    <div>
      <div className="grid grid-cols-1 divide-y border-b border-border laptop:grid-cols-3 laptop:divide-x laptop:divide-y-0 laptop:divide-border">
        <Container className="py-6 laptop:col-span-4">
          <ProfessionalDashboard />
        </Container>
      </div>
    </div>
  );
}
