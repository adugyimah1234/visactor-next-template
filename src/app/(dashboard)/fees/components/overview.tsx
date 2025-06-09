/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart2, 
  CreditCard, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Import services
import dashboardService, { type FinancialSummary, type CollectionProgress, type Transaction } from '@/services/dashboard';
import financialReports, { type ExportFormat } from '@/services/financial-reports';

type TrendDirection = 'up' | 'down' | 'neutral';

interface FinancialStatCard {
  title: string;
  value: string;
  change: string;
  trend: TrendDirection;
  icon: any;  // LucideIcon type
  description: string;
}

export default function FeesOverview() {
  // State for data
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [collectionProgress, setCollectionProgress] = useState<CollectionProgress | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // State for UI
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch financial overview data
      const financialOverview = await dashboardService.getFinancialOverview();
      
      setFinancialSummary(financialOverview.summary);
      setCollectionProgress(financialOverview.collectionProgress);
      setTransactions(financialOverview.recentTransactions);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  // Refresh data function
  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  // Export report function
  const exportReport = async (format: ExportFormat = 'pdf') => {
    try {
      setExporting(true);
      await financialReports.downloadReport('income', {
        period: 'monthly',
        include_details: true
      }, format);
    } catch (error) {
      console.error('Error exporting report:', error);
      setError(error instanceof Error ? error.message : 'Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  // Format financial stats for display
  const getFormattedStats = (): FinancialStatCard[] => {
    if (!financialSummary) return [];
    
    return [
      { 
        title: 'Total Collections', 
        value: financialReports.formatCurrency(financialSummary.totalCollections), 
        change: `${financialSummary.totalCollectionsChange > 0 ? '+' : ''}${financialSummary.totalCollectionsChange.toFixed(1)}%`, 
        trend: financialSummary.totalCollectionsChange > 0 ? 'up' : 'down',
        icon: DollarSign,
        description: 'Total fees collected this month'
      },
      { 
        title: 'Pending Payments', 
        value: financialReports.formatCurrency(financialSummary.pendingPayments), 
        change: `${financialSummary.pendingPaymentsChange > 0 ? '+' : ''}${financialSummary.pendingPaymentsChange.toFixed(1)}%`, 
        trend: financialSummary.pendingPaymentsChange > 0 ? 'up' : 'down',
        icon: CreditCard,
        description: 'Awaiting payment processing'
      },
      { 
        title: 'Outstanding Balance', 
        value: financialReports.formatCurrency(financialSummary.outstandingBalance), 
        change: `${financialSummary.outstandingBalanceChange > 0 ? '+' : ''}${financialSummary.outstandingBalanceChange.toFixed(1)}%`, 
        trend: financialSummary.outstandingBalanceChange < 0 ? 'up' : 'down', // For outstanding balance, negative change is good
        icon: BarChart2,
        description: 'Total unpaid fees'
      },
      { 
        title: 'Overdue Payments', 
        value: financialReports.formatCurrency(financialSummary.overduePayments), 
        change: `${financialSummary.overduePaymentsChange > 0 ? '+' : ''}${financialSummary.overduePaymentsChange.toFixed(1)}%`, 
        trend: financialSummary.overduePaymentsChange < 0 ? 'up' : 'down', // For overdue payments, negative change is good
        icon: Calendar,
        description: 'Past due payments'
      }
    ];
  };

  // Format transactions for display
  const formattedTransactions = transactions.map(transaction => ({
    id: transaction.id,
    student: transaction.student_name,
    amount: transaction.amount,
    type: transaction.type,
    date: new Date(transaction.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button variant="outline" size="sm" className="mt-2" onClick={refreshData}>
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading || refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportReport('pdf')} 
            disabled={loading || exporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // Loading skeletons for stats cards
          Array(4).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <div className="flex items-center pt-1">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-3 w-10 ml-1" />
                  <Skeleton className="h-3 w-20 ml-2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Actual stats cards
          getFormattedStats().map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center pt-1">
                  {stat.trend === 'up' ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  } ml-1`}>
                    {stat.change}
                  </span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection Progress</CardTitle>
          <CardDescription>
            {collectionProgress ? 
              `Collection period: ${collectionProgress.period}` : 
              'Monthly collection targets and achievements'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {loading ? (
            // Loading skeleton for collection progress
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-10" />
                </div>
                <Skeleton className="h-2 w-full mt-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <Skeleton className="h-5 w-20 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto mt-1" />
                </div>
                <div>
                  <Skeleton className="h-5 w-20 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto mt-1" />
                </div>
                <div>
                  <Skeleton className="h-5 w-20 mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto mt-1" />
                </div>
              </div>
            </div>
          ) : (
            // Actual collection progress
            collectionProgress && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Collection Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {`${collectionProgress.percentage.toFixed(1)}%`}
                    </span>
                  </div>
                  <Progress value={collectionProgress.percentage} className="h-2 mt-2" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="text-muted-foreground">Target</div>
                    <div className="font-medium mt-1">
                      {financialReports.formatCurrency(collectionProgress.target)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Collected</div>
                    <div className="font-medium mt-1">
                      {financialReports.formatCurrency(collectionProgress.collected)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Remaining</div>
                    <div className="font-medium mt-1">
                      {financialReports.formatCurrency(collectionProgress.remaining)}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Loading skeleton for transactions
            <div className="space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-5 w-20 mb-1 ml-auto" />
                    <Skeleton className="h-5 w-16 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              {formattedTransactions.length > 0 ? (
                <div className="space-y-4">
                  {formattedTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.student}</p>
                        <p className="text-sm text-muted-foreground">{transaction.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{financialReports.formatCurrency(transaction.amount)}</p>
                        <Badge variant={
                          transaction.type === 'payment' ? 'default' :
                          transaction.type === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {transaction.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <p className="text-muted-foreground mb-2">No recent transactions found</p>
                  <Button variant="outline" size="sm" onClick={refreshData}>
                    Refresh
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing the {transactions.length} most recent transactions
          </div>
          <Button variant="link" size="sm">
            View All
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
