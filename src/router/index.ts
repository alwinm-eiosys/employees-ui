import { createRouter, createWebHistory } from 'vue-router'
import { AUTH_TOKEN_STORAGE_KEY } from '../services/api'
import { clearVerifiedSession, verifySession } from './session'
import LoginView from '../views/LoginView.vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import DashboardHome from '../views/DashboardHome.vue'
import AdminsView from '../views/AdminsView.vue'
import EmployeesView from '../views/EmployeesView.vue'

//createWebHistory() manages web hsitory and also the URL in address-bar
//Children path add behind parent paths
//Post login, path is at '/', but insce next path is empty string, Vue router combines both, thus, silpaying a combined UI of both pages
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true } /*guest-page*/,
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true /*restricted-page*/ },
      children: [
        { path: '', name: 'dashboard', component: DashboardHome }, // combined w/ parent and shown as first page post login
        { path: 'admins', name: 'admins', component: AdminsView },
        { path: 'employees', name: 'employees', component: EmployeesView },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }, //catch-all route (often used for Invalid routes).
  ],
})

// Global Navigation Guard that runs before every single page change in your app.
// async used on parent arrow fn so that, within it, await can be used on fn calls.
router.beforeEach(async (to) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth) // Scans the route hierarchy (including parents and children) to check if any meta flags are turned on. Is this a protceted page?
  const guestOnly = to.matched.some((record) => record.meta.guestOnly) // Is this an open page for logged-out users?

  // If in restricted page
  if (requiresAuth) {
    if (!token) return { name: 'login' } // No token/undefined/null
    if (!(await verifySession(token))) { // token exists & is of correct type
      // Invalid Token
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      clearVerifiedSession()
      return { name: 'login' } // force user back to login
    }
  }

  if (guestOnly) {
    if (token && (await verifySession(token))) {
      return { name: 'dashboard' }
    }
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    clearVerifiedSession()
  }

  return true // Not really needed, just to tell Vue router: "Checks complete! Gate's open, allow navigation to proceed."
})
