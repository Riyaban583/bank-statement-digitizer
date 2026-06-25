import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  db,
  auth,
} from "../firebase/firebaseConfig";
import * as XLSX from "xlsx";

export default function Entries() {
  const [transactions, setTransactions] =
    useState([]);
    const [message, setMessage] =
  useState("");
  const [invoices, setInvoices] =
  useState([]);

  

  const isMatched = (invoice, transaction) => {
  const invoiceName = invoice.customerName
    .toLowerCase()
    .trim();

  const description = transaction.description
    .toLowerCase();

  const amount = Number(
    transaction.credit ||
    transaction.debit ||
    0
  );

  return (
    description.includes(invoiceName) &&
    amount === Number(invoice.invoiceAmount)
  );
};

 const matchedInvoices = invoices.filter(
  (invoice) =>
    transactions.some((txn) =>
      isMatched(invoice, txn)
    )
);

const unmatchedInvoices = invoices.filter(
  (invoice) =>
    !transactions.some((txn) =>
      isMatched(invoice, txn)
    )
);
const matchedTransactions = transactions.filter(
  (txn) =>
    invoices.some((invoice) =>
      isMatched(invoice, txn)
    )
);

const unmatchedTransactions = transactions.filter(
  (txn) =>
    !invoices.some((invoice) =>
      isMatched(invoice, txn)
    )
);
const getMatchedTransaction = (invoice) => {
  return transactions.find((txn) =>
    isMatched(invoice, txn)
  );
};

  const exportMatchedExcel = () => {
  const data = matchedInvoices.map((invoice) => {

  const txn = getMatchedTransaction(invoice);

  return {
    InvoiceNo: invoice.invoiceNumber,
    Customer: invoice.customerName,
    InvoiceAmount: invoice.invoiceAmount,
    Transaction: txn?.description,
    TransactionAmount: txn?.credit || txn?.debit,
    Date: txn?.date,
  };

});

const worksheet =
  XLSX.utils.json_to_sheet(data);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Matched"
  );

  XLSX.writeFile(
    workbook,
    "matched-transactions.xlsx"
  );
};

const exportUnmatchedExcel = () => {
  const data = unmatchedTransactions.map((txn) => ({
  Date: txn.date,
  Description: txn.description,
  Amount: txn.credit || txn.debit,
}));

const worksheet =
  XLSX.utils.json_to_sheet(data);
  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Unmatched"
  );

  XLSX.writeFile(
    workbook,
    "unmatched-transactions.xlsx"
  );
};


  const fetchTransactions = async () => {
    try {
        console.log(
  "Current User:",
  auth.currentUser
);

console.log(
  "UID:",
  auth.currentUser?.uid
);
      const q = query(
        collection(db, "transactions"),
        where(
          "userId",
          "==",
          auth.currentUser.uid
        )
      );

      const snapshot =
        await getDocs(q);

        console.log(
  "Current User:",
  auth.currentUser
);

console.log(
  "UID:",
  auth.currentUser?.uid
);
console.log(
  "Docs Found:",
  snapshot.docs.length
);

snapshot.docs.forEach((doc) =>
  console.log(doc.data())
);

      const data =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      setTransactions(data);
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error
      );
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
    console.error(
      "Error fetching invoices:",
      error
    );
  }
};

  useEffect(() => {
  fetchTransactions();
  fetchInvoices();
}, []);

  

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md p-6">

          <h1 className="text-3xl font-bold mb-4">
            Entries Dashboard
          </h1>

          <p className="text-gray-600 mb-6">
            Matched and Unmatched Transactions
          </p>

          {message && (
  <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
    {message}
  </div>
)}

          <div className="mb-6">
  <button
    onClick={exportMatchedExcel}
    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md"
  >
    Export Matched Excel
  </button>

  <button
  onClick={exportUnmatchedExcel}
  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md ml-3"
>
  Export Unmatched Excel
</button>
</div>


          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="font-semibold">
              Total Transactions:{" "}
              {transactions.length}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

  <div className="bg-green-100 p-4 rounded-lg">
   <h3 className="font-bold">
  Matched Transactions
</h3>

    <p className="text-2xl font-bold">
  {matchedTransactions.length}
</p>
  </div>

  <div className="bg-red-100 p-4 rounded-lg">
  <h3 className="font-bold">
  Unmatched Transactions
</h3>

   <p className="text-2xl font-bold">
  {unmatchedTransactions.length}
</p>
  </div>

</div>
<div className="bg-white border rounded-lg overflow-hidden">

  <div className="p-4 border-b">
    <h2 className="text-xl font-semibold">
  Matched Invoices
</h2>
  </div>

  <table className="w-full">
    <thead>
  <tr className="bg-green-600 text-white">

    <th className="p-3 text-left">
      Invoice No
    </th>

    <th className="p-3 text-left">
      Customer
    </th>

    <th className="p-3 text-left">
      Invoice Amount
    </th>

    <th className="p-3 text-left">
  Transaction
</th>

<th className="p-3 text-left">
  Transaction Amount
</th>

  </tr>
</thead>

   <tbody>

  {matchedInvoices.map((invoice) => {

  const txn = getMatchedTransaction(invoice);

  return (
    <tr
      key={invoice.id}
      className="border-b"
    >

      <td className="p-3">
        {invoice.invoiceNumber}
      </td>

      <td className="p-3">
        {invoice.customerName}
      </td>

      <td className="p-3">
        ₹ {invoice.invoiceAmount}
      </td>

      <td className="p-3">
  {txn?.description}
</td>

<td className="p-3">
  ₹ {txn?.credit || txn?.debit}
</td>

    </tr>

  );
})}

</tbody>
  </table>

</div>
<div className="bg-white border rounded-lg overflow-hidden mt-6">

  <div className="p-4 border-b">
   <h2 className="text-xl font-semibold">
  Unmatched Transactions
</h2>
  </div>

  <table className="w-full">
   <thead>
  <tr className="bg-red-600 text-white">
   <th className="p-3">
  Date
</th>

<th className="p-3">
  Description
</th>

<th className="p-3">
  Amount
</th>
  </tr>
</thead>

   <tbody>
  {unmatchedTransactions.map((txn) => (
    <tr key={txn.id} className="border-b">
      <td className="p-3">
        {txn.date}
      </td>

      <td className="p-3">
        {txn.description}
      </td>

      <td className="p-3">
       ₹ {txn.credit || txn.debit}
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