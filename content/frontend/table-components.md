---
title: Table 组件复用
description: Process-Card Table 组件设计与使用指南
---

Process-Card 封装了一套**高复用性的 Table 组件**，包含搜索、表格、编辑、详情四大组件，可快速开发完整的 CRUD 功能页面。

## 组件概览

| 组件 | 文件路径 | 用途 |
|------|---------|------|
| **TableSearch** | `components/table-search.vue` | 搜索表单组件 |
| **TableCustom** | `components/table-custom.vue` | 主表格组件（含工具栏、分页、操作列） |
| **TableEdit** | `components/table-edit.vue` | 编辑表单组件（新增/编辑） |
| **TableDetail** | `components/table-detail.vue` | 详情展示组件 |

## 快速开始：5 分钟实现 CRUD

以"用户管理"为例，演示如何使用 Table 组件快速开发完整的增删改查功能。

### 完整示例代码

**文件路径**：`process-card-frontend/src/views/system/user.vue`（简化版）

```vue
<template>
  <div class="container">
    <!-- 1. 搜索组件 -->
    <TableSearch :query="query" :options="searchOpt" :search="handleSearch"/>

    <!-- 2. 表格组件 -->
    <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :viewFunc="handleView"
        :editFunc="handleEdit"
        :delFunc="handleDelete"
        :page-change="changePage"
    >
      <!-- 工具栏按钮插槽 -->
      <template #toolbarBtn>
        <el-button type="warning" :icon="CirclePlusFilled" @click="handleAdd">
          新增
        </el-button>
      </template>
    </TableCustom>

    <!-- 3. 新增/编辑弹窗 -->
    <el-dialog :title="isEdit ? '编辑用户' : '新增用户'" v-model="visible" width="700px">
      <TableEdit :form-data="rowData" :options="options" :edit="isEdit" :update="confirmUpdate"/>
    </el-dialog>

    <!-- 4. 查看详情弹窗 -->
    <el-dialog title="用户详情" v-model="visible1" width="700px">
      <TableDetail :data="viewData"/>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {CirclePlusFilled} from '@element-plus/icons-vue'
import {getUserList, createUserWithRole, updateUser, deleteUser, getUserInfo} from '@/api/user'
import TableCustom from '@/components/table-custom.vue'
import TableDetail from '@/components/table-detail.vue'
import TableSearch from '@/components/table-search.vue'
import TableEdit from "@/components/table-edit.vue"

// ===== 搜索配置 =====
const query = reactive({ username: '' })
const searchOpt = ref([
  { type: 'input', label: '用户名：', prop: 'username' }
])
const handleSearch = () => changePage(1)

// ===== 表格配置 =====
const columns = ref([
  { type: 'index', label: '序号', width: 55, align: 'center' },
  { prop: 'username', label: '用户名' },
  { prop: 'display_name', label: '显示名称' },
  { prop: 'telephone', label: '手机号' },
  { prop: 'email', label: '邮箱' },
  {
    prop: 'role_names',
    label: '角色',
    formatter: (val: string[]) => val ? val.join(', ') : ''
  },
  {
    prop: 'operator',
    label: '操作',
    customButtons: [
      {
        label: '修改密码',
        type: 'warning',
        handler: (row: any) => openPasswordDialog(row),
        show: (row: any) => permiss.key.includes(PermissionCode.USER_PASSWORD_MANAGEMENT)
      }
    ]
  },
])

const page = reactive({ index: 1, size: 10, total: 0 })
const tableData = ref([])

// 获取表格数据
const getData = async () => {
  const res = await getUserList({ page: page.index, size: page.size, ...query })
  tableData.value = res.data.list
  page.total = res.data.total
}

// 分页变化
const changePage = (val: number) => {
  page.index = val
  getData()
}

// ===== 编辑表单配置 =====
const visible = ref(false)
const isEdit = ref(false)
const rowData = ref({})
const options = ref([
  { type: 'input', label: '用户名', prop: 'username', disabled: isEdit },
  { type: 'input', label: '显示名称', prop: 'display_name' },
  { type: 'input', label: '手机号', prop: 'telephone' },
  { type: 'input', label: '邮箱', prop: 'email' },
  { type: 'select-multi', label: '角色', prop: 'role_ids', opts: roleOptions }
])

// 新增
const handleAdd = () => {
  rowData.value = {}
  isEdit.value = false
  visible.value = true
}

// 编辑
const handleEdit = async (row: any) => {
  const res = await getUserInfo(row.username)
  rowData.value = res.data
  isEdit.value = true
  visible.value = true
}

// 确认更新
const confirmUpdate = async (data: any) => {
  if (isEdit.value) {
    await updateUser(data)
    ElMessage.success('编辑成功')
  } else {
    await createUserWithRole(data)
    ElMessage.success('新增成功')
  }
  visible.value = false
  getData()
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该用户吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteUser(row.user_id)
    ElMessage.success('删除成功')
    getData()
  })
}

// ===== 查看详情 =====
const visible1 = ref(false)
const viewData = ref({})

const handleView = async (row: any) => {
  const res = await getUserInfo(row.username)
  viewData.value = res.data
  visible1.value = true
}

onMounted(() => {
  getData()
})
</script>
```

**效果**：
- ✅ 搜索：输入用户名搜索
- ✅ 列表：显示用户信息，支持分页
- ✅ 新增：点击"新增"按钮，弹出表单
- ✅ 编辑：点击"编辑"按钮，回显数据并修改
- ✅ 删除：点击"删除"按钮，确认后删除
- ✅ 查看：点击"查看"按钮，展示详细信息
- ✅ 权限控制：自定义按钮支持权限控制

### 开发步骤

#### Step 1: 定义搜索配置

```typescript
const query = reactive({
  username: '',
  email: ''
})

const searchOpt = ref([
  { type: 'input', label: '用户名：', prop: 'username' },
  { type: 'input', label: '邮箱：', prop: 'email' },
  { type: 'select', label: '角色：', prop: 'role_id', opts: roleOptions }
])
```

**支持的类型**：
- `input`：文本输入框
- `select`：下拉选择（单选）
- `select-multi`：下拉选择（多选）
- `date`：日期选择器
- `daterange`：日期范围选择器

#### Step 2: 定义表格列配置

```typescript
const columns = ref([
  // 序号列（自动编号）
  { type: 'index', label: '序号', width: 55, align: 'center' },

  // 普通数据列
  { prop: 'username', label: '用户名', width: 150 },
  { prop: 'email', label: '邮箱' },

  // 格式化列（自定义显示）
  {
    prop: 'role_names',
    label: '角色',
    formatter: (val: string[]) => val ? val.join(', ') : '无'
  },

  // 操作列（自定义按钮）
  {
    prop: 'operator',
    label: '操作',
    width: 300,
    customButtons: [
      {
        label: '审核',
        type: 'success',
        handler: (row: any) => handleReview(row),
        show: (row: any) => row.status === 'pending' && hasPermission('REVIEW')
      },
      {
        label: '导出',
        type: 'primary',
        handler: (row: any) => handleExport(row)
      }
    ]
  }
])
```

**列配置参数**：
- `type`：列类型（`'selection'` 多选、`'index'` 序号、`'expand'` 展开行）
- `prop`：数据字段名
- `label`：列标题
- `width`：列宽度
- `align`：对齐方式（`'left'` / `'center'` / `'right'`）
- `formatter`：格式化函数 `(value) => string`
- `customButtons`：自定义按钮数组（操作列专用）

#### Step 3: 定义编辑表单配置

```typescript
const options = ref([
  {
    type: 'input',
    label: '用户名',
    prop: 'username',
    disabled: isEdit  // 编辑时禁用
  },
  {
    type: 'input',
    label: '邮箱',
    prop: 'email',
    rules: [{ required: true, message: '请输入邮箱' }]
  },
  {
    type: 'select',
    label: '角色',
    prop: 'role_id',
    opts: roleOptions,  // 下拉选项
    multiple: false
  },
  {
    type: 'select-multi',
    label: '权限',
    prop: 'permission_ids',
    opts: permissionOptions
  },
  {
    type: 'date',
    label: '生日',
    prop: 'birthday'
  }
])
```

**表单类型**：
- `input`：文本输入框
- `textarea`：多行文本框
- `select`：下拉选择（单选）
- `select-multi`：下拉选择（多选）
- `date`：日期选择器
- `switch`：开关
- `radio`：单选按钮
- `checkbox`：复选框

#### Step 4: 实现 CRUD 逻辑

```typescript
// 获取数据
const getData = async () => {
  const res = await getUserList({
    page: page.index,
    size: page.size,
    ...query  // 搜索条件
  })
  tableData.value = res.data.list
  page.total = res.data.total
}

// 新增
const handleAdd = () => {
  rowData.value = {}  // 清空表单
  isEdit.value = false
  visible.value = true
}

// 编辑
const handleEdit = async (row: any) => {
  const res = await getUserInfo(row.id)
  rowData.value = res.data  // 回显数据
  isEdit.value = true
  visible.value = true
}

// 确认保存
const confirmUpdate = async (data: any) => {
  if (isEdit.value) {
    await updateUser(data)
  } else {
    await createUser(data)
  }
  ElMessage.success('操作成功')
  visible.value = false
  getData()  // 刷新列表
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除吗?', '提示', {
    type: 'warning'
  }).then(async () => {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getData()
  })
}
```

## TableCustom 组件详解

### 核心参数

```typescript
<TableCustom
    :columns="columns"          // 列配置
    :tableData="tableData"      // 表格数据
    :total="page.total"         // 总记录数
    :currentPage="page.index"   // 当前页码
    :pageSize="page.size"       // 每页条数
    :page-change="changePage"   // 分页变化回调

    :viewFunc="handleView"      // 查看按钮回调
    :editFunc="handleEdit"      // 编辑按钮回调
    :delFunc="handleDelete"     // 删除按钮回调

    :hasToolbar="true"          // 是否显示工具栏
    :hasPagination="true"       // 是否显示分页
    :rowKey="'id'"              // 行唯一标识字段
/>
```

### 自定义按钮

**在列配置中添加 `customButtons`**：

```typescript
{
  prop: 'operator',
  label: '操作',
  customButtons: [
    {
      label: '审核',
      type: 'success',
      icon: CircleCheckFilled,
      handler: (row: any) => {
        console.log('审核', row)
      },
      show: (row: any) => {
        // 条件显示：只有状态为 pending 且有审核权限的用户才能看到
        return row.status === 'pending' && hasReviewPermission()
      },
      disabled: (row: any) => {
        // 条件禁用：已审核的行禁用按钮
        return row.reviewed === true
      }
    }
  ]
}
```

**按钮配置参数**：
- `label`：按钮文本
- `type`：按钮类型（`'primary'` / `'success'` / `'warning'` / `'danger'`）
- `size`：按钮大小（`'large'` / `'default'` / `'small'`）
- `icon`：按钮图标
- `handler`：点击回调 `(row) => void`
- `show`：显示条件 `boolean | ((row) => boolean)`
- `disabled`：禁用条件 `(row) => boolean`

### 工具栏插槽

```vue
<TableCustom>
  <template #toolbarBtn>
    <el-button type="primary" @click="handleAdd">新增</el-button>
    <el-button type="success" @click="handleExport">导出</el-button>
    <el-button type="warning" @click="handleImport">导入</el-button>
  </template>
</TableCustom>
```

### 列插槽（自定义单元格）

```vue
<TableCustom :columns="columns" :tableData="tableData">
  <!-- 自定义"状态"列的显示 -->
  <template #status="{ rows, index }">
    <el-tag :type="rows.status === 'active' ? 'success' : 'danger'">
      {{ rows.status === 'active' ? '激活' : '禁用' }}
    </el-tag>
  </template>

  <!-- 自定义"头像"列的显示 -->
  <template #avatar="{ rows }">
    <el-avatar :src="rows.avatar" />
  </template>
</TableCustom>
```

**注意**：插槽名称必须与列配置中的 `prop` 一致。

## TableSearch 组件详解

### 参数说明

```typescript
<TableSearch
    :query="query"          // 绑定的查询对象
    :options="searchOpt"    // 搜索项配置
    :search="handleSearch"  // 搜索按钮回调
/>
```

### 搜索项配置

```typescript
const searchOpt = ref([
  // 文本输入
  {
    type: 'input',
    label: '用户名：',
    prop: 'username',
    placeholder: '请输入用户名'
  },

  // 下拉选择
  {
    type: 'select',
    label: '角色：',
    prop: 'role_id',
    opts: [
      { label: '管理员', value: 1 },
      { label: '普通用户', value: 2 }
    ]
  },

  // 日期选择
  {
    type: 'date',
    label: '创建日期：',
    prop: 'created_at'
  },

  // 日期范围
  {
    type: 'daterange',
    label: '日期范围：',
    prop: 'date_range'
  }
])
```

### 搜索逻辑

```typescript
const query = reactive({
  username: '',
  role_id: null,
  created_at: ''
})

const handleSearch = () => {
  page.index = 1  // 重置页码
  getData()       // 重新获取数据
}
```

**清空搜索**：`TableSearch` 组件自带"重置"按钮，会清空 `query` 对象的所有字段。

## TableEdit 组件详解

### 参数说明

```typescript
<TableEdit
    :form-data="rowData"      // 表单数据（用于回显）
    :options="options"        // 表单项配置
    :edit="isEdit"            // 是否为编辑模式
    :update="confirmUpdate"   // 提交回调
/>
```

### 表单验证

```typescript
const options = ref([
  {
    type: 'input',
    label: '用户名',
    prop: 'username',
    rules: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
    ]
  },
  {
    type: 'input',
    label: '邮箱',
    prop: 'email',
    rules: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
    ]
  }
])
```

## TableDetail 组件详解

### 使用方式

```vue
<TableDetail :data="viewData"/>
```

**`viewData` 示例**：

```typescript
const viewData = ref({
  '用户名': 'admin',
  '邮箱': 'admin@example.com',
  '手机号': '13800138000',
  '角色': '管理员, 开发者',
  '创建时间': '2025-01-01 12:00:00'
})
```

**效果**：自动渲染为表格形式，左侧为 key，右侧为 value。

## 实战案例：工艺卡管理

基于 Table 组件开发工艺卡管理功能（含多权限按钮）。

**文件路径**：`views/process-card/index.vue`（示例）

```typescript
const columns = ref([
  { type: 'selection' },  // 多选列
  { type: 'index', label: '序号', width: 55 },
  { prop: 'card_name', label: '工艺卡名称' },
  { prop: 'product_name', label: '产品名称' },
  {
    prop: 'status',
    label: '状态',
    formatter: (val: string) => {
      const statusMap = {
        draft: '草稿',
        reviewing: '审核中',
        confirmed: '已确认',
        executing: '执行中',
        completed: '已完成'
      }
      return statusMap[val] || val
    }
  },
  {
    prop: 'operator',
    label: '操作',
    width: 400,
    customButtons: [
      {
        label: '执行',
        type: 'primary',
        handler: (row) => handleExecute(row),
        show: (row) => row.status === 'confirmed' && hasPermission(PermissionCode.PROCESS_CARD_EXECUTE)
      },
      {
        label: '审核',
        type: 'success',
        handler: (row) => handleReview(row),
        show: (row) => row.status === 'reviewing' && hasPermission(PermissionCode.PROCESS_CARD_REVIEW)
      },
      {
        label: '确认',
        type: 'warning',
        handler: (row) => handleConfirm(row),
        show: (row) => row.status === 'reviewed' && hasPermission(PermissionCode.PROCESS_CARD_CONFIRM)
      },
      {
        label: '导出',
        type: 'default',
        handler: (row) => handleExport(row),
        show: (row) => hasPermission(PermissionCode.PROCESS_CARD_EXPORT)
      }
    ]
  }
])
```

**效果**：
- 不同状态的工艺卡显示不同的操作按钮
- 不同权限的用户看到不同的按钮
- 按钮的显示和禁用状态动态变化

## 最佳实践

1. **列配置复用**：将常用的列配置提取为函数
   ```typescript
   const getIndexColumn = () => ({ type: 'index', label: '序号', width: 55 })
   const getOperatorColumn = (customButtons) => ({ prop: 'operator', label: '操作', customButtons })
   ```

2. **权限控制集成**：在 `customButtons.show` 中检查权限
   ```typescript
   show: (row) => permiss.key.includes(PermissionCode.USER_DELETE)
   ```

3. **状态管理**：使用 `formatter` 格式化显示
   ```typescript
   formatter: (val) => statusMap[val] || '未知'
   ```

4. **分页持久化**：刷新页面后保留分页状态
   ```typescript
   const page = reactive({
     index: Number(sessionStorage.getItem('pageIndex')) || 1,
     size: Number(sessionStorage.getItem('pageSize')) || 10
   })
   const changePage = (val) => {
     page.index = val
     sessionStorage.setItem('pageIndex', val.toString())
     getData()
   }
   ```

5. **表单验证复用**：提取常用验证规则
   ```typescript
   const requiredRule = (message) => ({ required: true, message, trigger: 'blur' })
   const emailRule = { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
   ```

## 组件扩展

### 新增自定义列类型

编辑 `table-custom.vue`，在 `<template #default>` 中添加新类型：

```vue
<template #default="{ row }">
  <!-- 新增 image 类型 -->
  <el-image v-if="item.type === 'image'" :src="row[item.prop]" style="width: 50px; height: 50px" />

  <!-- 新增 link 类型 -->
  <el-link v-if="item.type === 'link'" :href="row[item.prop]" target="_blank">
    查看
  </el-link>

  <!-- 原有逻辑 -->
  <span v-else>{{ row[item.prop] }}</span>
</template>
```

### 新增自定义表单类型

编辑 `table-edit.vue`，添加新表单项：

```vue
<!-- 新增 file-upload 类型 -->
<el-upload v-else-if="item.type === 'file-upload'" :action="uploadUrl">
  <el-button type="primary">上传文件</el-button>
</el-upload>
```

## 常见问题

### 1. 如何实现表格多选后批量删除？

`TableCustom` 已内置多选功能，使用 `multipleSelection` 属性：

```typescript
<TableCustom :delSelection="handleBatchDelete"/>

const handleBatchDelete = (selection: any[]) => {
  const ids = selection.map(item => item.id)
  ElMessageBox.confirm(`确定要删除选中的 ${ids.length} 条记录吗?`, '提示', {
    type: 'warning'
  }).then(async () => {
    await batchDeleteUsers(ids)
    ElMessage.success('批量删除成功')
    getData()
  })
}
```

### 2. 如何实现表格排序？

在列配置中添加 `sortable: true`：

```typescript
{ prop: 'created_at', label: '创建时间', sortable: true }
```

### 3. 如何实现表格导出？

工具栏添加导出按钮：

```vue
<template #toolbarBtn>
  <el-button type="success" @click="handleExport">导出 Excel</el-button>
</template>
```

```typescript
const handleExport = () => {
  const data = tableData.value
  // 使用 xlsx 或后端接口导出
  exportToExcel(data, 'users.xlsx')
}
```

## 下一步

- 阅读 [新增权限指南](../development-guide/add-new-permission) 学习完整的开发流程
- 查看 [权限控制](./permission-control) 了解如何集成权限
- 学习 [连接配置](./connection-config) 了解后端地址管理

---

**提示**：Table 组件是 Process-Card 快速开发的核心。掌握这套组件，可以在 10 分钟内完成一个完整的 CRUD 页面！
