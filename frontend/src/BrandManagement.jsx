import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

export default function BrandManagement() {
  const [chains, setChains] = useState([]);
  const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [chainId, setChainId] = useState("");
  const [editId, setEditId] = useState(null);
  const [companyFilter, setCompanyFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const [chainResponse, brandResponse] = await Promise.all([
        fetch(`${API}/chains`),
        fetch(`${API}/brands`),
      ]);

      if (!chainResponse.ok || !brandResponse.ok) {
        throw new Error("Could not load data");
      }

      setChains(await chainResponse.json());
      setBrands(await brandResponse.json());
    } catch {
      setMessage("Unable to load data. Check that the backend is running.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveBrand(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        editId ? `${API}/brands/${editId}` : `${API}/brands`,
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ brandName, chainId: Number(chainId) }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Unable to save brand");
      }

      setBrandName("");
      setChainId("");
      setEditId(null);
      setMessage("Brand saved successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteBrand(id) {
    if (!window.confirm("Delete this brand?")) return;

    try {
      const response = await fetch(`${API}/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Unable to delete brand");

      setMessage("Brand deleted successfully.");
      await loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  const filtered = brands.filter((brand) => {
    const company = brand.chain?.companyName || "";
    const group = brand.chain?.groupName || "";

    return (
      company.toLowerCase().includes(companyFilter.toLowerCase()) &&
      group.toLowerCase().includes(groupFilter.toLowerCase())
    );
  });

  const companies = [...new Set(
    chains.map((chain) => chain.companyName).filter(Boolean)
  )];

  const groups = [...new Set(
    chains.map((chain) => chain.groupName).filter(Boolean)
  )];

  return (
    <main style={{ padding: 24, color: "#243247" }}>
      <h2>Manage Brands</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={card}>
          <b>Total Groups</b>
          <h2>{groups.length}</h2>
        </div>
        <div style={card}>
          <b>Total Chains</b>
          <h2>{chains.length}</h2>
        </div>
        <div style={{ ...card, background: "#168653" }}>
          <b>Total Brands</b>
          <h2>{brands.length}</h2>
        </div>
      </div>

      <h3>{editId ? "Edit Brand" : "Add Brand"}</h3>

      <form onSubmit={saveBrand} style={formStyle}>
        <input
          required
          placeholder="Enter brand name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
        />

        <select
          required
          value={chainId}
          onChange={(e) => setChainId(e.target.value)}
        >
          <option value="">Select Company / Chain</option>
          {chains.map((chain) => (
            <option key={chain.id} value={chain.id}>
              {chain.companyName} — {chain.groupName}
            </option>
          ))}
        </select>

        <button type="submit">{editId ? "Update" : "Add Brand"}</button>

        {editId && (
          <button type="button" onClick={() => {
            setEditId(null);
            setBrandName("");
            setChainId("");
          }}>
            Cancel
          </button>
        )}
      </form>

      {message && <p>{message}</p>}

      <h3>Filter Records</h3>
      <div style={formStyle}>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option value="">All Groups</option>
          {groups.map((group) => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      <table style={{ width: "100%", marginTop: 20, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["No.", "Group", "Company", "Brand", "Edit", "Delete"].map((h) => (
              <th key={h} style={cell}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((brand, index) => (
            <tr key={brand.id}>
              <td style={cell}>{index + 1}</td>
              <td style={cell}>{brand.chain?.groupName || "—"}</td>
              <td style={cell}>{brand.chain?.companyName || "—"}</td>
              <td style={cell}>{brand.brandName}</td>
              <td style={cell}>
                <button onClick={() => {
                  setEditId(brand.id);
                  setBrandName(brand.brandName);
                  setChainId(String(brand.chain?.id || ""));
                }}>Edit</button>
              </td>
              <td style={cell}>
                <button onClick={() => deleteBrand(brand.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" style={cell}>No brands found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

const card = {
  background: "#245A81",
  color: "white",
  padding: 18,
  borderRadius: 8,
  minWidth: 130,
};

const formStyle = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 18,
};

const cell = {
  border: "1px solid #ddd",
  padding: 10,
  textAlign: "left",
};