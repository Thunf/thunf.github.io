<template>
  <div class="hello">

    <h1>Hello World!</h1>

    <demo v-if="showDemo"></demo>

    <template v-for="item in list">
      <div>{{item}}: {{getComponentName(item)}}</div>
      <component :is="getComponentName(item)"></component>
    </template>
  </div>
</template>

<script>
import _async from '@c/hello/index.js'

export default {
  name: 'hello',
  components: _async(),
  data () {
    return {
      showDemo: 0,
      list: []
    }
  },
  mounted () {
    setTimeout(() => {
      this.showDemo = 1
      this.list.push('demx')
    }, 3000)
    setTimeout(() => {
      this.list.push('demo')
    }, 4000)
    setTimeout(() => {
      this.list.push('any-no-exist-module')
    }, 5000)
  },
  methods: {
    isComponentExist (name) {
      return this.constructor.component(name)
    },
    getCamelCase (name) {
      return name.replace(/^([a-z])|-([a-z])/g, (str) => {
        return str.toUpperCase().replace('-', '')
      })
    },
    getComponentName (name) {
      return this.isComponentExist(name) ? name : (() => {
        const camel = this.getCamelCase(name)
        return this.isComponentExist(camel) ? camel : 'empty'
      })()
    }
  }
}
</script>

<style>
</style>
