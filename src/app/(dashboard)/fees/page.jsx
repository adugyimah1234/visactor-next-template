/* eslint-disable no-console */
'use client';
import { useState, useEffect } from 'react';
import { Download, Plus, Receipt, Wallet, History, BarChart, Loader2, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
// Import components
import FeesOverview from './components/overview';
import InvoicesPage from './invoices/page';
import PaymentHistoryPage from './payment-history/page';
import FinancialRecordsPage from './records/page';
import { CreateInvoiceForm } from '@/components/invoice/create-invoice-form';
// Import services
import financialReports from '@/services/financial-reports';
import { useToast } from '@/hooks/use-toast';
export default function FeesPage() {
    // State
    const [activeTab, setActiveTab] = useState('overview');
    const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    // Toast for notifications
    const { toast } = useToast();
    // Define tabs
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'payments', label: 'Payments', icon: Wallet },
        { id: 'records', label: 'Records', icon: History },
    ];
    // Initial loading effect
    useEffect(() => {
        // Simulate initial data loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);
    // Handle tab change
    const handleTabChange = (value) => {
        setActiveTab(value);
        // Optional: prefetch data for the selected tab
    };
    // Export data based on active tab
    const handleExport = async (format = 'pdf') => {
        try {
            setIsExporting(true);
            setError(null);
            let reportType;
            // Determine report type based on active tab
            switch (activeTab) {
                case 'overview':
                    reportType = 'income';
                    break;
                case 'invoices':
                    reportType = 'outstanding_payments';
                    break;
                case 'payments':
                    reportType = 'fee_collection';
                    break;
                case 'records':
                    reportType = 'student_statement';
                    break;
                default:
                    reportType = 'income';
            }
            await financialReports.downloadReport(reportType, { include_details: true }, format);
            toast({
                title: "Export Successful",
                description: `The GHC{activeTab} report has been downloaded.`,
            });
        }
        catch (error) {
            console.error('Error exporting report:', error);
            setError(error instanceof Error ? error.message : 'Failed to export report');
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: error instanceof Error ? error.message : 'An error occurred during export',
            });
        }
        finally {
            setIsExporting(false);
        }
    };
    // Handle creating a new invoice
    const handleNewInvoiceCreated = () => {
        setShowNewInvoiceDialog(false);
        toast({
            title: "Invoice Created",
            description: "New invoice has been created successfully.",
        });
        // If we're on the invoices tab, we should refresh the invoices list
        if (activeTab === 'invoices') {
            // Trigger a refresh of the invoices list
            // This would typically be implemented with a context or state management
        }
    };
    if (error) {
        return (<Alert variant="destructive" className="max-w-lg mx-auto my-8">
        <AlertCircle className="h-4 w-4"/>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>);
    }
    return (<div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="container flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Finance Management</h1>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    {isExporting ? (<Loader2 className="h-4 w-4 mr-2 animate-spin"/>) : (<Download className="h-4 w-4 mr-2"/>)}
                    {isExporting ? "Exporting..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    PDF Document
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Excel Spreadsheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    CSV File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Dialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2"/>
                    New Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Create a new invoice for a student. Add items to the invoice.
                    </DialogDescription>
                  </DialogHeader>
                  <CreateInvoiceForm onSuccess={handleNewInvoiceCreated} onCancel={() => setShowNewInvoiceDialog(false)}/>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {tabs.map((tab) => (<TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4"/>
                  {tab.label}
                </TabsTrigger>))}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {loading ? (<div className="flex items-center justify-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>) : (<FeesOverview />)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {loading ? (<div className="flex items-center justify-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>) : (<InvoicesPage />)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {loading ? (<div className="flex items-center justify-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>) : (<PaymentHistoryPage />)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  {loading ? (<div className="flex items-center justify-center h-96">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                    </div>) : (<FinancialRecordsPage />)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {showNewInvoiceDialog && (<CreateInvoiceForm onSuccess={handleNewInvoiceCreated} onCancel={() => setShowNewInvoiceDialog(false)}/>)}
    </div>);
}
