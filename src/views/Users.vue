<template>
  <div class="users_contanier">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索和添加用户 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model.trim="queryInfo.query"
            @change="searchUser(true)"
            prefix-icon="el-icon-search"
          >
            <!-- <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button> -->
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addUserDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表表格 -->
      <el-table :data="users" style="width: 100%" border stripe>
        <el-table-column prop="username" label="用户" width="180"> </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="updateUserState(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template scope="scope">
            <el-tooltip class="item" effect="dark" content="修改用户" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="getUpdatedUser(scope.row)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="删除用户" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button
                type="warning"
                icon="iconfont icon-shezhi"
                size="mini"
                @click="getAllocRoleUser(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="searchUser(false)"
        @current-change="searchUser(false)"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size.sync="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" width="50%" :before-close="cancelAddUser">
        <el-form :model="addUserForm" :rules="addUserFormRules" ref="addUserFormRef" label-width="100px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model.trim="addUserForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model.trim="addUserForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="addUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model.trim="addUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelAddUser">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户对话框 -->
      <el-dialog
        title="修改用户信息"
        :visible.sync="updateUserDialogVisible"
        width="50%"
        :before-close="cancelUpdateUser"
      >
        <el-form :model="updateUserForm" :rules="updateUserFormRules" ref="updateUserFormRef" label-width="100px">
          <el-form-item label="用户名">
            <el-input v-model.trim="updateUserForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model.trim="updateUserForm.email"></el-input>
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input v-model.trim="updateUserForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelUpdateUser">取 消</el-button>
          <el-button type="primary" @click="updateUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配角色对话框 -->
      <el-dialog title="提示" :visible.sync="allocRoleDialogVisible" width="30%" :before-close="cancelAllocRole">
        <el-row :gutter="20">
          <el-col :span="12">
            <p>用户名: {{ allocRoleUser.username }}</p>
          </el-col>
          <el-col :span="12">
            <p>当前角色: {{ allocRoleUser.role_name }}</p>
          </el-col>
        </el-row>
        <el-select v-model="targetRoleId" placeholder="请选择">
          <el-option v-for="role in roles" :key="role.id" :label="role.roleName" :value="role.id"> </el-option>
        </el-select>
        <span slot="footer" class="dialog-footer">
          <el-button @click="cancelAllocRole">取 消</el-button>
          <el-button type="primary" @click="allocRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    const validateEmail = (rule, value, callback) => {
      if (!value) return callback()
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (!regEmail.test(value)) return callback(new Error('邮箱格式不正确'))
      callback()
    }

    const validateMobile = (rule, value, callback) => {
      if (!value) return callback()
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (!regMobile.test(value)) return callback(new Error('手机格式不正确'))
      callback()
    }

    return {
      // 表格用户列表数据源,created时初始化
      users: [],
      // searchUser的query params，并且绑定了分页的当前页和每页数据个数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      // 分页的总条数
      total: 0,
      /* 添加用户 */
      addUserDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addUserFormRules: {
        username: [
          { required: true, message: '请输入登录用户名', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 10, message: '长度在 6 到 10 个字符', trigger: 'blur' }
        ],
        email: [{ validator: validateEmail, trigger: 'blur' }],
        mobile: [{ validator: validateMobile, trigger: 'blur' }]
      },
      /* 修改用户 */
      updateUserDialogVisible: false,
      updateUserForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      updateUserFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: validateEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ]
      },
      /* 分配角色 */
      allocRoleDialogVisible: false,
      allocRoleUser: {},
      roles: [],
      targetRoleId: ''
    }
  },
  async created() {
    const { data: res } = await this.$http.get('users', {
      params: this.queryInfo
    })

    if (res.meta.status !== 200) return this.$msg.error('获取用户列表失败')
    this.users = res.data.users
    this.total = res.data.total
    this.queryInfo.pagenum = res.data.pagenum
  },
  methods: {
    /* 查询用户列表 */
    async searchUser(research) {
      // searchUser不仅用于查询用户列表，还可以在用户列表变动后更新表格中用户列表
      // research是判断 查询静态（false）的用户列表，还是动态(true)的用户列表，比如分页导致的searchUser就是静态的，而添加用户后的searUser就是动态的，此时需要重置分页
      if (research) {
        this.queryInfo.pagenum = 1
      }

      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) return this.$msg.error('查询用户失败')
      this.users = res.data.users
      this.total = res.data.total
      this.queryInfo.pagenum = res.data.pagenum
    },
    /* 添加用户 */
    addUser() {
      this.$refs.addUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) return this.$msg.error('添加用户失败')
        this.$msg.success('添加用户成功')
        this.addUserDialogVisible = false
        // 刷新表格数据
        this.searchUser(true)
      })
    },
    cancelAddUser() {
      this.$refs.addUserFormRef.resetFields()
      this.addUserDialogVisible = false
    },
    /* 更新用户状态 */
    async updateUserState({ id, mg_state: state }) {
      const { data: res } = await this.$http.put(`users/${id}/state/${state}`)
      if (res.meta.status !== 200) return this.$msg.error('更新用户状态失败')
      this.$msg.success('更新用户状态成功')
      // 刷新表格数据
      // this.searchUser(true)
    },
    /* 更新用户 */
    getUpdatedUser(user) {
      this.updateUserForm.username = user.username
      this.updateUserForm.id = user.id
      this.updateUserForm.email = user.email
      this.updateUserForm.mobile = user.mobile

      this.updateUserDialogVisible = true
    },
    updateUser() {
      this.$refs.updateUserFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`users/${this.updateUserForm.id}`, this.updateUserForm)

        if (res.meta.status !== 200) return this.$msg.error('更新用户信息失败')
        this.$msg.success('更新用户信息成功')
        this.updateUserDialogVisible = false
        // 刷新表格数据
        this.searchUser(false)
      })
    },
    cancelUpdateUser() {
      this.$refs.updateUserFormRef.resetFields()
      this.updateUserDialogVisible = false
    },
    /* 删除用户 */
    async deleteUser(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`users/${id}`)
          if (res.meta.status !== 200) return this.$msg.error('删除用户失败')
          this.$msg.success('删除成功!')
          // 刷新表格数据
          this.searchUser(true)
        })
        .catch(() => {
          this.$msg.info('已取消删除')
        })
    },
    /* 分配角色 */
    async getAllocRoleUser(user) {
      // 记录当前用户
      this.allocRoleUser = user
      // 获取角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$msg.error('获取角色列表失败')
      this.roles = res.data
      this.allocRoleDialogVisible = true
    },
    cancelAllocRole() {
      // 清理targetRoleId,allocRoleUser
      this.targetRoleId = ''
      this.allocRoleUser = {}
      this.allocRoleDialogVisible = false
    },
    async allocRole() {
      const { data: res } = await this.$http.put(`users/${this.allocRoleUser.id}/role`, {
        rid: this.targetRoleId
      })
      if (res.meta.status !== 200) return this.$msg.error('分配角色失败')
      this.$msg.success('分配角色成功')
      // 清理targetRoleId,allocRoleUser
      this.targetRoleId = ''
      this.allocRoleUser = {}
      this.allocRoleDialogVisible = false

      // 刷新表格数据
      this.searchUser(false)
    }
  }
}
</script>

<style lang="less" scoped>
.users_contanier {
  height: 100%;

  .el-card {
    margin-top: 20px;
  }

  .el-table {
    margin-top: 20px;
  }

  .el-pagination {
    margin-top: 20px;
  }
}
</style>
