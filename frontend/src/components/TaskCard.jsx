import api from "../api/axios";

const STATUS_COLORS = {
  Todo: "#6366f1",
  "In Progress": "#f59e0b",
  Done: "#10b981",
};

export default function TaskCard({
  task,
  userId,
  onEdit,
  onDelete,
  showEdit = true, // ✅ control edit button
}) {
  const isCreator = task.createdBy._id === userId;

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onDelete();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="task-card">
      {/* Top */}
      <div className="card-top">
        <span
          className="status-dot"
          style={{ background: STATUS_COLORS[task.status] }}
        />
        <span className="status-label">{task.status}</span>

        {task.assignedTo && (
          <span className="badge">
            {isCreator
              ? `→ ${task.assignedTo.name}`
              : `← ${task.createdBy.name}`}
          </span>
        )}
      </div>

      {/* Content */}
      <h3>{task.title}</h3>
      <p className="desc">{task.description}</p>

      {task.dueDate && (
        <p className="due">Due {new Date(task.dueDate).toLocaleDateString()}</p>
      )}

      {/* Actions */}
      <div className="card-actions">
        {/* ✅ Edit button (controlled) */}
        {showEdit && <button onClick={() => onEdit(task)}>Edit</button>}

        {/* ✅ Delete only for creator */}
        {isCreator && (
          <button onClick={handleDelete} className="danger">
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
