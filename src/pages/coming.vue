<template>
  <div id="threejs-dots" class="coming">
    <div class="fixed-wrap">
      <h1 class="h1">Coming Soon</h1>
      <a class="blog" href="https://blog.thunf.cn">→ Blog</a>
    </div>
  </div>
</template>

<script>
import '@c/coming/Projector.js'
import '@c/coming/CanvasRenderer.js'
import CreateParticle from '@c/coming/particle.js'

export default {
  name: 'coming',
  data () {
    return {
    }
  },
  mounted () {
    typeof CreateParticle === 'function' && CreateParticle('threejs-dots')
  }
}
</script>

<style lang="less">
.coming {
  position: relative;
  width:100%;
  height:100%;
  overflow: hidden; 
  -webkit-touch-callout: none;
  -webkit-text-size-adjust:none;
  user-select: none;

  .fixed-wrap{
    position: fixed;
    top: 50%;
    width: 100%;
    color: #fff;
    margin: auto;
    text-align: center;
    transform: translateY(-50%);
  }
  .h1{
    height: 1em;
    margin: 0 0 10px;
    font: 100 8vw/1 PingFangSC-Light;
  }
  .blog{
    display: block;
    text-decoration: none;
    font-size: 4vw;
    color: #fff;
  }
}
#canvas{
  display: block;
  width:100%;
  height:100%;
  background: #000;
  pointer-events:none;
}
</style>
