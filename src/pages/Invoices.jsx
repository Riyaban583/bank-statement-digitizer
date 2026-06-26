import { useEffect, useState } from "react";
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
import { Card, Button, Input, Field, EmptyState } from "../components/ui";
import { formatCurrency } from "../utils/format";

export default function Invoices() {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoices, setInvoices] = useState([]);
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchInvoices();
    });
    return () => unsubscribe();
  }, []);

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
              Add invoices to reconcile them against your transactions.
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
                      <th className="px-5 py-3 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
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
                        <td className="px-5 py-3 text-right">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => deleteInvoice(invoice.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
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
