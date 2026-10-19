import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/estimates";

const emptyForm = {
  clientName: "",
  chainName: "",
  serviceName: "",
  quantity: 1,
  unitPrice: 0,
  gstPercent: 18,
  status: "Draft",
};

export default function EstimateManagement() {
  const [estimates, setEstimates] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  async function loadEstimates() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load estimates");
      setEstimates(await response.json());
      setError("");
    } catch {
      setError("Backend not connected. Start Spring Boot on port 8080.");
    }
  }

  useEffect(() => {
    loadEstimates();
  }, []);

  const subtotal = Number(form.quantity || 0) *
                   Number(form.unitPrice || 0);
  const total = subtotal + subtotal *
                Number(form.gstPercent || 0) / 100;

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            quantity: Number(form.quantity),
            unitPrice: Number(form.unitPrice),
            gstPercent: Number(form.gstPercent),
          }),
        }
      );

      if (!response.ok) throw new Error("Save failed");

      setForm(emptyForm);
      setEditingId(null);
      setError("");
      await loadEstimates();
    } catch {
      setError("Could not save. Check the backend and database.");
    }
  }

  function edit(item) {
    setForm({
      clientName: item.clientName || "",
      chainName: item.chainName || "",
      serviceName: item.serviceName || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstPercent: item.gstPercent,
      status: item.status || "Draft",
    });
    setEditingId(item.id);
  }

  async function remove(id) {
    if (!window.confirm("Delete this estimate?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed");
      await loadEstimates();
    } catch {
      setError("Could not delete estimate.");
    }
  }

  const filtered = estimates.filter((item) => {
    const text = `${item.clientName} ${item.chainName} ${item.serviceName}`
      .toLowerCase();
    return text.includes(search.toLowerCase()) &&
      (statusFilter === "All" || item.status === statusFilter);
  });

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    boxSizing: "border-box",
  };

  return (
    <main style={{
      maxWidth: 1100, margin: "24px auto", padding: 20,
      fontFamily: "Arial, sans-serif", color: "#172033"
    }}>
      <h1>Estimate Management</h1>
      <p>Create estimates, calculate costs, and track approvals.</p>

      {error && (
        <p style={{ color: "#b91c1c" }}>{error}</p>
      )}

      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
        gap: 12, marginBottom: 20
      }}>
        {[
          ["Total Estimates", estimates.length],
          ["Draft", estimates.filter(x => x.status === "Draft").length],
          ["Approved", estimates.filter(x => x.status === "Approved").length],
          ["Pending", estimates.filter(x => x.status === "Pending Approval").length],
        ].map(([label, value]) => (
          <div key={label} style={{
            padding: 16, border: "1px solid #dbe3ef",
            borderRadius: 10, background: "#f8fafc"
          }}>
            <div>{label}</div>
            <h2>{value}</h2>
          </div>
        ))}
      </section>

      <form onSubmit={save} style={{
        padding: 20, border: "1px solid #dbe3ef",
        borderRadius: 10, marginBottom: 24
      }}>
        <h2>{editingId ? "Edit Estimate" : "Create Estimate"}</h2>

        <label>Client Name
          <input required name="clientName" value={form.clientName}
            onChange={change} style={inputStyle} />
        </label>

        <label>Customer Chain / Company
          <input required name="chainName" value={form.chainName}
            onChange={change} style={inputStyle} />
        </label>

        <label>Service Name
          <input required name="serviceName" value={form.serviceName}
            onChange={change} style={inputStyle} />
        </label>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
          gap: 12
        }}>
          <label>Quantity
            <input required type="number" min="1" name="quantity"
              value={form.quantity} onChange={change} style={inputStyle} />
          </label>
          <label>Unit Price (₹)
            <input required type="number" min="0" step="0.01"
              name="unitPrice" value={form.unitPrice}
              onChange={change} style={inputStyle} />
          </label>
          <label>GST (%)
            <input required type="number" min="0" step="0.01"
              name="gstPercent" value={form.gstPercent}
              onChange={change} style={inputStyle} />
          </label>
          <label>Status
            <select name="status" value={form.status}
              onChange={change} style={inputStyle}>
              {["Draft", "Pending Approval", "Approved", "Rejected"]
                .map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>

        <div style={{
          padding: 14, background: "#eff6ff",
          borderRadius: 8, marginBottom: 16
        }}>
          <p>Subtotal: <b>{money(subtotal)}</b></p>
          <p>GST: <b>{money(total - subtotal)}</b></p>
          <h3>Total Amount: {money(total)}</h3>
        </div>

        <button type="submit" style={{
          padding: "10px 18px", background: "#1d4ed8",
          color: "white", border: 0, borderRadius: 6,
          cursor: "pointer"
        }}>
          {editingId ? "Update Estimate" : "Save Estimate"}
        </button>{" "}
        {editingId && (
          <button type="button" onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
          }}>Cancel</button>
        )}
      </form>

      <h2>Saved Estimates</h2>
      <div style={{
        display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14
      }}>
        <input placeholder="Search client, chain, service..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }} />
        <select value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: 200 }}>
          {["All", "Draft", "Pending Approval", "Approved", "Rejected"]
            .map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Client", "Chain", "Service", "Qty", "Total", "Status", "Actions"]
                .map(h => <th key={h} style={{
                  textAlign: "left", padding: 10,
                  background: "#eaf0f8", whiteSpace: "nowrap"
                }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td style={{ padding: 10 }}>{item.clientName}</td>
                <td style={{ padding: 10 }}>{item.chainName}</td>
                <td style={{ padding: 10 }}>{item.serviceName}</td>
                <td style={{ padding: 10 }}>{item.quantity}</td>
                <td style={{ padding: 10 }}>
                  {money(item.totalAmount)}
                </td>
                <td style={{ padding: 10 }}>{item.status}</td>
                <td style={{ padding: 10, whiteSpace: "nowrap" }}>
                  <button onClick={() => edit(item)}>Edit</button>{" "}
                  <button onClick={() => remove(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{ padding: 18 }}>
                No estimates found.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}