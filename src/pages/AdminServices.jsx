import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get('/api/services')
      .then(res => {
        setServices(res.data.services || []);
        setFiltered(res.data.services || []);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(
      services.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.type?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, services]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Services</h2>
      <input
        type="text"
        placeholder="Search by name or type"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded w-full max-w-md"
      />
      {loading ? (
        <div>Loading services...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-4">No services found.</td></tr>
              ) : (
                filtered.map(service => (
                  <tr key={service._id || service.id}>
                    <td className="py-2 px-4 border-b">{service.name}</td>
                    <td className="py-2 px-4 border-b">{service.type}</td>
                    <td className="py-2 px-4 border-b">{service.price}</td>
                    <td className="py-2 px-4 border-b">{service.status || 'active'}</td>
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

export default AdminServices; 