import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'coming',
    component: () => import(/* webpackChunkName: "coming" */ '@/pages/coming')
  }, {
    path: '/hello',
    name: 'hello',
    component: () => import(/* webpackChunkName: "hello" */ '@/pages/hello')
  }, {
    path: '*',
    redirect: '/'
  }]
})
