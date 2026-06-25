import { useState } from "react";
import Navbar from "../components/Navbar";
import { useEffect } from "react";

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
import {
  db,
  auth,
} from "../firebase/firebaseConfig";


export default function Invoices() {
    const [invoiceNumber, setInvoiceNumber] = useState("");

const [customerName, setCustomerName] = useState("");

const [invoiceAmount, setInvoiceAmount] = useState("");
const [invoices, setInvoices] =
  useState([]);

const saveInvoice = async () => {
  try {
    if (
      !invoiceNumber ||
      !customerName ||
      !invoiceAmount
    ) {
      alert("Please fill all fields");
      return;
    }

    await addDoc(
      collection(db, "invoices"),
      {
        invoiceNumber,
        customerName,
        invoiceAmount: Number(invoiceAmount),
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      }
    );

    alert("Invoice Saved");
    fetchInvoices();
    setInvoiceNumber("");
    setCustomerName("");
    setInvoiceAmount("");

  } catch (error) {
    console.error(error);
  }
};

const fetchInvoices = async () => {
  try {
    const q = query(
      collection(db, "invoices"),
      where(
        "userId",
        "==",
        auth.currentUser.uid
      )
    );

    const snapshot = await getDocs(q);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setInvoices(data);

  } catch (error) {
    console.error(error);
  }
};
useEffect(() => {
  fetchInvoices();
}, []);

const deleteInvoice = async (id) => {
  try {

    await deleteDoc(
      doc(db, "invoices", id)
    );

    fetchInvoices();

  } catch (error) {
    console.error(error);
  }
};
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md p-6">

          <h1 className="text-3xl font-bold mb-6">
            Invoice Management
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block font-medium mb-2">
                Invoice Number
              </label>

              <input
  type="text"
  value={invoiceNumber}
  onChange={(e) =>
    setInvoiceNumber(e.target.value)
  }
  className="w-full border rounded-lg p-3"
/>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Customer Name
              </label>

             <input
  type="text"
  value={customerName}
  onChange={(e) =>
    setCustomerName(e.target.value)
  }
  className="w-full border rounded-lg p-3"
/>
            </div>

            <div>
              <label className="block font-medium mb-2">
                Invoice Amount
              </label>

             <input
  type="number"
  value={invoiceAmount}
  onChange={(e) =>
    setInvoiceAmount(e.target.value)
  }
  className="w-full border rounded-lg p-3"
/>
            </div>

          </div>

         <button
  onClick={saveInvoice}
  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
>
  Save Invoice
</button>

<div className="mt-8">

  <h2 className="text-2xl font-bold mb-4">
    Saved Invoices
  </h2>

  <table className="w-full border border-gray-300">

    <thead className="bg-blue-600 text-white">

      <tr>

        <th className="p-3 border">
          Invoice No
        </th>

        <th className="p-3 border">
          Customer
        </th>

        <th className="p-3 border">
          Amount
        </th>

        <th className="p-3 border">
  Action
</th>

      </tr>

    </thead>

    <tbody>

      {invoices.map((invoice) => (

        <tr key={invoice.id}>

          <td className="p-3 border">
            {invoice.invoiceNumber}
          </td>

          <td className="p-3 border">
            {invoice.customerName}
          </td>

          <td className="p-3 border">
            ₹ {invoice.invoiceAmount}
          </td>

          <td className="p-3 border">

  <button
    onClick={() => deleteInvoice(invoice.id)}
    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
  >
    Delete
  </button>

</td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

        </div>
      </div>
    </>
  );
}