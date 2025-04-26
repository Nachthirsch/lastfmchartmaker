import { createPinia } from "pinia";

// Create and export a Pinia instance
const pinia = createPinia();
export default pinia;

// Re-export all stores for easier imports
export * from "./artists";
export * from "./albums";
export * from "./tracks";
