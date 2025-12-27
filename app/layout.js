import '../styles/globals.css';

export const metadata = {
  title: 'Inventory Management System',
  description: 'Real-time inventory tracking for material businesses',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container nav-content">
            <div className="nav-brand">
              📦 Inventory Manager
            </div>
            <ul className="nav-links">
              <li><a href="/">Dashboard</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/analytics">Analytics</a></li>
            </ul>
          </div>
        </nav>
        <main style={{ padding: '2rem 0', minHeight: '80vh' }}>
          <div className="container">
            {children}
          </div>
        </main>
        <footer style={{ background: '#1e293b', color: 'white', padding: '2rem 0', textAlign: 'center' }}>
          <div className="container">
            <p>© 2024 Inventory Management System. Built with Next.js & Express.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
