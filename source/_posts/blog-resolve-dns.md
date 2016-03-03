---
title: 把博客托管到github和coding
date: 2016-03-03 13:33:03
toc: true
tags: 
    - blog
    - dns
categories:
thumbnail: http://7xrhcw.com1.z0.glb.clouddn.com/16-3-3/72446606.jpg
photo:
---

要说为什么要这么干，似乎可以找到很多理由：
  - 为了稳定的访问速度
  - 为了规避一道神奇的墙
  - 为了不把资源放在一个篮子里
  - gitcafe即将合并到coding
  - ...

<!-- more -->

![gitcafe即将合并到coding][pic1]

是的，我也是今天才知道gitcafe要合并的事的！(似乎coding是昨天[3.2]才宣布收购gitcafe的)
虽然一直知道有同时托管这么个事儿，那如今就直接在coding上圈块地好了～

## Coding Pages

欲练此功，必先...在coding上有代码对吧～

### 仓库迁移

首先，注册coding账号(已有，略)，新建项目，把该填的都填上：
  - 项目名称：最好和`账户名`相同，这样的项目相当于gh上的xxx.github.io的项目
  - 项目描述：描...
  - 私有/公开：当然选`公开`，~~不然憋大招？~~
  - 初始化/导入：选`导入仓库`，点击`GIT`，然后把你的github项目仓库贴进去...
  - 高级选项：项目版本(收费)/添加成员，依个人情况而定，大家刚开始自嗨的不用管它
  - 创建项目

然后坐下喝口水，就同步完成了。
`如果碰到了同步失败(检测不到仓库blablabla)的情况，请尝试删除当前空项目，再来一次。我测试的时候失败了一次来着`

现在，在coding上就有了一个和github上一模一样的代码仓库

### 开启Pages

有了仓库还不行，还得能看到展示页才行

> 同理于github上的gh-pages，coding上的默认Page分支为`coding-pages`，且可以指定分支

由于 GitHub Pages(xxx.github.io) 的默认分支为master，为了同步方便，coding也设置page分支为master
`若博客项目没有建在io项目中，则需放在gh-pages分支中方可展示`

![coding上设置page分支为master][pic2]


设置完成后，就可以通过`http://用户名.coding.me/项目名`直接访问page了
尝试：由于`用户名==项目名`，`http://用户名.coding.me/`也是可以访问到的

接下来出现了`绑定自定义域名`的选项，我填写了自己的域名。但似乎没有向访问thunf.github.io那样会通过CNAME自动跳转到www.thunf.me。
此处设置不明白，待明白回来补充（**同求高人指点**）。


## 域名解析

thunf.me的域名是在阿里云上买的，从选购到设置域名解析什么的一条龙服务，十(不)分(再)方(赘)便(述)。
如果是在阿里云上买的域名，那么进入**控制台**，找到**域名列表**，点击域名后面的**解析**进入**域名控制台-解析设置**


> www 是指域名前带www的可以解析，举栗：www.thunf.me
> @ 是指前面不带任何主机名也可解析，举栗：thunf.me

![域名解析设置][pic3]

如此设置就可以将国内访问解析到coding服务器上，而海外线路统一解析到github服务器上了

## 本地操作

有了两个同样的远程仓库后，我们就可以规划本地操作了。

### 设置remote

现在可以添加remote，这样就可以把更改同时提交到两个仓库里，保持线上同步。

```sh
// 打开静态文件根目录
cd blog/public

// 添加coding的仓库地址
git remote add coding <你的coding中项目的仓库地址>

// 查看已有远程仓库地址
git remote -v
```

为了保持public文件夹同步，也就是静态网站文件同步，所以设置要在blog/public目录中进行。

### PUSH更新

当确认了更改，`hexo g`、`git add`、`git commit`完成后

```sh
// 提交到github远程仓库，提交到coding远程仓库
git push origin:master && git push coding:master
```

如此便完成了两个仓库的同步更新。以后只需重复`PUSH更新`步骤就可以了









[pic1]: http://7xrhcw.com1.z0.glb.clouddn.com/16-3-3/52545842.jpg
[pic2]: http://7xrhcw.com1.z0.glb.clouddn.com/16-3-3/11136862.jpg
[pic3]: http://7xrhcw.com1.z0.glb.clouddn.com/16-3-3/55205442.jpg