import { createRouter, createWebHistory } from 'vue-router';
import Journals from '../views/Journals.vue';
import Reports from '../views/Reports.vue';
import Links from '../views/Links.vue';
import Playground from '../views/Playground.vue';

const routes = [
  {
    path: '/',
    redirect: '/journals',
  },
  {
    path: '/journals',
    name: 'Journals',
    component: Journals,
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
  },
  {
    path: '/links',
    name: 'Links',
    component: Links,
  },
  {
    path: '/playground',
    name: 'Playground',
    component: Playground,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
