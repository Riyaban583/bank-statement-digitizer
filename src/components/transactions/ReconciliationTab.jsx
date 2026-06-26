import { useMemo } from "react";
import * as XLSX from "xlsx";
import { Card, Button, StatCard, EmptyState } from "../ui";
import { formatCurrency } from "../../utils/format";
import {
  buildReconciliation,
  getMatchedTransaction,
} from "../../utils/matching";

export default function ReconciliationTab({ transactions, invoices }) {
  const { matchedInvoices, unmatchedTransactions } = useMemo(
    () => buildReconciliation(transactions, invoices),
    [transactions, invoices]
  );

  const exportMatched = () => {
    const data = matchedInvoices.map((invoice) => {
      const txn = getMatchedTransaction(invoice, transactions);
      return {
        InvoiceNo: invoice.invoiceNumber,
        Customer: invoice.customerName,
        InvoiceAmount: invoice.invoiceAmount,
        Transaction: txn?.description,
        TransactionAmount: txn?.credit || txn?.debit,
        Date: txn?.date,
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Matched");
    XLSX.writeFile(wb, "matched-invoices.xlsx");
  };

  const exportUnmatched = () => {
    const data = unmatchedTransactions.map((txn) => ({
      Date: txn.date,
      Description: txn.description,
      Amount: txn.credit || txn.debit,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Unmatched");
    XLSX.writeFile(wb, "unmatched-transactions.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Invoices" value={invoices.length} />
        <StatCard
          label="Matched Invoices"
          value={matchedInvoices.length}
          accent="matched"
        />
        <StatCard
          label="Unmatched Transactions"
          value={unmatchedTransactions.length}
          accent="unmatched"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="success"
          onClick={exportMatched}
          disabled={matchedInvoices.length === 0}
        >
          Export Matched
        </Button>
        <Button
          variant="danger"
          onClick={exportUnmatched}
          disabled={unmatchedTransactions.length === 0}
        >
          Export Unmatched
        </Button>
      </div>

      {/* Matched invoices */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">Matched Invoices</h2>
        </div>
        {matchedInvoices.length === 0 ? (
          <EmptyState
            icon="🔗"
            title="No matched invoices"
            subtitle="Add invoices and they will match against transactions automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Invoice No</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Invoice Amount
                  </th>
                  <th className="px-5 py-3 font-medium">Transaction</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Txn Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {matchedInvoices.map((invoice) => {
                  const txn = getMatchedTransaction(invoice, transactions);
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {invoice.customerName}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-800">
                        {formatCurrency(invoice.invoiceAmount)}
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {txn?.description}
                      </td>
                      <td className="px-5 py-3 text-right text-emerald-600">
                        {formatCurrency(txn?.credit || txn?.debit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Unmatched transactions */}
      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-800">
            Unmatched Transactions
          </h2>
        </div>
        {unmatchedTransactions.length === 0 ? (
          <EmptyState
            icon="✅"
            title="Everything reconciled"
            subtitle="All transactions match an invoice."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {unmatchedTransactions.map((txn) => (
                  <tr
                    key={txn.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {txn.date}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {txn.description}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-800">
                      {formatCurrency(txn.credit || txn.debit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
