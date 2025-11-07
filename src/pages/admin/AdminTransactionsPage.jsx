import React from "react";
import EditableTransactionManagement from "../../components/admin/EditableTransactionManagement";
import TransactionGenerator from "../../components/admin/TransactionGenerator";

const AdminTransactionsPage = () => {
  return (
    <div className="space-y-6">
      {/* Transaction Generator Tool */}
      <TransactionGenerator />

      {/* Existing Transaction Management */}
      <EditableTransactionManagement />
    </div>
  );
};

export default AdminTransactionsPage;
