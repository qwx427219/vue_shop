<template>
  <div class="roles_container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input
            placeholder="请输入要查询的角色名称"
            prefix-icon="el-icon-search"
            v-model.trim="keyWords"
            @change="searchRole"
            clearable
            @clear="getRoles()"
          >
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="roles" border stripe style="width: 100%">
        <!-- 展开列 -->
        <el-table-column type="expand" width="50">
          <!-- 角色权限视图 -->
          <template scope="{row}">
            <!-- 没有权限的角色 -->
            <el-row v-if="!row.children.length" class="no_rights">
              <span style="color: red">该角色尚未配置任何权限</span>
            </el-row>
            <!-- 有权限的角色 -->
            <el-row
              v-else
              v-for="right in row.children"
              :key="right.id"
              class="rights level1"
              type="flex"
              align="middle"
            >
              <!-- 一级权限 -->
              <el-col :span="3">
                <el-tag type="danger" closable @close="deleteRoleRight(row, right.id)">{{ right.authName }}</el-tag>
              </el-col>
              <el-col :span="21">
                <el-row
                  v-for="subright in right.children"
                  :key="subright.id"
                  class="rights level2"
                  type="flex"
                  align="middle"
                >
                  <!-- 二级权限 -->
                  <el-col :span="3">
                    <el-tag type="warning" closable @close="deleteRoleRight(row, subright.id)">{{
                      subright.authName
                    }}</el-tag>
                  </el-col>
                  <el-col :span="21" class="level3 rights">
                    <!-- 三级权限 -->
                    <el-tag
                      type="success"
                      closable
                      @close="deleteRoleRight(row, grandright.id)"
                      v-for="grandright in subright.children"
                      class="grand_rights"
                      :key="grandright.id"
                    >
                      {{ grandright.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 角色名称 -->
        <el-table-column prop="roleName" label="角色名称" width="400"> </el-table-column>
        <!-- 角色描述 -->
        <el-table-column prop="roleDesc" label="角色描述" width="400"> </el-table-column>
        <!-- 操作 -->
        <el-table-column label="操作">
          <template scope="scope">
            <!-- 编辑 -->
            <el-button type="primary" icon="iconfont icon-xiugai" size="mini" @click="getRole(scope.row)">
              编辑
            </el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="iconfont icon-shanchu" size="mini" @click="deleteRole(scope.row.id)">
              删除
            </el-button>
            <!-- 分配权限 -->
            <el-button
              type="warning"
              icon="iconfont icon-assignPermissions-o"
              size="mini"
              @click="getAllocRightsRole(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" :before-close="cancelAddRole">
      <el-form :model="addUserForm" :rules="editRoleFormRules" ref="addUserFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addUserForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addUserForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddRole">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%" :before-close="cancelEditRole">
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditRole">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限 -->
    <el-dialog title="分配权限" :visible.sync="allocRightsDialogVisible" width="50%">
      <el-tree
        ref="rightsTreeRef"
        :data="allRights"
        :props="{ label: 'authName', children: 'children' }"
        node-key="id"
        :default-checked-keys="roleRights"
        show-checkbox
        default-expand-all
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allocRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      /* 角色列表 */
      roles: [],
      /* 查询角色 */
      keyWords: '',
      /* 修改角色 */
      editRoleDialogVisible: false,
      editRoleForm: {},
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请填写角色名称', trigger: 'blur' },
          { min: 1, max: 16, message: '角色名称不要超过16个字符', trigger: 'blur' }
        ],
        roleDesc: [{ min: 0, max: 128, message: '角色描述不要超过128个字符', trigger: 'blur' }]
      },
      /* 分配权限 */
      allocRightsDialogVisible: false,
      allRights: [],
      role: {},
      roleRights: [],
      /* 添加角色 */
      addRoleDialogVisible: false,
      addUserForm: {
        roleName: '',
        roleDesc: ''
      }
    }
  },
  methods: {
    /* 查询角色 */
    async searchRole() {
      await this.getRoles()
      this.roles = this.roles.filter(role => {
        return role.roleName.indexOf(this.keyWords) !== -1
      })
    },
    async getRoles() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$msg.error('获取角色列表失败')
      this.roles = res.data
    },
    /* 刷新表格角色列表 */
    getRole({ id, roleName, roleDesc }) {
      this.editRoleForm = { id, roleName, roleDesc }
      this.editRoleDialogVisible = true
    },
    /* 修改角色 */
    cancelEditRole() {
      this.$refs.editRoleFormRef.resetFields()
      this.editRoleForm = {}
      this.editRoleDialogVisible = false
    },
    editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.editRoleForm.id}`, this.editRoleForm)
        if (res.meta.status !== 200) return this.$msg.error('修改角色失败')
        this.$msg.success('修改角色成功')
        this.$refs.editRoleFormRef.resetFields()
        // 更新表格数据
        this.getRoles()
        this.editRoleDialogVisible = false
      })
    },
    /* 删除角色 */
    deleteRole(id) {
      this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${id}`)
          if (res.meta.status !== 200) return this.$msg.error('删除角色失败!')
          this.getRoles()
          this.$msg.success('删除角色成功!')
        })
        .catch(() => {
          this.$msg.info('已取消删除')
        })
    },
    /* 分配权限 */
    async getAllocRightsRole(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$msg.erro('获取权限列表失败')
      this.allRights = res.data
      this.role = role

      // 清空上次roleRight缓存
      this.roleRights = []
      this.getRoleRightId(role.children)

      this.allocRightsDialogVisible = true
    },
    getRoleRightId(rights) {
      for (let i = 0; i < rights.length; i++) {
        this.roleRights.push(rights[i].id)
        if (rights[i].children) {
          this.getRoleRightId(rights[i].children)
        }
      }
    },
    async allocRights() {
      const rids = this.$refs.rightsTreeRef.getCheckedKeys().join(',')
      const { data: res } = await this.$http.post(`roles/${this.role.id}/rights`, { rids })
      if (res.meta.status !== 200) return this.$msg.error('更新角色权限失败')
      this.$msg.success('更新角色权限成功')
      this.getRoles()
      this.allocRightsDialogVisible = false
    },
    /* 添加角色 */
    cancelAddRole() {
      this.$refs.addUserFormRef.resetFields()
      this.addRoleDialogVisible = false
    },
    addRole() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addUserForm)
        if (res.meta.status !== 201) return this.$msg.error('添加角色失败')
        this.$msg.success('添加角色成功')
        this.$refs.addUserFormRef.resetFields()
        // 刷新表格角色数据
        this.getRoles()
        this.addRoleDialogVisible = false
      })
    },
    /* 删除角色的权限 */
    deleteRoleRight(role, rightId) {
      this.$confirm('此操作将删除当前角色的该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
          if (res.meta.status !== 200) return this.$msg.error('删除角色权限失败')
          this.$msg.success('删除角色权限成功!')
          role.children = res.data
          // 刷新表格数据
          // this.getRoles()
        })
        .catch(() => {
          this.$msg.info('已取消删除')
        })
    }
  },
  async created() {
    this.getRoles()
  }
}
</script>

<style lang="less" scoped>
.roles_container {
  height: 100%;
  .el-card {
    margin-top: 20px;
    .el-table {
      margin-top: 20px;
    }
  }
}

.no_rights {
  display: flex;
  justify-content: space-around;
}

.rights {
  padding: 20px;
}

.grand_rights {
  margin: 7px;
}

.level1 {
  background-color: #f9fafc;
  border-bottom: 1px solid #ccc;
}

.level2 {
  background-color: #e5e9f2;
}

.level3 {
  background-color: #d3dce6;
}
</style>
>
