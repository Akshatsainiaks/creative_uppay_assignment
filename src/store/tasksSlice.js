
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  columns: {
    todo: { id: "todo", title: "To Do", taskIds: [] },
    inprogress: { id: "inprogress", title: "In Progress", taskIds: [] },
    done: { id: "done", title: "Done", taskIds: [] }
  },
  columnOrder: ["todo", "inprogress", "done"],
  tasks: {},
  filter: "All",
  activities: []
};

const slice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    loadInitial(state, action) {
      const d = action.payload || {};
      state.columns = d.columns || state.columns;
      state.columnOrder = d.columnOrder || state.columnOrder;
      state.tasks = d.tasks || state.tasks;
      state.activities = d.activities || state.activities;
      state.filter = d.filter || state.filter;
    },


    addTask(state, action) {
      const t = action.payload;
      if (!t?.id) return;
      state.tasks[t.id] = t;

      if (!state.columns[t.columnId]) {
        state.columns[t.columnId] = { id: t.columnId, title: t.columnId, taskIds: [] };
      }
      if (!state.columns[t.columnId].taskIds.includes(t.id)) {
        state.columns[t.columnId].taskIds.unshift(t.id);
      }
    },

    updateTask(state, action) {
      const t = action.payload;
      if (!t?.id) return;
      state.tasks[t.id] = { ...(state.tasks[t.id] || {}), ...t };
    },


    deleteTask(state, action) {
      const { taskId } = action.payload || {};
      if (!taskId) return;

      for (const c of Object.values(state.columns)) {
        if (Array.isArray(c.taskIds)) {
          c.taskIds = c.taskIds.filter((id) => id !== taskId);
        }
      }
      if (state.tasks && state.tasks[taskId]) delete state.tasks[taskId];
    },


    reorderWithinColumn(state, action) {
      const { columnId, startIndex, endIndex } = action.payload;
      const list = state.columns[columnId]?.taskIds;
      if (!Array.isArray(list)) return;
      const [removed] = list.splice(startIndex, 1);
      list.splice(endIndex, 0, removed);
    },


    moveTask(state, action) {
      const { source, destination, draggableId } = action.payload;
      const from = state.columns[source.droppableId];
      const to = state.columns[destination.droppableId];
      if (!from || !to) return;

      from.taskIds = from.taskIds.filter((id) => id !== draggableId);
      if (!to.taskIds.includes(draggableId)) {
        to.taskIds.splice(destination.index, 0, draggableId);
      }

      if (state.tasks[draggableId]) state.tasks[draggableId].columnId = destination.droppableId;
    },

    setFilter(state, action) {
      state.filter = action.payload;
    },

    addActivity(state, action) {
      const act = action.payload;
      if (!act?.id) return;

      if (state.activities.some((a) => a.id === act.id)) return;
      state.activities.unshift(act);
      if (state.activities.length > 300) state.activities.length = 300;
    }
  }
});

export const {
  loadInitial,
  addTask,
  updateTask,
  deleteTask,
  reorderWithinColumn,
  moveTask,
  setFilter,
  addActivity
} = slice.actions;

export default slice.reducer;
