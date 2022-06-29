<template>
  <div class="rights_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-table :data="rights" border stripe style="width: 100%">
        <el-table-column prop="id" label="权限ID" width="180"> </el-table-column>
        <el-table-column prop="authName" label="权限名称" width="380"> </el-table-column>
        <el-table-column prop="path" label="路径" width="380" :filters="pathFilters" :filter-method="filterPath">
        </el-table-column>
        <el-table-column label="等级" :filters="levelFilters" :filter-method="filterLevel">
          <template scope="scope">
            <el-tag type="danger" v-if="scope.row.level == 0">一级</el-tag>
            <el-tag type="warning" v-else-if="scope.row.level == 1">二级</el-tag>
            <el-tag type="success" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      rights: [],
      pathFilters: [],
      levelFilters: [
        { text: '一级', value: '0' },
        { text: '二级', value: '1' },
        { text: '三级', value: '2' }
      ]
    }
  },
  async created() {
    const { data: res } = await this.$http.get('rights/list')
    if (res.meta.status !== 200) return this.$msg.error('获取权限列表失败')
    this.rights = res.data

    // pathFilters
    const set = new Set()
    this.rights.forEach(({ path }) => {
      set.add(path) // 去重
    })
    set.forEach(path => {
      this.pathFilters.push({ text: path, value: path })
    })
  },
  methods: {
    filterLevel(val, row) {
      return row.level === val
    },
    filterPath(val, row) {
      return row.path === val
    },
    getIndex() {}
  }
}
</script>

<style lang="less" scoped>
.rights_container {
  height: 100%;
  .el-card {
    margin-top: 20px;
  }
}
</style>
