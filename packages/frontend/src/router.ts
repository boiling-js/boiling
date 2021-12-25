import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/', redirect: '/home'
  }, {
    path: '/home',
    name: 'home',
    component: () => import('./views/Home.vue')
  }, {
    path: '/:pathMatch(.*)*',
    component: () => import('element-plus').then(({ ElEmpty }) => ElEmpty),
    props: { description: '访问到了不存在的页面' }
  }]
})

export default router
