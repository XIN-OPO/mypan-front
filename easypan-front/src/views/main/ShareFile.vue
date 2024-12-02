<template>
    <div class="share-dialog-container">
        <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="600px"
            :showCancel="showCancel" @close="dialogConfig.show = false">
            <template v-if="showType == 0">
                <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="100px" @submit.prevent>
                    <!--input输入-->
                    <el-form-item label="文件" prop="">
                        {{ formData.fileName }}
                    </el-form-item>
                    <!-- 单选 -->
                    <el-form-item label="有效期" prop="validType">
                        <el-radio-group v-model="formData.validType">
                            <el-radio :label="0">1天</el-radio>
                            <el-radio :label="1">3天</el-radio>
                            <el-radio :label="2">7天</el-radio>
                            <el-radio :label="3">永久</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="提取码" prop="codeType">
                        <el-radio-group v-model="formData.codeType">
                            <el-radio :label="0">自定义</el-radio>
                            <el-radio :label="1">系统生成</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <!--input输入-->
                    <el-form-item prop="code" v-if="formData.codeType == 0">
                        <el-input clearable placeholder="请输入五位提取码" v-model="formData.code" maxlength="5"
                            :style="{ width: '150px' }"></el-input>
                    </el-form-item>
                </el-form>
            </template>
            <template v-else>
                <el-form-item label="分享连接" prop="">
                    {{ shareUrl }}{{ resultInfo.shareId }}
                </el-form-item>
                <el-form-item label="提取码" prop="">
                    {{ resultInfo.code }}
                </el-form-item>
                <!--input输入-->
                  <el-form-item label="" prop="" >
                    <el-button type="primary" @click="copy">复制链接及提取码</el-button>
                  </el-form-item>
            </template>
        </Dialog>
    </div>
</template> 

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import useClipboard from 'vue-clipboard3';
const { toClipboard } = useClipboard();
const { proxy } = getCurrentInstance();
const api = {
    shareFile: "/share/shareFile"
};
const shareUrl = ref(document.location.origin+"/share/");

const showType = ref(0);

const formData = ref({});
const formDataRef = ref();
const rules = {
    validType: [{ required: true, message: "请选择有效期" }],
    codeType: [{ required: true, message: "请选择提取码类型" }],
    code: [{ required: true, message: "请输入提取码" },
        { validator: proxy.Verify.shareCode, message: "提取码格式不正确" }
        ,{min:5,message:"提取码长度为5位"}
    ],
};

const dialogConfig = ref({
  show: false,
  title: "分享",
  buttons: [
   {
    type: "danger",
    text: "确定",
    click: (e) => {
      shareFile();
    },
  },
 ],
});

const show = (data)=>{
    showType.value = 0;
    dialogConfig.value.show = true;
    showCancel.value = true;
    resultInfo.value = {};
    dialogConfig.value.buttons[0].text = "确定";
    nextTick(()=>{
        formDataRef.value.resetFields();
        formData.value = Object.assign({},data);
    })
}
const resultInfo = ref({});
const showCancel = ref(true);
const shareFile = async () => {
    //如果已有分享信息，则不进行分享
    if(Object.keys(resultInfo.value).length > 0){
        dialogConfig.value.show = false;
        return;
    }
    formDataRef.value.validate(async (valid)=>{   
        if(!valid){
            return;
        }
        let params = {};
        Object.assign(params,formData.value);
        const result = await proxy.Request({
            url:api.shareFile,
            params:params
        })
        if(!result){
            return;
        }
        showType.value = 1;
        resultInfo.value = result.data;
        dialogConfig.value.buttons[0].text = "关闭";
        showCancel.value = false;
    })
}

defineExpose({
    show
})

const copy = async ()=>{
    await toClipboard(
        `链接:${shareUrl.value}${resultInfo.value.shareId}提取码:${resultInfo.value.code}`
    );
    proxy.Message.success("复制成功");
}
</script>

<style lang="scss" scoped>
.share-dialog-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border-radius: 8px;
  padding: 20px;
  
  // 分享表单样式
  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 25px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 0;
        width: 3px;
        height: 100%;
        background: linear-gradient(to bottom, #409eff, #67c23a);
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      &:hover::before {
        opacity: 1;
      }
      
      .el-form-item__label {
        font-weight: 500;
        color: #303133;
        text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);
      }
    }
  }

  // 文件名称样式
  .el-form-item:first-child {
    .el-form-item__content {
      color: #606266;
      background: linear-gradient(45deg, #fff 0%, #f0f2f5 100%);
      padding: 15px 20px;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      border-left: 4px solid #409eff;
    }
  }

  // 单选框组样式
  :deep(.el-radio-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;

    .el-radio {
      margin-right: 0;
      padding: 10px 25px;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      transition: all 0.3s;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(5px);

      &.is-checked {
        background: linear-gradient(45deg, #ecf5ff 0%, #dbedff 100%);
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      &:hover {
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }
  }

  // 提取码输入框样式
  :deep(.el-input) {
    .el-input__inner {
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #dcdfe6;
      transition: all 0.3s;
      
      &:focus {
        background: #fff;
        box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
      }
    }
  }

  // 分享结果样式
  .el-form-item:not(:has(button)) {
    .el-form-item__content {
      background: linear-gradient(45deg, #fff 0%, #f5f7fa 100%);
      padding: 15px 20px;
      border-radius: 8px;
      font-family: 'Monaco', monospace;
      color: #409eff;
      word-break: break-all;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      border-left: 4px solid #67c23a;
    }
  }

  // 复制按钮样式
  :deep(.el-button) {
    padding: 12px 35px;
    font-size: 14px;
    transition: all 0.3s;
    background: linear-gradient(45deg, #409eff 0%, #67c23a 100%);
    border: none;
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      background: linear-gradient(45deg, #66b1ff 0%, #85ce61 100%);
    }
    
    &:active {
      transform: translateY(0);
    }
  }

  // 添加卡片效果
  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    
    .el-dialog__header {
      background: linear-gradient(45deg, #409eff 0%, #67c23a 100%);
      padding: 20px;
      margin: 0;
      
      .el-dialog__title {
        color: white;
        font-weight: 500;
      }
    }
    
    .el-dialog__body {
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    }
  }
}
</style>
