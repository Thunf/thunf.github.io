---
title: Hello World
date: 2016-03-01 16:21:12
toc: true
tags: blog
categories:
thumbnail: //cdn.thunf.cn/20160301162112.jpg
photo:
---

开篇一定要`Hello World`，顺便记录一下怎么搭的博客。

<!-- more -->

## 关于本博 ##

一直想弄自己的博客，但是一直没想好写什么，所以就一直pending...
直到，我觉得还是先搭出来再想写什么好了～

折腾了一天，终于把hexo博客憋了出来。
hexo实在利器，install & init & running~
总觉得默认theme太low，于是找了半天theme。
终于找到一个中意的icarus，然后瞅瞅源码，稍微敲敲打打，fork过来准备自己维护。

## 关于主题 ##

翻了不少Blog，最终还是觉得[潘家邦][0]的博风格走心，遂借鉴。

目前做了这么几件事：
- languages/zh-CN.yml → languages/zh-Hans.yml
- languages/zh-TW.yml → languages/zh-Hant.yml
- 使中文包里menu选项i18n生效（可能原作喜欢菜单字母范？）
- 增加[[不蒜子]][1]作为计数器`墙裂推荐`
- 稍微敲打一下字体样式

感觉模板自由度很高，以后有的折腾了(虽然现在只有简单的列表)。

## 关于代码仓库 ##

目前是打算直接放github上，似乎有时候会被墙，稍后再研究一下怎么设置备用库～

想把public(发布的静态文件夹)和source(博文md源码)放在一个项目中，但是又不想把它们杂在一个分支里。
围观了一下别人的做法，感觉分开放置比较容易管理，但是感觉更新一次还要在两个项目里进行，遂不爽。

于是便进行如下结构
blog ==> `thunf.github.io`/`blog-server`
  ├ public ==> `thunf.github.io`/`master`
  ├ themes
  │   └ icarus ==> `thunf/hexo-theme-icarus`/`master`
  ├ source
  │   ├ _posts
  │   ├ 404.html
  │   ├ CNAME
  │   └ ...
  ├ _config.thunf.yml
  └ ...

如此一来，若在其他机器上做开发
```js
// clone项目，切换到`blog-server`分支，配置并安装依赖
git clone 'git@github.com:Thunf/thunf.github.io.git' blog
cd blog && git checkout blog-server && git pull origin blog-server
cp _config.thunf.yml _config.yml && npm install

// clone项目`master`分支到public文件夹下
git clone 'git@github.com:Thunf/thunf.github.io.git' public

// clone主题到themes/icarus目录下，配置
cd themes && git clone 'git@github.com:Thunf/hexo-theme-icarus.git' icarus
cd icarus && cp _config.thunf.yml _config.yml

```
如此便可跨机器完整部署博客资源
若需要新增内容
```js
cd blog && hexo new 'title'
hexo server

// edit... blablabla

hexo generate
cd public && git push origin master

```
就完成了新博文的发表


## NEXT ##

写写生活，写写工作，写写折腾... 围观与求围观

----

补充:
  - 2016-07-01：clone时选择使用SSH地址 - Use an SSH key and passphrase from account.


[0]: https://blog.jamespan.me/
[1]: http://service.ibruce.info/
