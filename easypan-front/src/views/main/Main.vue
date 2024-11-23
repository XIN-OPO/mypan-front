<template>
  <div>
    <div class="top">
      <div class="top-op">
        <div class="btn">
          <el-upload :show-file-list="false" :with-credentials="true" :multiple="true" :http-request="addFile"
            :accept="fileAccept">
            <el-button type="primary">
              <span class="iconfont icon-upload">上传</span>
            </el-button>
          </el-upload>
        </div>
        <el-button type="success" @click="newFolder" >
          <span class="iconfont icon-folder-add">新建文件夹</span>
        </el-button>
        <el-button type="danger" :disabled="selectFileIdList.length==0" @click="delFileBatch">
          <span class="iconfont icon-del">批量删除</span>
        </el-button>
        <el-button type="warning" :disabled="selectFileIdList.length==0" @click="moveFileBatch">
          <span class="iconfont icon-folder-add">批量移动</span>
        </el-button>
        <div class="search-panel">
          <el-input clearable placeholder="搜索文件">
            <template #suffix>
              <i class="iconfont icon-search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh" @click="loadDataList"></div>
      </div>
    </div>
    <!-- 导航 -->
    <div class="navigation">
      <Navigation>
        
      </Navigation>
    </div>
    <div class="file-list">
      <Table ref="dataTableRef" :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="true"
        :options="tableOptions" @rowSelected="rowSelected">
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
              <span >{{ row.fileName }}</span>
              <span v-if="row.status == 0" class="transfer-status">转码中</span>
              <span v-if="row.status == 1" class="transfer-status">转码失败</span>
            </span>
            <div class="edit-panel" v-if="row.showEdit">
              <el-input v-model.trim="row.fileNameReal" ref="editNameRef" :maxlength="190"
                @keyup.enter="saveNameEdit(index)">
                <template #suffix>
                  {{ row.fileSuffix }}
                </template>
              </el-input>
              <span :class="['iconfont icon-right1', row.fileNameReal ? '' :'not-allow']"
                @click="saveNameEdit(index)"
              ></span>
              <span class="iconfont icon-error" @click="cancelNameEdit(index)"></span>
            </div>
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1">分享</span>
                <span class="iconfont icon-download" v-if="row.folderType == 0">下载</span>
                <span class="iconfont icon-edit" @click="editFileName(index)">重命名</span>
                <span class="iconfont icon-del" @click="delFile(row)">删除</span>
                <span class="iconfont icon-move" @click="moveFolder(row)">移动</span>
              </template>
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
    <FolderSelect ref="folderSelectRef" @folderSelect="moveFolderDone"></FolderSelect>
  </div>
</template>

<script setup>

import FolderSelect from "@/components/FolderSelect.vue";
import { ref, reactive, getCurrentInstance, nextTick, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const folderSelectRef = ref();



const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFolder: "/file/newFolder",
  getFolderInfo: "/file/getFolderInfo",

  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download"
};
const emit = defineEmits(["addFile"])

const addFile = (fileData) => {
  emit("addFile", { file: fileData.file, filePid: currentFolder.value.fileId });
};
const currentFolder = ref({fileId:0});

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
const fileNameFuzzy = ref();
const category = ref();

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 10,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: 0
  };
  if (params.category != "all") {
    delete params.filePid;
  }
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};

const tableOptions = ref({
  extHeight: 50,
  selectType: "checkbox",
});

//多选
const selectFileIdList = ref([]);

const rowSelected = (rows) => {
  selectFileIdList.value = [];
  rows.forEach(row => {
    if (row.fileId) {
      selectFileIdList.value.push(row.fileId);
    }
  });
};

const delFile = (row) => {
  proxy.Confirm(`确定删除${row.fileName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: row.fileId
      }
    });
    if(!result){
      return;
    }
    loadDataList();
  });
};

const delFileBatch = () => {
  if(selectFileIdList.value.length==0){
    return;
  }
  proxy.Confirm(`确定删除这些文件吗？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: selectFileIdList.value.join(",")
      }
    });
    if (!result) {
      return;
    }
    loadDataList();
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
//编辑行
const editing = ref(false);
const editNameRef = ref();
const newFolder = () => {
  if (editing.value) {
    return;
  }
  tableData.value.list.forEach(element => {
    element.showEdit = false;
  });
  editing.value = true;
  tableData.value.list.unshift({
    showEdit: true,
    fileType: 0,
    fileId: "",
    filePid: 0,
  })
  nextTick(() => {
    editNameRef.value.focus();
  })
}
const cancelNameEdit = (index) => {
  const fileData = tableData.value.list[index];
  if (fileData.fileId) {
    fileData.showEdit = false;
  } else {
    tableData.value.list.splice(index, 1);
  }
  editing.value = false;
}

const saveNameEdit = async (index) => {
  const {fileId,filePid,fileNameReal} = tableData.value.list[index];
  if(fileNameReal=="" || fileNameReal.indexOf("/")!=-1){
    proxy.Message.warning("文件名不能为空或包含/");
    return;
  }
  let url = api.rename;
  if (fileId == "") {
    url = api.newFolder;
  } 
  let result = await proxy.Request({
    url: url,
    params: {
      fileId: fileId,
      filePid: filePid,
      fileName: fileNameReal
    }
  });
  if (!result) {
    return;
  }
  // cancelNameEdit(index);
  tableData.value.list[index] = result.data;
  editing.value = false;
}

const editFileName = (index) => {
  if (tableData.value.list[0].fileId == "") {
    tableData.value.list.splice(0, 1);
    index = index - 1;
  }
  tableData.value.list.forEach(element => {
    element.showEdit = false;
  });
  let curData = tableData.value.list[index];
  curData.showEdit = true;
  if (curData.folderType == 0) {
    curData.fileNameReal = curData.fileName.substring(0, curData.fileName.indexOf("."));
    curData.fileSuffix = curData.fileName.substring(curData.fileName.indexOf("."));
  }else{
    curData.fileNameReal = curData.fileName;
    curData.fileSuffix = "";
  }
  editing.value = true; 
  nextTick(() => {
    editNameRef.value.focus();
  })
};
const currentMoveFile = ref({});
const moveFolder=(data)=>{
  currentMoveFile.value = data;
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
}
const moveFileBatch = () => {
  currentMoveFile.value = {};
  folderSelectRef.value.showFolderDialog(currentFolder.value.fileId);
};
const moveFolderDone = async (folderId) => {
  if (currentFolder.value.fileId == folderId) {
    proxy.Message.warning("文件正在当前目录，无需移动");
    return;
  }
  let fileIdArray = [];
  if(currentMoveFile.value.fileId){
    fileIdArray.push(currentMoveFile.value.fileId);
  }else{
    fileIdArray = fileIdArray.concat(selectFileIdList.value);
  }
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: fileIdArray.value.join(","),
      filePid: folderId
    }
  });
  if(!result){
    return;
  }
  folderSelectRef.value.closeFolderDialog();
  loadDataList();
}
</script>

<style lang="scss" scoped>
:root {
  --primary-color: #ff8c00; // 橙色
  --secondary-color: #cc5500; // 深橙色
  --background-color: #f5f5f5; // 浅灰色背景
  --border-color: #e0e0e0; // 浅灰色边框
  --text-color: #333; // 深色文本
  --font-family: 'Arial', sans-serif; // 统一字体
}

body {
  font-family: var(--font-family);
  color: var(--text-color);
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
  overflow: hidden; // 禁止body滚动条
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--background-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.top-op {
  display: flex;
  align-items: center;
}

.navigation {
  padding: 20px;
  background-color: var(--background-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
}

.btn,
.el-button {
  margin-right: 1rem;
  font-size: 14px;
  color: #be3e3e;
  border: none;
  border-radius: 4px;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
  }
}

.search-panel {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

.el-input {
  border-color: var(--border-color);
  border-radius: 4px;
  padding: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 5px rgba(255, 140, 0, 0.5);
  }
}

.iconfont {
  margin-left: 10px;
  cursor: pointer;
  transition: color 0.3s, transform 0.3s;

  &:hover {
    color: var(--secondary-color);
    transform: scale(1.1);
  }
}

.file-list {
  padding: 1rem;
  height: calc(100vh - 100px); // 根据顶部高度调整
  overflow: hidden; // 禁止滚动条
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;

  &:hover {
    background-color: var(--border-color);
  }

  .edit-panel {
    display: flex;
    align-items: center;
    margin-right: 10px;
    background-color: #fff;
    padding: 0.5rem;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .el-input {
      margin-right: 0.5rem;
    }

    .iconfont {
      color: var(--primary-color);
      cursor: pointer;
      transition: color 0.3s, transform 0.3s;

      &:hover {
        color: var(--secondary-color);
        transform: scale(1.1);
      }
    }

    .not-allow {
      color: #ccc;
      cursor: not-allowed;
    }
  }

  .file-name {
    flex-grow: 1;
    display: flex;
    align-items: center;
  }

  .op {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    min-width: 50px;

    .icon-share1 {
      color: var(--primary-color);
      transition: color 0.3s, transform 0.3s;

      &:hover {
        color: var(--secondary-color);
        transform: scale(1.1);
      }
    }
  }
}
</style>