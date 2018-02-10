import Vue from 'vue'
import HelloWorld from '@/pages/hello'

describe('hello.vue', () => {
  it('should render correct contents', () => {
    const Constructor = Vue.extend(HelloWorld)
    const vm = new Constructor().$mount()
    expect(vm.$el.querySelector('.hello h1').textContent)
    .toEqual('Hello World!')
  })
})
