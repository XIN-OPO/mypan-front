<template>
  <div>
    <div class="top">
      <el-button type="primary" @click="cancelShareBatch" :disabled="selectFileIdList.length == 0">
        <span class="iconfont icon-cancel"></span>取消分享
      </el-button>
    </div>
    <div class="file-list">
      <Table ref="dataTableRef" :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="false"
        :options="tableOptions" @rowSelected="rowSelected">
        <template #fileName="{ index, row }">
          <div class="file-item" @mouseenter="showOp(row)" @mouseleave="cancelShowOp(row)">
            <template v-if="row.fileType == 3 && row.status!=0">
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
                <span class="iconfont icon-link" @click="copy(row)">复制链接 </span>
                <span class="iconfont icon-cancel" @click="cancelShare(row)">取消分享</span>
              </template>
            </span>
          </div>
        </template>
      </Table>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, onMounted } from "vue"
const { proxy } = getCurrentInstance();
import useClipboard from 'vue-clipboard3';
const { toClipboard } = useClipboard();

const shareUrl = ref(document.location.origin + "/share/");

const api = {
  loadDataList: "/share/loadShareList",
  cancelShare: "/share/cancelShare"
};
const dataTableRef = ref(null);
const columns = [
  {
    label: "文件名",
    prop: "fileName",
    scopedSlots: "fileName"
  },
  {
    label: "分享时间",
    prop: "shareTime",
    width: 200
  },
  {
    label: "失效时间",
    prop: "expireTime",
  },
  
  {
    label: "浏览次数",
    prop: "showCount",
    width: 200
  },
];

const tableData = ref({});
const tableOptions = {
  extraHeight: 100,
  selectType: "checkbox"
};

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo ,
    pageSize: tableData.value.pageSize ,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
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
      selectFileIdList.value.push(row.shareId);
    } 
  });
};

const showOp = (row) => {
  row.showOp = true;
};
const cancelShowOp = (row) => {
  row.showOp = false;
};

const copy = async (data) => {
  await toClipboard(
    `链接:${shareUrl.value}${data.shareId}提取码:${data.code}`
  );
  proxy.Message.success("复制成功");
}

const cancelShareList = ref([]);
const cancelShareBatch = () => {
  if(selectFileIdList.value.length == 0){
    proxy.Message.warning("请选择要取消分享的文件");
    return;
  }
  cancelShareList.value = selectFileIdList.value;
  
};
const cancelShareDone = () => {
  proxy.Confirm("确定取消分享吗？", async () => {
    let result = await  proxy.Request({
      url: api.cancelShare,
      params: { shareIds: cancelShareList.value.join(",") }
    });
    if (!result) {
      return;
    }
    proxy.Message.success("取消分享成功");
    cancelShareList.value = [];
    loadDataList();
  });
};
const cancelShare = (row) => {
  cancelShareList.value.push(row.shareId);
  cancelShareDone();
};

onMounted(() => {
  loadDataList();
});
</script>

<style lang="scss" scoped>
@import "@/assets/file_list.scss";

.file-list {
  margin-top: 10px;

  .file-item {
    .file-name {
      span {
        &:hover {
          color: #409eff;
        }
      }
    }

    .op {
      width: 170px;
    }
  }
}
</style>