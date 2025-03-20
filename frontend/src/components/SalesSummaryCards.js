// frontend/src/components/SalesSummaryCards.js
import React from 'react';
import "../styles/sale.css"

const SalesSummaryCards = ({ totalRevenue, totalSales, projectedRevenue, formatCurrency }) => {
  return (
    <div className="row mb-4">
      <div className="col-12 col-md-4 mb-3 mb-md-0">
        <div className="card dashboard-card sales-summary-card">
          <div className="card-header dashboard-card-header bg-info text-white">
            Total Revenue
          </div>
          <div className="card-body dashboard-card-body text-center">
            <p className="sales-summary-value">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-md-4 mb-3 mb-md-0">
        <div className="card dashboard-card sales-summary-card">
          <div className="card-header dashboard-card-header bg-info text-white">
            Total Sales
          </div>
          <div className="card-body dashboard-card-body text-center">
            <p className="sales-summary-value">{totalSales}</p>
          </div>
        </div>
      </div>
      
      <div className="col-12 col-md-4">
        <div className="card dashboard-card sales-summary-card">
          <div className="card-header dashboard-card-header bg-info text-white">
            Projected Revenue
          </div>
          <div className="card-body dashboard-card-body text-center">
            <p className="sales-summary-value">{formatCurrency(projectedRevenue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSummaryCards;
