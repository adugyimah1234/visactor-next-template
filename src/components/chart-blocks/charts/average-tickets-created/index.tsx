"use client";

import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import type { RegistrationStats } from "@/services/registrations";
import registrationService from "@/services/registrations";
import ChartTitle from "../../components/chart-title";
import Chart from "./chart";
import { DatePickerWithRange } from "./components/date-range-picker";
import MetricCard from "./components/metric-card";

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

  if (error) {
    return (
      <div className="text-destructive p-4 rounded-md bg-destructive/10">
        Error: {error}
      </div>
    );
  }

  const acceptanceRate = stats 
    ? Math.round((stats.totalAccepted / stats.totalRegistered) * 100) || 0
    : 0;

  return (
    <section className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ChartTitle title="Registration Statistics" icon={Users} />
        <DatePickerWithRange 
          className="" 
          value={dateRange}
          onValueChange={setDateRange}
        />
      </div>
      <div className="flex flex-wrap">
        <div className="my-4 flex w-52 shrink-0 flex-col justify-center gap-6">
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
        </div>
        <div className="relative h-96 min-w-[320px] flex-1">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Chart data={stats?.metrics ?? []} />
          )}
        </div>
      </div>
    </section>
  );
}
