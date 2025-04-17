<template>
  <div>
    <!-- 语言切换按钮 -->
    <div class="lang-switch">
      <button @click="switchLang('zh')">中文</button>
      <button @click="switchLang('en')">English</button>
    </div>

    <!-- 顶部校徽 -->
    <div class="logo-container">
      <img src="@/assets/imgs/logo.jpg" alt="Logo" class="school-logo" />
    </div>

    <!-- 登录容器 -->
    <div class="login-container">
      <div class="login-title2">{{ text.mainTitle2 }}</div>
      <div class="login-title">{{ text.mainTitle }}</div>
      <div class="login-xuehaoxingming">{{ text.xuehaoxingming }}</div>

      <div class="login-content">
        <!-- 左侧登录表单 -->
        <div class="login-left">
          <div class="panel active">
            <h2>{{ text.pwdPanelTitle }}</h2>

            <div class="form-group">
              <label>{{ text.lblPwdAccount }}</label>
              <el-input v-model="form.username" :placeholder="text.lblPwdAccount" />
            </div>
            <div class="form-group">
              <label>{{ text.lblPwdPassword }}</label>
              <el-input v-model="form.password" show-password :placeholder="text.lblPwdPassword" />
            </div>
            <div class="form-group">
              <label>{{ text.lblCode }}</label>
              <div class="sms-box">
                <el-input v-model="code" :placeholder="text.lblCode" />
                <Identify :identifyCode="identifyCode" @click.native="refreshCode" />
              </div>
            </div>
            <el-button class="submit-btn" @click="login">{{ text.btnPwdSubmit }}</el-button>
          </div>
        </div>
      </div>

      <!-- 底部协议 -->
      <div class="login-footer" style="margin-top: 6px;">
        {{ text.noAccount }} <a href="/register">{{ text.registerLink }}</a>
      </div>
      <div class="login-footer" v-html="text.footerText"></div>
    </div>
  </div>
</template>

<script>
import Identify from '@/components/Identify.vue';

const textZh = {
  mainTitle2: "欢迎来到论坛",
  mainTitle: "登录进入论坛",
  xuehaoxingming: "学号：220162401051 姓名：应亚炫",
  pwdPanelTitle: "密码登录",
  lblPwdAccount: "账号 / 手机号",
  lblPwdPassword: "密码",
  lblCode: "验证码",
  btnPwdSubmit: "登录",
  noAccount: "还没有账号？",
  registerLink: "点击注册",
  footerText: '注册/登录即表示您同意 <a href="#" id="agreementLink">用户协议</a> 和 <a href="#" id="privacyLink">隐私政策</a>'
};

const textEn = {
  mainTitle2: "Welcome to the forum",
  mainTitle: "Log in to the forum",
  xuehaoxingming: "Student ID:220162401051 Name:Yaxuan Ying",
  pwdPanelTitle: "Password Login",
  lblPwdAccount: "Account / Phone",
  lblPwdPassword: "Password",
  lblCode: "Verification Code",
  btnPwdSubmit: "Login",
  noAccount: "Don't have an account?",
  registerLink: "Click to register",
  footerText: 'By signing up/logging in, you agree to the <a href="#" id="agreementLink">User Agreement</a> and <a href="#" id="privacyLink">Privacy Policy</a>'
};

export default {
  name: 'Login',
  components: { Identify },
  data() {
    return {
      lang: 'zh',
      texts: { zh: textZh, en: textEn },
      form: { username: '', password: '', role: 'USER' },
      code: '',
      identifyCode: '',
      identifyCodes: '123456789ABCDEFGHGKMNPQRSTUVWXY'
    };
  },
  computed: {
    text() {
      return this.texts[this.lang];
    }
  },
  mounted() {
    this.refreshCode();
  },
  methods: {
    switchLang(lang) {
      this.lang = lang;
    },
    refreshCode() {
      this.identifyCode = '';
      for (let i = 0; i < 4; i++) {
        this.identifyCode += this.identifyCodes[Math.floor(Math.random() * this.identifyCodes.length)];
      }
    },
    login() {
      if (!this.code) {
        this.$message.warning(this.lang === 'zh' ? '请输入验证码' : 'Please enter the code');
        this.refreshCode();
        return;
      }
      if (this.code.toLowerCase() !== this.identifyCode.toLowerCase()) {
        this.$message.warning(this.lang === 'zh' ? '验证码错误' : 'Incorrect code');
        this.refreshCode();
        return;
      }

      if (this.form.username === 'admin') {
        this.form.role = 'ADMIN';
      } else {
        this.form.role = 'USER';
      }

      this.$request.post('/login', this.form).then(res => {
        if (res.code === '200') {
          localStorage.setItem("xm-user", JSON.stringify(res.data));
          this.$message.success(this.lang === 'zh' ? '登录成功' : 'Login successful');
          setTimeout(() => {
            if (res.data.role === 'ADMIN') {
              location.href = '/home';
            } else {
              location.href = '/front/home';
            }
          }, 500);
        } else {
          this.refreshCode();
          this.$message.error(res.msg);
        }
      });
    }
  }
};
</script>

<style scoped>
@import '@/assets/css/login-style.css';
</style>