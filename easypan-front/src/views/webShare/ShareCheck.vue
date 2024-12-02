<template>
    <div class="share">
        <div class="body-content">
            <div class="logo">
                <span class="iconfont icon-pan"></span>
                <span class="name">myPan</span>
            </div>
            <div class="code-panel">
                <div class="file-info">
                    <div class="avatar">
                        <Avatar :userId="shareInfo.userId" :avatar="shareInfo.avatar" :width="55">

                        </Avatar>
                    </div>
                    <div class="share-info">
                        <div class="user-info">
                            <span class="nick-name">{{ shareInfo.nickName }}</span>
                            <span class="share-time">{{ shareInfo.shareTime }}</span>
                        </div>
                        <div class="file-name">{{ shareInfo.fileName }}</div>
                    </div>
                </div>
                <div class="code-body">
                    <div class="tips">请输入验证码</div>
                    <div class="input-area">
                        <el-form :model="formData" :rules="rules" ref="formDataRef" @submit.prevent>
                            <!--input输入-->
                            <el-form-item label="验证码" prop="code">
                                <el-input clearable placeholder="请输入验证码" v-model.trim="formData.code"
                                    @keyup.enter="checkShare"></el-input>
                                <el-button type="primary" @click="checkShare">提取文件</el-button>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import Avatar from '@/components/Avatar.vue';
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();
import { useRoute ,useRouter} from 'vue-router';
const route = useRoute();
const router = useRouter();

const api = {
    getShareInfo: '/showShare/getShareInfo',
    checkShare: '/showShare/checkShareCode'
};

const shareInfo = ref({});

const shareId=route.params.shareId;

const formData = ref({});
const formDataRef = ref();
const rules = {
    code: [{ required: true, message: "请输入验证码" },
        {
        min:5,
        message:"验证码长度为5位"
        }, {
        max:5,
        message:"验证码长度为5位"
        },
    ],
};


const getShareInfo= async () => {
    let res = await proxy.Request({
        url: api.getShareInfo,
        params: {
            shareId
        }
    });
    if (!res) {
        return;
    }
    shareInfo.value = res.data;
}

getShareInfo();


const checkShare = async () => {
    formDataRef.value.validate(async (valid) => {
        if (!valid) {
            return;
        }
        let res = await proxy.Request({
            url: api.checkShare,
            params: {
                shareId,
                code: formData.value.code
            }
        });
        if (!res) {
            return;
        }
        router.push(`/share/${shareId}`);
    });
};
</script>

<style lang="scss" scoped>
.share{
    height: 100vh;
    background: linear-gradient(135deg, #FF69B4, #DDA0DD, #87CEEB);
    display: flex;
    justify-content: center;
    align-items: center;
    .body-content{
        display: flex;
        flex-direction: column;
        justify-content: center;
        width: 500px;
        animation: fadeIn 0.5s ease-in-out;
        .logo{
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 30px;
            color: #fff;
            .icon-pan{
                font-size: 120px;
                color: #fff;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                transition: transform 0.3s ease;
                &:hover{
                    transform: scale(1.1);
                }
            }
            .name{
                font-weight: bold;
                font-size: 110px;
                color: #fff;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
                margin-left: 10px;
            }
        }
        .code-panel{
            margin-top: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 25px;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            &:hover{
                transform: translateY(-5px);
            }
            .file-info{
                padding: 15px 25px;
                background: linear-gradient(to right, #ff9a9e, #fad0c4);
                display: flex;
                align-items: center;
                border-radius: 10px;
                color: #fff;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                .avatar{
                    margin-right: 15px;
                    transition: transform 0.3s ease;
                    &:hover{
                        transform: scale(1.05);
                    }
                }
                .share-info{
                    flex: 1;
                    .user-info{
                        display: flex;
                        align-items: center;
                        
                        .nick-name{
                            font-size: 20px;
                            font-weight: 600;
                            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
                        }
                        .share-time{
                            margin-left: 20px;
                            font-size: 14px;
                            opacity: 0.9;
                        }
                    }
                    .file-name{
                        margin-top: 10px;
                        font-size: 15px;
                        opacity: 0.95;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
            .code-body{
                padding: 30px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                .tips{
                    font-weight: 600;
                    color: #666;
                    margin-bottom: 20px;
                    font-size: 16px;
                }
                .input-area{
                    width: 100%;
                    max-width: 400px;
                    .el-form-item{
                        margin-bottom: 0;
                    }
                    .el-input{
                        margin-bottom: 15px;
                        :deep(.el-input__inner){
                            border-radius: 8px;
                            height: 40px;
                        }
                    }
                    .el-button{
                        width: 100%;
                        height: 40px;
                        border-radius: 8px;
                        background: linear-gradient(to right, #ff9a9e, #fad0c4);
                        border: none;
                        font-weight: 600;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        &:hover{
                            transform: translateY(-2px);
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                        }
                    }
                }
            }
        }
    }
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
