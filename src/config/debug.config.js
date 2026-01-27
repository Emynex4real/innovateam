/**
 * Debug Configuration
 * 
 * Set DEBUG_ENABLED to true to enable debug logs
 * Set to false for production (cleaner console)
 */

export const DEBUG_CONFIG = {
  // Master switch - set to false to disable all debug logs
  ENABLED: false, // Change to true when debugging
  
  // Individual module switches (only work if ENABLED is true)
  REQUEST_MANAGER: true,
  SERVICE_LAYER: true,
  DASHBOARD: true,
};

// Helper function to check if debug is enabled
export const isDebugEnabled = (module = null) => {
  if (!DEBUG_CONFIG.ENABLED) return false;
  if (!module) return true;
  return DEBUG_CONFIG[module] !== false;
};

export default DEBUG_CONFIG;
