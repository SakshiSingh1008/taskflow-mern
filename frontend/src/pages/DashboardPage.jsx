import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { Link } from "react-router-dom";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const statuses = ["Todo", "In Progress", "Done"];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [modal, setModal] = useState(null);

  const load = async () => {
    const { data } = await api.get("/tasks");
    setTasks(data);
  };

  useEffect(() => {
    load();
  }, []);

  // 🔥 DRAG LOGIC
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // No change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;


    const updatedTasks = tasks.map((task) =>
      task._id === draggableId
        ? { ...task, status: destination.droppableId }
        : task,
    );

    setTasks(updatedTasks);

    try {
      await api.put(`/tasks/${draggableId}`, {
        status: destination.droppableId,
      });
    } catch (err) {
      console.log("Failed to update status");
      load(); // fallback reload
    }
  };

  return (
    <div className="app-layout">
    
      <aside className="sidebar">
        <h2>TaskFlow</h2>

        <nav>
          <Link to="/dashboard" className="active">
            Dashboard
          </Link>
          <Link to="/my-tasks">My Tasks</Link>
        </nav>
      </aside>

   
      <div className="main">
       
        <header className="navbar">
          <h1>Dashboard</h1>

          <div className="nav-right">
            <button className="btn-primary" onClick={() => setModal("create")}>
              + New Task
            </button>

            <span className="user-name">{user.name}</span>

            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {/* 🔥 DRAG & DROP BOARD */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {statuses.map((status) => (
              <Droppable droppableId={status} key={status}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      background: snapshot.isDraggingOver ? "#273449" : "",
                    }}
                  >
                    <h2>
                      {status} (
                      {tasks.filter((t) => t.status === status).length})
                    </h2>

                    <div className="column-tasks">
                      {tasks
                        .filter((t) => t.status === status)
                        .map((t, index) => (
                          <Draggable
                            key={t._id}
                            draggableId={t._id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                              >
                                <TaskCard
                                  task={t}
                                  userId={user._id}
                                  onEdit={() => setModal(t)}
                                  onDelete={load}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}

                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {modal && (
        <TaskModal
          task={modal === "create" ? null : modal}
          userId={user._id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
          }}
        />
      )}
    </div>
  );
}
