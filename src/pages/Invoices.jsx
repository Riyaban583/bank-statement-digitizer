import { Fragment, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { Card, Button, Input, Field, EmptyState, Badge } from "../components/ui";
import { formatCurrency } from "../utils/format";
import { getMatchedTransaction } from "../utils/matching";

export default function Invoices() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchInvoices = async () => {
    try {
      const q = query(
        collection(db, "invoices"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  // Transactions are needed so each invoice can be reconciled against them.
  const fetchTransactions = async () => {
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        // Firestore can store these as strings — normalize to numbers like
        // the Transactions page does, so amount matching works reliably.
        return {
          id: doc.id,
          ...d,
          debit: Number(d.debit) || 0,
          credit: Number(d.credit) || 0,
          balance: Number(d.balance) || 0,
        };
      });
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchInvoices();
        fetchTransactions();
      }
    });
    return () => unsubscribe();
  }, []);

  // Precompute the matched transaction (if any) for every invoice.
  const matchedByInvoice = useMemo(() => {
    const map = {};
    invoices.forEach((invoice) => {
      map[invoice.id] = getMatchedTransaction(invoice, transactions);
    });
    return map;
  }, [invoices, transactions]);

  const saveInvoice = async () => {
    if (!invoiceNumber || !customerName || !invoiceAmount) {
      alert("Please fill all fields");
      return;
    }

    try {
      setSaving(true);
      await addDoc(collection(db, "invoices"), {
        invoiceNumber,
        customerName,
        invoiceAmount: Number(invoiceAmount),
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      setInvoiceNumber("");
      setCustomerName("");
      setInvoiceAmount("");
      fetchInvoices();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      await deleteDoc(doc(db, "invoices", id));
      if (expandedId === id) setExpandedId(null);
      fetchInvoices();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500">
              Add invoices to reconcile them against your transactions. Click an
              invoice to see its matched transaction.
            </p>
          </div>

          {/* Add invoice form */}
          <Card className="mb-6 p-6">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              New Invoice
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Invoice Number">
                <Input
                  type="text"
                  placeholder="INV-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </Field>
              <Field label="Customer Name">
                <Input
                  type="text"
                  placeholder="Customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </Field>
              <Field label="Amount">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                />
              </Field>
            </div>
            <div className="mt-5">
              <Button onClick={saveInvoice} disabled={saving}>
                {saving ? "Saving..." : "Save Invoice"}
              </Button>
            </div>
          </Card>

          {/* Saved invoices */}
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-800">Saved Invoices</h2>
            </div>

            {invoices.length === 0 ? (
              <EmptyState
                icon="🧾"
                title="No invoices yet"
                subtitle="Add your first invoice above."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 font-medium">Invoice No</th>
                      <th className="px-5 py-3 font-medium">Customer</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Amount
                      </th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const matchedTxn = matchedByInvoice[invoice.id];
                      const isExpanded = expandedId === invoice.id;
                      return (
                        <Fragment key={invoice.id}>
                          <tr
                            onClick={() =>
                              setExpandedId(isExpanded ? null : invoice.id)
                            }
                            className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-5 py-3 font-medium text-slate-800">
                              <span className="mr-2 inline-block w-3 text-slate-400">
                                {isExpanded ? "▾" : "▸"}
                              </span>
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-5 py-3 text-slate-600">
                              {invoice.customerName}
                            </td>
                            <td className="px-5 py-3 text-right text-slate-800">
                              {formatCurrency(invoice.invoiceAmount)}
                            </td>
                            <td className="px-5 py-3">
                              <Badge
                                variant={matchedTxn ? "success" : "neutral"}
                              >
                                {matchedTxn ? "Matched" : "Unmatched"}
                              </Badge>
                            </td>
                            <td className="px-5 py-3 text-right">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteInvoice(invoice.id);
                                }}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>

                          {isExpanded && (
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                              <td colSpan={5} className="px-5 py-4">
                                {matchedTxn ? (
                                  <MatchedTransaction txn={matchedTxn} />
                                ) : (
                                  <p className="text-sm text-slate-500">
                                    No matching transaction found for this
                                    invoice. A transaction matches when its
                                    description contains the customer name (or
                                    invoice number) and the amount is equal.
                                  </p>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

/* Details of the transaction reconciled to an invoice. */
function MatchedTransaction({ txn }) {
  const isCredit = Number(txn.credit) > 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Matched Transaction
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        <Detail label="Date" value={txn.date || "—"} />
        <Detail label="Type" value={isCredit ? "Credit" : "Debit"} />
        <Detail
          label="Amount"
          value={formatCurrency(isCredit ? txn.credit : txn.debit)}
          valueClassName={isCredit ? "text-emerald-600" : "text-rose-600"}
        />
        <Detail label="Balance" value={formatCurrency(txn.balance)} />
        <Detail label="Category" value={txn.category || "—"} />
        <Detail
          label="Description"
          value={txn.description || "—"}
          className="col-span-2 sm:col-span-3"
        />
      </div>
    </div>
  );
}

function Detail({ label, value, valueClassName = "text-slate-800", className }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}
