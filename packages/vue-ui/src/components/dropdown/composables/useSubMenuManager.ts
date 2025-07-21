import { ref, type Ref } from 'vue'
import type { SubMenuManager } from '../useDropdown'

/**
 * Composable for managing sub-menu state and behavior in dropdown systems.
 * Provides centralized sub-menu registration, activation, and lifecycle management.
 * 
 * Features:
 * - Sub-menu registration/unregistration
 * - Active sub-menu tracking
 * - Coordinated opening/closing of sub-menus
 * - Ensures only one sub-menu is active at a time
 * 
 * @returns {SubMenuManager} Sub-menu management utilities
 * 
 * @example
 * ```typescript
 * const subMenuManager = useSubMenuManager()
 * 
 * // Register a new sub-menu
 * subMenuManager.registerSubMenu('file-menu')
 * 
 * // Open a specific sub-menu (closes others)
 * subMenuManager.openSubMenu('file-menu')
 * 
 * // Close all sub-menus
 * subMenuManager.closeAllSubMenus()
 * 
 * // Check which sub-menu is active
 * if (subMenuManager.activeSubMenu.value === 'file-menu') {
 *   // File menu is open
 * }
 * ```
 */
export function useSubMenuManager(): SubMenuManager {
  /**
   * Set of registered sub-menu IDs
   * @private
   */
  const subMenus = ref<Set<string>>(new Set())
  
  /**
   * Currently active sub-menu ID
   */
  const activeSubMenu = ref<string | null>(null)
  
  /**
   * Register a sub-menu with the manager
   * @param {string} id - Unique identifier for the sub-menu
   */
  const registerSubMenu = (id: string) => {
    subMenus.value.add(id)
  }
  
  /**
   * Unregister a sub-menu from the manager
   * Also closes the sub-menu if it's currently active
   * @param {string} id - Unique identifier for the sub-menu
   */
  const unregisterSubMenu = (id: string) => {
    subMenus.value.delete(id)
    if (activeSubMenu.value === id) {
      activeSubMenu.value = null
    }
  }
  
  /**
   * Open a specific sub-menu by ID
   * Automatically closes any other active sub-menu
   * @param {string} id - Unique identifier for the sub-menu to open
   */
  const openSubMenu = (id: string) => {
    // Only open if the sub-menu is registered
    if (subMenus.value.has(id)) {
      activeSubMenu.value = id
    } else if (import.meta.env.DEV) {
      console.warn(`[useSubMenuManager] Attempted to open unregistered sub-menu: ${id}`)
    }
  }
  
  /**
   * Close a specific sub-menu by ID
   * Only closes if it's currently active
   * @param {string} id - Unique identifier for the sub-menu to close
   */
  const closeSubMenu = (id: string) => {
    if (activeSubMenu.value === id) {
      activeSubMenu.value = null
    }
  }
  
  /**
   * Close all sub-menus
   */
  const closeAllSubMenus = () => {
    activeSubMenu.value = null
  }
  
  return {
    activeSubMenu: activeSubMenu as Ref<string | null>,
    registerSubMenu,
    unregisterSubMenu,
    openSubMenu,
    closeSubMenu,
    closeAllSubMenus
  }
}