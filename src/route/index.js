import { createRouter, createWebHistory } from "vue-router";
import Login from "/src/components/views/Login.vue";
import Register from "/src/components/views/Register.vue";
import Home from "/src/components/views/Home.vue";
import Admin from "/src/components/dashboards/Admin.vue"
import User from "/src/components/dashboards/User.vue"

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
      next('/') // Redirect to home if not admin
    } else {
      next()
    }
  } else {
    next()
  }
});

export default router;
