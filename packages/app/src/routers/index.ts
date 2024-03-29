import { createRouter, createWebHistory } from 'vue-router'
import { jsonData } from '../mocks/mockDoc'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    name: 'landing',
    path: '/landing',
    component: () => import('../pages/landing/index.vue'),
  },
  {
    name: 'playground',
    path: '/',
    component: () => import('../pages/playground/playground.vue'),
    props: {
      mockData: jsonData,
    },
  },
]

export const mainRouter = createRouter({
  history: createWebHistory(),
  routes,
})
