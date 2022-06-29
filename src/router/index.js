import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/Login'
import Home from '@/views/Home'
import Users from '@/views/Users'
import Roles from '@/views/Roles'
import Rights from '@/views/Rights'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { needAuth: false } },
  {
    path: '/home',
    component: Home,
    meta: { needAuth: true },
    children: [
      { path: '/users', component: Users, meta: { needAuth: true } },
      { path: '/roles', component: Roles, meta: { needAuth: true } },
      { path: '/rights', component: Rights, meta: { needAuth: true } }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.needAuth) {
    if (sessionStorage.getItem('token')) return next()
    return next('/login')
  }
  next()
})

export default router
