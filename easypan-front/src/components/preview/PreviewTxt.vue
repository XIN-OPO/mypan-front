<template>
  <div class="code">
    <div class="top-op">
        <div class="encode-select">
            <!-- 下拉框 -->
                <el-select clearable  placeholder="选择编码" v-model="encode" @change="changeEncode">
                  <el-option value="utf-8" label="utf-8"></el-option>
                  <el-option value="gbk" label="gbk"></el-option>
                </el-select>
                <div class="tips">
                    乱码了？切换编码试试
                </div>
        </div>
        <el-button type="primary" @click="copy">复制</el-button>
    </div>
    <highlightjs autodetect :code="txtContent"></highlightjs>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue"
import useClipboard from 'vue-clipboard3';
const { proxy } = getCurrentInstance();
const { toClipboard } = useClipboard();
const encode = ref('utf-8');
const txtContent = ref('');
const blobResult = ref();
const codeRef = ref();

const props = defineProps({
    url: {
        type: String,
    }
});

const changeEncode = (e) => {
    encode.value = e;
    proxy.Message.success('编码切换成功');
    showTxt();
}

const showTxt = () => {
    const reader = new FileReader();
    reader.onload = () => {
        let txt=reader.result;
        txtContent.value = txt;
    }
    reader.readAsText(blobResult.value,encode.value);
}
const readTxt = async () => {
    let result = await proxy.Request({
        url: props.url,
        responseType: "blob"
    });
    if(!result){
        return;
    }
    blobResult.value = result;
    showTxt();
}

onMounted(() => {
    readTxt();
});
const copy = () => {
    toClipboard(txtContent.value);
    proxy.Message.success('复制成功');
}
</script>

<style lang="scss" scoped>
.code{
    width: 100%;
    height: 100vh;
    overflow: hidden;
    .top-op{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .encode-select{
        flex:1;
        display: flex;
        align-items: center;
        margin: 5px 10px;
        .tips{
            margin-left: 10px;
            color: #999;
        }
    }
    .copy-btn{
        margin-left: 10px;
    }
    pre{
        margin: 0px;
    }
    :deep(.hljs){
        width: 100%;
        height: calc(100vh - 50px);
        margin: 0px;
        overflow-x: auto;
        overflow-y: auto;
        white-space: pre-wrap;
        word-wrap: break-word;
    }
}
</style>
