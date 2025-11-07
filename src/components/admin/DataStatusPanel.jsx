import React from 'react';
import { useBankData } from '../../context/BankDataContext';

const DataStatusPanel = () => {
  const { 
    dataSource, 
    usingFallbackData, 
    loading, 
    errors, 
    isDataLoaded,
    bankingServices,
    bankingProducts,
    accountTypes,
    bankSettings
  } = useBankData();

  const getStatusIcon = (source) => {
    switch (source) {
      case 'firebase': return '🔥';
      case 'fallback': return '💾';
      case 'loading': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (source) => {
    switch (source) {
      case 'firebase': return 'text-green-600';
      case 'fallback': return 'text-yellow-600';
      case 'loading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Data Status</h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading banking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📊 Data Status Panel</h3>
      
      {usingFallbackData && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 text-sm">
            ⚠️ Some data is using fallback mode. This is normal if Firebase collections are empty or inaccessible.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">Banking Services</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.services)}>
              {getStatusIcon(dataSource.services)} {dataSource.services}
            </span>
            <span className="text-gray-500">({bankingServices.length} items)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Banking Products</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.products)}>
              {getStatusIcon(dataSource.products)} {dataSource.products}
            </span>
            <span className="text-gray-500">({bankingProducts.length} items)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Account Types</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.accountTypes)}>
              {getStatusIcon(dataSource.accountTypes)} {dataSource.accountTypes}
            </span>
            <span className="text-gray-500">({accountTypes.length} items)</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium">Bank Settings</span>
          <div className="flex items-center space-x-2">
            <span className={getStatusColor(dataSource.settings)}>
              {getStatusIcon(dataSource.settings)} {dataSource.settings}
            </span>
            <span className="text-gray-500">({Object.keys(bankSettings).length} settings)</span>
          </div>
        </div>
      </div>

      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-red-800 font-medium mb-2">Errors:</h4>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>• {key}: {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>🔥 Firebase: Data loaded from Firebase</p>
        <p>💾 Fallback: Using default/cached data</p>
        <p>⏳ Loading: Data being fetched</p>
      </div>
    </div>
  );
};

export default DataStatusPanel;
