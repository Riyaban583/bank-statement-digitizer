import { Badge, EmptyState } from "../ui";
import { formatCurrency } from "../../utils/format";

function StatusBadge({ matched }) {
  return matched ? (
    <Badge variant="success">● Matched</Badge>
  ) : (
    <Badge variant="danger">● Unmatched</Badge>
  );
}

function LoadingRows() {
  return (
    <div className="p-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex animate-pulse gap-4 border-b border-slate-100 py-4">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-4 flex-1 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

export default function TransactionsTable({
  rows,
  loading,
  isEmpty,
  isMatched,
}) {
  if (loading) return <LoadingRows />;

  if (isEmpty) {
    return (
      <EmptyState
        title="No transactions found"
        subtitle="Try changing your filters or upload a bank statement."
      />
    );
  }

  return (
    <div className="max-h-[600px] overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Description</th>
            <th className="px-4 py-3 text-right font-medium">Debit</th>
            <th className="px-4 py-3 text-right font-medium">Credit</th>
            <th className="px-4 py-3 text-right font-medium">Balance</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((txn) => (
            <tr
              key={txn.id}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                {txn.date}
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {txn.description}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-rose-600">
                {txn.debit ? formatCurrency(txn.debit) : "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right text-emerald-600">
                {txn.credit ? formatCurrency(txn.credit) : "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right font-semibold text-slate-800">
                {formatCurrency(txn.balance)}
              </td>
              <td className="px-4 py-3 text-center">
                <StatusBadge matched={isMatched(txn)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
