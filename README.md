# Campus Skill Swap Demo

一个面向 Gen Z 大学生的校园技能互助平台 Demo。  
用户可以发布自己能提供的技能或需要的帮助，通过 Credits 完成交换，并围绕订单进行沟通、议价、取消和结算。

## 在线地址

- Production: `https://campus-skill-swap-demo.vercel.app`

## 技术栈

- React 18
- Vite 5
- Tailwind CSS
- React Router
- localStorage

## 当前能力

- 首页展示技能提供 / 求助需求
- 发布任务，支持 AI 推荐定价和自定义定价
- 详情页接受服务
- 订单流转：`待确认 -> 进行中 -> 已完成 / 已取消`
- 订单沟通、议价、接受/拒绝议价
- 沟通失败取消订单，并自动退款
- Credits 余额、订单状态、流水保持一致
- 个人中心查看余额、订单和流水记录

## 本地启动

```bash
npm install
npm run dev
```

默认开发地址：

```bash
http://localhost:5173
```

## 生产构建

```bash
npm run build
```

## 项目结构

```txt
src/
  components/   # 通用组件
  data/         # Demo 初始数据
  pages/        # 页面
  utils/        # 存储、定价等工具
```

## 主要页面

- `/` 首页
- `/publish` 发布页
- `/post/:id` 详情页
- `/orders` 订单页
- `/profile` 个人中心

## GitHub 上传建议

这个项目已经补好了 `.gitignore`，上传到 GitHub 时不会包含：

- `node_modules`
- `dist`
- `.vercel`
- 日志文件
- 本地环境变量

推荐流程：

```bash
git init
git add .
git commit -m "init campus skill swap demo"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 部署说明

当前项目已适配 Vercel，且包含 `vercel.json`，前端路由刷新不会 404。

部署方式：

```bash
npm install
npm run build
npx vercel --prod
```

## 产品说明

这个 Demo 重点演示的是一条完整闭环：

1. 发布任务
2. 获取 AI 建议价或自定义定价
3. 接受服务并创建订单
4. 沟通细节与议价
5. 完成服务或取消订单
6. Credits 与流水同步更新
