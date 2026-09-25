
### 第三步：创建 CHANGELOG.md

在项目根目录下新建一个文件，命名为 `CHANGELOG.md`，粘贴以下内容并保存：

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-09-25
### Added
- 初始化 Vite + Vue 3 项目
- 添加样本配方数据（铁矿、铜矿、铁块、电路板等）
- 实现核心计算引擎 `pathFinder.js` 与 `calculator.js`
- 搭建 Pinia 状态管理（`recipeStore` 与 `planStore`）
- 实现递归树组件与产能规划表格 UI
- 添加终端测试脚本并验证计算逻辑

## [0.0.1] - 2026-09-25
### Added
- 项目初始化，Vite + Vue 3 脚手架