# 数字员工 — 部署说明

## 在本机打包

```bash
cd ai-pm-assistant
npm run build        # 生成 dist/ 目录
```

## 在目标电脑部署

目标电脑只需要安装 **Node.js 18+**，无需 TypeScript 或 Vite。

将整个 `ai-pm-assistant` 目录复制到目标电脑后：

```bash
cd ai-pm-assistant

# 仅安装运行所需的生产依赖
npm install --production

# 启动服务
npm start
```

启动后浏览器打开 http://localhost:3000 即可使用。

## 自定义端口

```bash
PORT=8080 npm start
```

## 注意事项

- `dist/` 目录必须存在（由 `npm run build` 生成），否则服务启动失败
- 服务内置了 API 代理，无需担心跨域问题
- 如需升级，在本机修改代码后重新 `npm run build`，将新的 `dist/` 覆盖到目标电脑即可
