
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/estimates";
const INVOICE_API = "http://localhost:8080/api/invoices";

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
  const [form, setForm] = useState({ ...emptyForm });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);

  async function loadEstimates() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Failed to load estimates");
      setEstimates(await response.json());
      setError("");
    } catch {
      setError("Cannot connect to backend. Check Spring Boot on port 8080.");
    }
  }

  useEffect(() => {
    loadEstimates();
  }, []);

  const subtotal =
    Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const gstAmount =
    subtotal * Number(form.gstPercent || 0) / 100;

  const total = subtotal + gstAmount;

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      setForm({ ...emptyForm });
      setEditingId(null);
      await loadEstimates();
    } catch {
      setError("Could not save estimate. Check backend and database.");
    } finally {
      setLoading(false);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this estimate?")) {
      return;
    }

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

  async function generateInvoice(item) {
    setGeneratingId(item.id);
    setError("");

    try {
      const response = await fetch(
        `${INVOICE_API}/from-estimate/${item.id}`,
        { method: "POST" }
      );

      if (!response.ok) {
        throw new Error("Invoice generation failed");
      }

      const invoice = await response.json();

      // Open the invoice page with the generated invoice ID.
      window.location.href = `/create-invoice?id=${invoice.id}`;
    } catch {
      setError(
        "Invoice generation failed. Check that InvoiceController.java " +
        "exists and Spring Boot is running."
      );
    } finally {
      setGeneratingId(null);
    }
  }

  const filtered = estimates.filter((item) => {
    const text =
      `${item.clientName || ""} ${item.chainName || ""} ` +
      `${item.serviceName || ""}`.toLowerCase();

    return (
      text.includes(search.toLowerCase()) &&
      (statusFilter === "All" || item.status === statusFilter)
    );
  });

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    marginBottom: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "8px 11px",
    border: 0,
    borderRadius: 5,
    cursor: "pointer",
    margin: "2px",
  };

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "24px auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
        color: "#172033",
      }}
    >
      <h1>Estimate Management</h1>
      <p>Create estimates, calculate costs, track approvals, and generate invoices.</p>

      {error && (
        <div
          role="alert"
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          ["Total Estimates", estimates.length],
          ["Draft", estimates.filter(x => x.status === "Draft").length],
          ["Approved", estimates.filter(x => x.status === "Approved").length],
          ["Pending Approval", estimates.filter(x => x.status === "Pending Approval").length],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: 16,
              border: "1px solid #dbe3ef",
              borderRadius: 10,
              background: "#f8fafc",
            }}
          >
            <div>{label}</div>
            <h2>{value}</h2>
          </div>
        ))}
      </section>

      <form
        onSubmit={save}
        style={{
          padding: 20,
          border: "1px solid #dbe3ef",
          borderRadius: 10,
          marginBottom: 24,
        }}
      >
        <h2>{editingId ? "Edit Estimate" : "Create Estimate"}</h2>

        <label>
          Client Name
          <input
            required
            name="clientName"
            value={form.clientName}
            onChange={change}
            style={inputStyle}
          />
        </label>

        <label>
          Customer Chain / Company
          <input
            required
            name="chainName"
            value={form.chainName}
            onChange={change}
            style={inputStyle}
          />
        </label>

        <label>
          Service Name
          <input
            required
            name="serviceName"
            value={form.serviceName}
            onChange={change}
            style={inputStyle}
          />
        </label>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))",
            gap: 12,
          }}
        >
          <label>
            Quantity
            <input
              required
              type="number"
              min="1"
              name="quantity"
              value={form.quantity}
              onChange={change}
              style={inputStyle}
            />
          </label>

          <label>
            Unit Price (₹)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              name="unitPrice"
              value={form.unitPrice}
              onChange={change}
              style={inputStyle}
            />
          </label>

          <label>
            GST (%)
            <input
              required
              type="number"
              min="0"
              step="0.01"
              name="gstPercent"
              value={form.gstPercent}
              onChange={change}
              style={inputStyle}
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={change}
              style={inputStyle}
            >
              {[
                "Draft",
                "Pending Approval",
                "Approved",
                "Rejected",
              ].map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          style={{
            padding: 14,
            background: "#eff6ff",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <p>Subtotal: <b>{money(subtotal)}</b></p>
          <p>GST: <b>{money(gstAmount)}</b></p>
          <h3>Total Amount: {money(total)}</h3>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            ...buttonStyle,
            padding: "10px 18px",
            background: "#1d4ed8",
            color: "white",
          }}
        >
          {loading
            ? "Saving..."
            : editingId
              ? "Update Estimate"
              : "Save Estimate"}
        </button>

        {editingId && (
          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              setEditingId(null);
              setForm({ ...emptyForm });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h2>Saved Estimates</h2>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <input
          placeholder="Search client, chain, service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 200 }}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: 200 }}
        >
          {[
            "All",
            "Draft",
            "Pending Approval",
            "Approved",
            "Rejected",
          ].map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 850,
          }}
        >
          <thead>
            <tr>
              {[
                "Client",
                "Chain",
                "Service",
                "Qty",
                "Total",
                "Status",
                "Actions",
              ].map(heading => (
                <th
                  key={heading}
                  style={{
                    textAlign: "left",
                    padding: 10,
                    background: "#eaf0f8",
                    whiteSpace: "nowrap",
                  }}
                >
                  {heading}
                </th>
              ))}
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
                  <button
                    style={{
                      ...buttonStyle,
                      background: "#facc15",
                    }}
                    onClick={() => edit(item)}
                  >
                    Edit
                  </button>

                  <button
                    style={{
                      ...buttonStyle,
                      background: "#dc2626",
                      color: "white",
                    }}
                    onClick={() => remove(item.id)}
                  >
                    Delete
                  </button>

                  <button
                    style={{
                      ...buttonStyle,
                      background: "#2563eb",
                      color: "white",
                    }}
                    disabled={generatingId === item.id}
                    onClick={() => generateInvoice(item)}
                  >
                    {generatingId === item.id
                      ? "Generating..."
                      : "Generate Invoice"}
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 18 }}>
                  No estimates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
