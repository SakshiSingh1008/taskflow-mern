import { useEffect, useState } from "react";
import api from "../api/axios";
import { Calendar } from "lucide-react";
export default function TaskModal({ task, userId, onClose, onSaved }) {
  const isCreator = !task || task?.createdBy?._id === userId;
  const isAssignee = task?.assignedTo?._id === userId;
  const isPersonal = task && !task.assignedTo;

  const [form, setF] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "Todo",
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : "",
    assignedTo: task?.assignedTo?._id || "",
  });
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 useEffect(() => {
   if (!task || isCreator) {
     api
       .get("/tasks/users")
       .then((r) => setUsers(r.data))
       .catch(() => {});
   }
 }, [task, isCreator]);

  const canEdit = (field) => {
    if (!task) return true; // creating — all editable
    if (isPersonal && isCreator) return true;
    if (isCreator && !isAssignee) {
      // assigner
      return field !== "status";
    }
    if (isAssignee && !isCreator) {
      // pure assignee
      return field === "status";
    }
    return false;
  };

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {};
      if (canEdit("title")) payload.title = form.title;
      if (canEdit("description")) payload.description = form.description;
      if (canEdit("status")) payload.status = form.status;
      if (canEdit("dueDate")) payload.dueDate = form.dueDate || null;
      if (!task) payload.assignedTo = form.assignedTo || null;

      if (task) {
        await api.put(`/tasks/${task._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{task ? "Edit task" : "New task"}</h2>

        {isAssignee && !isCreator && (
          <div className="info-banner">
            You are the assignee — only status can be changed.
          </div>
        )}
        {isCreator && task?.assignedTo && (
          <div className="info-banner">
            You are the assigner — you cannot change status.
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handle}>
          <label>Title</label>
          <input
            value={form.title}
            disabled={!canEdit("title")}
            onChange={(e) => setF({ ...form, title: e.target.value })}
            required={canEdit("title")}
          />

          <label>Description</label>
          <textarea
            value={form.description}
            disabled={!canEdit("description")}
            onChange={(e) => setF({ ...form, description: e.target.value })}
            required={canEdit("description")}
            rows={3}
          />

          <label>Status</label>
          <select
            value={form.status}
            disabled={!canEdit("status")}
            onChange={(e) => setF({ ...form, status: e.target.value })}
          >
            {["Todo", "In Progress", "Done"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <label>Due date</label>
          <div className="date-field">
            <input
              type="date"
              value={form.dueDate}
              disabled={!canEdit("dueDate")}
              onChange={(e) => setF({ ...form, dueDate: e.target.value })}
            />
            <Calendar className="date-icon" />
          </div>

          {!task && (
            <>
              <label>Assign to (optional)</label>
              <select
                value={form.assignedTo}
                onChange={(e) => setF({ ...form, assignedTo: e.target.value })}
              >
                <option value="">— Personal task —</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
