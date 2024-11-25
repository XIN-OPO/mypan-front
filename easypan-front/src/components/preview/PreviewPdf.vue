<template>
  <div class="pdf">
    <vue-pdf-embed ref="pdfRef" :source="state.url" class="vue-pdf-embed"
         :page="state.pageNum" 
    ></vue-pdf-embed>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from "vue"
const { proxy } = getCurrentInstance();
import VuePdfEmbed from 'vue-pdf-embed';
const pdfRef = ref();

const defineProps = defineProps({
    url: {
        type: String,
    }
});

const state = ref({
    url: "",
    pageNum: 0,
    numPages: 0,
});

const initPdf = () => {
    state.value.url ="/api" + defineProps.url;
}

onMounted(() => {
    initPdf();
});

</script>

<style lang="scss" scoped>
.pdf {
    width: 100%;
    height: 100vh;
    overflow: hidden;

    :deep(.vue-pdf-embed) {
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }
}
</style>
