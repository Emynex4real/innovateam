import React, { useState } from "react";

const Profiles = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState({
    fullName: "Michael Balogun Temidayo",
    email: "michaelbalogun34@gmail.com",
    mobileNumber: "08033772750",
    bvn: "12345678910",
    nin: "987654321",
  });
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [notification, setNotification] = useState({
    visible: false,
    message: "",
  });

  // Show notification
  const showNotification = (message) => {
    setNotification({ visible: true, message });
    setTimeout(() => {
      setNotification({ visible: false, message: "" });
    }, 3000); // Hide notification after 3 seconds
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setBankDetails({ ...bankDetails, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted");

    // Show notification based on the active tab
    if (activeTab === "editProfile") {
      showNotification("Profile updated successfully!");
    } else if (activeTab === "bankDetails") {
      showNotification("Bank details updated successfully!");
    } else if (activeTab === "changePassword") {
      showNotification("Password changed successfully!");
    }
  };

  return (
    <div className="">
      {/* Floating Notification */}
      {notification.visible && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {notification.message}
        </div>
      )}

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Small Container (Profile Picture, Name, Email) */}
          <div className="w-full md:w-1/4 bg-white rounded-lg shadow-lg p-6 text-center">
            <img
              src="https://play-lh.googleusercontent.com/BaaIfoR6ZCqccqiE8OwRtXIhiM6Yyj6sut6ZFCuo7spKBfsEZbJE8r2dHBtwSEGSXpc"
              alt="Profile Picture"
              className="w-24 h-24 rounded-full mx-auto mb-4"
            />
            <h2 className="text-xl font-bold">{profile.fullName}</h2>
            <p className="text-gray-600 break-words">{profile.email}</p>
          </div>

          {/* Big Container (Tabs and Content) */}
          <div className="w-full md:w-3/4 bg-white rounded-lg shadow-lg p-6">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 space-y-2 md:space-y-0 border-b mb-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-4 hover:bg-gray-100 text-left md:text-center ${
                  activeTab === "overview" ? "border-b-2 border-green-500" : ""
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("editProfile")}
                className={`py-2 px-4 hover:bg-gray-100 text-left md:text-center ${
                  activeTab === "editProfile"
                    ? "border-b-2 border-green-500"
                    : ""
                }`}
              >
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab("bankDetails")}
                className={`py-2 px-4 hover:bg-gray-100 text-left md:text-center ${
                  activeTab === "bankDetails"
                    ? "border-b-2 border-green-500"
                    : ""
                }`}
              >
                Bank Details
              </button>
              <button
                onClick={() => setActiveTab("changePassword")}
                className={`py-2 px-4 hover:bg-gray-100 text-left md:text-center ${
                  activeTab === "changePassword"
                    ? "border-b-2 border-green-500"
                    : ""
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Content */}
            <div>
              {/* Overview Content */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Overview</h3>
                  <p>
                    Welcome to your profile dashboard. Here you can manage your
                    personal information, bank details, and password.
                  </p>

                  <div className="container mx-auto">
                    <div className="bg-white rounded-lg p-6">
                      <h1 className="text-2xl font-bold mb-4">Profile Details</h1>
                      <div className="space-y-4">
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">Full Name:</span>
                          <span className="w-full md:w-2/3">{profile.fullName}</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">Email Address:</span>
                          <span className="w-full md:w-2/3 break-words">{profile.email}</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">Mobile Number:</span>
                          <span className="w-full md:w-2/3">{profile.mobileNumber}</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">State:</span>
                          <span className="w-full md:w-2/3">Lagos</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">Gender:</span>
                          <span className="w-full md:w-2/3">Male</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">Date of Birth:</span>
                          <span className="w-full md:w-2/3">1990-01-01</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">BVN:</span>
                          <span className="w-full md:w-2/3">{profile.bvn}</span>
                        </div>
                        <div className="flex flex-col md:flex-row items-center">
                          <span className="w-full md:w-1/3 font-medium">NIN:</span>
                          <span className="w-full md:w-2/3">{profile.nin}</span>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                        <button
                          onClick={() => setActiveTab("editProfile")}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                        >
                          Edit Profile
                        </button>
                        <button
                          onClick={() => setActiveTab("changePassword")}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                        >
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit Profile Content */}
              {activeTab === "editProfile" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Edit Profile</h3>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        name="mobileNumber"
                        value={profile.mobileNumber}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        NIN
                      </label>
                      <input
                        type="text"
                        name="nin"
                        value={profile.nin}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        BVN
                      </label>
                      <input
                        type="text"
                        name="bvn"
                        value={profile.bvn}
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded"
                      /> 
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Bank Details Content */}
              {activeTab === "bankDetails" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Bank Details</h3>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={bankDetails.bankName}
                        onChange={handleBankDetailsChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankDetails.accountNumber}
                        onChange={handleBankDetailsChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="accountName"
                        value={bankDetails.accountName}
                        onChange={handleBankDetailsChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Save Bank Details
                    </button>
                  </form>
                </div>
              )}

              {/* Change Password Content */}
              {activeTab === "changePassword" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Change Password</h3>
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={password.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={password.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={password.confirmNewPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Change Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;