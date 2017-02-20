---
title: 前后端分离之路 - Vue2项目多入口模板改造方案
toc: true
date: 2017-02-17 21:59:07
tags:
  - koa-grace
  - vue
  - boilerplate
categories:
thumbnail: http://7xrhcw.com1.z0.glb.clouddn.com/blog_vue-grace.jpg
photo:
---

做前后端分离也有一段时间了，业务一直在用Vue@1.x的多入口方案，也一直懒癌发作没搞2.x的版本。适逢最近在等某宝小程序的构建，由于迟迟不定技术方案，只好暂缓先捯饬一下Vue@2.x项目多入口的构建方案。

<!-- more -->


<style>
  .fix-li-img + p + ul img,
  .fix-li-img + p + blockquote img{
    display: inline-block;
    vertical-align: sub;
  }
</style>

此处强插一条硬广，推销一下自家的前后端分离框架：
<div class="fix-li-img"></div>
> ![][url_koa2-svg] **[Koa-grace@2.0][url_grace]** --- 全新的基于Koa@v2.x的MVC+RESTful架构的前后端分离框架




## 关于项目模板

项目模板没有选择重新开发，而是直接选用了vue官方模板[vuejs-templates/webpack][url_vue-webpack]。熟悉的开发者应该都了解，这是一个SPA模板，只有一个入口，而现在我们需要把它改成多入口，并且修改添加一些开发功能，以配合Koa-grace时的开发流程。

可用的改造方案已经发布，有兴趣的同学可以**先体验基于Koa-grace的多入口项目方案**：
<div class="fix-li-img"></div>
> ![][url_vue2-svg] **[Grace-vue-webpack-boilerplate][url_grace-vue-webpack] --- **基于Koa-grace的多入口Vue@2.x项目构建方案 🚀

关于官方模板，就不再分享学习的过程，下面仅讨论改造过程中**遇到的问题**和**实施方案的理由**。




## 关于目录结构

由于模板是为了基于Koa-grace的项目而设计，所以在目录结构上需保持基本的[Koa-grace项目结构][url_grace-structure]。
以下列举了项目中关键文件夹及文件的结构关系，仅供参考。

```bash
.
├── package.json        // 项目依赖
├── node_modules
│
├── mock                // mock数据文件
├── controller          // node层路由目录
│   ├── defaultCtrl.js
│   └── home.js
│
├── views               // 静态模板源码目录
├── static              // 静态资源源码目录
│   ├── image
│   ├── fonts
│   ├── css
│   └── js
│
├── build               // 编译脚本目录，本次重点改造
│   └── config          // 项目配置，供编译过程
└── vues                // 源码目录，下属文件夹将视作独立的页面入口，‘_’开头的文件夹将被忽略
    ├── _components     // 组件库，‘_’开头时将不会被作为入口
    ├── demo            // /demo页入口
    └── home            // /home页入口
        ├── index.js
        ├── index.vue
        └── router.js
```




## 关于多入口（Multiple Entry）

调整完文件结构，下面要解决的事情就是，在原有模板的基础上改造多入口方案。
其实这一步很简单，只需拓展webpack配置文件中entry的获取方式即可：

```js
// build/webpack.base.conf.js
/**
 * [entries 入口合成器]
 * @param  {object} opt 指定的入口，优先级高于自动抓取入口
 * @return {object}     返回合成的入口对象
 */
function entries (opt) {
  var ens = exec('cd ./vues && ls').split('\n').map(function(item) {
    var obj = {}
    // 将忽略所有以下划线“_”开头的文件夹
    if (!/^_[\w-]+$/.test(item)) {
      obj[item] = './vues/'+item+'/'
    }
    return obj
  })
  return Object.assign.apply(null, [].concat(ens, opt))
}

module.exports = {
  entry: entries({
    // 此处可以手动指定其他需打包的页面/文件入口
    common: [
      './static/css/common/reset.less',
      './static/css/common/index.less',
      './static/js/common/hello.js',
    ]
  }),
  ...
}
```

以上代码效果相当于：
```js
module.exports = {
  entry: {
    home: './vues/home/index.js',
    demo: './vues/demo/index.js',
    common: [
      './static/css/common/reset.less',
      './static/css/common/index.less',
      './static/js/common/hello.js',
    ]
  },
  ...
}
```
对于多入口项目，**避免了手工更新入口的麻烦，在源码目录中创建入口文件夹并添加源码文件**即可。
以上就完成了入口的改造，但这样还无法将文件按需要的目录结构产出，所以还需要调整产出配置。


## 关于文件产出（Files Output）

### 产出规则及需求

按照项目结构，整理文件产出的需求：

- js
  - 文件：编译后文件名应为build.js
  - 路径：需输出到static/js下，并存放于入口名称的文件夹内，如：static/js/home/build.js
- css
  - 文件：规则同上，如：build.css
  - 路径：规则同上，如：static/css/home/build.css
- html
  - 文件：产出文件名应为inde.html
  - 路径：需输出到views/下，如：views/home/index.html

**改造时直接进行了webpack.prod.conf的全功能配置**，webpack.dev.conf进行简化即可（开发阶段无需分离css、压缩代码、生成map、抽取公共依赖等步骤）。

通过查看原项目模板的编译流程可以了解：
- js：作为entry配置，output直接影响输出路径及文件名
- css：entry中配置的部分同上，由vue文件中抽离的部分则需要插件[ExtractTextPlugin][url_wp-extract]抽离
- html：需要插件[HtmlWebpackPlugin][url_wp-html]配合入口进行产出，可以使用ejs模板


### 产出html入口文件

首先，在webpack文档中可以了解到chunk的概念，它和entry是一一对应的，在多入口项目中尤为重要。

> Passing an array of file paths to the entry property creates what is known as a "multi-main entry". This is useful when you would like to **inject multiple dependent files together** and graph their dependencies **into one "chunk"**.     --- [webpack.js.org/entry-points][url_wp-entry]

其次，需要先产出可用的HTML文件，才能调试其他静态资源的加载。由于多入口化，HTML在产出时需要按chunk进行输出，才能保证对应入口的编译文件引用到对应的HTML中。因此需要按entry初始化对应的HtmlWebpackPlugin：

```js
  // build/webpack.prod.conf.js
  var webpackConfig = merge(utils.setEntrys(baseWebpackConfig), {
    ...
  }
  //
  // build/util.js
  function setEntrys (conf) {
    ...
    var htmlConfig = {
      // 压缩HTML选项，dev时不压缩
      minify: {
        removeComments: isNotDev,
        collapseWhitespace: isNotDev,
        removeAttributeQuotes: isNotDev
      }
    }
    var entries = Object.keys(conf.entry)
    entries.map(function(ent) {
      ...
      // 根据entry添加新插件到plugins中
      conf.plugins.push(new HtmlWebpackPlugin(Object.assign({
        // HTML输出地址，形如：/Users/thunf/fe/server/app/demo/views/home/index.html
        filename: `${path.resolve(config.base.outputRoot, 'views')}/${ent}/index.html`,
        // 允许引用的chunk，包含本身及公共部分
        chunks: [ent, 'vendor', 'manifest', 'common'],
        // 模板路径，形如：/Users/thunf/fe/server/app/demo/views/_common/_template.ejs
        template: path.resolve(projectRoot, 'views/_common/_template.ejs'),
        // 自动插入静态资源，由于结合使用了Koa-grace在Node预渲染HTML的功能，所以关闭该功能
        inject: false,
        // Chunks排序规则
        chunksSortMode: 'dependency'
      }, htmlConfig)))
    });
    return conf;
  }
```

现在，我们可以通过Koa-grace提供的服务来打开对应的页面了，但是页面中的静态资源链接还存在问题。



### 产出js/css静态资源

此时需要配置输出的参数`output`，参考webpack文档（[webpack.js.org/output][url_wp-output-en] | [webpack-china.org/output][url_wp-output-zh]），可以查看output的说明和配置，其中本次需要使用的参数及有效说明如下：

> [output.filename][url_wp-filename]: This option **determines the name** of each output bundle.
[output.path][url_wp-path]: The output directory as an **absolute** path.
[output.publicPath][url_wp-public]: This option specifies the **public URL** of the output directory when referenced in a browser.

简单来说，就是：
- output.filename：决定产出文件的名称和后缀
- output.path：影响文件输出的绝对位置（本机输出文件夹的绝对路径）
- output.publicPath：决定资源在浏览器中加载的路径（比如添加CDN、指定公开URL）

假设我们需要在home页产出的html中生成`/demo/static/js/home/build.js?v=12345`的资源链接，对应以上规则有：
- output.filename：**`static/js/home/build.js?v=12345`**
- output.path：`/Users/thunf/fe/server/app/demo`
  - 此路径为本地产出目录**绝对地址**，只影响本地产出目录，不影响html中输出的链接
- output.publicPath：**`/demo/`**
  - 在html输出时，会直接**添加到filename前**，生成完整链接
  - **将影响其他所有在html中引用的资源链接**

于是output应按以上规则配置，实际代码中**复用了路径配置及拼合路径的方法**，此处就不再进行代码分析。感兴趣的同学可以依次查看如下文件：[webpack.prod.conf.js#output][url_wp-prod]、[utils.js#assetsPath][url_wp-utils]、[config/index.js#buildConf][url_wp-config]



### 文件加戳：Query or fileName

关于文件加戳的问题，为什么我们选择了`build.js?v=12345`，而不是`build.12345.js`，是出于以下考虑的：
1、每次改动build都会产出新文件，长久以往会导致线上代码版本过多
2、上线仓储将越来越大，并且不易清理

但实际应用上，Query戳对比fileName戳也有问题存在，比如
1、无法有效利用CDN组合加速文件
2、无法存在多版本

但目前阶段根据业务需求，暂时足够使用，若有需要更改加戳方式的需求，只需在上述`output.filename`处将文件命名方式进行调整即可，此处不再累述。


### 其他资源路径问题

项目模板中目前还有图片资源及字体资源未提及，该两种资源在原模板中已存在loader及引用方式，下面描述碰到的问题及解决方法：

#### 生成图片引用路径

由于在处理图片资源时，并没有很好的理解`output.publicPath`的作用，没有使用形如`/demo/`的**相对于服务模式(server-relative)**，导致始终无法产出期望的文件路径。后来在webpack文档中找到具体的说明，才完成配置。

> The value of the option is prefixed to every URL created by the runtime or loaders. Because of this **the value of this option ends with /** in most cases. --- [output.publicPath][url_wp-public]

#### 图片资源引用方式

正常情况下，在.vue文件中可以使用相对路径来引用图片资源，但通过**配置别名**及`~alias`的引用方式将**更简洁**：

```html
<!-- Same effect, but alias write less -->
<img class="logo" src="../../static/image/logo-grace.png">
<img class="logo" src="~image/logo.png">
```

配置别名alias如下：

```js
// build/webpack.base.conf.js
module.exports = {
  ...
  resolve: {
    ...
    alias: {
      'static': resolve('static'),
      'image': resolve('static/image'),
      'components': resolve('vues/_components')
    }
  },
  ...
}
```
.vue文件中其他静态资源引用同理

```html
<!-- JS/Component -->
<script>
import Grace from 'components/grace.vue'
</script>
...
<!-- CSS/LESS -->
<style lang="less">
@import '~static/fonts/iconfont.less';
</style>
```


## 关于提升开发效率

考虑实际开发中，有需要进行诸如本地配置、打开浏览器、创建新文件等重复性操作的场景。
为了进一步~~懒癌发作~~**提升开发效率**，特别增加了一些增强功能，目前刚开始进行，欢迎抛出宝贵的建议。

### 自动配置开发环境

由于Koa-grace作为前后端分离框架，允许**同时解析多域名请求到多项目**，故以往在切换项目开发时，需要手动更改server.json配置及重启服务（官方吐槽：好烦啊喂）。那么既然项目启动需要单独`npm run dev`一次，为何不考虑将项目配置（开发环境）交由项目本身进行呢？

```js
// build/check-server.js
// 匹配grace下配置目录
function matchServerJson(graceRoot) {
  return glob.sync(path.join(graceRoot, '*/config/main.development.js')) || []
}
...
// 匹配grace目录
function findServerFolder(graceRoot, scb, ecb) {
  var confMatch = matchServerJson(graceRoot)
  ;(1 === confMatch.length) ? callback(scb)({
    serverRoot: path.resolve(confMatch[0], '../..'),
    serverConf: confMatch[0]
  }) : callback(ecb)(confMatch.length)
}
```

于是本着尽可能~~懒癌发作~~**让系统自己找**的思想，通过引入glob进行关键文件的路径匹配，来验证当前项目是否符合Koa-grace目录规范，顺便解析出当前Koa-grace启动的文件夹（default: server）名称，并添加到config。

有了server的路径，就可以按路径读取配置文件信息了，顺便也可以验证并添加本项目的配置：

```js
// build/open-browser.js
function lookForHost(hosts, autoOpenBrowser) {
  return Object.keys(hosts).filter(function(key, value) {
    // if vhost-matched, use the match one
    return hosts[key] === config.base.moduleName
  })[0] || (autoOpenBrowser && writeHostConf({
    // if auto-open & no-vhost-matched, auto set
    "127.0.0.1": config.base.moduleName
  }) || [
    // if no-auto-open & no-vhost-matched, to tip
    '> Maybe you have not set vhost to this app: ' + chalk.cyan(config.base.moduleName),
    '> Please set ' + chalk.magenta('vhost') + ' in ' + chalk.magenta('/server/config/server.json') + ' like this:',
    '  ' + chalk.green( JSON.stringify({
      merge: {vhost: {"127.0.0.1": config.base.moduleName } }
    }, null, 2).replace(/\n/g, '\n    ') ), '', ''
  ])
}
```

此处代码实现风格比较诡异，其实做了3种情况的判断：

- 如果匹配到本项目的vhost配置，那就使用该host
- 如果未匹配到，且允许自动打开浏览器，就**写入默认配置`{127.0.0.1: moduleName}`**
- 如果未匹配到，且不允许自动打开浏览器，就发起提示


### 自动打开项目首页

其实这个功能在原项目模板中已经存在，只不过原项目自带server并且只有一个入口，启动时只需打开固定的首页即可。
当变成多入口项目后，就需要面临新的问题：

- Koa-grace启动的host及端口不确定
- 首页路径不确定

第一个问题，通过上述方案已经可以解决。
第二个问题，暂时需在config配置`autoOpenPage`，需在配置文件中添加如下配置，特此说明。

```js
// build/config/index.js
devConf = {
  ...
  autoOpenBrowser: true, // 是否自动打开浏览器
  autoOpenDelay: 2000,   // 延迟多少ms打开浏览器，koa-grace服务检测到路由文件变化会自动重启
  autoOpenPage: 'home',  // 自动打开时的项目入口（路由）
  ...
};

```


## 关于ESLint

### 检查你的代码

> Code [linting][url_linting] is a type of static analysis.
> ESLint is designed to have all rules completely pluggable. --- [eslint.org][url_eslint.org]

很早之前就了解过这个玩意了，曾经组里也有几次技术调研涉及这个，一直没正式投入使用过，也就自己搞一搞。

其实开始使用时也是挺蛋疼的（模板自带配置使用标准：[feross/standard][url_standard]，感觉要求超级严格，比如“`{`”后换行并留一行空格都要error），但耐心看一下提示，就能知道格式哪里不标准，然后逐步就习惯了（避免写的时候太飘逸）。

> This module helps hold our code to a high standard of quality.
This module ensures that new contributors follow some basic style standards. --- [feross/standard][url_standardjs]

这里吐个槽，**如果团队协作开发一个仓储，图快而不加以规范，简直就是给维护者挖坑**（版本越老坑越大，自己深有体会，靠嘴遁要求统一风格，真心没用，什么诡异的代码风格都有）。


### 翻一翻文档

某：eslint限制太严格
我：嗯，确实严格，习惯就好
某：能不能改成只有提示，但是不影响编译流程的
我：看看文档

- eslint-loader: [github.com/MoOx/eslint-loader](https://github.com/MoOx/eslint-loader)
- eslint: 
    - en: [eslint.org/docs][url_eslint-en]
    - zh: [eslint.cn/docs][url_eslint-zh]

研究了一下俩文档，理论上可以有2个方案实现**只提示而不影响编译流程**，但是似乎又各自有问题，以下是这两种方案。

#### 配置extends/rules

在ESlint的官方文档里可以了解到 [configuring#extending-configuration-files][url_eslint-extend-rule]：

> 
- **extends**:
  - a string that specifies a configuration
  - an array of strings: each additional configuration extends the preceding configurations
- **rules**: which rules are enabled and at what error level
  - enable additional rules
  - change an inherited rule’s severity without changing its options
  - override options for rules from base configurations

接下来通过查看 feross/standard 的配置文件 [eslint-config-standard/eslintrc.json][url_standard.eslintrc] 可以得知，这个标准一言不合就error，而且**全部都是error**（没办法，就是这么任性）。不过 feross/standard 的作者也这么表态了：

> The word "standard" has more meanings than just "web standard" :-)
--- [FAQ: But this isn't a real web standard!][url_standardjs]


那么方案也就显而易见：
  - 找一份完全符合心意的标准（看起来比较难）
  - 写个插件，然后**自己定义规则**（[eslint.org/docs/rules][url_eslint.org-rules] | [eslint.cn/docs/rules][url_eslint.cn-rules]），添加到extends
    - 比如强制缩进就给error，不关心是否空行就给warning，随心所欲so easy
  - 在.eslintrc中，通过**添加rules属性，强行覆盖**现有extends提供的rules

优缺点也一目了然：
  - 优：配置化并完全可以自定义，完全可拔插，可持续维护；
  - 缺：想找到一个完全符合心意的标准几乎不可能（若自己写规则，一般人怕是没这心情，虽然规则不是很多，哈）


#### 配置failOnWarning

当然先讲一句，我其实**不推荐**这种配置，原因在后面说。

首先在eslint-loader文档里，找到这么一句话：

> So even ESLint warnings will fail the build. --- [eslint-loader#noerrorsplugin][url_eslint-loader]

即使是warning也会阻断build过程。但有趣的是，option配置可以改变提示行为，默认值都是false：

>**emitError**: Loader will always return errors if this option is set to true.
**emitWarning**: Loader will always return warnings if option is set to true.
**failOnWarning**: Loader will cause the module build to fail if there are any eslint warnings.
**failOnError**: Loader will cause the module build to fail if there are any eslint errors.

以我的理解，eslint-loader应该是在preLoad阶段，以报错的形式影响webpack编译进程，并显示提示信息。
所以在[eslint-loader的源码][url_eslint-loader.src]里，找到了这么个地方：

```js
  // default behavior: emit error only if we have errors
  var emitter = res.errorCount ? webpack.emitError : webpack.emitWarning

  // force emitError or emitWarning if user want this
  if (config.emitError) {
    emitter = webpack.emitError
  }
  else if (config.emitWarning) {
    emitter = webpack.emitWarning
  }

  if (emitter) {
    emitter(messages)
    if (config.failOnError && res.errorCount) {
      throw new Error("Module failed because of a eslint error.\n"
        + messages)
    }
    else if (config.failOnWarning && res.warningCount) {
      throw new Error("Module failed because of a eslint warning.\n"
        + messages)
    }
  }
```

这段代码表明，正常流程上的warning和error是调用webpack自带的方法来emit的，只不过我们可以通过配置：
1.emitError/emitWarning：取消default behavior，使emitter强制变成error/warning类型
2.failOnWarning/failOnError：抛出一个Error来打断webpack的build过程

那么问题来了，默认的配置`{emitError: false, failOnError: false}`，只是由webpack进行了一次emitError，并没有实际抛出一个Error，那实际上应该**不会 cause the module build to fail**才对？但实际开发时，比如为什么“`{`”后换行并留一行空格，不只触发了规则[no-trailing-spaces][url_eslint-rule.spaces]的error，还导致webpack没有实际build出新文件呢？

那么基本上可以断定这和webpack.emitError有关系了，来看一下webpack的源码：

```js
// webpack/lib/NormalModule.js
  ...
    emitWarning: function(warning) {
      module.warnings.push(new ModuleWarning(module, warning));
    },
    emitError: function(error) {
      module.errors.push(new ModuleError(module, error));
    },
  ...
```

这里API功能是收集error和warning，那么理论上还有地方，会根据error和warning数量决定是否可以继续编译。
中间调试的过程就不累述，最终在webpack的Compiler.js中先找到了判定emit并return的地方：

```js
// webpack/lib/Compiler.js
  ...
  if(self.compiler.applyPluginsBailResult("should-emit", compilation) === false) {
    return self._done(null, compilation);
  }
  ...
```

经过寻找`should-emit`在哪里触发，然后找到在NoEmitOnErrorsPlugin中，处理errors数量的逻辑：

```js
// webpack/lib/NoEmitOnErrorsPlugin.js
  ...
  compiler.plugin("should-emit", (compilation) => {
    if(compilation.errors.length > 0)
      return false;
  });
  ...
```

此处可以看出，若errors中存在error，NoEmitOnErrorsPlugin会返回false，而对warning没有处理。这一行为会导致Compiler.js中的compile流程被中断，当然就不会有文件产出啦。

那么为了验证这个逻辑，将NoEmitOnErrorsPlugin从项目build/webpack.dev.conf.js中注释掉之后，带着已知的格式问题（如多个空行，不影响实际编译），仍然可以编译出新文件，有兴趣的小伙伴可以自行尝试。当然这个插件在dev环境开发时还会影响其他loader的表现，不建议砍掉它。

那么回到我们的问题上来，通过强制eslint触发emitWarning而不是emitError，即在eslint的option中配置`{emitWarning: true}`，**格式检测规则（编译无关的规则）**就不会终止webpack编译产出文件了：

```js
  ...
  {
    test: /\.(js|vue)$/,
    loader: 'eslint-loader',
    ...
    options: {
      ...
      /* ======= begin ====== */ 
      emitWarning: true
      /* =======  end  ====== */ 
    }
  },
  ...
```

当然如果是会引起编译的错误，在接下来的编译中该断还是得断，还有可能产生多次log（毕竟没有被eslint在preLoad过程中拦下来，eslint提示完，后面的loader还会继续提示，比如重复显示error，调试过程简直最强大脑有木有）

所以尽管可以实现**只提示而不影响编译流程**的目标，但又带来了新问题，虽然简单快捷但并不优雅，也没有让eslint发挥出什么作用（对非强迫症患者，仅提示还是拦不住的各种诡异风格的）。
**这就是不推荐的理由。**总之blabla这么多，就是想说下面这句话。


### 不想用就别硬用

实在不能接受，那就干掉吧，推荐下面的方式。

- 1、[Fork It And Make Your Own][url_fork]
- 2、Comment out or delete the codes below (the part between comments):
```js
  // build/webpack.base.conf.js
  ...
  module: {
    rules: [
      /* ==================== eslint =================== */ 
      /* If eslint makes you mad, just delete these code */
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: "pre",
        include: [resolve('vues'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      /* ================== eslint end ================= */
      ...
    ]
    ...
  }
  ...
```
- 3、Enjoy your code : )

## 其他问题

### 报错信息不显示

有小伙伴反应这一现象，如下图所示。其实这跟个人使用的terminal配色方案有关（webpack显示错误代码的颜色，正好跟terminal的背景色相同，就看不到了嘛），[查看解决方案](#avoidTerminalColorGray)。

![problem: terminal-color-gray][image_eslint-terminal-color]

经过调试，发现这种提示是由[eslint-friendly-formatter][url_eslint-formatter]打印出来的，根据源码显示：

```js
  ...
  var parseBoolEnvVar = function(varName) {
    var env = process.env || { };
    return env[varName] === 'true';
  };
  var subtleLog = function(args) {
    return parseBoolEnvVar('EFF_NO_GRAY') ? args : chalk.gray(args);
  };
  ...
```

#### avoidTerminalColorGray

只需配置`process.env.EFF_NO_GRAY = true`即可阻止使用chalk.gray显示文字。
那么这个配置也将**加入项目的配置文件，如下配置**即可

```js
// build/config/index.js
  ...
  devConf = {
    ...
    avoidTerminalColorGray: true
  };
  ...
```

## NEXT

### 抽取代码（TODO）

有时间将抽离**提升开发效率**部分的逻辑为插件，以帮助更多其他技术栈的Koa-grace项目更好的提升开发体验。

### 自动创建新入口（TODO）

已经有同学提出需要自动创建新入口的脚本及命令，这个近期也会提供（每次添加新入口要创建好几个文件夹及文件也是麻烦）

### 热加载（TODO）

该功能在原模板中存在，但升级多入口后，server将由Koa-grace接管，目前已移除该部分代码，下一步考虑添加Koa-grace的中间件，来配合完成vue项目的热加载方案

### 需要建议or意见

欢迎试用 & Stars

<style>
  .fix-li-img + p + ul img{
    display: inline-block;
    vertical-align: sub;
  }
</style>

<div class="fix-li-img"></div>
- ![][url_koa2-svg] **全新的基于Koa@v2.x的MVC+RESTful架构的前后端分离框架 [Koa-grace@2.0][url_grace]**
- ![][url_vue2-svg] **基于Koa-grace的多入口Vue@2.x项目构建方案 🚀 [Grace-vue-webpack-boilerplate][url_grace-vue-webpack]**

如果你有其他项目需要配置Vue@2.x项目多入口方案，也欢迎加入我们的群交流~

![Koa-grace交流群][image_grace-qq]


[url_koa2-svg]: https://img.shields.io/github/stars/xiongwilee/koa-grace.svg?label=%E2%98%85
[url_vue2-svg]: https://img.shields.io/github/stars/Thunf/grace-vue-webpack-boilerplate.svg?label=%E2%98%85
[url_grace]: https://github.com/xiongwilee/koa-grace
[url_vue-webpack]: https://github.com/vuejs-templates/webpack
[url_grace-vue-webpack]: https://github.com/Thunf/grace-vue-webpack-boilerplate
[url_grace-structure]: https://github.com/xiongwilee/koa-grace#目录结构-1
[url_wp-entry]: https://webpack.js.org/concepts/entry-points/#single-entry-shorthand-syntax
[url_wp-extract]: https://webpack.js.org/plugins/extract-text-webpack-plugin/
[url_wp-html]: https://webpack.js.org/plugins/html-webpack-plugin/
[url_wp-output-en]: https://webpack.js.org/configuration/output/
[url_wp-output-zh]: https://doc.webpack-china.org/configuration/output/
[url_wp-filename]: https://webpack.js.org/configuration/output/#output-filename
[url_wp-path]: https://webpack.js.org/configuration/output/#output-path
[url_wp-public]: https://webpack.js.org/configuration/output/#output-publicpath
[url_wp-prod]: https://github.com/Thunf/grace-vue-webpack-boilerplate/blob/master/build/webpack.prod.conf.js#L21
[url_wp-utils]: https://github.com/Thunf/grace-vue-webpack-boilerplate/blob/master/build/utils.js#L6
[url_wp-config]: https://github.com/Thunf/grace-vue-webpack-boilerplate/blob/master/build/config/index.js
[url_linting]: https://en.wikipedia.org/wiki/Lint_(software)
[url_eslint.org]: http://eslint.org/docs/about/
[url_standard]: https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
[url_standardjs]: http://standardjs.com/#but-this-isnt-a-real-web-standard
[url_eslint-extend-rule]: http://eslint.org/docs/user-guide/configuring#extending-configuration-files
[url_standard.eslintrc]: https://github.com/feross/eslint-config-standard/blob/master/eslintrc.json
[url_eslint.org-rules]: http://eslint.org/docs/rules/
[url_eslint.cn-rules]: http://eslint.cn/docs/rules/
[url_eslint-loader.src]: https://github.com/MoOx/eslint-loader/blob/master/index.js#L100
[url_eslint-rule.spaces]: http://eslint.org/docs/rules/no-trailing-spaces
[url_eslint-en]: http://eslint.org/docs/user-guide/
[url_eslint-zh]: http://eslint.cn/docs/user-guide/
[url_eslint-loader]: https://github.com/MoOx/eslint-loader#noerrorsplugin
[url_fork]: https://github.com/Thunf/grace-vue-webpack-boilerplate#fork-it-and-make-your-own
[url_eslint-formatter]: https://github.com/royriojas/eslint-friendly-formatter/blob/master/index.js#L35
[image_eslint-terminal-color]: http://7xrhcw.com1.z0.glb.clouddn.com/eslint-terminal.png
[image_grace-qq]: http://7xrhcw.com1.z0.glb.clouddn.com/grace-qq.png


