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
    path: '/channel/:id',
    component: () => import('./views/Channel.vue'),
    props: route => ({
      id: route.params.id,
      title: route.query.title
    })
  }, {
    path: '/edit-personnel',
    component: () => import('./views/EditPersonnel.vue')
  }, {
    path: '/create-channel',
    component: () => import('./views/CreateChannel.vue'),
    props: route => ({
      type: route.query.type,
      info: route.query.info
    })
  },{
    path: '/create-chatRoom',
    component: () => import('./views/CreateChatRoom.vue'),
    props: route => ({
      type: route.query.type,
      info: route.query.info,
      channelId: route.query.channelId,
      subTitle: route.query.subTitle
    })
  }, {
    path: '/:pathMatch(.*)*',
    component: () => import('element-plus').then(({ ElEmpty }) => ElEmpty),
    props: { description: '访问到了不存在的页面' }
  }]
})

export default router
