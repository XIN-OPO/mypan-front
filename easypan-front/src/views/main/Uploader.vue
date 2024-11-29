<template>
    <div class="uploader-panel">
        <div class="uploader-title">
            <span>上传任务</span>
            <span class="tips">(仅展示本次上传内容)</span>
        </div>
        <div class="file-list">
            <div v-for="(item,index) in fileList" class="file-item">
                <div class="upload-panel">
                    <div class="file-name">
                        {{ item.fileName }}
                    </div>
                    <div class="progress">
                        <el-progress :percentage="item.uploadProgress" v-if="item.status == STATUS.uploading.value || 
                      item.status == STATUS.upload_seconds.value || 
                      item.status == STATUS.upload_finish.value" />
                    </div>
                    <div class="upload-status">
                        <!-- 图标 -->
                        <span :class="['iconfont','icon-'+STATUS[item.status].icon]"
                            :style="{color:STATUS[item.status].color}"></span>
                        <!-- 状态 -->
                        <span class="status" :style="{color:STATUS[item.status].color}">
                            {{ item.status == "fail" ? item.errorMsg : STATUS[item.status].desc }}
                        </span>
                        <!-- 上传信息 -->
                        <span class="upload-info" v-if="item.status == STATUS.uploading.value">
                            {{ proxy.Utils.sizeToStr(item.uploadSize) }} / {{ proxy.Utils.sizeToStr(item.totalSize) }}
                        </span>
                        <!-- 上传速度 -->
                        <span class="upload-speed" v-if="item.status == STATUS.uploading.value">
                            {{ proxy.Utils.sizeToStr(item.uploadSpeed) }}
                        </span>
                    </div>
                </div>
                <div class="op">
                    <!-- md5 -->
                    <el-progress type="circle" :percentage="item.md5Progress" v-if="item.status == STATUS.init.value"
                        :width="50" />
                    <div class="op-btn">
                        <span v-if="item.status == STATUS.uploading.value">
                            <Icon :width="28" class="btn-item" iconName="pause" title="暂停"
                                @click="pauseUpload(item.uid)"></Icon>
                        </span>
                        <span v-if="item.status == STATUS.pause.value">
                            <Icon :width="28" class="btn-item" iconName="upload" title="上传"
                                @click="startUpload(item.uid)"></Icon>
                        </span>
                        <Icon :width="28" class="del btn-item" iconName="del" title="删除" v-if="item.status != STATUS.init.value && item.status != STATUS.upload_finish.value
                    || item.status == STATUS.upload_seconds.value" @click="delUpload(item.uid)"></Icon>
                        <Icon :width="28" class="clean btn-item" iconName="clean" title="清除" v-if="item.status == STATUS.upload_finish.value
                    || item.status == STATUS.fail.value || item.status == STATUS.upload_seconds.value"
                            @click="cleanUpload(item.uid)"></Icon>
                    </div>
                </div>
            </div>
            <div v-if="fileList.length == 0" class="empty-file">
                <NoData msg="暂无上传任务" />
            </div>
        </div>
    </div>
</template>

<script  setup>
import Icon from "@/components/Icon.vue";
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
import SparkMD5 from "spark-md5";
import { dataType } from "element-plus/es/components/table-v2/src/common";
const { proxy } = getCurrentInstance();


const api = {
    upload: "/file/uploadFile",
}
const chunkSize = 1024*1024*5;
const fileList = ref([]);
const delList = ref([]);
const STATUS = {
    emptyfile: {
        value: "emptyfile",
        desc: "空文件",
        color: "#999",
        icon: "close"
    },
    fail: {
        value: "fail",
        desc: "上传失败",
        color: "red",
        icon: "close"
    },
    init: {
        value: "init",
        desc: "解析中",
        color: "#e6a23c",
        icon: "clock"
    },
    uploading: {
        value: "uploading",
        desc: "上传中",
        color: "#67c23a",
        icon: "upload"
    },
    pause: {
        value: "pause",
        desc: "暂停",
        color: "#999",
        icon: "pause"
    },
    upload_finish: {
        value: "upload_finish",
        desc: "上传完成",
        color: "#67c23a",
        icon: "ok"
    },
    upload_seconds: {
        value: "upload_seconds",
        desc: "秒传",
        color: "#999",
        icon: "ok"
    },
};

const addFile = async (file, filePid) => {
    const fileItem = {
        //文件 文件大小 文件流 文件名
        file: file,
        //文件uid
        uid: file.uid, 
        //md5进度
        md5Progress: 0,
        md5: null,
        status: STATUS.init.value,
        uploadSize:0,
        totalSize: file.size,
        fileName: file.name,
        filePid: filePid,
        uploadProgress: 0,
        pause: false,
        //分片
        chunkIndex: 0,
        //错误信息
        errorMsg: null,
        
    };
    fileList.value.unshift(fileItem);
    if (fileItem.totalSize == 0) {
        fileItem.status = STATUS.emptyfile.value;
        return;
    } 
    let md5FileUid = await cumputeMd5(fileItem);
    if (md5FileUid==null) {
        return; 
    }
    uploadFile(md5FileUid);
};

defineExpose({
  addFile
});

//计算md5
const cumputeMd5 = (fileItem) => {
    let file=fileItem.file;
    let blogSlice=File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
    //分片数
    let chunks = Math.ceil(file.size / chunkSize);
    let currentChunk=0;
    let spark = new SparkMD5.ArrayBuffer();
    let fileReader = new FileReader();

    let loadNext = () => {
        let start = currentChunk * chunkSize;
        let end = Math.min(file.size, start + chunkSize);
        let chunk = blogSlice.call(file, start, end);
        fileReader.readAsArrayBuffer(chunk);//读取分片内容
    };
    loadNext();
    //Promise 是 JavaScript 中用于处理异步操作的一种对象。它代表一个在未来可能完成或失败的操作及其结果值。
    return new Promise((resolve, reject) => {
        let resultFile = getFileByUid(file.uid);
        fileReader.onload = (e) => {
            spark.append(e.target.result);
            currentChunk++;
            if (currentChunk < chunks) {
                console.log(`${file.name},第${currentChunk}个分片解析完成，开始第${currentChunk + 1}个分片解析`);
                let percent = Math.floor((currentChunk / chunks) * 100);//进度
                resultFile.md5Progress = percent;
                console.log(fileItem.uid, "MD5计算进度", percent);
                loadNext();
            } else {
                let md5 = spark.end();
                spark.destroy();
                resultFile.md5Progress = 100;
                resultFile.md5 = md5;
                resultFile.status = STATUS.uploading.value;
                resolve(fileItem.uid);
                console.log(fileItem.uid,"MD5计算完成");
            }
        };
        fileReader.onerror = (e) => {
            resultFile.md5Progress = -1;
            resultFile.status = STATUS.fail.value;  
            reject(fileItem.uid);
        };
    }).catch(e=>{
        console.log(e);
        return null;
    });

};

//获取文件
const getFileByUid = (uid) => {
    let file = fileList.value.find(item => {
        return item.file.uid == uid;
    });
    return file;
};

const emit = defineEmits(["uploadCallback"]);

const uploadFile = async (uid, chunkIndex) => {
    chunkIndex = chunkIndex ? chunkIndex : 0;
    //分片上传
    let currentFile = getFileByUid(uid);
    const file = currentFile.file;
    const fileSize = currentFile.totalSize;
    const chunks=Math.ceil(fileSize/chunkSize);
    for(let i=chunkIndex;i<chunks;i++){
        let delIndex = delList.value.indexOf(uid);
        if (delIndex != -1) {
            delList.value.splice(delIndex, 1);
            break;
        }
        currentFile = getFileByUid(uid);
        if(currentFile.pause){
            break;
        }
        let start=i*chunkSize;
        let end = Math.min(fileSize, start + chunkSize);//比大小，一次就分成一个分片的大小
        let chunk = file.slice(start, end);
        let updateResult = await proxy.Request({
            url: api.upload,
            showLoading: false,
            dataType: "file",
            params: {
                file: chunk,
                fileName: file.name,
                fileMd5: currentFile.md5,
                chunkIndex: i,
                chunks: chunks,
                filePid: currentFile.filePid,
                fileId: currentFile.fileId,
            },
            showError: false,
            errorCallback: (msg) => {
                currentFile.errorMsg = msg;
                currentFile.status = STATUS.fail.value;
            },
            uploadProgressCallback: (event) => {
                let loaded = event.loaded;
                if (loaded > fileSize) {
                    loaded = fileSize;
                }
                currentFile.uploadSize = i * chunkSize + loaded;
                currentFile.uploadProgress = Math.floor((currentFile.uploadSize / fileSize) * 100);
            }
        });
        if(updateResult==null){
            break;
        }
        currentFile.fileId = updateResult.data.fileId;
        currentFile.status = STATUS[updateResult.data.status].value;    
        currentFile.chunkIndex = i;
        if(updateResult.data.status == STATUS.upload_finish.value || updateResult.data.status == STATUS.upload_seconds.value){
            currentFile.uploadProgress = 100;
            emit("uploadCallback");
            break;
        }

    }
};

const startUpload = (uid) => {
    let file = getFileByUid(uid);
    if (file) {
        file.pause = false;
        if (file.status === STATUS.pause.value) {
            file.status = STATUS.uploading.value;
            uploadFile(uid, file.chunkIndex); // 从暂停的分片继续上传
        }
    }
};

const pauseUpload = (uid) => {
    let file = getFileByUid(uid);
    if (file) {
        file.pause = true;
        file.status = STATUS.pause.value;
        // 记录当前上传的分片索引
        file.chunkIndex = Math.floor(file.uploadSize / chunkSize);
    }
};

const delUpload = (uid) => {
  let file = getFileByUid(uid);
  if (file) {
    delList.value.push(uid);
    let index = fileList.value.findIndex(item => item.uid === uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
  }
};

const cleanUpload = (uid) => {
  let file = getFileByUid(uid);
  if (file) {
    let index = fileList.value.findIndex(item => item.uid === uid);
    if (index !== -1) {
      fileList.value.splice(index, 1);
    }
  }
};

</script>

<style lang="scss" scoped>
.uploader-panel{
  .uploader-title{
    border-bottom: 1px solid #ccc;
    line-height: 40px;
    padding: 0px 10px;
    font-size: 15px;
    color: #000;
    .tips{
        font-size: 13px;
        color: #999;
    }
  }
  .file-list{
    overflow: auto;
    padding: 10px 0px;
    // min-height: calc(100vh / 2);
    //max-height: calc(100vh - 120px);
    .file-item{
        padding: 3px 10px;
        border-bottom: 1px solid #ccc;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
    }   
    .file-item:nth-child(even){
        background-color: #f9eee6;
    }
    .upload-panel{
        flex:1;
        .file-name{
            color: #d9acac;
            font-size: 14px;
        }
        .upload-status{
            display: flex;
            align-items: center;
            margin-top: 5px;
            .iconfont{
                margin-right: 5px;
            }
            .status{
                color: red;
                font-size: 13px;
            }
            .upload-info{
                margin-left: 5px;
                font-size: 12px;
                color: #999;
            }
        }
        .progress{
            height: 10px;
        }
    }
    .op{
        width: 100px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .op-btn{
            .btn-item{
                cursor: pointer;
            }
            .del,.clean{
                margin-left: 5px;
            }
        }
    }
}
}
</style>