---
title: 永不消失的遮罩：鲜为人知的 Context 大坑
toc: true
tags:
  - CSS
thumbnail: //img003.qufenqi.com/products/8d/1c/8d1c2c5cc87ef37f2481f3da58a394bf.jpg
date: 2018-03-22 16:30:00
categories:
photo:
---


这是一个令人费解的遮罩问题，经过各种调试与查阅资料后，发现由 z-index 一路牵扯到 Stacking Context，浑水竟然如此之深...

<!-- more -->

<style>
p.pp{margin: 0 0 -1.6em;}
div.sc{width: 300px; height: 220px; color: #fff; box-sizing: border-box; border: #000 solid 2px; padding: 5px 0 0 40px; line-height: 1.15; margin-top: 5px; }
div.sc > div.sc{margin: 0; height: calc(100% - 1em - 5px); margin-top: 5px;}
@media screen and (max-width: 600px) {
  div.sc{width: 200px; padding-left: 20px;}
}
div.zs{float: right;}
p + div.zs{margin-top: -1.6em;}
</style>


## 永不消失的遮罩

众所周知，z-index这货能控制元素的层级，遵循近大远小、后来居上的规则，可以把元素举高高或者打入幕后。
比如在做各种浮层/层叠定位的时候，拿来用一用。

直到最近调试了一个[诡异的弹层页面（示例）][url_demo_overflow]，遮罩死皮赖脸的cover全场 (╯‵□′)╯︵┻━┻
调试过程略过，下面梳理一下涉及的知识点，从`stacking context（层叠上下文）`说起：


## Stacking Context

> The bottom of the stack is the furthest from the user.
The top of the stack is the nearest to the user.
<div class="zs"> ------[w3.org/CSS22#Painting order][url_w3_zindex] </div>
<pre style="font-family: monospace;">
            |      |         |    |
            |           |    |    |    ⇦ ☻
            |           |         |    user
z-index:  canvas  -1    0    1    2
</pre>

在HTML的世界里，除了`x轴`（水平）和`y轴`（竖直）的维度，还有`z轴`（垂直屏幕）的维度；

可以想象在z轴上存在很多个层，那么处于底部的元素距离用户最远，而在顶部的元素则距离用户最近，相对下层的元素，用户会先看到其上部的元素；

在这个维度中，通过对比z-index的值，来决定各个层最终如何展示在用户的视野中。而这种通过z-index对比层级关系并影响子元素渲染顺序的结构，我们称之为层叠上下文（Stacking Context）。


### Z-index

> <p class="pp">For a positioned box, the 'z-index' property specifies:</p>
- The stack level of the box in the current stacking context.
- Whether the box establishes a stacking context.
<div class="zs"> ------ [w3.org/CSS22#z-index][url_w3_zidx]</div>

<p class="pp">从W3的文档里可以了解到，对于定位的盒模型，z-index声明：</p>
- 在当前的层叠上下文中，层叠的水平
- 元素是否创建层叠上下文


那么再来看z-index的值，它存在两种方式：

> <p class="pp">&lt;integer&gt;</p>
- This integer is the stack level of the generated box in the current stacking context. The box also establishes a new stacking context.

> <p class="pp">auto</p>
- The stack level of the generated box in the current stacking context is 0. If the box has 'position: fixed' or if it is the root, it also establishes a new stacking context.
<div class="zs"> ------ [w3.org/CSS22#z-index][url_w3_zidx]</div>

那么便存在`数值`和`auto`两种类型的值，其中`auto`生效时，其在数值上与0相同。
而`数值`则表明了当前元素位于当前层叠上下文中的`stack level`，翻译过来叫`层叠水平`。


### Stack Level

> - Boxes with greater stack levels are always formatted in front of boxes with lower stack levels. 
- Boxes with the same stack level in a stacking context are stacked back-to-front according to document tree order.
<div class="zs"> ------ [w3.org/CSS22#z-index][url_w3_zidx]</div>

<p class="pp">对于不同元素间的描述，这里抽出了两句有用的，总结起来就是：</p>
- 近大远小：元素层叠水平数值大的比小的更靠前（前者覆盖后者：100 > 1 > auto = 0 > -1）
- 后来居上：元素层级一致、层叠水平数值一致时，靠后的元素覆盖前面的元素

那么对于在同一个层叠上下文内的各层，其`back-to-front order`按下面👇的描述进行展示：

> <p class="pp">Within each stacking context, the following layers are painted in back-to-front order:</p>
- the background and borders of the element forming the stacking context.
- the child stacking contexts with negative stack levels (most negative first).
- the in-flow, non-inline-level, non-positioned descendants.
- the non-positioned floats.
- the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
- the child stacking contexts with stack level 0 and the positioned descendants with stack level 0.
- the child stacking contexts with positive stack levels (least positive first).
<div class="zs"> ------ [w3.org/CSS22#z-index][url_w3_zidx]</div>

看完上代码实测一下，用图形示意就是：

<div class="sc" style="position: relative; z-index: 1; background: red;">background/borders
  <div class="sc" style="position: relative; z-index: -1; background: orange;">z-index < 0
    <div class="sc" style="background: yellow; color: #666;">block
      <div class="sc" style="float: left; background: lightgreen; color: #666;">floats
        <div class="sc" style="display: inline-block; background: lightskyblue;">inline
          <div class="sc" style="position: relative; z-index: 0; background: cyan; color: #666;">z-index: 0 === auto
            <div class="sc" style="position: relative; z-index: 1; background: mediumpurple;">z-index > 0
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
<div style="text-align: center;">Back-to-front order</div>
<div></div>


### Features

> - Stacking contexts can contain further stacking contexts.
- A stacking context is atomic from the point of view of its parent stacking context;
- boxes in other stacking contexts may not come between any of its boxes.
- Each box belongs to one stacking context.
- Each positioned box in a given stacking context has an integer stack level, which is its position on the z-axis relative other stack levels within the same stacking context. 
<div class="zs"> ------[w3.org/CSS22#Painting order][url_w3_zindex] </div>

对于层叠上下文，特性总结起来就是：
- 可以嵌套
- 其层叠特性并不对内部元素产生影响
- 每个层叠上下文相对于其他元素是完全独立的
- 每个元素都将处于一个层叠上下文中
- 子元素以其父元素（parent stacking context）为z-index相对基准点，拥有相对于同一层叠上下文内的层叠水平数值


### Establishes A Stacking Context

> - The root element forms the root stacking context. 
- Other stacking contexts are generated by any positioned element (including relatively positioned elements) having a computed value of 'z-index' other than 'auto'. 
<div class="zs"> ------ [w3.org/CSS22#z-index][url_w3_zidx]</div>

<p class="pp">起初，层叠上下文以两种形式存在：</p>
- 根元素`<html>`会形成顶级的层叠上下文
- 给一个`已定位元素(positioned element)`指定一个具体的值（auto除外）

> Stacking contexts are not necessarily related to containing blocks. 
In future levels of CSS, other properties may introduce stacking contexts.
<div class="zs"> ------ [w3.org/CSS22#z-index][url_w3_zidx]</div>

而现在由于CSS3的出现，又多了一些由CSS属性直接导致的层叠上下文生成的方式：

- opacity ≠ 1
- filter ≠ none
- isolation = isolate
- transform ≠ none
- mix-blend-mode ≠ normal
- position = fixed（mobile webkit & chrome 22+）
- z-index ≠ auto的flex项(父元素display:flex|inline-flex)
- will-change = 上面任意属性名
- ** -webkit-overflow-scrolling = touch & overflow ≠ (visible/hidden/unset) **

这些规则会导致非常诡异的问题，比如本文遇到的那个坑，查看这个[诡异的弹层页面（示例）][url_demo_overflow]



## Analyze & Solve Problem

通过学习并理解以上的知识点，现在来解释一下诡异的问题到底是怎么出现的！
`实际上debug的步骤，则是刚好相反的，先试验分析再找理论支持，并解释问题出现的原因`


### 问题描述

```HTML
<div id="app">
  <div id="dialog" style="position: fixed; z-index: 101;">dialog</div>
</div>
<div id="mask" style="position: fixed; z-index: 100;">mask</div>
```

这个结构不是什么好例子🌰，但是恰好某个组件是这么实现的，所以为了排查问题，抽离了最核心的DEMO，就是以上这个DOM结构

假设现在`#app`不具备前文所述的任何一种产生层叠上下文的条件，那么此时`#dialog`和`#mask`应当作为`同级别`层叠上下文来看待，并遵循`近大远小`的原则，dialog应当覆盖在mask之上。（😂确实我们想要这个效果）

但现在由于某种神奇的原因，在`#app`上添加了`-webkit-overflow-scrolling: touch; overflow: auto`属性，此时悲剧发生了：[IOS手机打开，mask覆盖到了dialog之上（😱WAHT HAPPENED!?）][url_demo_overflow]

后来经过试验，`#app`元素若存在**上述9种任意一种属性/组合**，都会导致这个诡异的状态出现！！！😱AMAZING！！！


### 科学解释

用上面的原理解释一下，当`#app`元素存在上述9种任意一种属性/组合时，发生了什么：

- **`#app`会生成新的叠层上下文**，此时其内部元素`#dialog`就变成其嵌套层叠上下文
- `#dialog`即以`#app`的层叠上下文为基准，**不再和`#mask`作同级对比**
- **`#app`的z-index相当于`auto`，并在数值上`与0相等`**

<p class="pp">这意味着：</p>
- **`#dialog`将在`#app`的层叠上下文内渲染**
- **`#mask`将覆盖在`#app`之上**，因为：`#app`:auto < `#mask`:100

<p class="pp">最终，导致了：</p>
- **`#mask`覆盖在`#dialog`之上**. OH NO !😯


### 问题联想

恰好在这个例子中，我遇到了`-webkit-overflow-scrolling: touch; overflow: auto`这个组合导致的问题，所以曾经一度联想，是不是因为BFC导致的，并发现一篇很好的文章：

> BFC元素特性表现原则就是，内部子元素再怎么翻江倒海，翻云覆雨都不会影响外部的元素
<div class="zs"> ------ [CSS深入理解流体特性和BFC特性][url_zxx_bfc]</div>

但是作为noZUOnoDIE星人，还是必须动手试一下的嘛。结果发现根本没有这回事，跟BFC一点关系都没有！！！BFC表示拒绝背锅~🙅🙅🙅
并且在严谨的控制变量法下发现：**只有overflow ≠ (visible/hidden/unset)时，`-webkit-overflow-scrolling: touch`才会使当前元素生成叠层上下文**

这就是为什么在ISO手机上死活关不掉这个遮罩层的原因所在了吧😑



## 参考文档

- [The stacking context][url_moz_sc]
- [w3.org/CSS22#z-index][url_w3_zidx]
- [Appendix E. Elaborate description of Stacking Contexts][url_w3_zindex]
- [CSS Stacking Context里那些鲜为人知的坑][url_ain_sc]
- [理解CSS3 isolation: isolate的表现和作用][url_zxx_iso]
- [深入理解CSS中的层叠上下文和层叠顺序][url_zxx_sc]
- [CSS深入理解流体特性和BFC特性][url_zxx_bfc]
- [CSS3 transform对普通元素的N多渲染影响][url_zxx_trs]
- [深入理解CSS溢出overflow][url_xhh]
- [深入理解BFC][url_xhh_bfc]







[url_demo_sc]: https://thunf.github.io/Demos/article/20180322_stacking_context
[url_demo_overflow]: https://thunf.github.io/Demos/article/20180322_stacking_context?overflow

[url_w3_zidx]: https://www.w3.org/TR/CSS22/visuren.html#z-index
[url_w3_zindex]: https://www.w3.org/TR/CSS2/zindex.html#painting-order

[url_moz_sc]: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context

[url_ain_sc]: http://blog.angular.in/css-stacking-contextli-na-xie-xian-wei-ren-zhi-de-keng/
[url_zxx_iso]: http://www.zhangxinxu.com/wordpress/2016/01/understand-css3-isolation-isolate/
[url_zxx_sc]: http://www.zhangxinxu.com/wordpress/2016/01/understand-css-stacking-context-order-z-index/
[url_zxx_bfc]: http://www.zhangxinxu.com/wordpress/2015/02/css-deep-understand-flow-bfc-column-two-auto-layout/
[url_zxx_trs]: http://www.zhangxinxu.com/wordpress/2015/05/css3-transform-affect/
[url_xhh]: https://www.cnblogs.com/xiaohuochai/p/5289653.html
[url_xhh_bfc]: http://www.cnblogs.com/xiaohuochai/p/5248536.html



