<template>
  <div class="container">
    <el-card class="card">
      <div class="title">修改密码</div>
      <el-form ref="formRef" :model="user" :rules="rules" label-width="140px" class="form">
        <el-form-item label="原始密码" prop="password">
          <el-input show-password v-model="user.password" placeholder="请输入原始密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input show-password v-model="user.newPassword" placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input show-password v-model="user.confirmPassword" placeholder="请再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="update" style="width: 100%">确认修改</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>


<script>
export default {
  name: "Password",
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请确认密码'))
      } else if (value !== this.user.newPassword) {
        callback(new Error('确认密码错误'))
      } else {
        callback()
      }
    }

    return {
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        password: [
          { required: true, message: '请输入原始密码', trigger: 'blur' },
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
        ],
        confirmPassword: [
          { validator: validatePassword, required: true, trigger: 'blur' },
        ],
      }
    }
  },
  created() {

  },
  methods: {
    update() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$request.put('/updatePassword', this.user).then(res => {
            if (res.code === '200') {
              // 成功更新
              localStorage.removeItem('xm-user')   // 清除缓存的用户信息
              this.$message.success('修改密码成功')
              this.$router.push('/login')
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
  }
}
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f6f7fb;
}

.card {
  width: 420px;
  padding: 30px 30px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  font-size: 20px;
  color: #333;
  margin-bottom: 25px;
  font-weight: bold;
}

.form >>> .el-form-item__label {
  white-space: nowrap;
  font-weight: bold;
}

>>> .el-form-item__label {
  font-weight: bold;
  white-space: nowrap;
}

a {
  color: #2a60c9;
}
</style>
