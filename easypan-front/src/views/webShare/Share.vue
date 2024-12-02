<template>
    <div class="share">
        <div class="header">
            <div class="header-content">
                <div class="logo" @click="jump">
                    <span class="iconfont icon-pan"></span>
                    <span class="name">myPan</span>
                </div>
            </div>
        </div>
        <div class="share-body">
            <template v-if="Object.keys(shareInfo).length==0">
                <div class="loading" v-loading="Object.keys(shareInfo).length==0">
                </div>
            </template>
            <template v-else>
                <div class="share-panel">
                    <div class="share-user-info">
                        <div class="avatar">
                            <Avatar :userId="shareInfo.userId" :avatar="shareInfo.avatar" :width="50"> </Avatar>
                        </div>
                    </div>
                    <div class="share-info">
                        <div class="user-info">
                            <span class="nick-name">{{shareInfo.nickName}}</span>
                            <span class="share-time">{{shareInfo.shareTime}}</span>
                        </div>
                        <div class="file-name">
                            {{ shareInfo.fileName }}
                        </div>
                    </div>
                </div>
                <div class="share-op-button">
                    <el-button type="primary" @click="cancelShare" v-if="shareInfo.currentUser">
                        <span class="iconfont icon-cancel"></span>
                        取消分享</el-button>
                    <el-button type="primary" @click="save2MyPan" v-else :disabled="selectFileIdList.length==0">
                        <span class="iconfont icon-import"></span>
                        保存分享</el-button>
                </div>
                <Navigation ref="navigationRef" @navChange="navChange" :shareId="shareId">
                </Navigation>
                <div class="file-list">
                    <Table :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="false"
                        ref="dataTableRef" :options="tableOptions" @rowSelected="rowSelected">
                        <template #fileName="{ index, row }">
                            <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
                                <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status == 2">
                                    <Icon :width="32" :cover="row.fileCover"></Icon>
                                </template>
                                <template v-else>
                                    <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
                                    <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
                                </template>
                                <span class="file-name" :title="row.fileName" v-if="!row.showEdit">
                                    <span @click="preview(row)">{{ row.fileName }}</span>
                                </span>
                                <span class="op">
                                        <span class="iconfont icon-download" v-if="row.folderType == 0"
                                            @click="downloadFile(row)">下载</span>
                                        <span class="iconfont icon-import" @click="save2MyPan(row)"
                                        v-if="row.showOp && !shareInfo.currentUser">保存到我的网盘</span>
                                </span>
                            </div>
                        </template>
                        <template #fileSize="{ index, row }">
                            <div class="file-size">
                                <span v-if="row.folderType == 0">
                                    {{ proxy.Utils.sizeToStr(row.fileSize) }}
                                </span>
                            </div>
                        </template>
                    </Table>
                </div>
            </template>
            <FolderSelect ref="folderSelectRef" @folderSelect="save2MyPanDone"></FolderSelect>
            <Preview ref="previewRef"></Preview>
        </div>
    </div>
</template>

<script setup>
import Avatar from "@/components/Avatar.vue";
import FolderSelect from "@/components/FolderSelect.vue";
import Navigation from "@/components/Navigation.vue";
import Preview from "@/components/preview/Preview.vue";
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
const navigationRef = ref();
const folderSelectRef = ref();
const previewRef = ref();

const api = {
    getShareLoginInfo: "/showShare/getShareLoginInfo",
    loadFileList: "/showShare/loadFileList",
    createDownloadUrl: "/showShare/createDownloadUrl",
    download: "/api/showShare/download",
    cancelShare: "/share/cancelShare",
    saveShare: "/showShare/saveShare",
};

const shareId = route.params.shareId;
const shareInfo = ref({});

const getShareInfo = async () => {
    let res = await proxy.Request({
        url: api.getShareLoginInfo,
        showLoading: false,
        params: { shareId } 
    });
    if(!res){
        return;
    }
    if(res.data==null){
        router.push(`/shareCheck/${shareId}`);
        return;
    }
    shareInfo.value = res.data;
}
getShareInfo();


const columns = [
    {
        label: "文件名",
        prop: "fileName",
        scopedSlots: "fileName"
    },
    {
        label: "修改时间",
        prop: "lastUpdateTime",
        width: 200
    },
    {
        label: "文件大小",
        prop: "fileSize",
        scopedSlots: "fileSize",
        width: 200
    }
];

const tableData = ref({});
const tableOptions = ref({
  extHeight: 100,
    selectType:"checkbox"
});
const currentFolderId = ref({fileId:"0"});
const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 10,
    shareId: shareId,
    filePid:currentFolderId.value.fileId 
  };
  let result = await proxy.Request({
    url: api.loadFileList,
    params
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};

const selectFileIdList = ref([]);

const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach(row => {
    if (row.fileId) {
      selectFileIdList.value.push(row.fileId);
    }
  });
};

const showOp = (row) => {
    tableData.value.list.forEach(item => {
        item.showOp = false;
    });
    row.showOp = true;
};
const cancelShowOp = (row) => {
    row.showOp = false;
};

const preview = (data) => {
    if (data.folderType == 1) {//如果是文件夹
        navigationRef.value.openFolder(data);
        return;
    }
    //文件
    if (data.status != 2) {
        proxy.Message.warning("文件转码中，请稍后再试");
        return;
    }
    previewRef.value.showPreview(data, 0);
}

const navChange = (data) => {
    const {curFolder} = data;
    currentFolderId.value = curFolder;
    loadDataList();
}
</script>

<style lang="scss" scoped>
@import "@/assets/file_list.scss";
.share {
    min-height: 100vh;
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    
    .header {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        padding: 15px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;

            .logo {
                display: flex;
                align-items: center;
                cursor: pointer;

                .icon-pan {
                    font-size: 32px;
                    color: #FF9A9E;
                    transition: transform 0.3s ease;
                }

                .name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-left: 10px;
                    background: linear-gradient(45deg, #FF9A9E, #FAD0C4);
                    -webkit-background-clip: text;
                    color: transparent;
                }

                &:hover .icon-pan {
                    transform: rotate(15deg);
                }
            }
        }
    }

    .share-body {
        max-width: 1200px;
        margin: 30px auto;
        padding: 0 20px;

        .loading {
            height: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .share-panel {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;

            .share-user-info {
                margin-right: 20px;

                .avatar {
                    transition: transform 0.3s ease;
                    &:hover {
                        transform: scale(1.05);
                    }
                }
            }

            .share-info {
                flex: 1;

                .user-info {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;

                    .nick-name {
                        font-size: 18px;
                        font-weight: 600;
                        color: #333;
                    }

                    .share-time {
                        margin-left: 15px;
                        font-size: 14px;
                        color: #999;
                    }
                }

                .file-name {
                    font-size: 16px;
                    color: #666;
                    margin-top: 5px;
                }
            }
        }

        .share-op-button {
            margin-bottom: 20px;
            display: flex;
            justify-content: flex-end;

            .el-button {
                padding: 10px 20px;
                border-radius: 8px;
                background: linear-gradient(45deg, #FF9A9E, #FAD0C4);
                border: none;
                transition: all 0.3s ease;

                .iconfont {
                    margin-right: 5px;
                }

                &:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 154, 158, 0.3);
                }

                &:disabled {
                    background: #f5f5f5;
                    color: #999;
                }
            }
        }

        // 文件列表样式
        .file-list {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 20px;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);

            .file-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #eee;
                transition: all 0.3s ease;

                &:hover {
                    background: rgba(255, 154, 158, 0.1);
                }

                .file-type {
                    width: 40px;
                    height: 40px;
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    .iconfont {
                        font-size: 24px;
                        color: #FF9A9E;
                    }
                }

                .file-info {
                    flex: 1;
                    
                    .file-name {
                        font-size: 16px;
                        color: #333;
                        margin-bottom: 5px;
                    }

                    .file-desc {
                        font-size: 12px;
                        color: #999;
                        display: flex;
                        align-items: center;

                        .size {
                            margin-right: 15px;
                        }

                        .update-time {
                            color: #666;
                        }
                    }
                }

                .file-op {
                    display: flex;
                    gap: 10px;

                    .op-btn {
                        padding: 5px 10px;
                        border-radius: 4px;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;

                        &.download {
                            color: #FF9A9E;
                            &:hover {
                                background: rgba(255, 154, 158, 0.1);
                            }
                        }

                        &.preview {
                            color: #67C23A;
                            &:hover {
                                background: rgba(103, 194, 58, 0.1);
                            }
                        }
                    }
                }
            }
        }
    }
}

// 添加动画
@keyframes slideIn {
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
