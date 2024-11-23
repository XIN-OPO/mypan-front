<template>
  <div class="top-navigation">
    <div class="all-file">全部文件</div>
    <div class="link">
        <span>我的分享</span>
        <span class="icon-right">></span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance();
const api = {
    getFolderInfo: "/file/getFolderInfo",
    getFolderInfo4Share: "/showShare/getFolderInfo",
    getFolderInfo4Admin: "/admin/getFolderInfo"
};

const props = defineProps({
    //是否监听路由
    watchPath: {
        type: Boolean,
        default: true
    }
})


//目录集合
const folderList = ref([]);
//当前目录 
const currentFolder = ref({ fileId: "0" });
 
const openFolder = (data)=>{
    const { fileId, fileName } = data;
    const folder = {
        fileName: fileName,
        fileId: fileId
    }
    folderList.value.push(folder);
    currentFolder.value = folder;
    setPath();
}

const setPath = () => {
    if (!props.watchPath) {
        //设置不监听路由回调方法 
        return;
    }
    let pathArray = [];
    folderList.value.forEach(item => {
        pathArray.push(item.fileId);
    });
    router.push({
        path: route.path,
        query: pathArray.length == 0 ? "" : { path: pathArray.join("/") }
    });
}
defineExpose({
    openFolder
})
</script>

<style lang="scss" scoped>
.top-navigation{
    display: flex;
    align-items: center;
    
    font-size: 13px;
    line-height: 40px;
    .all-file{
        cursor: pointer;
        color: var(--text-color);
        font-weight: bold;
    }
    .link{
        color: #06a7ff;
        cursor: pointer;
    }
    .icon-right{
        color: #999;
        padding: 0 5px;
        font-size:13px;
    }
}
</style>
