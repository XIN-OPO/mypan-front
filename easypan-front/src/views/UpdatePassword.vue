<template>
    <div>
        <Dialog :title="dialogConfig.title" :show="dialogConfig.show" :buttons="dialogConfig.buttons" width="500px"
            :showCancel="false" @close="dialogConfig.show = false">
            <el-form :model="formData" ref="formDataRef" :rules="rules" label-width="80px" @submit.prevent>
                <el-form-item label="新密码" prop="password">
                    <el-input v-model.trim="formData.password" type="password" placeholder="请输入新密码" size="large"
                        show-password>
                        <template #prefix>
                            <span class="iconfont icon-password"></span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="rePassword">
                    <el-input v-model.trim="formData.rePassword" type="password" placeholder="请输入确认密码" size="large"
                        show-password>
                        <template #prefix>
                            <span class="iconfont icon-rePassword"></span>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
        </Dialog>
    </div>
</template>

<script setup>

import { ref, reactive, getCurrentInstance, nextTick } from 'vue';

const { proxy } = getCurrentInstance();

const formData = ref({});
const formDataRef = ref();
const checkRePassword = (rule, value, callback) => {
    if (value !== formData.value.rePassword) {
        callback(new Error(rule.message));
    } else {
        callback;
    }
}
const api = {
    updatePassword: "updatePassword"
}   
const rules = {
    password: [{ required: true, message: "请输入密码" },
        {
            validator: proxy.Verify.password,
            message: "密码格式不正确"
        }
    ],
    rePassword: [{ required: true, message: "请输入新密码" },
            {
            validator: checkRePassword,
            message: "两次密码不一致"
        }
    ],
};

const show = () => {
    dialogConfig.value.show = true;
    nextTick(() => {
        formDataRef.value.resetFields();
        formData.value = {};
    });
}
defineExpose({
    show
});
const dialogConfig = ref({
  show: false,
  title: "修改密码",
  buttons: [
   {
    type: "primary",
    text: "确定",
    click: (e) => {
      submitForm();
    },
  },
 ],
});

const submitForm = async () => {
    await formDataRef.value.validate(async (valid) => {
        if (valid) {
            console.log(formData.value);
        }
        let result = await proxy.Request({
            url: api.updatePassword,
            params: {
                password: formData.value.password
            }
        });
        if (!result) {
            return;
        }
        dialogConfig.value.show = false;
        proxy.Message.success("修改成功");
    });
}
</script>

<style lang="scss"></style>