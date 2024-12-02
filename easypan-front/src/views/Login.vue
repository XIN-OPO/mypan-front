<template>
  <div class="login-body">
    <div class="bg"></div>
    <div class="login-panel">
      <el-form class="login-register" :model="formData" :rules="rules" ref="formDataRef" @submit.prevent="doSubmmit">
        <div class="login-title">myPan</div>
        <el-form-item prop="email">
          <el-input size="large" clearable placeholder="请输入邮箱" v-model.trim="formData.email" maxLength="150">
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
          <!-- 登陆密码 -->
        </el-form-item>
        <el-form-item prop="password" v-if="opType == 1">
          <el-input type="password" size="large" clearable placeholder="请输入密码" v-model.trim="formData.password"
            show-password>
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
        <!-- 注册 -->
        <div v-if="opType == 0 || opType == 2">
          <!--input输入-->
          <el-form-item prop="emailCode">
            <div class="send-email-panel">
              <el-input size="large" clearable placeholder="请输入邮箱验证码" v-model="formData.emailCode">
                <template #prefix>
                  <span class="iconfont icon-checkcode"></span>
                </template>
              </el-input>
              <el-button class="send-email-btn" type="primary" size="large" @click="getEmailCode">
                获取验证码
              </el-button>
            </div>
            <el-popover placement="left" :width="500" trigger="click">
              <div>
                <p>在垃圾邮箱中查找邮箱验证码</p>
                <p>在邮箱中头像-设置-反垃圾-白名单-设置邮件地址白名单</p>
                <p>将邮箱添加到白名单不知道怎么设置？</p>
              </div>
              <template #reference>
                <span class="a-link" :style="{ 'font-size': '14px' }">
                  未收到邮箱验证码？
                </span>
              </template>
            </el-popover>
          </el-form-item>

          <!--input输入-->
          <el-form-item prop="nickName" v-if="opType == 0">
            <el-input size="large" clearable placeholder="请输入昵称" v-model="formData.nickName" maxLength="20">
              <template #prefix>
                <span class="iconfont icon-account">

                </span>
              </template>
            </el-input>
          </el-form-item>
          <!--注册密码，找回密码-->
          <el-form-item prop="registerPassword">
            <el-input clearable placeholder="请输入密码" v-model.trim="formData.registerPassword" type="password"
              size="large" show-password>
              <template #prefix>
                <span class="iconfont icon-password">

                </span>
              </template>
            </el-input>
          </el-form-item>
          <!-- 重复密码 -->
          <el-form-item prop="reRegisterPassword">
            <el-input clearable placeholder="确认密码" v-model.trim="formData.reRegisterPassword" type="password"
              size="large" show-password>
              <template #prefix>
                <span class="iconfont icon-password">

                </span>
              </template>
            </el-input>
          </el-form-item>
        </div>


        <!-- 验证码 -->
        <el-form-item prop="checkCode">
          <div class="check-code-panel">
            <el-input clearable size="large" placeholder="请输入验证码" v-model="formData.checkCode" @keyup.enter="doSubmmit">
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl" class="check-code" @click="changeCheckCode(0)" />
          </div>
        </el-form-item>

        <el-form-item v-if="opType == 1">
          <div class="rememberme-panel">
            <el-checkbox v-model="formData.rememberMe">
              记住我
            </el-checkbox>
          </div>
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(2)">忘记密码</a>
            <a href="javascript:void(0)" class="a-link" @click="showPanel(0)">没有账号</a>
          </div>
        </el-form-item>

        <el-form-item v-if="opType == 2">
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">去登陆</a>
          </div>
        </el-form-item>
        <el-form-item v-if="opType == 0">
          <div class="no-account">
            <a href="javascript:void(0)" class="a-link" @click="showPanel(1)">已有账号</a>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="op-btn" size="large" @click="doSubmmit">
            <span v-if="opType == 0">注册</span>
            <span v-if="opType == 1">登陆</span>
            <span v-if="opType == 2">重置密码</span>
          </el-button>
        </el-form-item>

      </el-form>
    </div>
    <Dialog :show="dialogConfig4SendMailCode.show" :title="dialogConfig4SendMailCode.title"
      :buttons="dialogConfig4SendMailCode.buttons" width="500px" :showCancel="false"
      @close="dialogConfig4SendMailCode.show = false">
      <el-form :model="formDataSendMailCode" :rules="rules" ref="formDataRefSendMailCode" label-width="80px"
        @submit.prevent>
        <!--input输入-->
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>

        <el-form-item label="验证码" prop="checkCode">
          <div class="check-code-panel">
            <el-input clearable size="large" placeholder="请输入验证码" v-model="formDataSendMailCode.checkCode">
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img :src="checkCodeUrl4SendMailCode" class="check-code" @click="changeCheckCode(1)" />
          </div>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>

import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import md5 from "js-md5";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  checkCode: "/api/checkCode",
  sendEmailCode: "/sendEmailCode",
  register: "/register",
  login: "/login",
  resetPwd: "/resetPwd",
  qqLogin:"/qqLogin"
}
//操作类型 0：注册 1：登录 2：重置密码
const opType = ref(1);
const showPanel = (type) => {
  opType.value = type;
  resetForm();
}
onMounted(() => {
  showPanel(1);
})

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    callback(new Error(rule.message));
  } else {
    callback;
  }
}
const formData = ref({});
const formDataRef = ref();
const rules = {
  email: [{ required: true, message: "请输入正确的邮箱" }, { validator: proxy.Verify.email, message: "请输入正确的邮箱" }],
  password: [
    {
      required: true, message: "请输入密码"
    },
  ],
  emailCode: [{ required: true, message: "请输入邮箱验证码" }],
  nickName: [{ required: true, message: "请输入昵称" }],
  // registerPassword: [ 
  //   { required: true, message: "请输入密码" },
  //   { validator: proxy.Verify.password, message: "密码只能是数字字母特殊字符，8-18位" }
  // ],
  // reRegisterPassword: [
  //   { validator: checkRePassword, message: "两次输入密码不一致" }
  // ],
  checkCode: [{
    required: true, message: "请输入验证码",
  }]
};
const checkCodeUrl = ref(api.checkCode);
const checkCodeUrl4SendMailCode = ref(api.checkCode);
const changeCheckCode = (type) => {
  if (type == 0) {
    checkCodeUrl.value = api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  } else {
    checkCodeUrl4SendMailCode.value = api.checkCode + "?type=" + type + "&time=" + new Date().getTime();
  }
};
//发送邮箱验证码
const formDataSendMailCode = ref({});
const formDataRefSendMailCode = ref();

const dialogConfig4SendMailCode = reactive({
  show: false,
  title: "发送邮箱验证码",
  buttons: [
    {
      type: "primary",
      text: "发送验证码",
      click: (e) => {
        sendEmailCode();
      },
    },
  ],
});

const getEmailCode = () => {
  formDataRef.value.validateField("email", (valid) => {
    if (!valid) {
      return;
    }
    dialogConfig4SendMailCode.show = true;
    nextTick(() => {
      changeCheckCode(1);
      formDataRefSendMailCode.value.resetFields();
      formDataSendMailCode.value = {
        email: formData.value.email,
      };
    });
  });
}
const register = async () => {
  let params = {};
  Object.assign(params, formData.value);
  params.password = params.registerPassword;
  delete params.reRegisterPassword;
  delete params.registerPassword;
  let result = await proxy.Request({
    url: api.register,
    params: params,
    errorCallback: () => {
      changeCheckCode(0);
    }
  })
  if (!result) {
    return;
  }
  proxy.Message.success("注册成功");
  showPanel(1);
}

//登录 注册 重置密码 提交表单
const doSubmmit = () => {

  console.log('当前操作类型:', opType.value);
  console.log('表单数据:', formData.value);

  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let params = {};
    Object.assign(params, formData.value);
    //注册
    if (opType.value == 0 || opType.value == 2) {
      params.password = params.registerPassword;
      delete params.reRegisterPassword;
      delete params.registerPassword;
    }
    //登录
    if (opType.value == 1) {
      let cookieLoginInfo = proxy.VueCookies.get("loginInfo");
      let cookiePassword = cookieLoginInfo == null ? null : cookieLoginInfo.password;
      if (params.password != cookiePassword) {
        params.password = md5(params.password);
      }
    }
    let url = null;
    if (opType.value == 0) {
      url = api.register;
    } else if (opType.value == 1) {
      url = api.login;
    } else if (opType.value == 2) {
      url = api.resetPwd;
    }
    let result = await proxy.Request({
      url: url,
      params: params,
      errorCallback: () => {
        changeCheckCode(0);
      }
    })
    if (!result) {
      return;
    }
    if (opType.value == 0) {
      proxy.Message.success("注册成功");
      showPanel(1);

    } else if (opType.value == 1) {
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe,
        };
        proxy.VueCookies.set("loginInfo", loginInfo, "7d");
      } else {
        proxy.VueCookies.remove("loginInfo")
      }
      proxy.Message.success("登录成功");
      //存储cookie
      proxy.VueCookies.set("userInfo", result.data, 0);
      //重定向到原始页面
      const redirectUrl = route.query.redirectUrl || "/";
      router.push(redirectUrl);
    } else if (opType.value == 2) {
      proxy.Message.success("重置密码成功");
      showPanel(1);
    }
  });
}
//发送邮箱验证码
const sendEmailCode = () => {
  formDataRefSendMailCode.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const params = Object.assign({}, formDataSendMailCode.value);
    params.type = opType.value == 0 ? 0 : 1;
    let result = await proxy.Request({
      url: api.sendEmailCode,
      params: params,
      errorCallback: () => {
        changeCheckCode(1);
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("验证码发送成功，请登录邮箱查看");
    dialogConfig4SendMailCode.show = false;
  });
}

//重置表单
const resetForm = () => {
  changeCheckCode(0);
  formDataRef.value.resetFields();
  formData.value = {};
  if (opType.value == 1) {
    const cookieLoginInfo = proxy.VueCookies.get("loginInfo");
    if (cookieLoginInfo) {
      formData.value = cookieLoginInfo;
    }
  }
}
</script>

<style lang="scss">
.login-body {
  height: 100vh;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.8), rgba(37, 117, 252, 0.8)), 
              url("../assets/1013373.png") no-repeat center center;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;

  .bg {
    display: none; // 隐藏背景图
  }

  .login-panel {
    width: 400px;
    padding: 30px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    .login-register {
      .login-title {
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 25px;
      }

      .send-email-panel {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .send-email-btn {
          margin-left: 10px;
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: #fff;
          border: none;
          border-radius: 5px;
          padding: 10px 20px;
          cursor: pointer;
          transition: background 0.3s;
          &:hover {
            background: linear-gradient(135deg, #5a0fb8 0%, #1a5bb8 100%);
          }
        }
      }

.el-form-item__content {
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  font-size: var(--font-size);
  line-height: 32px;
  min-width: 0;
  position: relative;
  flex-direction: row;
  justify-content: space-between;
}

      .rememberme-panel {
        margin-top: 15px;
      }

      .no-account {
        margin-top: 20px;
        display: flex;
        justify-content: space-between;
        width: 40%;
        a {
          color: #2575fc;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
          &:hover {
            color: #1a5bb8;
            text-decoration: underline;
          }
        }
      }

      .op-btn {
        width: 100%;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 15px;
        font-size: 16px;
        cursor: pointer;
        transition: background 0.3s;
        &:hover {
          background: linear-gradient(135deg, #5a0fb8 0%, #1a5bb8 100%);
        }
      }
    }
  }

  .check-code-panel {
    margin-top: 15px;
    display: flex;
    align-items: center;

    .check-code {
      margin-left: 10px;
      cursor: pointer;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  }
}
</style>

