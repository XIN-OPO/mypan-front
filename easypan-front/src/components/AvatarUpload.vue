<template>
  <div class="avatar-upload">
    <div class="avatar-show">
        <template v-if="localFile">
            <img :src="localFile"/>
        </template>
        <template v-else>
            <img :src="`${modelValue.qqAvatar}`" 
            v-if="modelValue&&modelValue.qqAvatar"
            />    
            <img :src="`/api/getAvatar/${modelValue.userId}`" v-else/>
        </template>
    </div>
    <div class="select-btn">
        <el-upload
        name="file"
        :show-file-list="false"
        accept=".png,.PNG,.jpg,.jpeg,.JPEG,.gif,.GIF"
        :multiple="false"
        :http-request="uploadImage"
        >
            <el-button type="primary">选择头像</el-button>
        </el-upload>
    </div>
  </div>
</template>

<script setup>
import {ref,reactive,getCurrentInstance,nextTick} from 'vue';
import { useRouter, useRoute } from 'vue-router';
const {proxy} = getCurrentInstance();
const router = useRouter(); 
const route = useRoute();

const timestamp = ref("");
const props = defineProps({
    modelValue: {
        type: Object,
        default:null,
    },
});

const localFile = ref(null);

const emit = defineEmits();
const uploadImage = async (file) => {
    file = file.file;
    let img=new FileReader();
    img.readAsDataURL(file);
    img.onload=({target})=>{
        localFile.value=target.result;
    };
    emit("update:modelValue",file);
};
</script>

<style lang="scss">
.avatar-upload{
    display: flex;
    align-items: end;
    justify-content: center;
    .avatar-show{
        background-color: #fff;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        .iconfont{
            font-size: 50px;
            color: #ccc;
        }
        img{
            width: 100%;
            height: 100%;
        }
        .op{
           position: absolute;
           color: #0e8aef;
           top:80px;
        }
    }
    .select-btn{
        margin-left: 10px;
        vertical-align: bottom;
    }
}
</style>