<template>
  <div>
    <div class="top">
      <el-button type="success" @click="recoverBatch" :disabled="selectFileIdList.length == 0">
        <span class="iconfont icon-revert"></span>
        还原</el-button>
      <el-button type="danger" @click="delBatch" :disabled="selectFileIdList.length == 0">
        <span class="iconfont icon-del"></span>
        批量删除</el-button>
    </div>
    <div class="file-list">
      <Table :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="true" ref="dataTableRef"
        :options="tableOptions" @rowSelected="rowSelected">
        <template #fileName="{ index, row }">
          <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
            <template v-if="row.fileType == 3 && row.status != 0">
              <Icon :width="32" :cover="row.fileCover"></Icon>
            </template>
            <template v-else>
              <Icon v-if="row.folderType == 0" :fileType="row.fileType"></Icon>
              <Icon v-if="row.folderType == 1" :fileType="0"></Icon>
            </template>
            <span class="file-name" :title="row.fileName">
              {{ row.fileName }}
            </span>
            <span class="op">
              <template v-if="row.showOp">
                <span class="iconfont icon-revert" @click="recover(row)">还原 </span>
                <span class="iconfont icon-del" @click="del(row)">删除</span>
              </template>
            </span>
          </div>
        </template>
        <template #fileSize="{ index, row }">
          <span v-if="row.fileSize">{{ proxy. Utils.sizeToStr(row.fileSize) }}</span>
          <span v-else>--</span>
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue"
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: '/recycle/loadRecycleList',
  delFile: '/recycle/delFile',
  recoverFile: '/recycle/recoverFile',
}

const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName",
  },
  {
    label: "删除时间",
    prop: "recoveryTime",
    width: 200
  },
  {
    label: '大小',
    prop: 'fileSize',
    width: 150,
    scopedSlots: 'fileSize'
  }
];

const tableData = ref({});
const tableOptions = ref({
  extHeight: 100,
  selectType: "checkbox"
});

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    params: params,
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
  tableData.value.list.forEach((item) => {
    item.showOp = false;
  });
  row.showOp = true;
};
const cancelShowOp = (row) => {
  row.showOp = false;
};

//恢复
const recover = async (row) => {  
  proxy.Confirm(`确定恢复${row.fileName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: {fileIds: row.fileId},
    });
    if(!result){
      return;
    }
    proxy.Message.success("恢复成功");
    loadDataList();
    emit('refresh');
  });
}
//批量恢复
const recoverBatch = async () => {
  if(selectFileIdList.value.length == 0){
    proxy.Message.warning("请选择要恢复的文件");
    return;
  }
  proxy.Confirm("确定恢复吗？", async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: { fileIds: selectFileIdList.value.join(',') },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("恢复成功");
    loadDataList();
    emit('refresh');
  });
}

//删除
const del = async (row) => {
  proxy.Confirm(`确定删除${row.fileName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {fileIds: row.fileId},
    });
    if (!result) {
      return;
    }
    proxy.Message.success("删除成功");
    loadDataList();
    emit('refresh');
  });
}

//批量删除
const delBatch = async () => {
  if (selectFileIdList.value.length == 0) {
    proxy.Message.warning("请选择要删除的文件");
    return;
  }
  proxy.Confirm("确定删除吗？", async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: { fileIds: selectFileIdList.value.join(',') },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("删除成功");
    loadDataList();
    emit('refresh');
  });
};

const emit = defineEmits(['refresh']);

</script>

<style lang="scss" scoped>
@import '@/assets/file_list.scss';
.file-list{
  margin: 10px;
  
  .file-item{
    .op{
      width: 120px;
    }
  }
}
</style>