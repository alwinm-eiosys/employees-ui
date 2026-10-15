import { createRouter, createWebHistory } from 'vue-router';
import { AUTH_TOKEN_STORAGE_KEY } from '../services/api';
import { clearVerifiedSession, verifySession } from './session';
import LoginView from '../views/LoginView.vue';
import DashboardLayout from '../layouts/DashboardLayout.vue';
import DashboardHome from '../views/DashboardHome.vue';
import AdminsView from '../views/AdminsView.vue';
import EmployeesView from '../views/EmployeesView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardHome },
        { path: 'admins', name: 'admins', component: AdminsView },
        { path: 'employees', name: 'employees', component: EmployeesView },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
});

router.beforeEach(async (to) => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  if (requiresAuth) {
    if (!token) return { name: 'login' };
    if (!(await verifySession(token))) {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      clearVerifiedSession();
      return { name: 'login' };
    }
  }

  if (guestOnly && token) {
    if (await verifySession(token)) return { name: 'dashboard' };
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    clearVerifiedSession();
  }
  return true;
});
