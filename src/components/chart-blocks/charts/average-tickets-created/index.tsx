/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  Clock,
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  Area, 
  AreaChart, 
  Bar,
  BarChart,
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import registrationService from '@/services/registrations';

interface RegistrationStats {
  totalRegistered: number;
  totalPending: number;
  totalAccepted: number;
  totalRejected: number;
  metrics: {
    date: string;
    count: number;
    status: 'pending' | 'approved' | 'rejected';
  }[];
}

// Type definitions
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

// Metric Card Component
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'blue' 
}) => {
  const colorVariants: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };

  const iconColors: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <div className=" rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold  mb-2">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center gap-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendValue}%
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorVariants[color]}`}>
          <Icon className={`h-6 w-6 ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  );
};

// Chart Card Component
interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description, children, className = "" }) => (
  <div className={`rounded-xl border  shadow-sm ${className}`}>
    <div className="p-6 pb-4">
      <h3 className="text-lg font-semibold  mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
    <div className="px-6 pb-6">
      {children}
    </div>
  </div>
);

// Custom Tooltip Component
interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="text-sm font-medium text-gray-900 mb-2">
          {new Date(label).toLocaleDateString()}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Main Dashboard Component
export default function ProfessionalDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState<RegistrationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date range calculation
  const getDateRange = (range: string) => {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
    }
    
    return { start: start.toISOString(), end: end.toISOString() };
  };

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const { start, end } = getDateRange(timeRange);
        const data = await registrationService.getStats(start, end);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  // Transform metrics data for charts
  const getChartData = () => {
    if (!stats) return [];
    
    const grouped = stats.metrics.reduce((acc, metric) => {
      const existing = acc.find(item => item.date === metric.date);
      if (existing) {
        existing[metric.status] = metric.count;
      } else {
        acc.push({
          date: metric.date,
          pending: metric.status === 'pending' ? metric.count : 0,
          approved: metric.status === 'approved' ? metric.count : 0,
          rejected: metric.status === 'rejected' ? metric.count : 0,
        });
      }
      return acc;
    }, [] as any[]);
    
    return grouped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get pie chart data
  const getPieData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Approved', value: stats.totalAccepted, color: '#10B981' },
      { name: 'Pending', value: stats.totalPending, color: '#F59E0B' },
      { name: 'Rejected', value: stats.totalRejected, color: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  // Calculate acceptance rate
  const acceptanceRate = stats && stats.totalRegistered > 0 
    ? Math.round((stats.totalAccepted / stats.totalRegistered) * 100) 
    : 0;

  // Calculate trend (simplified - comparing first and last data points)
  const getTrend = () => {
    const chartData = getChartData();
    if (chartData.length < 2) return { value: 0, direction: 'up' as const };
    
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const firstTotal = first.pending + first.approved + first.rejected;
    const lastTotal = last.pending + last.approved + last.rejected;
    
    if (firstTotal === 0) return { value: 0, direction: 'up' as const };
    
    const change = ((lastTotal - firstTotal) / firstTotal) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' as const : 'down' as const
    };
  };

  const trend = getTrend();
  const chartData = getChartData();
  const pieData = getPieData();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-full mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold ">Dashboard</h1>
            <p className="text-gray-600 mt-1">Registration analytics and insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className=" border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : (
            <>
              <MetricCard
                title="Total Applications"
                value={stats?.totalRegistered ?? 0}
                icon={Users}
                trend={trend.direction}
                trendValue={trend.value}
                color="blue"
              />
              <MetricCard
                title="Approved"
                value={stats?.totalAccepted ?? 0}
                icon={UserCheck}
                trend="up"
                trendValue={8.2}
                color="green"
              />
              <MetricCard
                title="Pending Review"
                value={stats?.totalPending ?? 0}
                icon={Clock}
                trend="down"
                trendValue={3.1}
                color="yellow"
              />
              <MetricCard
                title="Acceptance Rate"
                value={acceptanceRate}
                icon={Activity}
                trend="up"
                trendValue={2.4}
                color="blue"
              />
            </>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Area Chart */}
          <ChartCard 
            title="Registration Trends" 
            description="Daily registration statistics over time"
            className="lg:col-span-2"
          >
            {loading ? (
              <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Approved"
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="1"
                    stroke="#F59E0B"
                    fill="#F59E0B"
                    fillOpacity={0.6}
                    name="Pending"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Rejected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Pie Chart */}
          <ChartCard 
            title="Status Distribution" 
            description="Current application status breakdown"
          >
            {loading ? (
              <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <div className="text-gray-500">Loading chart...</div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {item.value} ({Math.round((item.value / (stats?.totalRegistered ?? 1)) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </ChartCard>
        </div>

        {/* Bar Chart */}
        <ChartCard 
          title="Weekly Performance" 
          description="Comparison of application processing by day"
        >
          {loading ? (
            <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-gray-500">Loading chart...</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'short' 
                  })}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" fill="#EF4444" name="Rejected" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}