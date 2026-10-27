// Below line helps with:
// Importing assets (like .svg, .png, or .css files).

// Environment variables accessed via import.meta.env (e.g., import.meta.env.VITE_API_URL).

// Hot Module Replacement (HMR) API via import.meta.hot.



/// <reference types="vite/client" />

// Helps TS understand files ending in .vue are SFC's
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}
