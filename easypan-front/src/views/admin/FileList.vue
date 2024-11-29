<template>
  <div>
    <div class="top">
      <div class="top-op">
        <div class="search-panel">
          <el-input clearable placeholder="搜索文件" v-model="fileNameFuzzy" @keyup.enter="search">
            <template #suffix>
              <i class="iconfont icon-search" @click="search"></i>
            </template>
          </el-input>
        </div>
        <div class="iconfont icon-refresh" @click="loadDataList"></div>
        <el-button type="danger" @click="delFileBatch">批量删除</el-button>
      </div>
    </div>
    <!-- 导航 -->
    <div class="navigation">
      <Navigation ref="navigationRef" @navChange="navChange" :adminShow="true">

      </Navigation>
    </div>
    <div class="file-list" v-if="tableData.list&&tableData.list.length>0">
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
              <span @click="preview(row)">{{ row.fileName }}</span>
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
              <span :class="['iconfont icon-right1', row.fileNameReal ? '' : 'not-allow']"
                @click="saveNameEdit(index)"></span>
              <span class="iconfont icon-error" @click="cancelNameEdit(index)"></span>
            </div>
            <span class="op">
              <template v-if="row.showOp && row.fileId && row.status == 2">
                <span class="iconfont icon-share1" @click="share(row)">分享</span>
                <span class="iconfont icon-download" v-if="row.folderType == 0" @click="downloadFile(row)">下载</span>
                <span class="iconfont icon-del" @click="delFile(row)">删除</span>
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
    <Preview ref="previewRef"></Preview>
    <ShareFile ref="shareFileRef"></ShareFile>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();

import Icon from "@/components/Icon.vue";
import Preview from "@/components/preview/Preview.vue";
import ShareFile from "../main/ShareFile.vue";
const api = {
  loadDataList: "/admin/loadFileList",
  delFile: "/admin/delFile",
  createDownloadUrl: "/admin/createDownloadUrl",
  download: "/api/admin/download"
}

const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName"
  },
  {
    label: "发布人",
    prop: "nickName",
    width: 200,
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
const showLoading = ref(false);

//搜索
//就是刷新列表的时候把搜索框里面的内容更新一下就好
const search = () => {
  showLoading.value = true;
  loadDataList();
}

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 10,
    fileNameFuzzy: fileNameFuzzy.value,
    filePid: currentFolder.value.fileId,
  };
  
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params,
    showLoading: showLoading.value
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
      selectFileIdList.value.push(row.userId + "_" + row.fileId);
    }
  });
};

const delFile = (row) => {
  proxy.Confirm(`确定删除${row.fileName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIdsAndUserIds: row.userId + "_" + row.fileId
      }
    });
    if (!result) {
      return;
    }
    loadDataList();
  });
};

const delFileBatch = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  proxy.Confirm(`确定删除这些文件吗？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIdsAndUserIds: selectFileIdList.value.join(",")
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
const previewRef = ref();
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
const navigationRef = ref();
const currentFolder = ref({ fileId: "0" });
const navChange = (data) => {
  const { categoryId, curFolder } = data;
  category.value = categoryId;
  currentFolder.value = curFolder;
  loadDataList();
}

//下载文件
const downloadFile = async (data) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + data.userId + "/" + data.fileId,
  });
  if (!result) {
    return;
  }
  window.location.href = api.download + "/" + result.data;
}

const shareFileRef = ref();
const share = (row) => {
  shareFileRef.value.show(row);
}

</script>

<style lang="scss" scoped>

@import '@/assets/file_list.scss';
.search-panel{
  margin-left: 10px;
  .file-item{
    .op{
      width: 120px;
    }
  }
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #fff5e6; /* 更新为与 Framework.vue 中 header 相同的浅暖色背景 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  border-radius: 8px; /* 圆角 */
  margin-bottom: 16px; /* 底部间距 */
}

.top-op {
  display: flex;
  align-items: center;
  gap: 16px; /* 控件之间的间距 */
}

.search-panel {
  display: flex;
  align-items: center;
}

.el-input {
  border-color: #e0e0e0;
  border-radius: 4px;
  padding: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    border-color: #ff8c00; /* 橙色 */
    box-shadow: 0 0 5px rgba(255, 140, 0, 0.5);
  }
}

.iconfont {
  margin-left: 10px;
  cursor: pointer;
  transition: color 0.3s, transform 0.3s;

  &:hover {
    color: #ff8c00; /* 橙色 */
    transform: scale(1.1);
  }
}

.el-button {
  background-color: #ff8c00; /* 橙色 */
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #cc5500; /* 深橙色 */
    transform: translateY(-2px);
  }
}

</style>