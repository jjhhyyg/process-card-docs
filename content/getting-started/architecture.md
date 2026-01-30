---
title: 系统架构
description: Process-Card 的整体架构设计和技术方案
---

Process-Card 采用**前后端分离**的经典架构，前端 Vue 3 SPA 通过 RESTful API 与后端 Spring Boot 进行交互。

```mermaid
graph TB
    subgraph "客户端层"
        Browser[浏览器]
        Desktop[桌面应用<br/>Tauri可选]
    end

    subgraph "前端层 - Vue 3 SPA"
        Router[Vue Router<br/>路由守卫]
        Store[Pinia Store<br/>状态管理]
        Components[组件库<br/>Element Plus]
        API[Axios<br/>HTTP客户端]
    end

    subgraph "后端层 - Spring Boot"
        Gateway[API网关<br/>CORS配置]
        Security[Spring Security<br/>JWT过滤器]
        Controller[Controller层<br/>REST API]
        Service[Service层<br/>业务逻辑]
        Repository[Repository层<br/>JPA + MyBatis]
    end

    subgraph "数据层"
        MySQL[(MySQL 8.0+<br/>关系数据库)]
        FileStorage[文件存储<br/>本地/对象存储]
    end

    Browser --> Router
    Desktop --> Router
    Router --> Store
    Router --> Components
    Components --> API
    API -->|HTTP/HTTPS| Gateway
    Gateway --> Security
    Security --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> MySQL
    Service --> FileStorage
```

## 前后端分离设计

### 通信方式

- **协议**：HTTP/HTTPS
- **数据格式**：JSON
- **认证方式**：JWT Bearer Token
- **跨域处理**：CORS 配置

### 前端职责

1. **用户界面渲染**：Vue 3 组件化开发
2. **路由管理**：Vue Router + 权限守卫
3. **状态管理**：Pinia Store（用户信息、权限、连接配置）
4. **HTTP 请求**：Axios + 请求/响应拦截器
5. **权限控制**：v-permiss 指令 + 路由守卫

### 后端职责

1. **业务逻辑处理**：Service 层
2. **数据持久化**：JPA + MyBatis
3. **权限验证**：@RequirePermission 注解 + AOP 切面
4. **用户认证**：JWT Token 生成和验证
5. **API 接口提供**：RESTful 风格

## 权限架构

### 三级权限模型

```mermaid
erDiagram
    USER ||--o{ USER_ROLES : has
    USER_ROLES }o--|| ROLE : belongs
    ROLE ||--o{ ROLE_PERMISSIONS : has
    ROLE_PERMISSIONS }o--|| PERMISSION : belongs

    USER {
        int user_id PK
        string username
        string password
        string display_name
    }

    ROLE {
        int role_id PK
        string role_name
        string role_mark
        boolean is_active
    }

    PERMISSION {
        int permission_id PK
        string permission_code
        string permission_name
        string description
        string category
    }

    USER_ROLES {
        int user_id FK
        int role_id FK
    }

    ROLE_PERMISSIONS {
        int role_id FK
        int permission_id FK
    }
```

### 权限验证流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant F as JWT过滤器
    participant A as 权限切面
    participant S as Service层
    participant D as 数据库

    C->>F: HTTP请求 + Bearer Token
    F->>F: 验证Token签名和有效期
    F->>F: 提取用户信息和权限列表
    F->>A: 设置SecurityContext
    A->>A: 检查@RequirePermission注解
    A->>A: 比对用户权限码
    alt 权限匹配
        A->>S: 允许访问
        S->>D: 执行业务逻辑
        D-->>C: 返回结果
    else 权限不足
        A-->>C: 403 Forbidden
    end
```

## JWT 认证架构

### Token 结构

```mermaid
graph LR
    subgraph "Access Token (1小时)"
        A1[Header<br/>算法:HS256]
        A2[Payload<br/>userId, username<br/>roleMark, permissions<br/>type: access]
        A3[Signature<br/>密钥签名]
    end

    subgraph "Refresh Token (7天)"
        R1[Header<br/>算法:HS256]
        R2[Payload<br/>userId, username<br/>type: refresh]
        R3[Signature<br/>密钥签名]
    end
```

### 认证流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant F as 前端
    participant B as 后端
    participant D as 数据库

    U->>F: 输入用户名密码
    F->>B: POST /auth/login
    B->>D: 查询用户和角色权限
    D-->>B: 用户信息 + 权限列表
    B->>B: 生成 Access Token + Refresh Token
    B-->>F: 返回 tokens
    F->>F: 存储到 localStorage
    F->>F: 设置 Axios默认header

    Note over F,B: 后续请求携带 Access Token

    F->>B: API 请求 (Authorization: Bearer token)
    B->>B: 验证 Token
    alt Token 有效
        B-->>F: 返回数据
    else Token 过期
        B-->>F: 401 Unauthorized
        F->>B: POST /auth/refresh (Refresh Token)
        B->>D: 查询最新权限
        B-->>F: 新的 Access Token
        F->>B: 重试原请求
    end
```

## 前端架构设计

### 目录结构

```plaintext
src/
├── api/              # API 接口封装
├── components/       # 可复用组件
├── composables/      # 组合式函数（业务逻辑复用）
├── constants/        # 常量（权限码等）
├── router/           # 路由配置 + 守卫
├── store/            # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面视图
```

### 状态管理

```mermaid
graph TB
    subgraph "Pinia Stores"
        PS[permiss.ts<br/>权限管理]
        CS[connection.ts<br/>后端连接]
        TS[tabs.ts<br/>标签页]
        SS[sidebar.ts<br/>侧边栏]
    end

    subgraph "Vue Components"
        Header[Header组件]
        Sidebar[Sidebar组件]
        Views[View页面]
    end

    PS --> Header
    PS --> Sidebar
    PS --> Views
    CS --> Header
    TS --> Header
    SS --> Sidebar
```

### 路由守卫

```mermaid
flowchart TD
    Start[路由跳转] --> CheckConn{后端已连接?}
    CheckConn -->|否| ToConn[跳转到连接配置]
    CheckConn -->|是| CheckAuth{需要认证?}
    CheckAuth -->|否| Allow[允许访问]
    CheckAuth -->|是| CheckToken{Token存在?}
    CheckToken -->|否| ToLogin[跳转到登录]
    CheckToken -->|是| CheckPerm{权限匹配?}
    CheckPerm -->|否| To403[跳转到403]
    CheckPerm -->|是| Allow
```

## 后端架构设计

### 分层架构

```plaintext
Controller 层（接收HTTP请求）
    ↓
Service 层（业务逻辑处理）
    ↓
Repository/Mapper 层（数据访问）
    ↓
Database（数据持久化）
```

### 切面编程（AOP）

```mermaid
graph LR
    Request[HTTP请求] --> JWTFilter[JWT过滤器]
    JWTFilter --> PermissionAspect["权限切面<br/>@RequirePermission"]
    PermissionAspect --> LogAspect["日志切面<br/>@CustomLog"]
    LogAspect --> AuditAspect["审计切面<br/>@Auditable"]
    AuditAspect --> Controller[Controller方法]
```

### 数据访问层

Process-Card 混合使用 **JPA** 和 **MyBatis**：

| 场景 | 技术选择 | 原因 |
|------|---------|------|
| 简单 CRUD | Spring Data JPA | 自动生成 SQL，代码简洁 |
| 复杂查询 | MyBatis | 灵活的 SQL 控制，性能优化 |
| 关联查询 | MyBatis | 避免 N+1 问题 |
| 批量操作 | MyBatis | 原生 SQL 性能更好 |

## 环境隔离设计

### 三环境配置

```yaml
# application.yaml
spring:
  profiles:
    active: dev  # 默认开发环境

---
# application-dev.yaml（开发环境）
server:
  port: 6062
spring:
  jpa:
    hibernate:
      ddl-auto: create-drop  # 每次重启重建数据库
    show-sql: true
  datasource:
    url: jdbc:mysql://localhost:3306/vt_process_card_dev

---
# application-test.yaml（测试环境）
server:
  port: 6061
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # 仅验证，不修改结构
  datasource:
    url: jdbc:mysql://localhost:3306/vt_process_card_test

---
# application-prod.yaml（生产环境）
server:
  port: 6060
spring:
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false  # 关闭SQL日志
  datasource:
    url: jdbc:mysql://production-server:3306/vt_process_card_prod
```

### 前端环境切换

前端通过 **连接配置页面** 动态设置后端地址，支持：

- IP 地址
- 端口
- Context Path（URL 前缀）

存储在 `localStorage` 中，刷新页面不丢失。

## 文件处理架构

### 文件存储

- **存储路径**：`/Users/erikssonhou/storage`（可配置）
- **文件类型**：模型文件、图片、Excel 等
- **分块上传**：支持大文件（5MB 分块）
- **软删除**：逻辑删除，30 天后物理删除

### 文件上传流程

```mermaid
sequenceDiagram
    participant C as 客户端
    participant U as 后端Upload
    participant S as 后端Service
    participant FS as 文件系统

    C->>U: 上传分块1
    U->>FS: 保存临时分块
    C->>U: 上传分块2
    U->>FS: 保存临时分块
    C->>U: 上传分块N（最后）
    U->>FS: 保存临时分块
    U->>FS: 合并所有分块
    FS-->>U: 返回文件路径
    U->>S: 创建文件引用记录
    S-->>C: 返回文件ID
```

## 性能优化设计

### 前端优化

- **路由懒加载**：`() => import('./views/xxx.vue')`
- **组件懒加载**：按需加载 Element Plus 组件
- **请求去重**：Axios 拦截器防止重复请求
- **缓存机制**：标准数据缓存到 Store

### 后端优化

- **分页查询**：所有列表接口支持分页
- **索引优化**：主键、外键、查询字段建立索引
- **连接池**：HikariCP 数据库连接池
- **异步处理**：文件生成、邮件发送等使用异步

## 安全架构

### 安全措施

1. **认证**：JWT Token + 签名验证
2. **授权**：@RequirePermission + 权限切面
3. **CSRF 防护**：无状态 API 禁用 CSRF
4. **SQL 注入防护**：JPA Criteria + MyBatis 预编译
5. **XSS 防护**：前端输入验证 + 后端转义
6. **防暴力破解**：LoginAttempt 记录登录尝试
7. **密码加密**：BCrypt 哈希存储

### CORS 配置

允许跨域访问，支持前后端分离部署：

```java
@Configuration
public class WebConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");  // 允许所有域名
        config.addAllowedMethod("*");         // 允许所有HTTP方法
        config.addAllowedHeader("*");         // 允许所有请求头
        config.setAllowCredentials(true);     // 允许携带凭证
        return source;
    }
}
```

## 日志和审计

### 日志体系

- **操作日志**：`@CustomLog` 注解记录关键操作
- **审计日志**：`@Auditable` 注解记录 CRUD 操作
- **异常日志**：全局异常处理器记录

### 审计信息

所有重要操作记录到 `audit_logs` 表：

- 操作人（user_id）
- 操作类型（CREATE/UPDATE/DELETE）
- 目标资源（PERMISSION/ROLE/USER）
- 操作描述
- 时间戳

## 下一步

- 查看 [技术栈详解](./tech-stack) 了解具体技术选型
- 阅读 [后端权限系统](../backend/permission-system) 深入理解权限实现
- 学习 [前端权限控制](../frontend/permission-control) 掌握前端权限

---

**提示**：本架构设计遵循"关注点分离"原则，前后端、各层级职责清晰，便于维护和扩展。
