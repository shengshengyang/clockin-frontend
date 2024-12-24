import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/PageEntries.vue') },
      { path: 'edit-member', component: () => import('pages/PageEditMember.vue'),meta: { requiresAuth: true }  },
      { path: 'map', component: () => import('pages/PageMap.vue'),meta: { requiresAuth: true } },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
