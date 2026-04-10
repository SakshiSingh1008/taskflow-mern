import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";
import { Link } from "react-router-dom";

export default function MyTasksPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const myTasks = tasks.filter((t) => t.assignedTo?._id === user._id);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>TaskFlow</h2>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/my-tasks" className="active">
            My Tasks
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <div className="main">
        {/* Navbar */}
        <header className="navbar">
          <h1>My Tasks</h1>

          <div className="nav-right">
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="mytasks-container">
          {myTasks.length === 0 ? (
            <p className="empty">No tasks assigned to you</p>
          ) : (
            myTasks.map((t) => (
              <TaskCard
                key={t._id}
                task={t}
                userId={user._id}
                showEdit={false} // ✅ edit hidden
                onDelete={load}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
