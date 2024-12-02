<template>
  <div>
    <div class="sys-setting-panel">
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="180px" @submit.prevent>
        <!--input输入-->
        <el-form-item label="注册邮箱标题" prop="registerEmailTitle">
          <el-input clearable placeholder="请输入注册邮件验证码标题" v-model.trim="formData.registerEmailTitle"></el-input>
        </el-form-item>

        <el-form-item label="注册邮箱内容" prop="registerEmailContent">
          <el-input clearable placeholder="请输入注册邮件验证码内容" v-model.trim="formData.registerEmailContent"></el-input>
        </el-form-item>

        <el-form-item label="初始大小" prop="userInitUseSpace">
          <el-input clearable placeholder="请输入用户初始大小" v-model.trim="formData.userInitUseSpace">

            <template #suffix>
              MB
            </template>
          </el-input>

        </el-form-item>
        <!--input输入-->
        <el-form-item>
          <el-button type="primary" @click="saveSysSetting">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick ,onMounted} from "vue"
const { proxy } = getCurrentInstance();

const api = {
  getSysSettings:"/admin/getSysSettings",
  saveSysSettings:"/admin/saveSysSettings"  
}

const formData = ref({});
const formDataRef = ref();
const rules = {
  registerEmailTitle: [{ required: true, message: "请输入注册邮件验证码标题" }],
  registerEmailContent: [{ required: true, message: "请输入注册邮件验证码内容" }],
  userInitUseSpace: [{ required: true, message: "请输入用户初始大小" },{validator:proxy.Verify.number,message:"空间大小只能是数字"}]
};

const getSysSettings = async () => {
  let res = await proxy.Request({
    url:api.getSysSettings,
  })
  if(!res){
    return;
  }
  formData.value = res.data;
}

const saveSysSetting = async () => {
  formDataRef.value.validate(async (valid) => {
    if(!valid){
      return;
    }
    let params = {};
    Object.assign(params,formData.value);
    let res = await proxy.Request({
      url:api.saveSysSettings,
      params,
    })
    if(!res){
      return;
    }
    proxy.Message.success("保存成功");
  })
}

onMounted(() => {
  getSysSettings();
})
</script>

<style lang="scss" scoped>
.sys-setting-panel{
  margin-top: 20px;
  width: 600px;
}
</style>