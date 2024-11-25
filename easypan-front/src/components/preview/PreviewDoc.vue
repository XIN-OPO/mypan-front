<template>
  <div ref="docRef" class="doc-content">

  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick ,onMounted} from "vue"
const { proxy } = getCurrentInstance();
import * as docx from "docx-preview";
const docRef = ref();
const props = defineProps({
    url: {
        type: String,
    }
});

const initDoc = async () => {
    let result = await proxy.Request({
        url: props.url,
        responseType: "blob"
    });
    if(!result){
        return;
    }
    docx.renderAsync(result, docRef.value);
}

onMounted(() => {
    initDoc();
    //
    //startScroll();
});

const stopScroll = () => {
    document.body.style.overflow = "hidden";
}
const startScroll = () => {
    document.body.style.overflow = "auto";
}
</script>

<style lang="scss" scoped>
.doc-content{
    margin: 0px auto;
    :deep .doc-wrapper{
        background: #fff;
        padding: 10px 0px;
    }
    :deep .docx-wrapper > section.docx{
       margin: 0;
       overflow-y: scroll;
       height: 100vh;
    }
}
</style>
