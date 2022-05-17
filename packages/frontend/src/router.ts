import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [{
    path: '/', redirect: '/home'
  }, {
    path: '/home',
    name: 'home',
    redirect: '/home/friends',
    component: () => import('./views/home/Index.vue'),
    children: [{
      path: '/home/friends',
      component: () => import('./views/home/Friends.vue')
    },{
      path: '/home/channels',
      component: () => import('./views/home/Channels.vue')
    },{
      path: '/home/groups',
      component: () => import('./views/home/Groups.vue')
    }, {
      path: '/home/chat-rooms/:id',
      component: () => import('./views/ChatRoom.vue'),
      props: route => ({
        id: route.params.id,
        title: route.query.title
      })
    }]
  }, {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue')
  }, {
    path: '/register',
    name: 'register',
    component: () => import('./views/Register.vue')
  }, {
    path: '/theme',
    component: () => import('./views/Theme.vue')
  }, {
    path: '/:pathMatch(.*)*',
    component: () => import('element-plus').then(({ ElEmpty }) => ElEmpty),
    props: { description: '访问到了不存在的页面' }
  }, {
    path: '/edit-personnel',
    component: () => import('./components/EditPersonnel.vue')
  }, {
    path: '/create-channel',
    component: () => import('./components/CreateChannel.vue')
  }]
})

export default router
