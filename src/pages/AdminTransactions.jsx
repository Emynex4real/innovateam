import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/transactions')
      .then(res => {
        setTransactions(res.data.transactions || []);
        setFiltered(res.data.transactions || []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      transactions.filter(t =>
        t.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        t.type?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, transactions]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transactions</h2>
      <input
        type="text"
        placeholder="Search by user, email, or type"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />
      {loading ? (
        <div>Loading transactions...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-4">No transactions found.</td></tr>
              ) : (
                filtered.map(tx => (
                  <tr key={tx._id || tx.id}>
                    <td className="py-2 px-4 border-b">{tx.user?.name || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{tx.user?.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">{tx.amount}</td>
                    <td className="py-2 px-4 border-b">{tx.type}</td>
                    <td className="py-2 px-4 border-b">{tx.status}</td>
                    <td className="py-2 px-4 border-b">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions; 