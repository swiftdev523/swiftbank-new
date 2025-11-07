import React from "react";
import Modal from "./Modal";
import { useModal } from "../../context/ModalContext";
import LoadingIndicator from "../LoadingIndicator";

const TransactionModal = ({ type, account, onSubmit, isOpen, onClose }) => {
  const { isLoading } = useLoading();
  const loading = isLoading(LoadingTypes.TRANSACTION);

  const getTitle = () => {
    switch (type) {
      case "transfer":
        return "Transfer Money";
      case "deposit":
        return "Make a Deposit";
      case "withdraw":
        return "Withdraw Funds";
      default:
        return "Transaction";
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingIndicator loading={true} message="Processing transaction..." />
      );
    }

    // Render appropriate form based on transaction type
    switch (type) {
      case "transfer":
        return <TransferForm account={account} onSubmit={onSubmit} />;
      case "deposit":
        return <DepositForm account={account} onSubmit={onSubmit} />;
      case "withdraw":
        return <WithdrawForm account={account} onSubmit={onSubmit} />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="md"
      closeOnOverlayClick={!loading}
      showClose={!loading}>
      {renderContent()}
    </Modal>
  );
};

// Form components would be imported from separate files
const TransferForm = ({ account, onSubmit }) => {
  // Transfer form implementation
  return <div>Transfer Form</div>;
};

const DepositForm = ({ account, onSubmit }) => {
  // Deposit form implementation
  return <div>Deposit Form</div>;
};

const WithdrawForm = ({ account, onSubmit }) => {
  // Withdraw form implementation
  return <div>Withdraw Form</div>;
};

export default TransactionModal;
