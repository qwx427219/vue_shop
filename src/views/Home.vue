<template>
  <div class="home_container">
    <el-container>
      <el-header>
        <el-button @click="logout">退出</el-button>
      </el-header>
      <el-container>
        <el-aside width="200px">Aside</el-aside>
        <el-main>Main</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    logout(){
      sessionStorage.removeItem('token')
      this.$msg.success('退出登录成功')
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped>
  .home_container {
    height: 100%;

    .el-header {
      display: flex;
      justify-content: end;
      align-items: center;
    }
  }
</style>
