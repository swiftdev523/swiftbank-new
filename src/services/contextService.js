// Service to manage context initialization and updates
// This will be the central point for Firebase integration later

export class ContextService {
  static validateUserData(userData) {
    if (!userData) return false;
    
    const requiredFields = ['id', 'username', 'email', 'role', 'permissions'];
    return requiredFields.every(field => userData.hasOwnProperty(field));
  }

  static validateAccountData(accountData) {
    if (!accountData) return false;
    
    const requiredFields = ['accountNumber', 'type', 'balance'];
    return requiredFields.every(field => accountData.hasOwnProperty(field));
  }

  static validateTransactionData(transactionData) {
    if (!transactionData) return false;
    
    const requiredFields = ['id', 'type', 'amount', 'description', 'date'];
    return requiredFields.every(field => transactionData.hasOwnProperty(field));
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  }

  static generateTransactionId() {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateAccountNumber() {
    return `${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }
}

export class StateManager {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

export const createContextState = (initialState) => {
  return new StateManager(initialState);
};