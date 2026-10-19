
import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api/groups";

export default function CustomerGroups() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadGroups() {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load groups");
      setGroups(await response.json());
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function saveGroup(event) {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Group name is required.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        editingId === null ? API : `${API}/${editingId}`,
        {
          method: editingId === null ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupName: name.trim() })
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || result.error || "Unable to save group");
      setName("");
      setEditingId(null);
      setMessage("Group saved successfully.");
      await loadGroups();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(group) {
    try {
      const response = await fetch(`${API}/${group.groupId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !group.active })
      });
      if (!response.ok) throw new Error("Unable to change group status");
      setMessage("Group status updated.");
      await loadGroups();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteGroup(id) {
    if (!window.confirm("Deactivate this group?")) return;
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to deactivate group");
      setMessage("Group deactivated.");
      await loadGroups();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: "25px auto", padding: 20, fontFamily: "Arial" }}>
      <h2>Customer Group Management</h2>
      <p>Create, edit, activate, or deactivate customer groups.</p>

      <form onSubmit={saveGroup} style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter group name"
          aria-label="Group name"
          required
          style={{ padding: 10, flex: 1, minWidth: 200 }}
        />
        <button disabled={loading} type="submit" style={{ padding: "10px 18px" }}>
          {loading ? "Saving..." : editingId === null ? "Add Group" : "Update Group"}
        </button>
        {editingId !== null && (
          <button type="button" onClick={() => { setEditingId(null); setName(""); }}>
            Cancel
          </button>
        )}
      </form>

      {message && <p role="status">{message}</p>}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["ID", "Group Name", "Status", "Actions"].map((heading) => (
                <th key={heading} style={{ padding: 12, borderBottom: "1px solid #ccc", textAlign: "left" }}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.groupId}>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{group.groupId}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>{group.groupName}</td>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                  {group.active ? "Active" : "Inactive"}
                </td>
                <td style={{ padding: 12, borderBottom: "1px solid #eee" }}>
                  <button onClick={() => { setEditingId(group.groupId); setName(group.groupName); }}>
                    Edit
                  </button>{" "}
                  <button onClick={() => toggleStatus(group)}>
                    {group.active ? "Deactivate" : "Activate"}
                  </button>{" "}
                  {group.active && (
                    <button onClick={() => deleteGroup(group.groupId)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr><td colSpan="4" style={{ padding: 15 }}>No groups found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
