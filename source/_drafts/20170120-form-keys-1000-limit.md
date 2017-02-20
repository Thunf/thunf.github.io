---
title: 踩坑parameterLimit - 神秘的1000URL-encoded限制
toc: true
date: 2017-01-20 22:31:52
tags:
categories:
thumbnail:
photo:
---

时值年前上班最后一天，居然还加班到本楼层最后才走，也是醉了。


<!-- more -->

The parameterLimit option controls the maximum number of parameters that are allowed in the URL-encoded data. If a request contains more parameters than this value, a 413 will be returned to the client. Defaults to 1000.