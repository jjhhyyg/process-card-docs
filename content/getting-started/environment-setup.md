---
title: '环境搭建指南'
description: '开发环境配置与项目启动指南'
---

本指南将帮助你配置开发环境并运行工艺卡管理系统。

## 环境要求

### 必需软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| **JDK** | 21+ | 推荐使用 Amazon Corretto |
| **Node.js** | 22 LTS | 推荐使用 nvm 管理版本 |
| **MySQL** | 8.4 LTS | 数据库服务 |
| **Maven** | 3.9+ | 后端构建工具 |
| **Git** | 2.x | 版本控制 |

### 可选软件

| 软件 | 说明 |
|------|------|
| **Docker** | 容器化部署 |
| **Rust** | Tauri 桌面应用开发需要 |
| **VS Code** | 推荐的代码编辑器 |
| **IntelliJ IDEA** | 后端开发 IDE |
| **WebStorm** | 前端开发 IDE，和 VS Code 二选一 |

## 安装步骤

### 1. 安装 JDK 21

推荐使用 SDKMAN! 管理 Java 版本

::tabs
  ::div{label="macOS/Linux"}

  ```bash
  # 安装 SDKMAN!
  curl -s "https://get.sdkman.io" | bash
  source "$HOME/.sdkman/bin/sdkman-init.sh"
  
  # 安装 Amazon Corretto 21
  sdk install java 21-amzn
  
  # 设置为默认版本
  sdk default java 21-amzn
  
  # 验证安装
  java -version
  ```

  ::

  ::div{label="Windows"}

  1. 下载 [Amazon Corretto 21](https://aws.amazon.com/corretto/)
  2. 运行安装程序
  3. 设置环境变量 `JAVA_HOME`
  4. 验证安装：

  ```powershell
  java -version
  ```

  ::
::

### 2. 安装 Node.js

::tabs
  ::div{label="macOS/Linux"}
  **推荐使用 nvm 管理 Node.js 版本**

  ```bash
  # 安装 nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  
  # 重新加载 shell 配置
  source ~/.bashrc  # 或 source ~/.zshrc
  
  # 安装 Node.js 22 LTS
  nvm install 22
  nvm use 22
  nvm alias default 22
  
  # 验证安装
  node -v
  npm -v
  ```

  ::

  ::div{label="Windows"}

  1. 下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
  2. 运行安装程序
  3. 安装 Node.js 22 LTS：

  ```powershell
  nvm install 22
  nvm use 22
  
  # 验证安装
  node -v
  npm -v
  ```

  ::
::

### 3. 安装 MySQL 8.4 LTS

::tabs
  ::div{label="macOS/Windows/Linux"}
  **推荐从官网下载安装包**

  1. 访问 [MySQL 官方下载页面](https://dev.mysql.com/downloads/mysql/)
  2. 选择 **MySQL 8.4.x LTS** 版本
  3. 选择适合你操作系统的安装包
  4. 运行安装程序并配置 root 密码
  5. 启动 MySQL 服务

  **macOS 验证：**

  ```bash
  mysql --version
  ```

  **Windows 验证：**

  ```powershell
  mysql --version
  ```

  ::

  ::div{label="Docker"}

  ```bash
  # 使用 Docker 运行 MySQL 8.4
  docker run -d \
    --name mysql-dev \
    -e MYSQL_ROOT_PASSWORD=123456 \
    -e MYSQL_DATABASE=vt_process_card \
    -e MYSQL_USER=vt_admin \
    -e MYSQL_PASSWORD=123456 \
    -p 3306:3306 \
    mysql:8.4
  ```

  ::
::

### 4. 创建数据库用户

```sql
-- 连接 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE IF NOT EXISTS vt_process_card 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'vt_admin'@'localhost' IDENTIFIED BY '123456';

-- 授权
GRANT ALL PRIVILEGES ON vt_process_card.* TO 'vt_admin'@'localhost';
FLUSH PRIVILEGES;
```

::: tip 开发环境说明
在开发环境中，数据库表结构由 JPA 实体类自动生成。  
Flyway 迁移脚本仅在测试和生产环境中使用。
:::

## 项目配置

### 克隆项目

```bash
git clone <repository-url> develop
cd develop
```

### 后端配置

1. **配置数据库连接**

编辑 `process-card-backend/src/main/resources/application.yaml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/vt_process_card?createDatabaseIfNotExist=true
    username: vt_admin
    password: 123456  # 修改为你的密码
```

1. **配置文件存储路径**

```yaml
file:
  base-save-path: /your/storage/path  # 修改为你的存储路径
```

1. **配置 JWT 密钥**（生产环境必须修改）

```yaml
jwt:
  secret: your-secret-key-must-be-at-least-256-bits-long
```

### 前端配置

1. **安装依赖**

```bash
cd process-card-frontend
npm install
```

1. **配置 API 地址**（如需要）

编辑 `vite.config.ts` 中的代理配置：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 启动项目

### 启动后端

```bash
cd process-card-backend

# 使用 Maven Wrapper（推荐）
./mvnw spring-boot:run

# 或使用系统 Maven
mvn spring-boot:run
```

后端启动后访问：

- API 服务：`http://localhost:8080`
- API 文档：`http://localhost:8080/swagger-ui.html`

### 启动前端

```bash
cd process-card-frontend

# 开发模式
npm run dev
```

前端启动后访问：`http://localhost:5173`

### 启动流程图

```mermaid
flowchart LR
    subgraph Backend["后端启动"]
        B1["检查 JDK 21"] --> B2["Maven 编译"]
        B2 --> B3["JPA 自动建表<br/>(开发环境)"]
        B3 --> B4["启动 Spring Boot"]
        B4 --> B5["监听 8080 端口"]
    end
    
    subgraph Frontend["前端启动"]
        F1["检查 Node.js"] --> F2["pnpm install"]
        F2 --> F3["启动 Vite"]
        F3 --> F4["监听 5173 端口"]
    end
    
    subgraph Database["数据库"]
        DB["MySQL 3306"]
    end
    
    B5 --> DB
    F4 --> B5
```

## 常见问题

### Q: 启动后端报错 "Access denied for user"

**解决方案**：检查 MySQL 用户权限和密码配置

```sql
-- 重置用户密码
ALTER USER 'vt_admin'@'localhost' IDENTIFIED BY '123456';
FLUSH PRIVILEGES;
```

### Q: 前端请求后端 API 报 CORS 错误

**解决方案**：确保后端配置了 CORS，或使用 Vite 代理

```typescript
// vite.config.ts
export default {
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
}
```

### Q: 数据库表未创建

**原因**：开发环境依赖 JPA 自动建表

**解决方案**：

1. 检查 `application.yaml` 配置：
   ```yaml
   spring:
     jpa:
       generate-ddl: true
       hibernate:
         ddl-auto: update
   ```

2. 确保实体类包路径正确
3. 检查日志中是否有 Hibernate DDL 语句

::: tip 环境差异
- **开发环境**：JPA 自动建表
- **测试/生产环境**：使用 Flyway 迁移脚本
:::

### Q: Node.js 版本不兼容

**解决方案**：使用 nvm 管理 Node.js 版本

```bash
nvm install 18
nvm use 18
```

22
nvm use 22en 下载依赖慢

**解决方案**：配置阿里云镜像

编辑 `~/.m2/settings.xml`：

```xml
<mirrors>
  <mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
  </mirror>
</mirrors>
```

## 开发工具推荐

### VS Code 插件

| 插件 | 说明 |
|------|------|
| **Vue - Official** | Vue 3 语言支持 |
| **TypeScript Vue Plugin** | Vue TypeScript 支持 |
| **Tailwind CSS IntelliSense** | Tailwind 智能提示 |
| **ESLint** | 代码检查 |
| **Prettier** | 代码格式化 |

### IntelliJ IDEA 插件

| 插件 | 说明 |
|------|------|
| **Lombok** | Lombok 注解支持 |
| **MapStruct Support** | 对象映射支持 |
| **Database Navigator** | 数据库管理 |

## 下一步

- [后端项目结构](/backend/project-structure) - 了解后端代码组织
- [数据库设计](/backend/database) - 数据库表结构与 Flyway
- [前端项目结构](/frontend/project-structure) - 了解前端代码组织
