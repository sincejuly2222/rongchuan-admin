# rongchuan-admin

容川后台管理系统。

## 本地开发

启动前端开发服务器：

```bash
pnpm run dev
```

开发环境默认不会在应用启动时自动请求 `/api/auth/refresh`。这样在只运行前端、没有同时启动后端接口时，不会持续出现 Vite 代理的 `ECONNREFUSED` 日志。

如果你需要在开发环境恢复真实登录会话，可以设置：

```bash
VITE_DEV_ENABLE_SESSION_RESTORE=true
```

如果后端接口地址不是 `http://localhost:3000`，可以覆盖 Vite 的代理目标：

```bash
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8080
```
