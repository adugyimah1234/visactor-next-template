"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import type { RegistrationStats } from "@/services/registrations";
import registrationService from "@/services/registrations";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";
import { DatePickerWithRange } from "./components/date-range-picker";
import MetricCard from "./components/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function RegistrationStats() {
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await registrationService.getStats(
          dateRange.from?.toISOString(),
          dateRange.to?.toISOString()
        );
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange]);

  const acceptanceRate =
    stats && stats.totalRegistered
      ? Math.round((stats.totalAccepted / stats.totalRegistered) * 100)
      : 0;

  if (error) {
    return (
      <Card className="bg-destructive/10 text-destructive border-destructive/30">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    );
  }

  return (
    <section className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ChartTitle title="Registration Statistics" icon={Users} />
        <DatePickerWithRange value={dateRange} onValueChange={setDateRange} />
      </div>

      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-4 w-52">
            {loading ? (
              <>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </>
            ) : (
              <>
                <MetricCard
                  title="Total Applications"
                  value={stats?.totalRegistered ?? 0}
                  color="#60C2FB"
                />
                <MetricCard
                  title="Accepted"
                  value={stats?.totalAccepted ?? 0}
                  color="#10B981"
                />
                <MetricCard
                  title="Acceptance Rate"
                  value={acceptanceRate}
                  color="#3161F8"
                />
              </>
            )}
          </div>

          <Separator orientation="vertical" className="hidden md:block h-auto" />

          <div className="relative flex-1 min-w-[300px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            ) : (
              <Chart data={stats?.metrics ?? []} />
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
