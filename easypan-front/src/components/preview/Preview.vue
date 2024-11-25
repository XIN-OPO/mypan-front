<template>
    <PreviewImage ref="imageViewRef" :imageList="[imageUrl]" v-if="fileInfo.fileCategary == 3"></PreviewImage>
</template>

<script setup>
import PreviewImage from './PreviewImage.vue';
import { ref, getCurrentInstance, computed, nextTick } from "vue"
const { proxy } = getCurrentInstance();
const imageViewRef = ref();
const fileInfo = ref({});
const imageUrl = computed(() => {
    return proxy.globalInfo.imageUrl + fileInfo.value.fileCover.replaceAll("_.", ".");
});

const showPreview = (data,showPart) => {
    fileInfo.value = data;
    if (data.fileCategary == 3) { 
        nextTick(() => {
            imageViewRef.value.showImageViewer(0);
        });
    }
}
const FILE_URL_MAP = {
    0: {
        fileUrl: "/file/getFile",
        videoUrl: "/file/ts/getVideoInfo",
        createDownloadUrl: "/file/createDownloadUrl",
        downloadUrl: "/api/file/download",
    },
    1:{
        fileUrl: "/admin/getFile",
        videoUrl: "/admin/ts/getVideoInfo",
        createDownloadUrl: "/admin/createDownloadUrl",
        downloadUrl: "/api/admin/download",
    },
    2: {
        fileUrl: "/showShare/getFile",
        videoUrl: "/showShare/ts/getVideoInfo",
        createDownloadUrl: "/showShare/createDownloadUrl",
        downloadUrl: "/api/showShare/download",
    }
}

defineExpose({
  showPreview
});


</script>

<style lang="scss" scoped>
</style>
