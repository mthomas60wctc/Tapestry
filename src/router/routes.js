const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/login' },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { viewTitle: 'Dashboard / Library' },
      },
      {
        path: 'workspace',
        component: () => import('pages/WorkspacePage.vue'),
        meta: { viewTitle: 'Book Workspace' },
      },
      {
        path: 'timeline',
        component: () => import('pages/TimelinePage.vue'),
        meta: { viewTitle: 'Timeline' },
      },
      {
        path: 'genealogy',
        component: () => import('pages/GenealogyPage.vue'),
        meta: { viewTitle: 'Genealogy Visualization' },
      },
      {
        path: 'share',
        component: () => import('pages/SharePage.vue'),
        meta: { viewTitle: 'Share & Permissions' },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
