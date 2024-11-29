<template>
  <div class="top-navigation">
    <template v-if="folderList.length>0">
        <span class="back link" @click="backParent">返回上一级</span>
        <el-divider direction="vertical" />
    </template>
    <span v-if="folderList.length==0" class="all-file">全部文件</span>
    <span v-if="folderList.length>0" class="link" @click="setCurFolder(-1)">全部文件</span>
    <template v-for="(item,index) in folderList">
        <span class="iconfont icon-right"></span>
        <span class="link" v-if="index<folderList.length-1" @click="setCurFolder(index)">{{item.fileName}}</span>
        <span v-if="index==folderList.length-1" class="text">{{item.fileName}}</span>
        
    </template>
</div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick ,watch} from "vue"
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const api = {
    getFolderInfo: "/file/getFolderInfo",
    getFolderInfo4Share: "/showShare/getFolderInfo",
    getFolderInfo4Admin: "/admin/getFolderInfo"
};
const { proxy } = getCurrentInstance();
const props = defineProps({
    //是否监听路由
    watchPath: {
        type: Boolean,
        default: true
    },
    shareId: {
        type: String,
        default: ""
    },
    adminShow: {
        type: Boolean,  
        default: false
    }
})

const init = () => {
    folderList.value = [];
    currentFolder.value = { fileId: "0" };
    doCallback();
}

const category = ref();
//目录集合
const folderList = ref([]);
//当前目录 
const currentFolder = ref({ fileId: "0" });
 
const openFolder = (data) => {
    const { fileId, fileName } = data;
    const folder = {
        fileName: fileName,
        fileId: fileId
    }
    folderList.value.push(folder);
    currentFolder.value = folder;
    setPath();
}

defineExpose({
    openFolder,
})

//返回上一级
const backParent = () => {
    let curIndex = null;
    for (let i = 0; i < folderList.value.length; i++){
        if(folderList.value[i].fileId==currentFolder.value.fileId){
            curIndex = i;
            break;
        }
    }
    if(curIndex==null){
        return;
    }
    setCurFolder(curIndex-1);
}

//点击导航设置当前目录
const setCurFolder = (index) => {
    if (index == -1) {
        //返回全部
        currentFolder.value = { fileId: "0" };
        folderList.value = [];
    } else {
        currentFolder.value = folderList.value[index];
        folderList.value.splice(index+1,folderList.value.length);
    }
    setPath();
}

const setPath = () => {
    if (!props.watchPath) {
        //设置不监听路由回调方法 
        doCallback();
        return;
    }
    let pathArray = [];
    folderList.value.forEach((item)=>{
        pathArray.push(item.fileId);
    });
    router.push({
        path: route.path,
        query: pathArray.length == 0 ? "" : { path: pathArray.join("/") },
    });
}

const getNavigationFolder = async (path) => {
    let url = api.getFolderInfo;
    if(props.shareId){
        url = api.getFolderInfo4Share;
    }
    if(props.adminShow){
        url = api.getFolderInfo4Admin;
    }   
    let result = await proxy.Request({
        url: url,
        showLoading: false,
        params: {
            path: path,
            shareId: props.shareId,
        }
    });
    if (!result) {
        return;
    }
    folderList.value = result.data;
}
const emit = defineEmits(["navChange"]);
const doCallback = () => {
    emit("navChange", {
        categoryId: category.value,
        curFolder: currentFolder.value
    });
}



watch(() => route, (newVal, oldVal) => {
    if(!props.watchPath){
        return;
    }
    if (newVal.path.indexOf("/main") === -1
        && newVal.path.indexOf("/settings/fileList") === -1
    ) {
        return;
    }
    const path = newVal.query.path;
    category.value = newVal.params.category;  
    if(path==undefined){
        init();
    } else {
        getNavigationFolder(path);
        let pathArray = path.split("/"); 
        currentFolder.value = {
            fileId: pathArray[pathArray.length-1],
        }
        doCallback();
    }
}, { immediate: true, deep: true });   



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
