<template>
  <div class="home_container">
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <!-- logo -->
        <div class="avator_box">
          <img src="@/assets/logo.png" alt="Vue后台管理系统" @click="$router.push('/login')" />
        </div>
        <!-- 退出登录 -->
        <el-button type="primary" @click="logout">退出</el-button>
      </el-header>
      <!-- 主体区域 -->
      <el-container>
        <!-- 侧边栏区域 -->
        <el-aside width="200px">
          <el-menu
            unique-opened
            router
            background-color="#e4f5ef"
            text-color="#2c3e50"
            active-text-color="#42b983"
            :default-active="$route.path"
          >
            <!-- 一级菜单 -->
            <el-submenu :index="menu.path" v-for="menu in menuList" :key="menu.id">
              <template slot="title">
                <i class="iconfont" :class="iconMap[menu.path]"></i>
                <span>{{ menu.authName }}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item :index="'/' + subMenu.path" v-for="subMenu in menu.children" :key="subMenu.id">
                <template slot="title">
                  <span>{{ subMenu.authName }}</span>
                </template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 内容区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      menuList: [],
      iconMap: {
        users: 'icon-yonghuguanli',
        rights: 'icon-zhanghaoquanxianguanli',
        goods: 'icon-goods',
        orders: 'icon-dingdanguanli',
        reports: 'icon-shujutongji'
      }
    }
  },
  methods: {
    logout () {
      sessionStorage.removeItem('token')
      this.$msg.success('退出登录成功')
      this.$router.push('/login')
    }
  },
  async created () {
    const { data: res } = await this.$http.get('menus')
    if (res.meta.status !== 200) return this.$msg.error('获取菜单失败')
    this.menuList = res.data
  }
}
</script>

<style lang="less" scoped>
.home_container {
  height: 100%;

  .el-container {
    height: 100%;
  }

  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #bbe6d6;
  }

  .avator_box {
    height: 80%;
    background-color: #eee;
    border: 1px solid white;
    box-sizing: border-box;
    border-radius: 50%;

    img {
      height: 100%;
      cursor: pointer;
    }
  }

  .el-aside {
    height: 100%;
    background-color: #e4f5ef;

    .iconfont {
      margin-right: 10px;
    }
  }
}
</style>
