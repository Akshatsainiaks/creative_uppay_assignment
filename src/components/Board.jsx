// // src/components/Board.jsx
// import React, { useEffect, useCallback, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// import {
//   addTask,
//   updateTask,
//   deleteTask,
//   reorderWithinColumn,
//   moveTask,
//   setFilter,
//   loadInitial,
//   addActivity
// } from "../store/tasksSlice";

// import AddTaskModal from "./AddTaskModal";
// import TaskCard from "./Column";
// import ActivityLog from "./ActivityLog";

// import socket, {
//   connectSocket,
//   joinBoard,
//   leaveBoard,
//   emitTaskUpdate,
//   emitTaskCreate,
//   emitTaskDelete,
//   emitActivityAdd,
//   shareBoardLink
// } from "../socket";

// // MUI Icons
// import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
// import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
// import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
// import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
// import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
// import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
// import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
// import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";

// const BOARD_KEY_PREFIX = "tasks_"; // localStorage key prefix
// const ACTIVITY_LIMIT = 500; // how many activities to keep

// export default function Board() {
//   const boardId = "mobile-app";
//   const dispatch = useDispatch();

//   const columns = useSelector((s) => s.tasks.columns);
//   const columnOrder = useSelector((s) => s.tasks.columnOrder);
//   const tasks = useSelector((s) => s.tasks.tasks);
//   const filter = useSelector((s) => s.tasks.filter);

//   const [showAddTaskModal, setShowAddTaskModal] = useState(false);
//   const [toasts, setToasts] = useState([]);

//   // auto-dismiss first toast every 3s
//   useEffect(() => {
//     if (!toasts.length) return;
//     const timer = setTimeout(() => setToasts((t) => t.slice(1)), 3000);
//     return () => clearTimeout(timer);
//   }, [toasts]);

//   // helper: deep clone safe
//   const safeClone = (v) => {
//     try {
//       return JSON.parse(JSON.stringify(v));
//     } catch {
//       if (Array.isArray(v)) return [...v];
//       if (v && typeof v === "object") return { ...v };
//       return v;
//     }
//   };

//   // ensure snapshot exists and shape
//   const ensureSnapshot = (cols = {}, colOrder = [], tsks = {}, acts = []) => {
//     window.__TASKS_SNAPSHOT = window.__TASKS_SNAPSHOT || {};
//     window.__TASKS_SNAPSHOT.columns = window.__TASKS_SNAPSHOT.columns || safeClone(cols);
//     window.__TASKS_SNAPSHOT.columnOrder = window.__TASKS_SNAPSHOT.columnOrder || safeClone(colOrder);
//     window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || safeClone(tsks);
//     window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || safeClone(acts);
//   };

//   // read snapshot from localStorage (if present) and load initial into redux
//   useEffect(() => {
//     connectSocket();
//     joinBoard(boardId);

//     const saved = localStorage.getItem(BOARD_KEY_PREFIX + boardId);
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         ensureSnapshot(parsed.columns, parsed.columnOrder, parsed.tasks, parsed.activities);
//         // dispatch to redux so UI matches snapshot
//         dispatch(loadInitial({
//           columns: parsed.columns || {},
//           columnOrder: parsed.columnOrder || [],
//           tasks: parsed.tasks || {},
//           activities: parsed.activities || []
//         }));
//       } catch (e) {
//         // fallback
//         ensureSnapshot(columns, columnOrder, tasks, []);
//       }
//     } else {
//       // first time: populate snapshot from current redux store shapes
//       ensureSnapshot(columns, columnOrder, tasks, []);
//       // store it to localStorage for future
//       localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     }

//     // --- socket listeners (update redux + snapshot + localStorage) ---
//     const onCreated = ({ task }) => {
//       if (!task || !task.id) return;
//       dispatch(addTask(task));

//       ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//       window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
//       window.__TASKS_SNAPSHOT.tasks[task.id] = safeClone(task);

//       // ensure column array exists and includes task
//       if (window.__TASKS_SNAPSHOT.columns && window.__TASKS_SNAPSHOT.columns[task.columnId]) {
//         if (!Array.isArray(window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds)) window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds = [];
//         if (!window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds.includes(task.id)) {
//           window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds.unshift(task.id);
//         }
//       }
//       localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     };

//     const onUpdated = ({ task }) => {
//       if (!task || !task.id) return;
//       dispatch(updateTask(task));

//       ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//       window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
//       window.__TASKS_SNAPSHOT.tasks[task.id] = safeClone(task);
//       localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     };

//     const onDeleted = ({ taskId }) => {
//       if (!taskId) return;
//       dispatch(deleteTask({ taskId }));

//       ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//       if (window.__TASKS_SNAPSHOT.tasks) delete window.__TASKS_SNAPSHOT.tasks[taskId];
//       // remove from all columns
//       for (const c of Object.values(window.__TASKS_SNAPSHOT.columns || {})) {
//         if (Array.isArray(c.taskIds)) c.taskIds = c.taskIds.filter((id) => id !== taskId);
//       }
//       localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     };

//     const onActivity = ({ activity }) => {
//       if (!activity || !activity.id) return;

//       // dedupe by id
//       ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//       window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
//       if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
//         window.__TASKS_SNAPSHOT.activities.unshift(activity);
//         // prune
//         if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) {
//           window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
//         }
//         dispatch(addActivity(activity)); // update redux
//         localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//       }
//     };

//     socket.on("task:created", onCreated);
//     socket.on("task:updated", onUpdated);
//     socket.on("task:deleted", onDeleted);
//     socket.on("activity:added", onActivity);

//     return () => {
//       // cleanup listeners, leave room
//       socket.off("task:created", onCreated);
//       socket.off("task:updated", onUpdated);
//       socket.off("task:deleted", onDeleted);
//       socket.off("activity:added", onActivity);
//       leaveBoard(boardId);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // persist helper: write current redux shapes to snapshot and localStorage
//   const persist = () => {
//     ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//     window.__TASKS_SNAPSHOT.columns = safeClone(columns);
//     window.__TASKS_SNAPSHOT.columnOrder = safeClone(columnOrder);
//     window.__TASKS_SNAPSHOT.tasks = safeClone(tasks);
//     // activities kept from snapshot (we don't mutate from redux)
//     localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//   };

//   // DRAG handler — updates redux + snapshot + localStorage
//   const onDragEnd = useCallback(
//     (result) => {
//       const { source, destination, draggableId } = result;
//       if (!destination) return;

//       // no-op if same spot
//       if (
//         source.droppableId === destination.droppableId &&
//         source.index === destination.index
//       ) {
//         return;
//       }

//       // same column reorder
//       if (source.droppableId === destination.droppableId) {
//         dispatch(
//           reorderWithinColumn({
//             columnId: source.droppableId,
//             startIndex: source.index,
//             endIndex: destination.index
//           })
//         );
//         // update snapshot
//         ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//         const newCols = safeClone(window.__TASKS_SNAPSHOT.columns);
//         if (newCols && newCols[source.droppableId] && Array.isArray(newCols[source.droppableId].taskIds)) {
//           const list = newCols[source.droppableId].taskIds;
//           const [removed] = list.splice(source.index, 1);
//           list.splice(destination.index, 0, removed);
//           window.__TASKS_SNAPSHOT.columns = newCols;
//           localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//         }
//         return;
//       }

//       // move between columns
//       dispatch(moveTask({ source, destination, draggableId }));

//       // update task object and emit
//       const updatedTask = { ...(tasks[draggableId] || {}), columnId: destination.droppableId };
//       emitTaskUpdate({ boardId, task: updatedTask });

//       // update snapshot columns & tasks
//       ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//       const newCols = safeClone(window.__TASKS_SNAPSHOT.columns);

//       // remove from source
//       if (newCols && newCols[source.droppableId]) {
//         newCols[source.droppableId].taskIds = (newCols[source.droppableId].taskIds || []).filter((id) => id !== draggableId);
//       }
//       // add to destination
//       if (!newCols[destination.droppableId]) newCols[destination.droppableId] = { id: destination.droppableId, title: destination.droppableId, taskIds: [] };
//       newCols[destination.droppableId].taskIds.splice(destination.index, 0, draggableId);

//       window.__TASKS_SNAPSHOT.columns = newCols;
//       window.__TASKS_SNAPSHOT.tasks = { ...(window.__TASKS_SNAPSHOT.tasks || {}), [draggableId]: updatedTask };

//       // add activity for move
//       const activity = {
//         id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
//         text: `Moved "${updatedTask.title || draggableId}" to ${destination.droppableId}`,
//         time: new Date().toISOString(),
//         taskId: draggableId
//       };
//       // dedupe then add
//       window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
//       if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
//         window.__TASKS_SNAPSHOT.activities.unshift(activity);
//         if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
//       }
//       dispatch(addActivity(activity));
//       emitActivityAdd({ boardId, activity });

//       localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     },
//     [dispatch, tasks, columns, columnOrder]
//   );

//   // Create task locally (from modal) -> update redux, snapshot, emit, activity
//   const createTaskLocal = (payload) => {
//     const id = "t_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
//     const task = {
//       id,
//       title: payload.title || "Untitled",
//       description: payload.description || "",
//       priority: payload.priority || "Low", // can be Low / High / Completed
//       dueAt: payload.dueAt || null,
//       subtasks: payload.subtasks || [],
//       columnId: "todo",
//       commentsCount: 0,
//       filesCount: 0,
//       members: payload.members || []
//     };

//     // redux + emit
//     dispatch(addTask(task));
//     emitTaskCreate({ boardId, task });

//     // update snapshot columns/tasks
//     ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//     window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
//     window.__TASKS_SNAPSHOT.tasks[id] = safeClone(task);
//     if (!window.__TASKS_SNAPSHOT.columns) window.__TASKS_SNAPSHOT.columns = safeClone(columns);
//     if (!window.__TASKS_SNAPSHOT.columns.todo) window.__TASKS_SNAPSHOT.columns.todo = { id: "todo", title: "To Do", taskIds: [] };
//     if (!window.__TASKS_SNAPSHOT.columns.todo.taskIds.includes(id)) window.__TASKS_SNAPSHOT.columns.todo.taskIds.unshift(id);

//     // create activity
//     const activity = {
//       id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
//       text: `Created "${task.title}"`,
//       time: new Date().toISOString(),
//       taskId: id
//     };
//     window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
//     if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
//       window.__TASKS_SNAPSHOT.activities.unshift(activity);
//       if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
//     }
//     dispatch(addActivity(activity));
//     emitActivityAdd({ boardId, activity });

//     // save
//     localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     setToasts((t) => [...t, { id: Date.now() + Math.random(), text: `Task "${task.title}" created` }]);
//   };

//   // Programmatic move (used by TaskCard menu). markCompleted will also set priority.
//   const moveTaskLocal = (taskId, toColumn, markCompleted = false) => {
//     const current = tasks[taskId];
//     if (!current) return;

//     const sourceIndex = (columns[current.columnId]?.taskIds || []).indexOf(taskId);
//     const destIndex = (columns[toColumn]?.taskIds || []).length;

//     dispatch(moveTask({
//       source: { droppableId: current.columnId, index: sourceIndex >= 0 ? sourceIndex : 0 },
//       destination: { droppableId: toColumn, index: destIndex },
//       draggableId: taskId
//     }));

//     const updated = { ...current, columnId: toColumn };
//     if (markCompleted) updated.priority = "Completed";

//     emitTaskUpdate({ boardId, task: updated });

//     // update snapshot columns/tasks
//     ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//     const newCols = safeClone(window.__TASKS_SNAPSHOT.columns);
//     if (newCols && newCols[current.columnId]) {
//       newCols[current.columnId].taskIds = (newCols[current.columnId].taskIds || []).filter((id) => id !== taskId);
//     }
//     if (!newCols[toColumn]) newCols[toColumn] = { id: toColumn, title: toColumn, taskIds: [] };
//     newCols[toColumn].taskIds.splice(destIndex, 0, taskId);

//     window.__TASKS_SNAPSHOT.columns = newCols;
//     window.__TASKS_SNAPSHOT.tasks = { ...(window.__TASKS_SNAPSHOT.tasks || {}), [taskId]: updated };

//     // activity
//     const activity = {
//       id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
//       text: `${markCompleted ? "Completed" : "Moved"} "${updated.title || taskId}" → ${toColumn}`,
//       time: new Date().toISOString(),
//       taskId
//     };
//     window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
//     if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
//       window.__TASKS_SNAPSHOT.activities.unshift(activity);
//       if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
//     }
//     dispatch(addActivity(activity));
//     emitActivityAdd({ boardId, activity });

//     localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     persist();
//   };

//   // Edit task (simple title edit flow)
//   const editTaskLocal = (taskId) => {
//     const t = tasks[taskId];
//     if (!t) return;
//     const newTitle = prompt("Edit title", t.title);
//     if (!newTitle) return;

//     const updated = { ...t, title: newTitle };
//     dispatch(updateTask(updated));
//     emitTaskUpdate({ boardId, task: updated });

//     // snapshot update
//     ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//     window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
//     window.__TASKS_SNAPSHOT.tasks[taskId] = safeClone(updated);

//     // activity
//     const activity = {
//       id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
//       text: `Edited "${updated.title}"`,
//       time: new Date().toISOString(),
//       taskId
//     };
//     window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
//     if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
//       window.__TASKS_SNAPSHOT.activities.unshift(activity);
//       if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
//     }
//     dispatch(addActivity(activity));
//     emitActivityAdd({ boardId, activity });

//     localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     persist();
//   };

//   // Delete task
//   const deleteTaskLocal = (taskId) => {
//     if (!window.confirm("Delete this task?")) return;

//     // get title for activity
//     const t = tasks[taskId];
//     const title = t?.title || taskId;

//     dispatch(deleteTask({ taskId }));
//     emitTaskDelete({ boardId, taskId });

//     // snapshot update
//     ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
//     if (window.__TASKS_SNAPSHOT.tasks) delete window.__TASKS_SNAPSHOT.tasks[taskId];
//     for (const c of Object.values(window.__TASKS_SNAPSHOT.columns || {})) {
//       if (Array.isArray(c.taskIds)) c.taskIds = c.taskIds.filter((id) => id !== taskId);
//     }

//     // activity
//     const activity = {
//       id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
//       text: `Deleted "${title}"`,
//       time: new Date().toISOString(),
//       taskId
//     };
//     window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
//     if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
//       window.__TASKS_SNAPSHOT.activities.unshift(activity);
//       if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
//     }
//     dispatch(addActivity(activity));
//     emitActivityAdd({ boardId, activity });

//     localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
//     persist();
//   };

//   // UI: render
//   return (
//     <div className="px-6 pt-6">
//       {/* Header (Figma-like) */}
//       <div className="flex items-start justify-between mb-10">
//         <div className="flex flex-col">
//           <div className="flex items-center gap-3">
//             <h1 className="text-4xl font-extrabold text-[#0D0D25]">Mobile App</h1>
//             <span className="p-2 bg-[#EEEBFF] rounded-lg cursor-pointer">
//               <BorderColorOutlinedIcon sx={{ color: "#5A3FFF", fontSize: 20 }} />
//             </span>
//             <span className="p-2 bg-[#EEEBFF] rounded-lg cursor-pointer">
//               <LinkOutlinedIcon sx={{ color: "#5A3FFF", fontSize: 20 }} />
//             </span>
//           </div>

//           <div className="flex items-center gap-3 mt-5">
//             <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700">
//               <FilterAltOutlinedIcon sx={{ fontSize: 18 }} />
//               Filter
//             </button>
//             <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700">
//               <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />
//               Today
//             </button>
//           </div>
//         </div>

//         <div className="flex items-center gap-8">
//           <div className="flex items-center gap-4">
//             <button className="flex items-center gap-2 text-[#5A3FFF] font-medium">
//               <span className="p-1 bg-[#EEEBFF] rounded-md flex items-center">
//                 <PersonAddAltOutlinedIcon sx={{ fontSize: 18, color: "#5A3FFF" }} />
//               </span>
//               Invite
//             </button>
//             <div className="flex items-center -space-x-3">
//               {[10, 14, 17, 22].map((img, i) => (
//                 <img key={i} src={`https://i.pravatar.cc/40?img=${img}`} className="w-9 h-9 rounded-full border" />
//               ))}
//               <div className="w-9 h-9 bg-[#F3D4D4] text-[#C84646] rounded-full flex items-center justify-center text-sm font-semibold border">
//                 +2
//               </div>
//             </div>
//           </div>

//           <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700">
//             <GroupOutlinedIcon sx={{ fontSize: 20 }} />
//             Share
//           </button>

//           <div className="w-px h-6 bg-gray-300"></div>

//           <button className="p-3 bg-[#5A3FFF] rounded-lg shadow text-white">
//             <GridViewOutlinedIcon sx={{ fontSize: 20 }} />
//           </button>

//           <button className="p-3 rounded-lg border border-gray-300 text-gray-500">
//             <MoreHorizOutlinedIcon sx={{ fontSize: 24 }} />
//           </button>
//         </div>
//       </div>

//       {/* Board */}
//       <DragDropContext onDragEnd={onDragEnd}>
//         <div className="grid grid-cols-3 gap-6">
//           {columnOrder.map((colId) => {
//             const col = columns[colId];
//             // UI-only rename: "In Progress" -> "On Progress"
//             const colTitle = col?.title === "In Progress" ? "On Progress" : col?.title || colId;
//             const taskList = (col?.taskIds || []).map((id) => tasks[id]).filter(Boolean);

//             const topBar =
//               colId === "todo"
//                 ? "border-t-4 border-purple-500"
//                 : colId === "inprogress"
//                 ? "border-t-4 border-yellow-500"
//                 : "border-t-4 border-green-500";

//             return (
//               <Droppable key={col.id} droppableId={col.id}>
//                 {(provided) => (
//                   <div
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     className={`bg-white rounded-xl p-4 min-h-[420px] border ${topBar}`}
//                   >
//                     <div className="flex justify-between items-center mb-3">
//                       <h3 className="font-semibold">
//                         {colTitle}
//                         <span className="text-sm text-gray-400 ml-1">({col.taskIds.length})</span>
//                       </h3>

//                       {col.id === "todo" && (
//                         <button onClick={() => setShowAddTaskModal(true)} className="text-xl w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100">
//                           +
//                         </button>
//                       )}
//                     </div>

//                     <div className="space-y-4">
//                       {taskList.map((task, index) => (
//                         <Draggable key={task.id} draggableId={task.id} index={index}>
//                           {(prov) => (
//                             <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
//                               <TaskCard
//                                 task={task}
//                                 onMove={(toCol, markCompleted) => moveTaskLocal(task.id, toCol, !!markCompleted)}
//                                 onEdit={() => editTaskLocal(task.id)}
//                                 onDelete={() => deleteTaskLocal(task.id)}
//                               />
//                             </div>
//                           )}
//                         </Draggable>
//                       ))}

//                       {provided.placeholder}
//                     </div>
//                   </div>
//                 )}
//               </Droppable>
//             );
//           })}
//         </div>
//       </DragDropContext>

//       {/* Modal */}
//       {showAddTaskModal && (
//         <AddTaskModal
//           onClose={() => setShowAddTaskModal(false)}
//           onCreate={(payload) => { createTaskLocal(payload); setShowAddTaskModal(false); }}
//         />
//       )}

//       {/* Activity */}
//       <div className="mt-8">
//         <ActivityLog />
//       </div>

//       {/* Toasts */}
//       <div className="fixed right-5 bottom-5 space-y-2 w-80">
//         {toasts.map((t) => (
//           <div key={t.id} className="bg-white text-sm border px-3 py-2 rounded shadow flex justify-between">
//             {t.text}
//             <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="ml-2">×</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// src/components/Board.jsx
import React, { useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  addTask,
  updateTask,
  deleteTask,
  reorderWithinColumn,
  moveTask,
  setFilter,
  loadInitial,
  addActivity
} from "../store/tasksSlice";

import AddTaskModal from "./AddTaskModal";
import TaskCard from "./Column"; // your TaskCard / Column component
import ActivityLog from "./ActivityLog";

import socket, {
  connectSocket,
  joinBoard,
  leaveBoard,
  emitTaskUpdate,
  emitTaskCreate,
  emitTaskDelete,
  emitActivityAdd,
  shareBoardLink
} from "../socket";

// MUI Icons used in header UI
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import LinkOutlinedIcon from "@mui/icons-material/LinkOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import MoreHorizOutlinedIcon from "@mui/icons-material/MoreHorizOutlined";

const BOARD_KEY_PREFIX = "tasks_";
const ACTIVITY_LIMIT = 500;

export default function Board() {
  const boardId = "mobile-app";
  const dispatch = useDispatch();

  const columns = useSelector((s) => s.tasks.columns);
  const columnOrder = useSelector((s) => s.tasks.columnOrder);
  const tasks = useSelector((s) => s.tasks.tasks);
  const filter = useSelector((s) => s.tasks.filter);

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [commentModal, setCommentModal] = useState({ open: false, taskId: null });
  const [dummyUsers] = useState([
    { id: "u1", name: "Amit", avatar: "https://i.pravatar.cc/40?img=10" },
    { id: "u2", name: "Riya", avatar: "https://i.pravatar.cc/40?img=14" },
    { id: "u3", name: "Karan", avatar: "https://i.pravatar.cc/40?img=17" },
    { id: "u4", name: "Sneha", avatar: "https://i.pravatar.cc/40?img=22" }
  ]);

  // auto-dismiss first toast after 3s
  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => setToasts((t) => t.slice(1)), 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const safeClone = (v) => {
    try {
      return JSON.parse(JSON.stringify(v));
    } catch {
      if (Array.isArray(v)) return [...v];
      if (v && typeof v === "object") return { ...v };
      return v;
    }
  };

  const ensureSnapshot = (cols = {}, colOrder = [], tsks = {}, acts = []) => {
    window.__TASKS_SNAPSHOT = window.__TASKS_SNAPSHOT || {};
    window.__TASKS_SNAPSHOT.columns = window.__TASKS_SNAPSHOT.columns || safeClone(cols);
    window.__TASKS_SNAPSHOT.columnOrder = window.__TASKS_SNAPSHOT.columnOrder || safeClone(colOrder);
    window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || safeClone(tsks);
    window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || safeClone(acts);
  };

  // — LOAD from localStorage & set up socket listeners
  useEffect(() => {
    connectSocket();
    joinBoard(boardId);

    const saved = localStorage.getItem(BOARD_KEY_PREFIX + boardId);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        ensureSnapshot(parsed.columns, parsed.columnOrder, parsed.tasks, parsed.activities);
        dispatch(loadInitial({
          columns: parsed.columns || {},
          columnOrder: parsed.columnOrder || [],
          tasks: parsed.tasks || {},
          activities: parsed.activities || []
        }));
      } catch (e) {
        ensureSnapshot(columns, columnOrder, tasks, []);
      }
    } else {
      ensureSnapshot(columns, columnOrder, tasks, []);
      localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    }

    // socket handlers
    const onCreated = ({ task }) => {
      if (!task || !task.id) return;
      dispatch(addTask(task));
      ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
      window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
      window.__TASKS_SNAPSHOT.tasks[task.id] = safeClone(task);
      if (window.__TASKS_SNAPSHOT.columns && window.__TASKS_SNAPSHOT.columns[task.columnId]) {
        if (!Array.isArray(window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds)) window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds = [];
        if (!window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds.includes(task.id)) {
          window.__TASKS_SNAPSHOT.columns[task.columnId].taskIds.unshift(task.id);
        }
      }
      localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    };

    const onUpdated = ({ task }) => {
      if (!task || !task.id) return;
      dispatch(updateTask(task));
      ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
      window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
      window.__TASKS_SNAPSHOT.tasks[task.id] = safeClone(task);
      localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    };

    const onDeleted = ({ taskId }) => {
      if (!taskId) return;
      dispatch(deleteTask({ taskId }));
      ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
      if (window.__TASKS_SNAPSHOT.tasks) delete window.__TASKS_SNAPSHOT.tasks[taskId];
      for (const c of Object.values(window.__TASKS_SNAPSHOT.columns || {})) {
        if (Array.isArray(c.taskIds)) c.taskIds = c.taskIds.filter((id) => id !== taskId);
      }
      localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    };

    const onActivity = ({ activity }) => {
      if (!activity || !activity.id) return;
      ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
      window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
      if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
        window.__TASKS_SNAPSHOT.activities.unshift(activity);
        if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
        dispatch(addActivity(activity));
        localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
      }
    };

    socket.on("task:created", onCreated);
    socket.on("task:updated", onUpdated);
    socket.on("task:deleted", onDeleted);
    socket.on("activity:added", onActivity);

    return () => {
      socket.off("task:created", onCreated);
      socket.off("task:updated", onUpdated);
      socket.off("task:deleted", onDeleted);
      socket.off("activity:added", onActivity);
      leaveBoard(boardId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



    // persist helper
  const persist = () => {
    ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
    window.__TASKS_SNAPSHOT.columns = safeClone(columns);
    window.__TASKS_SNAPSHOT.columnOrder = safeClone(columnOrder);
    window.__TASKS_SNAPSHOT.tasks = safeClone(tasks);
    localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
  };

  // DRAG END
  const onDragEnd = useCallback(
    (result) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      if (source.droppableId === destination.droppableId) {
        dispatch(reorderWithinColumn({
          columnId: source.droppableId,
          startIndex: source.index,
          endIndex: destination.index
        }));
        // update snapshot ordering
        ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
        const newCols = safeClone(window.__TASKS_SNAPSHOT.columns);
        if (newCols && newCols[source.droppableId] && Array.isArray(newCols[source.droppableId].taskIds)) {
          const list = newCols[source.droppableId].taskIds;
          const [removed] = list.splice(source.index, 1);
          list.splice(destination.index, 0, removed);
          window.__TASKS_SNAPSHOT.columns = newCols;
          localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
        }
        return;
      }

      // move across columns
      dispatch(moveTask({ source, destination, draggableId }));

      // update task and emit
      const updatedTask = { ...(tasks[draggableId] || {}), columnId: destination.droppableId };
      emitTaskUpdate({ boardId, task: updatedTask });

      // update snapshot columns & tasks
      ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
      const newCols = safeClone(window.__TASKS_SNAPSHOT.columns) || {};
      if (newCols[source.droppableId]) {
        newCols[source.droppableId].taskIds = (newCols[source.droppableId].taskIds || []).filter((id) => id !== draggableId);
      }
      if (!newCols[destination.droppableId]) newCols[destination.droppableId] = { id: destination.droppableId, title: destination.droppableId, taskIds: [] };
      newCols[destination.droppableId].taskIds.splice(destination.index, 0, draggableId);

      window.__TASKS_SNAPSHOT.columns = newCols;
      window.__TASKS_SNAPSHOT.tasks = { ...(window.__TASKS_SNAPSHOT.tasks || {}), [draggableId]: updatedTask };

      // add activity
      const activity = {
        id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
        text: `Moved "${updatedTask.title || draggableId}" → ${destination.droppableId}`,
        time: new Date().toISOString(),
        taskId: draggableId
      };
      window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
      if (!window.__TASKS_SNAPSHOT.activities.some((a) => a.id === activity.id)) {
        window.__TASKS_SNAPSHOT.activities.unshift(activity);
        if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
      }
      dispatch(addActivity(activity));
      emitActivityAdd({ boardId, activity });

      localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    },
    [dispatch, tasks, columns, columnOrder]
  );

  // CREATE TASK
  const createTaskLocal = (payload) => {
    const id = "t_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    const task = {
      id,
      title: payload.title || "Untitled",
      description: payload.description || "",
      priority: payload.priority || "Low",
      dueAt: payload.dueAt || null,
      subtasks: payload.subtasks || [],
      columnId: "todo",
      comments: [], // <-- comments stored on task
      commentsCount: 0,
      filesCount: 0,
      members: payload.members && payload.members.length ? payload.members : dummyUsers.slice(0, 2)
    };

    dispatch(addTask(task));
    emitTaskCreate({ boardId, task });

    // update snapshot & activity
    ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
    window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
    window.__TASKS_SNAPSHOT.tasks[id] = safeClone(task);
    if (!window.__TASKS_SNAPSHOT.columns.todo) window.__TASKS_SNAPSHOT.columns.todo = { id: "todo", title: "To Do", taskIds: [] };
    if (!window.__TASKS_SNAPSHOT.columns.todo.taskIds.includes(id)) window.__TASKS_SNAPSHOT.columns.todo.taskIds.unshift(id);

    const activity = {
      id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      text: `Created "${task.title}"`,
      time: new Date().toISOString(),
      taskId: id
    };
    window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
    window.__TASKS_SNAPSHOT.activities.unshift(activity);
    if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
    dispatch(addActivity(activity));
    emitActivityAdd({ boardId, activity });

    localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    setToasts((t) => [...t, { id: Date.now() + Math.random(), text: `Task "${task.title}" created` }]);
  };

  // Programmatic move (used by TaskCard menu)
  const moveTaskLocal = (taskId, toColumn, markCompleted = false) => {
    const current = tasks[taskId];
    if (!current) return;

    const sourceIndex = (columns[current.columnId]?.taskIds || []).indexOf(taskId);
    const destIndex = (columns[toColumn]?.taskIds || []).length;

    dispatch(moveTask({
      source: { droppableId: current.columnId, index: sourceIndex >= 0 ? sourceIndex : 0 },
      destination: { droppableId: toColumn, index: destIndex },
      draggableId: taskId
    }));

    const updated = { ...current, columnId: toColumn };
    if (markCompleted) updated.priority = "Completed";

    emitTaskUpdate({ boardId, task: updated });

    // snapshot update
    ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
    const newCols = safeClone(window.__TASKS_SNAPSHOT.columns);
    if (newCols && newCols[current.columnId]) {
      newCols[current.columnId].taskIds = (newCols[current.columnId].taskIds || []).filter((id) => id !== taskId);
    }
    if (!newCols[toColumn]) newCols[toColumn] = { id: toColumn, title: toColumn, taskIds: [] };
    newCols[toColumn].taskIds.splice(destIndex, 0, taskId);

    window.__TASKS_SNAPSHOT.columns = newCols;
    window.__TASKS_SNAPSHOT.tasks = { ...(window.__TASKS_SNAPSHOT.tasks || {}), [taskId]: updated };

    const activity = {
      id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      text: `${markCompleted ? "Completed" : "Moved"} "${updated.title || taskId}" → ${toColumn}`,
      time: new Date().toISOString(),
      taskId
    };
    window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
    window.__TASKS_SNAPSHOT.activities.unshift(activity);
    if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
    dispatch(addActivity(activity));
    emitActivityAdd({ boardId, activity });

    localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    persist();
  };

  // EDIT
  const editTaskLocal = (taskId) => {
    const t = tasks[taskId];
    if (!t) return;
    const newTitle = prompt("Edit title", t.title);
    if (!newTitle) return;

    const updated = { ...t, title: newTitle };
    dispatch(updateTask(updated));
    emitTaskUpdate({ boardId, task: updated });

    ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
    window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
    window.__TASKS_SNAPSHOT.tasks[taskId] = safeClone(updated);

    const activity = {
      id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      text: `Edited "${updated.title}"`,
      time: new Date().toISOString(),
      taskId
    };
    window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
    window.__TASKS_SNAPSHOT.activities.unshift(activity);
    if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
    dispatch(addActivity(activity));
    emitActivityAdd({ boardId, activity });

    localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    persist();
  };

  // DELETE
  const deleteTaskLocal = (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    const t = tasks[taskId];
    const title = t?.title || taskId;

    dispatch(deleteTask({ taskId }));
    emitTaskDelete({ boardId, taskId });

    ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
    if (window.__TASKS_SNAPSHOT.tasks) delete window.__TASKS_SNAPSHOT.tasks[taskId];
    for (const c of Object.values(window.__TASKS_SNAPSHOT.columns || {})) {
      if (Array.isArray(c.taskIds)) c.taskIds = c.taskIds.filter((id) => id !== taskId);
    }

    const activity = {
      id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      text: `Deleted "${title}"`,
      time: new Date().toISOString(),
      taskId
    };
    window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
    window.__TASKS_SNAPSHOT.activities.unshift(activity);
    if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
    dispatch(addActivity(activity));
    emitActivityAdd({ boardId, activity });

    localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    persist();
  };

  // ---------------------
  // COMMENTS
  // ---------------------
  const openCommentsFor = (taskId) => {
    setCommentModal({ open: true, taskId });
  };

  const closeComments = () => {
    setCommentModal({ open: false, taskId: null });
  };

  // add comment to task (persist + activity + emit)
  const addCommentLocal = (taskId, text) => {
    if (!text || !text.trim()) return;
    const t = tasks[taskId] || window.__TASKS_SNAPSHOT.tasks?.[taskId];
    if (!t) return;

    const comment = {
      id: "c_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      text: text.trim(),
      time: new Date().toISOString(),
      author: dummyUsers[Math.floor(Math.random() * dummyUsers.length)]
    };

    // update redux task (commentsCount optional)
    const updatedTask = { ...(t || {}), comments: [...(t.comments || []), comment], commentsCount: ((t.commentsCount || 0) + 1) };
    dispatch(updateTask(updatedTask));
    emitTaskUpdate({ boardId, task: updatedTask });

    // snapshot update
    ensureSnapshot(columns, columnOrder, tasks, window.__TASKS_SNAPSHOT?.activities || []);
    window.__TASKS_SNAPSHOT.tasks = window.__TASKS_SNAPSHOT.tasks || {};
    window.__TASKS_SNAPSHOT.tasks[taskId] = safeClone(updatedTask);

    // activity
    const activity = {
      id: "a_" + (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      text: `Commented on "${updatedTask.title}"`,
      time: new Date().toISOString(),
      taskId
    };
    window.__TASKS_SNAPSHOT.activities = window.__TASKS_SNAPSHOT.activities || [];
    window.__TASKS_SNAPSHOT.activities.unshift(activity);
    if (window.__TASKS_SNAPSHOT.activities.length > ACTIVITY_LIMIT) window.__TASKS_SNAPSHOT.activities.length = ACTIVITY_LIMIT;
    dispatch(addActivity(activity));
    emitActivityAdd({ boardId, activity });

    // persist
    localStorage.setItem(BOARD_KEY_PREFIX + boardId, JSON.stringify(window.__TASKS_SNAPSHOT));
    setToasts((tarr) => [...tarr, { id: Date.now() + Math.random(), text: "Comment added" }]);
  };

  // ---------------------
  // RENDER / UI
  // ---------------------

  // Comment modal component (embedded)
  function CommentModal({ open, taskId, onClose, onAdd }) {
    if (!open) return null;
    const t = (tasks && tasks[taskId]) || (window.__TASKS_SNAPSHOT && window.__TASKS_SNAPSHOT.tasks && window.__TASKS_SNAPSHOT.tasks[taskId]) || null;
    const comments = (t && t.comments) || [];

    const [val, setVal] = useState("");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="w-[520px] bg-white rounded-xl p-6 shadow-lg max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Comments — {t ? t.title : ""}</h3>
            <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-gray-100">Close</button>
          </div>

          <div className="space-y-3 mb-4">
            {comments.length === 0 && <div className="text-sm text-gray-500">No comments yet — be the first.</div>}
            {comments.map((c) => (
              <div key={c.id} className="border rounded p-3">
                <div className="flex items-center gap-3 mb-1">
                  <img src={c.author?.avatar || "https://i.pravatar.cc/40"} className="w-8 h-8 rounded-full" alt={c.author?.name} />
                  <div>
                    <div className="text-sm font-medium">{c.author?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-400">{new Date(c.time).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-sm">{c.text}</div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t flex gap-2">
            <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Write a comment..." className="flex-1 border rounded px-3 py-2" />
            <button onClick={() => { onAdd(taskId, val); setVal(""); }} className="px-4 py-2 bg-indigo-600 text-white rounded">Add</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold text-[#0D0D25]">Mobile App</h1>
            <span className="p-2 bg-[#EEEBFF] rounded-lg cursor-pointer">
              <BorderColorOutlinedIcon sx={{ color: "#5A3FFF", fontSize: 20 }} />
            </span>
            <span className="p-2 bg-[#EEEBFF] rounded-lg cursor-pointer">
              <LinkOutlinedIcon sx={{ color: "#5A3FFF", fontSize: 20 }} />
            </span>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700">
              <FilterAltOutlinedIcon sx={{ fontSize: 18 }} /> Filter
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700">
              <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} /> Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-[#5A3FFF] font-medium">
              <span className="p-1 bg-[#EEEBFF] rounded-md flex items-center">
                <PersonAddAltOutlinedIcon sx={{ fontSize: 18, color: "#5A3FFF" }} />
              </span>
              Invite
            </button>

            <div className="flex items-center -space-x-3">
              {[10, 14, 17, 22].map((img, i) => (
                <img key={i} src={`https://i.pravatar.cc/40?img=${img}`} className="w-9 h-9 rounded-full border" />
              ))}
              <div className="w-9 h-9 bg-[#F3D4D4] text-[#C84646] rounded-full flex items-center justify-center text-sm font-semibold border">
                +2
              </div>
            </div>
          </div>

          <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700">
            <GroupOutlinedIcon sx={{ fontSize: 20 }} /> Share
          </button>

          <div className="w-px h-6 bg-gray-300"></div>

          <button className="p-3 bg-[#5A3FFF] rounded-lg shadow text-white">
            <GridViewOutlinedIcon sx={{ fontSize: 20 }} />
          </button>

          <button className="p-3 rounded-lg border border-gray-300 text-gray-500">
            <MoreHorizOutlinedIcon sx={{ fontSize: 24 }} />
          </button>
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {columnOrder.map((colId) => {
            const col = columns[colId];
            const colTitle = col?.title === "In Progress" ? "On Progress" : col?.title || colId;
            const taskList = (col?.taskIds || []).map((id) => tasks[id]).filter(Boolean);

            const topBar = colId === "todo" ? "border-t-4 border-purple-500" :
                          colId === "inprogress" ? "border-t-4 border-yellow-500" : "border-t-4 border-green-500";

            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className={`bg-white rounded-xl p-4 min-h-[420px] border ${topBar}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold">
                        {colTitle}
                        <span className="text-sm text-gray-400 ml-1">({col.taskIds.length})</span>
                      </h3>

                      {col.id === "todo" && (
                        <button onClick={() => setShowAddTaskModal(true)}
                          className="text-xl w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100">
                          +
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {taskList.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(prov) => (
                            <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}>
                           <TaskCard
  task={task}
  onMove={(toCol, markCompleted) => moveTaskLocal(task.id, toCol, !!markCompleted)}
  onEdit={() => editTaskLocal(task.id)}
  onDelete={() => deleteTaskLocal(task.id)}
  onOpenComments={(taskId) => openCommentsFor(taskId)}   // Correct
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
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <AddTaskModal
          onClose={() => setShowAddTaskModal(false)}
          onCreate={(payload) => { createTaskLocal(payload); setShowAddTaskModal(false); }}
        />
      )}

      {/* Comment modal (embedded) */}
      <CommentModal open={commentModal.open} taskId={commentModal.taskId} onClose={closeComments} onAdd={addCommentLocal} />

      {/* Activity */}
      <div className="mt-8">
        <ActivityLog />
      </div>

      {/* Toasts */}
      <div className="fixed right-5 bottom-5 space-y-2 w-80">
        {toasts.map((t) => (
          <div key={t.id} className="bg-white text-sm border px-3 py-2 rounded shadow flex justify-between">
            {t.text}
            <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="ml-2">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

