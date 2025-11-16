import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "./tasksSlice";

const loadState = () => {
  try {
    const s = localStorage.getItem("upaay_state_v1");
    return s ? JSON.parse(s) : undefined;
  } catch { return undefined; }
};

const preloaded = loadState();

const store = configureStore({
  reducer: { tasks: tasksReducer },
  preloadedState: preloaded,
});

store.subscribe(() => {
  try {
    localStorage.setItem("upaay_state_v1", JSON.stringify(store.getState()));
  } catch {}
});

export default store;
