<p align="center">
  <img src="./public/favicon@128.png" alt="Boiling">
</p>
<h1 align="center">Boiling</h1>

<p align="center">
  <img src="https://shields.io/badge/TypeScript-Driver-green?logo=typescript" alt="lang">
  <img src="https://shields.io/badge/version-0.1.0-green?logo=github" alt="version">
</p>

应用名字取自人声鼎沸的“沸”。

## FAQ

* Q: 需要什么环境以及工具？
* A: `Node.js 16.x`, `yarn`, `Mongodb 5.x`
* Q: 如何启动应用？
* A: 在项目根目录下
  * 确认已经启动 mongodb 以及安装了 yarn
  * 安装依赖 `yarn`
  * 在 `./packages/backend` 创建环境变量文件 `.env`
  * 在 `.env` 中添加如下内容
    ```
    PORT=32141
    ```
  * 启动应用服务端 `start:dev:server`
  * 启动应用客户端 `start:dev:client`
