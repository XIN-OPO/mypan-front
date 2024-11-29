<template>
    <PreviewImage ref="imageViewRef" :imageList="[imageUrl]" v-if="fileInfo.fileCategary == 3"></PreviewImage>
    <Window ref="windowRef" :show="showWindow" :width="fileInfo.fileCategary ==1?1500:800" 
    :title="fileInfo.fileName" :align="fileInfo.fileCategary ==1?'center':'center'" @close="closeWindow"
    v-else
    >
        <PreviewVideo v-if="fileInfo.fileCategary == 1" :url="url"></PreviewVideo>
        <PreviewDoc v-if="fileInfo.fileType == 5" :url="url"></PreviewDoc>
        <PreviewExcel v-if="fileInfo.fileType == 6" :url="url"></PreviewExcel>
        <PreviewPdf v-if="fileInfo.fileType == 4" :url="url"></PreviewPdf>
        <PreviewTxt v-if="fileInfo.fileType == 7 || fileInfo.fileType == 8" :url="url"></PreviewTxt>
        <PreviewMusic v-if="fileInfo.fileCategary == 2" :url="url" :fileName="fileInfo.fileName"></PreviewMusic>
        <PreviewDownload v-if="fileInfo.fileCategary == 5 && fileInfo.fileType != 8" 
        :createDownloadUrl="createDownloadUrl" 
        :downloadUrl="downloadUrl"
        :fileInfo="fileInfo"
        ></PreviewDownload>
    </Window>
</template>
 
<script setup>
import PreviewImage from './PreviewImage.vue';
import PreviewVideo from './PreviewVideo.vue';
import PreviewDoc from './PreviewDoc.vue';
import PreviewExcel from './PreviewExcel.vue';
import PreviewPdf from './PreviewPdf.vue';
import PreviewTxt from './PreviewTxt.vue';  
import PreviewMusic from './PreviewMusic.vue';
import PreviewDownload from './PreviewDownload.vue';
import { ref, getCurrentInstance, computed, nextTick } from "vue"
const { proxy } = getCurrentInstance();
const imageViewRef = ref();
const fileInfo = ref({});
const windowRef = ref();
const url = ref(null);

const createDownloadUrl = ref(null);
const downloadUrl = ref(null);

const imageUrl = computed(() => {
    return proxy.globalInfo.imageUrl + fileInfo.value.fileCover.replaceAll("_.", ".");
});
const showWindow = ref(false);
const showPreview = (data,showPart) => {
    fileInfo.value = data;
    if (data.fileCategary == 3) { 
        nextTick(() => {
            imageViewRef.value.showImageViewer(0);
        });
    }else{
        showWindow.value = true;
        let _url = FILE_URL_MAP[showPart].fileUrl;
        let _createDownloadUrl = FILE_URL_MAP[showPart].createDownloadUrl;
        let _downloadUrl = FILE_URL_MAP[showPart].downloadUrl;
        if (data.fileCategary == 1) {
            _url = FILE_URL_MAP[showPart].videoUrl;
        }
        if (showPart == 0) {
            _url = _url + "/" + data.fileId;
            _createDownloadUrl = _createDownloadUrl + "/" + data.fileId;
        }else if(showPart == 1){
            _url = _url + "/" + data.userId+"/"+data.fileId;
            _createDownloadUrl = _createDownloadUrl + "/" + data.userId+"/"+data.fileId;
        }
        url.value = _url;
        createDownloadUrl.value = _createDownloadUrl;
        downloadUrl.value = _downloadUrl;
    }
}


const closeWindow = () => {
    showWindow.value = false
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
