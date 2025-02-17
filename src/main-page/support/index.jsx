import React, { useState } from 'react';

const Support = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {/* Main Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
        {/* Left Container: Contact Information */}
        <div className="bg-green-600 text-white p-8 md:w-1/3 flex flex-col space-y-6">
          <h2 className="text-2xl font-bold">Contact Information</h2>

          {/* Sub-Container: Address */}
          <div className="bg-green-700 p-4 rounded-lg">
            <h3 className="font-semibold">Address</h3>
            <p className="text-sm mt-2">06, Opposite GGSS Bakori, Dutsen Rimt, Katsina.</p>
          </div>

          {/* Sub-Container: Email Us */}
          <div className="bg-green-700 p-4 rounded-lg">
            <h3 className="font-semibold">Email Us</h3>
            <p className="text-sm mt-2">info@arewagate.com</p>
            <p className="text-sm">arewagatecafe@gmail.com</p>
          </div>

          {/* Sub-Container: Call Us */}
          <div className="bg-green-700 p-4 rounded-lg">
            <h3 className="font-semibold">Call Us</h3>
            <p className="text-sm mt-2">+234 703 837 4534</p>
          </div>

          {/* Sub-Container: Links */}
          <div className="bg-green-700 p-4 rounded-lg">
            <h3 className="font-semibold">Links</h3>
            <a href="#" className="text-sm underline block mt-2">Join Group</a>
            <a href="#" className="text-sm underline block">Chat with Customer Care</a>
          </div>
        </div>

        {/* Right Container: Contact Form */}
        <div className="p-8 md:w-2/3">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Us a Message</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Your Name
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Your Email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
                Subject
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                Message
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message..."
                rows="4"
                required
              />
            </div>
            <div className="flex items-center justify-end">
              <button
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Support;