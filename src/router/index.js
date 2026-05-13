import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { auth } from 'boot/firebaseInit'
import { onAuthStateChanged } from 'firebase/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

let isAuthenticated = false
let authReadyResolve

const authReady = new Promise((resolve) => {
  authReadyResolve = resolve
})

// Check auth state
onAuthStateChanged(auth, (user) => {
  isAuthenticated = !!user
  if (authReadyResolve) {
    authReadyResolve()
    authReadyResolve = null
  }
})

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Auth guard
  Router.beforeEach(async (to) => {
    await authReady

    if (!isAuthenticated && to.path !== '/login') {
      return '/login'
    }

    if (to.path === '/login' && isAuthenticated) {
      // User is logged in and trying to access login page
      return '/dashboard'
    }

    return true
  })

  return Router
})
