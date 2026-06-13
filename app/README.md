# Spanish Vocab

一个面向中文用户的西班牙语词汇学习网站，支持 DELE A1 / A2 / B1 词汇学习、发音播放、错题本、学习设置和轻量复习。

项目目前是一个前端 MVP，使用 Next.js 构建，数据暂时保存在浏览器本地 localStorage 中。

## 在线预览

Vercel Demo：

```txt
https://spanish-vocab-app-one.vercel.app
```

GitHub Repository：

```txt
https://github.com/Cliion11/spanish-vocab-app
```

## 项目截图

暂时未添加截图。

后续可以补充：

* 首页截图
* 学习页截图
* 错题本截图
* 设置页截图

## 核心功能

### 1. 首页

首页采用简约高级的莫奈系玻璃拟态风格，提供学习入口、错题本入口和设置入口。

### 2. 等级选择

支持三个学习阶段：

* DELE A1 基础词汇
* DELE A2 初级词汇
* DELE B1 中级词汇

每个等级展示学习统计，包括总复习、今日复习、已学习、已掌握、错题和到期复习。

### 3. 单词学习

学习页支持：

* 单词卡片展示
* 词性展示
* 中文释义
* 西语例句
* 中文翻译
* 显示答案
* 认识 / 模糊 / 不认识
* 一轮学习完成页

### 4. 发音功能

支持浏览器内置语音播放：

* 进入新单词时自动播放
* 手动点击播放发音
* 可在设置页调整自动播放开关
* 可在设置页调整发音语速

### 5. 错题本

当用户在学习页选择“不认识”时，单词会自动加入错题本。

错题本支持：

* 查看错题
* 查看错误次数
* 查看例句和翻译
* 移除单个错题
* 清空错题本

### 6. 设置页

设置页支持：

* 每日目标设置
* 自动播放发音开关
* 发音语速调节
* 清空错题本
* 清空学习统计
* 重置本地数据

### 7. PWA 支持

项目已添加 Web App Manifest 和应用图标，后续可以进一步优化为可添加到手机主屏幕的轻量网页 App。

## 技术栈

* Next.js
* React
* TypeScript
* CSS
* localStorage
* Web Speech API
* Vercel

## 页面路径

```txt
/                 首页
/study            学习等级选择页
/study/a1         A1 学习页
/study/a2         A2 学习页
/study/b1         B1 学习页
/mistakes         错题本
/settings         设置页
/icon.svg         App 图标
```

## 本地运行

### 1. 克隆项目

```bash
git clone https://github.com/Cliion11/spanish-vocab-app.git
```

### 2. 进入项目目录

```bash
cd spanish-vocab-app
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

然后在浏览器打开：

```txt
http://localhost:3000
```

## 构建项目

```bash
npm run build
```

## 当前项目状态

这是一个早期 MVP 版本，主要目标是验证：

* 中文用户是否需要更轻量的西语背单词工具
* DELE 分级词汇学习是否有吸引力
* 发音、错题本、轻量复习是否能形成基础学习闭环
* 简约高级的视觉风格是否适合语言学习产品

## 后续计划

### 短期计划

* 增加更多 A1 / A2 / B1 词库
* 优化移动端体验
* 增加错题复习模式
* 增加学习连续天数
* 增加更清晰的学习进度展示

### 中期计划

* 支持用户登录
* 支持云端同步
* 支持更多词库分类
* 支持例句收藏
* 支持每日学习提醒
* 支持导入和导出单词数据

### 长期计划

* 做成可安装的 PWA
* 探索移动端 App 版本
* 增加付费词库或高级复习功能
* 支持更多语言学习方向

## 数据说明

当前版本的数据主要保存在浏览器 localStorage 中。

这意味着：

* 同一个浏览器里可以保存学习记录
* 换浏览器或清理浏览器数据后，学习记录可能会丢失
* 当前版本暂时没有账号系统和云端同步

## 适合人群

这个项目主要面向：

* 想学习西班牙语的中文用户
* 正在准备 DELE A1 / A2 / B1 的学习者
* 希望用轻量方式积累西语词汇的人
* 不想使用复杂背单词软件的初学者

## 项目定位

Spanish Vocab 希望做成一个：

```txt
比 Anki 更轻
比传统词表更好看
比大型语言学习 App 更直接
适合中文用户学习西语词汇的工具
```

## License

This project is currently for learning and MVP validation.
License will be added later.
