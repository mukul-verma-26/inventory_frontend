'use client';

import { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createTransaction,
} from '../../lib/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    reorderPoint: 10,
    unitPrice: 0,
    location: 'Main Warehouse',
    supplier: '',
  });

  const [transactionData, setTransactionData] = useState({
    type: 'IN',
    quantity: 0,
    notes: '',
    performedBy: 'Admin',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        alert('Product updated successfully!');
      } else {
        await createProduct(formData);
        alert('Product created successfully!');
      }
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      alert('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.quantity,
      reorderPoint: product.reorderPoint,
      unitPrice: product.unitPrice,
      location: product.location,
      supplier: product.supplier,
    });
    setShowModal(true);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await createTransaction({
        productId: selectedProduct._id,
        ...transactionData,
        quantity: Number(transactionData.quantity),
      });
      alert('Transaction recorded successfully!');
      setShowTransactionModal(false);
      setSelectedProduct(null);
      resetTransactionForm();
      fetchProducts();
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Error recording transaction: ' + (error.response?.data?.message || error.message));
    }
  };

  const openTransactionModal = (product) => {
    setSelectedProduct(product);
    setShowTransactionModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      reorderPoint: 10,
      unitPrice: 0,
      location: 'Main Warehouse',
      supplier: '',
    });
  };

  const resetTransactionForm = () => {
    setTransactionData({
      type: 'IN',
      quantity: 0,
      notes: '',
      performedBy: 'Admin',
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      product.status.toLowerCase().replace(' ', '-') === filterStatus;

    return matchesSearch && matchesFilter;
  });

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
            Products
          </h1>
          <p style={{ color: '#64748b' }}>Manage your inventory items</p>
        </div>
        <button onClick={openAddModal} className="btn btn-primary">
          ➕ Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="grid grid-2">
          <div>
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="all">All Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Reorder Point</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ color: '#64748b' }}>
                    {searchTerm || filterStatus !== 'all'
                      ? 'No products match your filters'
                      : 'No products available. Click "Add Product" to get started.'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td style={{ fontWeight: '600' }}>{product.name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{product.sku}</td>
                  <td>{product.category}</td>
                  <td style={{ fontWeight: '600' }}>{product.quantity}</td>
                  <td>{product.reorderPoint}</td>
                  <td>₹{product.unitPrice.toLocaleString('en-IN')}</td>
                  <td>
                    <span
                      className={`badge ${
                        product.status === 'In Stock'
                          ? 'badge-success'
                          : product.status === 'Low Stock'
                          ? 'badge-warning'
                          : product.status === 'Out of Stock'
                          ? 'badge-danger'
                          : 'badge-info'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>{product.location}</td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openTransactionModal(product)}
                        className="btn btn-success btn-sm"
                        title="Stock Movement"
                      >
                        📦
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="btn btn-secondary btn-sm"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="btn btn-danger btn-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Steel, Cement, Bricks"
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Quantity *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: Number(e.target.value) })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Reorder Point *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.reorderPoint}
                      onChange={(e) =>
                        setFormData({ ...formData, reorderPoint: Number(e.target.value) })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: Number(e.target.value) })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Stock Movement</h2>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                {selectedProduct.name} (Current: {selectedProduct.quantity})
              </p>
            </div>
            <form onSubmit={handleTransaction}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Transaction Type *</label>
                  <select
                    required
                    value={transactionData.type}
                    onChange={(e) =>
                      setTransactionData({ ...transactionData, type: e.target.value })
                    }
                    className="form-select"
                  >
                    <option value="IN">Stock In (Received)</option>
                    <option value="OUT">Stock Out (Sold/Used)</option>
                    <option value="DAMAGE">Damaged</option>
                    <option value="RETURN">Return</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={transactionData.quantity}
                    onChange={(e) =>
                      setTransactionData({ ...transactionData, quantity: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Performed By</label>
                  <input
                    type="text"
                    value={transactionData.performedBy}
                    onChange={(e) =>
                      setTransactionData({ ...transactionData, performedBy: e.target.value })
                    }
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={transactionData.notes}
                    onChange={(e) =>
                      setTransactionData({ ...transactionData, notes: e.target.value })
                    }
                    className="form-textarea"
                    placeholder="Optional notes about this transaction..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setSelectedProduct(null);
                    resetTransactionForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Record Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
