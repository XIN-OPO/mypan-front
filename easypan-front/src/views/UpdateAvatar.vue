<template>
    <div>
        <Dialog :title="dialogConfig.title" :show="dialogConfig.show" :buttons="dialogConfig.buttons" width="500px"
            :showCancel="false" @close="dialogConfig.show = false">
            <el-form :model="formData" ref="formDataRef" rules="rules" label-width="80px" @submit.prevent>
                <el-form-item label="昵称">
                    {{ formData.nickName }}
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                    <AvatarUpload v-model="formData.avatar" ></AvatarUpload>
                </el-form-item>
            </el-form>
        </Dialog>
    </div>
</template> 

<script setup>
import AvatarUpload from '@/components/AvatarUpload.vue';
import { ref, reactive, getCurrentInstance, nextTick } from 'vue';

const { proxy } = getCurrentInstance();

const api = {
    updateUserAvatar: "updateUserAvatar",
};  
const formData = ref({});
const formDataRef = ref();
const rules = {
    avatar: [{ required: true, message: "请选择头像" }],
};

const show = (data) => {
    formData.value = Object.assign({}, data);
    formData.value.avatar = { userId: data.userId, qqAvatar: data.qqAvatar };
    dialogConfig.value.show = true;
};

defineExpose({
    show,
});
const dialogConfig = ref({
    show: false,
    title: "修改头像",
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
const emit = defineEmits();
const submitForm = async () => {
    if(!(formData.value.avatar instanceof File  )){
        dialogConfig.value.show = false;
        return;
    }
    let res = await proxy.Request({
        url: api.updateUserAvatar,
        params: {
            avatar: formData.value.avatar,
        },
    });
    if(!res){
        return;
    }
    dialogConfig.value.show = false;
    const cookieUserInfo = proxy.VueCookies.get("userInfo");
    delete cookieUserInfo.avatar;
    proxy.VueCookies.set("userInfo", cookieUserInfo, 0);
    emit("updateAvatar");
};
</script>

<style lang="scss" scoped></style>