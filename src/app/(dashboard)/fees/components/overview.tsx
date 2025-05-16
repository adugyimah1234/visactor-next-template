'use client';

import { useState } from 'react';
import { 
  BarChart2, 
  CreditCard, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FeesOverview() {
  const [activeTab, setActiveTab] = useState('overview');

  const overviewStats = [
    { 
      title: 'Total Collections', 
      value: '$245,500.00', 
      change: '+12.5%', 
      trend: 'up',
      icon: DollarSign,
      description: 'Total fees collected this month'
    },
    { 
      title: 'Pending Payments', 
      value: '$32,450.00', 
      change: '+5.2%', 
      trend: 'up',
      icon: CreditCard,
      description: 'Awaiting payment processing'
    },
    { 
      title: 'Outstanding Balance', 
      value: '$18,300.00', 
      change: '-3.8%', 
      trend: 'down',
      icon: BarChart2,
      description: 'Total unpaid fees'
    },
    { 
      title: 'Overdue Payments', 
      value: '$9,250.00', 
      change: '+2.3%', 
      trend: 'up',
      icon: Calendar,
      description: 'Past due payments'
    }
  ];

  const recentTransactions = [
    { id: 'TX001', student: 'John Doe', amount: 1200, type: 'payment', date: '2024-05-15' },
    { id: 'TX002', student: 'Jane Smith', amount: 950, type: 'pending', date: '2024-05-14' },
    { id: 'TX003', student: 'Mike Johnson', amount: 750, type: 'overdue', date: '2024-05-10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
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
        ))}
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Collection Progress</CardTitle>
          <CardDescription>Monthly collection targets and achievements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Month Progress</span>
                <span className="text-sm text-muted-foreground">78%</span>
              </div>
              <Progress value={78} className="h-2 mt-2" />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="text-muted-foreground">Target</div>
                <div className="font-medium mt-1">$320,000</div>
              </div>
              <div>
                <div className="text-muted-foreground">Collected</div>
                <div className="font-medium mt-1">$245,500</div>
              </div>
              <div>
                <div className="text-muted-foreground">Remaining</div>
                <div className="font-medium mt-1">$74,500</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.student}</p>
                    <p className="text-sm text-muted-foreground">{transaction.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${transaction.amount}</p>
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
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}