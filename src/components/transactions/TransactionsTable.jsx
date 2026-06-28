// src/components/transactions/TransactionsTable.jsx
// ✅ FIX: debit/credit amounts correctly display karo

import { formatCurrency } from "../../utils/format";

export default function TransactionsTable({ rows, loading, isEmpty, isMatched }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <svg className="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading transactions…
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p className="text-lg font-medium">No transactions found</p>
        <p className="mt-1 text-sm">Try adjusting your filters or upload a statement.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <th className="px-5 py-3 text-left">Date</th>
            <th className="px-5 py-3 text-left">Description</th>
            <th className="px-5 py-3 text-right">Debit</th>
            <th className="px-5 py-3 text-right">Credit</th>
            <th className="px-5 py-3 text-right">Balance</th>
            <th className="px-5 py-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((tx, i) => {
            const matched = isMatched(tx);

            // ✅ KEY FIX: Number() se ensure karo ki value numeric hai
            const debit = Number(tx.debit) || 0;
            const credit = Number(tx.credit) || 0;
            const balance = Number(tx.balance) || 0;

            return (
              <tr
                key={tx.id || i}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-5 py-3 font-medium text-blue-500">
                  {tx.date}
                </td>
                <td className="px-5 py-3 text-slate-700">
                  {tx.description}
                </td>

                {/* ── Debit column ─────────────────────────── */}
                <td className="px-5 py-3 text-right">
                  {debit > 0 ? (
                    <span className="font-medium text-rose-500">
                      {formatCurrency(debit)}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* ── Credit column ────────────────────────── */}
                <td className="px-5 py-3 text-right">
                  {credit > 0 ? (
                    <span className="font-medium text-emerald-500">
                      {formatCurrency(credit)}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* ── Balance column ───────────────────────── */}
                <td className="px-5 py-3 text-right text-slate-600">
                  {formatCurrency(balance)}
                </td>

                {/* ── Status badge ─────────────────────────── */}
                <td className="px-5 py-3 text-center">
                  {matched ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Matched
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-500 ring-1 ring-rose-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      Unmatched
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}