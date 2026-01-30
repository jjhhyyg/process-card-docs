# GitHub Pages 部署配置

本项目使用 GitHub Actions 自动部署到 GitHub Pages。

## 配置步骤

1. **启用 GitHub Pages**
   - 访问仓库设置：Settings > Pages
   - Source 选择：GitHub Actions

2. **自动部署**
   - 每次推送到 main 分支会自动触发部署
   - 也可以在 Actions 页面手动触发部署

## 访问地址

部署成功后，访问：https://jjhhyyg.github.io/process-card-docs/

## 本地预览生产构建

```bash
# 生成静态文件
npm run generate

# 预览生成的静态站点
npm run preview
```
