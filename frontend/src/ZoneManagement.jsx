
import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api";

export default function ZoneManagement() {
  const [brands, setBrands] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneName, setZoneName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [editId, setEditId] = useState(null);
  const [brandFilter, setBrandFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    try {
      const [b, z] = await Promise.all([
        fetch(`${API}/brands`),
        fetch(`${API}/zones`)
      ]);

      if (!b.ok || !z.ok) throw new Error("Could not load data");

      setBrands(await b.json());
      setZones(await z.json());
    } catch (e) {
      setMessage("Unable to load data. Check the backend and API.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getBrand(zone) {
    return zone.brand || {};
  }

  function getChain(zone) {
    return getBrand(zone).chain || {};
  }

  async function saveZone(e) {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        editId ? `${API}/zones/${editId}` : `${API}/zones`,
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zoneName: zoneName.trim(),
            brandId: Number(brandId)
          })
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to save zone");
      }

      setZoneName("");
      setBrandId("");
      setEditId(null);
      setMessage("Zone saved successfully.");
      await loadData();
    } catch (e) {
      setMessage(e.message);
    }
  }

  function editZone(zone) {
    setEditId(zone.id);
    setZoneName(zone.zoneName);
    setBrandId(String(zone.brand?.id || ""));
  }

  async function deleteZone(id) {
    if (!window.confirm("Are you sure you want to delete this zone?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/zones/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Unable to delete zone");

      setMessage("Zone deleted successfully.");
      await loadData();
    } catch (e) {
      setMessage(e.message);
    }
  }

  const unique = values => [...new Set(values.filter(Boolean))];

  const brandNames = unique(brands.map(b => b.brandName));
  const companyNames = unique(
    brands.map(b => b.chain?.companyName)
  );
  const groupNames = unique(
    brands.map(b => b.chain?.groupName)
  );

  const filteredZones = zones.filter(zone => {
    const brand = getBrand(zone);
    const chain = getChain(zone);

    return (
      (!brandFilter || brand.brandName === brandFilter) &&
      (!companyFilter || chain.companyName === companyFilter) &&
      (!groupFilter || chain.groupName === groupFilter)
    );
  });

  const box = {
    padding: 16,
    borderRadius: 7,
    color: "white",
    background: "#245A81",
    minWidth: 120
  };

  const input = { padding: 9, minWidth: 170 };
  const cell = {
    padding: 9,
    borderBottom: "1px solid #ddd",
    textAlign: "left"
  };

  return (
    <main style={{ padding: 22, color: "#243247" }}>
      <h2>Manage Zones</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={box}>
          <b>Total Groups</b>
          <h2>{groupNames.length}</h2>
        </div>
        <div style={{ ...box, background: "#F0B400" }}>
          <b>Total Chains</b>
          <h2>{unique(brands.map(b => b.chain?.id)).length}</h2>
        </div>
        <div style={{ ...box, background: "#168653" }}>
          <b>Total Brands</b>
          <h2>{brands.length}</h2>
        </div>
        <div style={{ ...box, background: "#1769E0" }}>
          <b>Total Zones</b>
          <h2>{zones.length}</h2>
        </div>
      </div>

      <h3>{editId ? "Edit Zone" : "Add Zone"}</h3>

      <form
        onSubmit={saveZone}
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <input
          style={input}
          placeholder="Enter zone name"
          required
          value={zoneName}
          onChange={e => setZoneName(e.target.value)}
        />

        <select
          style={input}
          required
          value={brandId}
          onChange={e => setBrandId(e.target.value)}
        >
          <option value="">Select Brand</option>
          {brands.map(brand => (
            <option key={brand.id} value={brand.id}>
              {brand.brandName} — {brand.chain?.companyName || "Company"}
            </option>
          ))}
        </select>

        <button type="submit">{editId ? "Update Zone" : "Add Zone"}</button>

        {editId && (
          <button type="button" onClick={() => {
            setEditId(null);
            setZoneName("");
            setBrandId("");
          }}>
            Cancel
          </button>
        )}
      </form>

      {message && <p>{message}</p>}

      <h3>Filters</h3>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <select style={input} value={brandFilter}
          onChange={e => setBrandFilter(e.target.value)}>
          <option value="">Filter by Brand</option>
          {brandNames.map(n => <option key={n}>{n}</option>)}
        </select>

        <select style={input} value={companyFilter}
          onChange={e => setCompanyFilter(e.target.value)}>
          <option value="">Filter by Company</option>
          {companyNames.map(n => <option key={n}>{n}</option>)}
        </select>

        <select style={input} value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}>
          <option value="">Filter by Group</option>
          {groupNames.map(n => <option key={n}>{n}</option>)}
        </select>

        <button type="button" onClick={() => {
          setBrandFilter("");
          setCompanyFilter("");
          setGroupFilter("");
        }}>
          Clear Filters
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
          <thead>
            <tr>
              {["Sr.No", "Zone", "Brand", "Company", "Group", "Edit", "Delete"]
                .map(title => <th key={title} style={cell}>{title}</th>)}
            </tr>
          </thead>
          <tbody>
            {filteredZones.map((zone, i) => {
              const brand = getBrand(zone);
              const chain = getChain(zone);

              return (
                <tr key={zone.id}>
                  <td style={cell}>{i + 1}</td>
                  <td style={cell}>{zone.zoneName}</td>
                  <td style={cell}>{brand.brandName || "—"}</td>
                  <td style={cell}>{chain.companyName || "—"}</td>
                  <td style={cell}>{chain.groupName || "—"}</td>
                  <td style={cell}>
                    <button onClick={() => editZone(zone)}>Edit</button>
                  </td>
                  <td style={cell}>
                    <button onClick={() => deleteZone(zone.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}

            {filteredZones.length === 0 && (
              <tr>
                <td colSpan="7" style={cell}>No zones found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
