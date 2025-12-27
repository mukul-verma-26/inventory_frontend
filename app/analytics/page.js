'use client';

import { useEffect, useState } from 'react';
import { getAnalytics, getProducts, getTransactions } from '../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, productsRes, transactionsRes] = await Promise.all([
        getAnalytics(),
        getProducts(),
        getTransactions(),
      ]);
      setAnalytics(analyticsRes.data);
      setProducts(productsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Prepare chart data
  const categoryData = {
    labels: Object.keys(analytics?.categoryBreakdown || {}),
    datasets: [
      {
        label: 'Products per Category',
        data: Object.values(analytics?.categoryBreakdown || {}),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)',
          'rgba(237, 100, 166, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)',
          'rgba(237, 100, 166, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const stockStatusData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock', 'Damaged'],
    datasets: [
      {
        data: [
          products.filter((p) => p.status === 'In Stock').length,
          products.filter((p) => p.status === 'Low Stock').length,
          products.filter((p) => p.status === 'Out of Stock').length,
          products.filter((p) => p.status === 'Damaged').length,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const topProductsByValue = products
    .map((p) => ({
      ...p,
      totalValue: p.quantity * p.unitPrice,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10);

  const valueChartData = {
    labels: topProductsByValue.map((p) => p.name.substring(0, 20)),
    datasets: [
      {
        label: 'Inventory Value (₹)',
        data: topProductsByValue.map((p) => p.totalValue),
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // ABC Analysis
  const sortedByValue = [...products]
    .map((p) => ({
      ...p,
      totalValue: p.quantity * p.unitPrice,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);

  const totalInventoryValue = sortedByValue.reduce((sum, p) => sum + p.totalValue, 0);
  let cumulativeValue = 0;
  const abcAnalysis = sortedByValue.map((product) => {
    cumulativeValue += product.totalValue;
    const cumulativePercent = (cumulativeValue / totalInventoryValue) * 100;
    let classification;
    if (cumulativePercent <= 70) {
      classification = 'A';
    } else if (cumulativePercent <= 90) {
      classification = 'B';
    } else {
      classification = 'C';
    }
    return { ...product, classification, cumulativePercent };
  });

  const aCount = abcAnalysis.filter((p) => p.classification === 'A').length;
  const bCount = abcAnalysis.filter((p) => p.classification === 'B').length;
  const cCount = abcAnalysis.filter((p) => p.classification === 'C').length;

  return (
    <div>
      <div className="mb-4">
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Analytics & Insights
        </h1>
        <p style={{ color: '#64748b' }}>Comprehensive inventory analysis and reporting</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            📦
          </div>
          <div className="stat-value">{analytics?.totalProducts || 0}</div>
          <div className="stat-label">Total SKUs</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            💰
          </div>
          <div className="stat-value">
            ₹{(analytics?.totalValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className="stat-label">Total Value</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            ⚠️
          </div>
          <div className="stat-value">{analytics?.lowStockCount || 0}</div>
          <div className="stat-label">Low Stock Alerts</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff' }}>
            📊
          </div>
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-2 mb-4">
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Products by Category
          </h2>
          <div style={{ height: '300px' }}>
            {Object.keys(analytics?.categoryBreakdown || {}).length > 0 ? (
              <Bar data={categoryData} options={chartOptions} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#64748b',
                }}
              >
                No data available
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Stock Status Distribution
          </h2>
          <div style={{ height: '300px' }}>
            {products.length > 0 ? (
              <Pie data={stockStatusData} options={chartOptions} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#64748b',
                }}
              >
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="card mb-4">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Top 10 Products by Inventory Value
        </h2>
        <div style={{ height: '400px' }}>
          {topProductsByValue.length > 0 ? (
            <Bar data={valueChartData} options={chartOptions} />
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#64748b',
              }}
            >
              No data available
            </div>
          )}
        </div>
      </div>

      {/* ABC Analysis */}
      <div className="card mb-4">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📈 ABC Analysis (Inventory Classification)
        </h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Products classified by their contribution to total inventory value
        </p>

        <div className="grid grid-3 mb-3">
          <div
            className="stat-card"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <div className="stat-value" style={{ color: 'white' }}>
              Class A
            </div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {aCount} products (~70% value)
            </div>
          </div>
          <div className="stat-card" style={{ background: '#fbbf24' }}>
            <div className="stat-value" style={{ color: 'white' }}>
              Class B
            </div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {bCount} products (~20% value)
            </div>
          </div>
          <div className="stat-card" style={{ background: '#94a3b8' }}>
            <div className="stat-value" style={{ color: 'white' }}>
              Class C
            </div>
            <div className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {cCount} products (~10% value)
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total Value</th>
                <th>Classification</th>
              </tr>
            </thead>
            <tbody>
              {abcAnalysis.slice(0, 15).map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td style={{ fontWeight: '600' }}>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.quantity}</td>
                  <td>₹{product.unitPrice.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: '600' }}>
                    ₹{product.totalValue.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        product.classification === 'A'
                          ? 'badge-danger'
                          : product.classification === 'B'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                      style={
                        product.classification === 'A'
                          ? {
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                            }
                          : {}
                      }
                    >
                      Class {product.classification}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Recent Transactions
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Performed By</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No transactions recorded yet
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 20).map((transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {transaction.productId?.name || 'Unknown'}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          transaction.type === 'IN'
                            ? 'badge-success'
                            : transaction.type === 'OUT'
                            ? 'badge-info'
                            : transaction.type === 'DAMAGE'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{transaction.quantity}</td>
                    <td>{transaction.performedBy}</td>
                    <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      {transaction.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
