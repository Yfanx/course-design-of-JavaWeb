<template>
  <div>
    <!-- 顶部校徽 -->
    <div class="logo-container">
      <img src="@/assets/imgs/logo.jpg" alt="Logo" class="school-logo" />
    </div>

    <!-- 注册容器 -->
    <div class="login-container">
      <div class="login-title2">欢迎注册论坛</div>
      <div class="login-title">创建你的账户</div>

      <div class="login-content">
        <div class="login-left">
          <el-form :model="form" :rules="rules" ref="formRef">
            <div class="form-group">
              <label>账号</label>
              <el-input v-model="form.username" placeholder="请输入账号"></el-input>
            </div>
            <div class="form-group">
              <label>密码</label>
              <el-input v-model="form.password" show-password placeholder="请输入密码"></el-input>
            </div>
            <div class="form-group">
              <label>确认密码</label>
              <el-input v-model="form.confirmPass" show-password placeholder="请确认密码"></el-input>
            </div>
            <div class="form-group">
              <label>验证码</label>
              <div class="sms-box">
                <el-input v-model="code" placeholder="请输入验证码"></el-input>
                <Identify :identifyCode="identifyCode" @click.native="refreshCode" />
              </div>
            </div>
            <el-button class="submit-btn" @click="register">注册</el-button>
          </el-form>
        </div>
      </div>

      <!-- 协议及跳转 -->
      <div class="login-footer">
        已有账号？<a href="/login">点击登录</a>
      </div>
    </div>
  </div>
</template>

<script>
import Identify from '@/components/Identify.vue';

export default {
  name: 'Register',
  components: { Identify },
  data() {
    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请确认密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    return {
      form: {
        username: '',
        password: '',
        confirmPass: '',
        role: 'USER'
      },
      code: '',
      identifyCode: '',
      identifyCodes: '123456789ABCDEFGHGKMNPQRSTUVWXY',
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPass: [{ validator: validatePassword, trigger: 'blur' }]
      }
    };
  },
  mounted() {
    this.refreshCode();
  },
  methods: {
    refreshCode() {
      this.identifyCode = '';
      for (let i = 0; i < 4; i++) {
        this.identifyCode += this.identifyCodes[Math.floor(Math.random() * this.identifyCodes.length)];
      }
    },
    register() {
      if (!this.code) {
        this.$message.warning('请输入验证码');
        this.refreshCode();
        return;
      }
      if (this.code.toLowerCase() !== this.identifyCode.toLowerCase()) {
        this.$message.warning('验证码错误');
        this.refreshCode();
        return;
      }
      this.$refs['formRef'].validate((valid) => {
        if (valid) {
          this.$request.post('/register', this.form).then((res) => {
            if (res.code === '200') {
              this.$router.push('/login');
              this.$message.success('注册成功');
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    }
  }
};
</script>

<style scoped>
@import '@/assets/css/login-style.css';
</style>