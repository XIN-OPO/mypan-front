<template>
  <div class="others">
    <div class="body-content">
        <div class="icon-container">
            <Icon :iconName="fileInfo.fileType == 0?'zip':'others'"
            width="80"
            ></Icon>
        </div>
        <div class="file-name">
            {{ fileInfo.fileName }}
        </div>
        <div class="tips">
            该类型的文件暂不支持预览请下载之后查看
        </div>
        <div class="download-btn">
            <el-button type="primary" @click="downloadFile">
                下载{{ proxy.Utils.sizeToStr(fileInfo.fileSize) }}
            </el-button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from "vue"
import Icon from "../Icon.vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
    createDownloadUrl: {
        type: String,
    },
    downloadUrl: {
        type: String,
    },
    fileInfo: {
        type: Object,
    }
});

const downloadFile = async () => {
    let res = await proxy.Request({
        url: props.createDownloadUrl,
    })
    if(!res.data){
        proxy.Message.error("下载链接获取失败");
        return;
    }
    window.location.href = props.downloadUrl + "/" + res.data; 
}
</script>

<style lang="scss" scoped>
.others {
    width: 100%;
    min-width: 300px;
    padding: 40px 20px;
    background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);

    .body-content {
        width: 100%;
        max-width: 400px;
        margin: 0 auto;
        text-align: center;
        background: rgba(255, 255, 255, 0.92);
        border-radius: 20px;
        padding: 40px 20px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.7);
        animation: fadeIn 0.6s ease;
        
        .icon-container {
            margin-bottom: 20px;
            animation: bounceIn 0.6s ease;
            background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
            width: 120px;
            height: 120px;
            border-radius: 30px;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            
            :deep(.icon) {
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
                transition: all 0.3s ease;

                &:hover {
                    transform: scale(1.1) rotate(5deg);
                }
            }
        }
        
        .file-name {
            font-size: 18px;
            font-weight: 600;
            color: #1a237e;
            margin: 20px 0;
            padding: 0 20px;
            word-break: break-all;
            line-height: 1.4;
        }
        
        .tips {
            color: #455a64;
            font-size: 14px;
            margin: 15px 0 25px;
            line-height: 1.6;
            padding: 15px 20px;
            background: linear-gradient(120deg, #e0f7fa 0%, #b2ebf2 50%, #e0f7fa 100%);
            border-radius: 12px;
            box-shadow: inset 0 2px 6px rgba(0,0,0,0.03);
        }
        
        .download-btn {
            margin-top: 30px;
            
            :deep(.el-button) {
                padding: 12px 35px;
                font-size: 15px;
                border-radius: 25px;
                transition: all 0.3s ease;
                background: linear-gradient(120deg, #4facfe 0%, #00f2fe 100%);
                border: none;
                font-weight: 600;
                letter-spacing: 1px;
                
                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(79,172,254,0.3);
                    background: linear-gradient(120deg, #00f2fe 0%, #4facfe 100%);
                }
                
                &:active {
                    transform: translateY(0);
                }
            }
        }
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }
    50% {
        opacity: 0.9;
        transform: scale(1.1);
    }
    80% {
        opacity: 1;
        transform: scale(0.89);
    }
    100% {
        opacity: 1;
        transform: scale(1);
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
