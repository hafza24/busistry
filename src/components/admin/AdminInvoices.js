import React, { useState, useMemo } from "react";
import { FileText, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Send, CreditCard, Download, CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminInvoices } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { TableSkeleton } from "@/components/ui/loading-skeletons";
import { InvoiceFormDialog } from "./InvoiceFormDialog";
import { InvoiceDetailsDialog } from "./InvoiceDetailsDialog";
import { PaymentRecordDialog } from "./PaymentRecordDialog";
const statusConfig = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-800", icon: FileText },
    sent: { label: "Sent", color: "bg-blue-100 text-blue-800", icon: Send },
    paid: { label: "Paid", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    partially_paid: { label: "Partial", color: "bg-yellow-100 text-yellow-800", icon: Clock },
    overdue: { label: "Overdue", color: "bg-red-100 text-red-800", icon: AlertCircle },
    cancelled: { label: "Cancelled", color: "bg-gray-200 text-gray-600", icon: XCircle },
};
const AdminInvoices = () => {
    const { data: invoices, isLoading } = useAdminInvoices();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const filteredInvoices = useMemo(() => {
        if (!invoices)
            return [];
        return invoices.filter(inv => {
            const matchesSearch = inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (inv.company_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (inv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
            const matchesType = typeFilter === "all" || inv.invoice_type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [invoices, searchTerm, statusFilter, typeFilter]);
    const stats = useMemo(() => {
        if (!invoices)
            return { total: 0, paid: 0, pending: 0, revenue: 0 };
        return {
            total: invoices.length,
            paid: invoices.filter(i => i.status === 'paid').length,
            pending: invoices.filter(i => ['sent', 'partially_paid', 'overdue'].includes(i.status)).length,
            revenue: invoices.reduce((acc, i) => acc + (i.amount_paid || 0), 0),
            outstanding: invoices.reduce((acc, i) => acc + (i.status !== 'cancelled' ? (Number(i.total_amount) - Number(i.amount_paid || 0)) : 0), 0)
        };
    }, [invoices]);
    if (isLoading)
        return <TableSkeleton columns={6} rows={8}/>;
    const handleView = (invoice) => {
        setSelectedInvoice(invoice);
        setIsDetailsOpen(true);
    };
    const handleEdit = (invoice) => {
        setSelectedInvoice(invoice);
        setIsFormOpen(true);
    };
    const handlePayment = (invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentOpen(true);
    };
    return (<div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">PKR {stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue Collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">PKR {stats.outstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending Payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="flex flex-1 items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search invoices..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (<SelectItem key={key} value={key}>{config.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="order">Order</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setSelectedInvoice(null); setIsFormOpen(true); }}>
          <Plus className="h-4 w-4 mr-2"/> Create Invoice
        </Button>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length > 0 ? (filteredInvoices.map((inv) => (<TableRow key={inv.id}>
                  <TableCell className="font-medium">
                    {inv.invoice_number}
                    <div className="text-[10px] text-muted-foreground uppercase">{inv.invoice_type}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inv.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{inv.company_name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{format(new Date(inv.issue_date), "dd MMM yyyy")}</div>
                    {inv.due_date && (<div className="text-[10px] text-muted-foreground">Due: {format(new Date(inv.due_date), "dd MMM yyyy")}</div>)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">PKR {Number(inv.total_amount).toLocaleString()}</div>
                    {inv.amount_paid > 0 && (<div className="text-[10px] text-green-600">Paid: PKR {Number(inv.amount_paid).toLocaleString()}</div>)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`gap-1 ${statusConfig[inv.status].color}`}>
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4"/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(inv)}>
                          <Eye className="h-4 w-4 mr-2"/> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(inv)}>
                          <Edit className="h-4 w-4 mr-2"/> Edit Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePayment(inv)}>
                          <CreditCard className="h-4 w-4 mr-2"/> Record Payment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2"/> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2"/> Cancel Invoice
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>))) : (<TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </Card>

      {/* Dialogs */}
      <InvoiceFormDialog open={isFormOpen} onOpenChange={setIsFormOpen} invoice={selectedInvoice}/>
      
      {selectedInvoice && (<>
          <InvoiceDetailsDialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen} invoice={selectedInvoice}/>
          <PaymentRecordDialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen} invoice={selectedInvoice}/>
        </>)}
    </div>);
};
export default AdminInvoices;
