import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Card, StatCard, EmptyState, Badge } from "../components/ui";

export default function Statements() {
  const [statements, setStatements] = useState([]);

  const fetchStatements = async () => {
    try {
      const q = query(
        collection(db, "statements"),
        where("userId", "==", auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStatements(data);
    } catch (error) {
      console.error("Error fetching statements:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchStatements();
    });
    return () => unsubscribe();
  }, []);

  const totalTransactions = statements.reduce(
    (sum, s) => sum + Number(s.transactionCount || 0),
    0
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Statements</h1>
            <p className="mt-1 text-sm text-slate-500">
              All your uploaded bank statements.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Total Statements" value={statements.length} />
            <StatCard label="Total Transactions" value={totalTransactions} />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="font-semibold text-slate-800">
                Uploaded Statements
              </h2>
            </div>

            {statements.length === 0 ? (
              <EmptyState
                title="No statements yet"
                subtitle="Upload a bank statement to get started."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 font-medium">Bank</th>
                      <th className="px-5 py-3 text-center font-medium">
                        Transactions
                      </th>
                      <th className="px-5 py-3 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statements.map((statement) => (
                      <tr
                        key={statement.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {statement.bank}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <Badge variant="neutral">
                            {statement.transactionCount}
                          </Badge>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/transactions?statementId=${statement.id}`}
                            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            View
                          </Link>
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
