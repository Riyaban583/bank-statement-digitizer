import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const saveTransactions = async (transactions) => {
  try {
    for (const transaction of transactions) {
      await addDoc(
        collection(db, "transactions"),
        transaction
      );
    }

    console.log("Transactions saved successfully");
  } catch (error) {
    console.error(
      "Error saving transactions:",
      error
    );
  }
};  