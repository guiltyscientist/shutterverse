import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/views/Login.vue";
import Register from "@/components/views/Register.vue";
import Home from "@/components/views/Home.vue";
import Admin from "@/components/dashboards/Admin.vue";
import NewsManagement from "@/components/managements/NewsManagement.vue";
import StudioManagement from "@/components/managements/StudioManagement.vue";
import TeamManagement from "@/components/managements/TeamManagement.vue";
import UserManagement from "@/components/managements/UserManagement.vue";
import User from "/src/components/dashboards/User.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/news',
    name: 'NewsManagement',
    component: NewsManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/studios',
    name: 'StudioManagement',
    component: StudioManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/teams',
    name: 'TeamManagement',
    component: TeamManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))

  if (to.meta.requiresAuth) {
    if (!user) {
      next('/login')
    } else if (to.meta.requiresAdmin && user.role !== 'admin') {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
});

export default router;
