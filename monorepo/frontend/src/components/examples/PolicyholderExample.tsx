import React, { useState } from "react";
import { api } from "@/trpc/react";

export function PolicyholderExample() {
  const [policyHolderId, setPolicyHolderId] = useState("ph_87654321");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    policy_type: "auto" as "auto" | "home" | "health" | "life",
    policy_number: "",
    start_date: "",
    end_date: "",
  });

  // Query a policyholder by ID
  const {
    data: policyholder,
    isLoading,
    error,
    refetch,
  } = api.policyholders.getPolicyholder.useQuery(
    { id: policyHolderId },
    { enabled: Boolean(policyHolderId) }
  );

  // Create a new policyholder
  const createPolicyholder = api.policyholders.createPolicyholder.useMutation({
    onSuccess: () => {
      // Clear form after successful creation
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        date_of_birth: "",
        street: "",
        city: "",
        state: "",
        zip: "",
        policy_type: "auto",
        policy_number: "",
        start_date: "",
        end_date: "",
      });
      // Refetch the policyholder list if needed
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPolicyholder.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
      },
      policies: [
        {
          policy_number: formData.policy_number,
          type: formData.policy_type,
          start_date: formData.start_date,
          end_date: formData.end_date,
        },
      ],
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "coverageAmount" ? Number(value) : value,
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Policyholder Example</h1>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Fetch Policyholder</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={policyHolderId}
            onChange={(e) => setPolicyHolderId(e.target.value)}
            placeholder="Enter policyholder ID"
            className="border p-2 rounded flex-1"
          />
          <button
            onClick={() => refetch()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Fetch
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error.message}</p>}

        {policyholder && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Policyholder Details</h3>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto text-sm">
              {JSON.stringify(policyholder, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create Policyholder</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Street</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">ZIP Code</label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Policy Type</label>
            <select
              name="policy_type"
              value={formData.policy_type}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="auto">Auto</option>
              <option value="home">Home</option>
              <option value="health">Health</option>
              <option value="life">Life</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Policy Number</label>
            <input
              type="text"
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
              disabled={createPolicyholder.isPending}
            >
              {createPolicyholder.isPending
                ? "Creating..."
                : "Create Policyholder"}
            </button>
          </div>
        </form>

        {createPolicyholder.error && (
          <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
            Error: {createPolicyholder.error.message}
          </div>
        )}

        {createPolicyholder.data && (
          <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
            Success! Created policyholder with ID: {createPolicyholder.data.id}
          </div>
        )}
      </div>
    </div>
  );
}
