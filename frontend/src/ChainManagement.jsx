
import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api/chains";
const GROUPS = "http://localhost:8080/api/groups";

export default function ChainManagement() {
  const [chains, setChains] = useState([]);
  const [groups, setGroups] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [gstn, setGstn] = useState("");
  const [groupName, setGroupName] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [c, g] = await Promise.all([fetch(API), fetch(GROUPS)]);
      if (!c.ok || !g.ok) throw new Error("Could not load data");
      setChains(await c.json());
      const groupData = await g.json();
      setGroups(groupData);
      if (!groupName && groupData.length) setGroupName(groupData[0].groupName);
    } catch (e) {
      setMessage(e.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setMessage("");
    try {
      const response = await fetch(editing ? `${API}/${editing}` : API, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, gstn: gstn.trim().toUpperCase(), groupName })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || data.message || "Save failed. Check GSTN and required fields.");
      }
      setMessage("Company saved successfully.");
      setCompanyName(""); setGstn(""); setEditing(null);
      await load();
    } catch (e) { setMessage(e.message); }
  }

  async function remove(id) {
    if (!window.confirm("Delete this company?")) return;
    const response = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!response.ok) { setMessage("Delete failed."); return; }
    setMessage("Company deleted.");
    await load();
  }

  const visible = chains.filter(c => !filter || c.groupName === filter);

  return (
    <section style={{ padding: 20, background: "white", borderRadius: 12, marginTop: 20 }}>
      <h2>Manage Chain / Company</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <strong>Total Groups: {groups.length}</strong>
        <strong>Total Chains: {chains.length}</strong>
      </div>

      <form onSubmit={save} style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
        <input required placeholder="Company name" value={companyName}
          onChange={e => setCompanyName(e.target.value)} />
        <input required minLength={15} maxLength={15} placeholder="15-character GSTN"
          value={gstn} onChange={e => setGstn(e.target.value.toUpperCase())} />
        <select required value={groupName} onChange={e => setGroupName(e.target.value)}>
          <option value="">Select group</option>
          {groups.map(g => <option key={g.groupId} value={g.groupName}>{g.groupName}</option>)}
        </select>
        <button type="submit">{editing ? "Update Company" : "Add Company"}</button>
        {editing && <button type="button" onClick={() => {
          setEditing(null); setCompanyName(""); setGstn("");
        }}>Cancel</button>}
      </form>

      {message && <p role="status">{message}</p>}

      <label>
        Filter by Group:{" "}
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All groups</option>
          {groups.map(g => <option key={g.groupId} value={g.groupName}>{g.groupName}</option>)}
        </select>
      </label>

      <div style={{ overflowX: "auto", marginTop: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>
            <th>Sr. No.</th><th>Group Name</th><th>Company</th><th>GSTN</th><th>Edit</th><th>Delete</th>
          </tr></thead>
          <tbody>
            {visible.map((c, i) => <tr key={c.id}>
              <td>{i + 1}</td><td>{c.groupName}</td><td>{c.companyName}</td><td>{c.gstn}</td>
              <td><button onClick={() => {
                setEditing(c.id); setCompanyName(c.companyName);
                setGstn(c.gstn); setGroupName(c.groupName);
              }}>Edit</button></td>
              <td><button onClick={() => remove(c.id)}>Delete</button></td>
            </tr>)}
            {!visible.length && <tr><td colSpan="6">No companies found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
