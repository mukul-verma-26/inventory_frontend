'use client';

import { useEffect, useState } from 'react';
import { getAnalytics, seedData } from '../lib/api';
import Link from 'next/link';

export default function Home() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setSeeding(true);
      await seedData();
      alert('Sample data created successfully!');
      fetchAnalytics();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error creating sample data');
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-between align-center mb-4">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b' }}>Real-time inventory overview and insights</p>
        </div>
        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="btn btn-secondary btn-sm"
        >
          {seeding ? 'Loading...' : '🌱 Seed Sample Data'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4 mb-4">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            📦
          </div>
          <div className="stat-value">{analytics?.totalProducts || 0}</div>
          <div className="stat-label">Total Products</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            💰
          </div>
          <div className="stat-value">
            ₹{(analytics?.totalValue || 0).toLocaleString('en-IN')}
          </div>
          <div className="stat-label">Total Inventory Value</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            ⚠️
          </div>
          <div className="stat-value">{analytics?.lowStockCount || 0}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            🔴
          </div>
          <div className="stat-value">{analytics?.damagedCount || 0}</div>
          <div className="stat-label">Damaged Items</div>
        </div>
      </div>

      {/* Alerts Section */}
      {analytics?.alerts && analytics.alerts.length > 0 && (
        <div className="card mb-4">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🚨 Stock Alerts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {analytics.alerts.map((alert, index) => (
              <div
                key={index}
                className={`alert ${
                  alert.severity === 'critical' ? 'alert-danger' : 'alert-warning'
                }`}
              >
                <span style={{ fontWeight: '600' }}>{alert.productName}</span>
                <span style={{ marginLeft: 'auto' }}>
                  Current: {alert.currentStock} | Reorder: {alert.reorderPoint}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-2">
        {/* Category Breakdown */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📊 Products by Category
          </h2>
          {analytics?.categoryBreakdown && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
                <div
                  key={category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{category}</span>
                  <span
                    style={{
                      background: '#667eea',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Value Products */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            💎 Top Value Products
          </h2>
          {analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {analytics.topProducts.map((product, index) => (
                <div
                  key={product._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '8px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      {index + 1}. {product.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      Qty: {product.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: '600', color: '#10b981' }}>
                    ₹{(product.quantity * product.unitPrice).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
              No products available
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-4">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-3">
          <Link href="/products?action=add">
            <button className="btn btn-primary" style={{ width: '100%' }}>
              ➕ Add New Product
            </button>
          </Link>
          <Link href="/products">
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              📋 View All Products
            </button>
          </Link>
          <Link href="/analytics">
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              📈 View Analytics
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
