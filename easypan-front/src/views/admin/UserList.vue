<template>
  <div class="user-list">
    <div class="top-panel">
      <el-form :model="searchFormData" :rules="rules" ref="searchFormDataRef" label-width="80px" @submit.prevent>
        <el-row>
          <el-col :span="4">
            <el-form-item label="用户昵称">
              <el-input clearable placeholder="支持模糊搜索" v-model.trim="searchFormData.nickNameFuzzy"
                @keyup.enter="loadDataList"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="状态">
              <el-select clearable placeholder="选择状态" v-model="searchFormData.status">
                <el-option :value="1" label="启用"></el-option>
                <el-option :value="0" label="禁用"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" :style="{  paddingLeft: '35px' }">
            <el-button type="primary" @click="loadDataList">搜索</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="file-list">
      <Table :columns="columns" :dataSource="tableData" :fetch="loadDataList" :initFetch="false" ref="dataTableRef"
        :options="tableOptions">
        <template #avatar="{ index,row }">
          <div class="avatar">
            <Avatar :userId="row.userId" :avatar="row.qqAvatar" :size="50"></Avatar>
          </div>
        </template>
        <template #space="{ index,row }">
          <div class="space">
            {{proxy.Utils.sizeToStr(row.useSpace)}} / {{ proxy.Utils.sizeToStr(row.totalSpace) }}
          </div>
        </template>
        <template #status="{ index,row }">
          <div class="status">
            <span v-if="row.status == 1" style="color: #67C23A;">启用</span>
            <span v-else style="color: #F56C6C;">禁用</span>
          </div>
        </template>
        <template #op="{ index,row }">
          <div class="op">
            <el-button class="btn-allocate-space" type="primary" size="small" @click="updateSpace(row)">分配空间</el-button>
            <el-divider direction="vertical" />
            <el-button class="btn-toggle-status" type="primary" size="small" @click="updateStatus(row)">{{row.status ==
              1 ? '禁用' : '启用'}}</el-button>
          </div>
        </template>
      </Table>
    </div>
    <Dialog :show="dialogConfig.show" :title="dialogConfig.title" :buttons="dialogConfig.buttons" width="400px"
      :showCancel="false" @close="dialogConfig.show = false">
      <el-form :model="formData" :rules="rules" ref="formDataRef" label-width="80px" @submit.prevent>
        <el-form-item label="昵称">
          {{ formData.nickName }}
        </el-form-item>
        <!--input输入-->
        <el-form-item label="空间大小" prop="changeSpace">
          <el-input clearable placeholder="请输入空间大小" v-model.trim="formData.changeSpace">
            <template #suffix>MB</template>
          </el-input>
        </el-form-item>               
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick ,toRefs,onMounted} from "vue"
const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/admin/loadUserList",
  updateUserStatus: "/admin/updateUserStatus",
  updateUserSpace: "/admin/updateUserSpace",
};

const searchFormData = ref({});

const columns = [
  {
    label: "头像",
    prop: "avatar",
    scopedSlots: "avatar",
    width:"100"
  },
  {
    label: "用户昵称",
    prop: "nickName",
  },
  {
    label: "邮箱",
    prop: "email",
  },
  {
    label: "空间使用",
    prop: "space",
    scopedSlots: "space",
  },
  {
    label: "注册时间",
    prop: "joinTime",
  }, 
  {
    label: "最后登录时间",
    prop: "lastLoginTime",
  },
  {
    label: "状态",
    prop: "status",
    scopedSlots: "status",
  },
  {
    label: "操作",
    prop: "op",
    scopedSlots: "op",
  },
];

const tableData = ref({});
const tableOptions = ref({
  extHeight: 100,
});

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || 1,
    pageSize: tableData.value.pageSize || 10,
    nickNameFuzzy: searchFormData.value.nickNameFuzzy,
    status: searchFormData.value.status,
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
//修改状态
const updateStatus = (row) => {
  proxy.Confirm(`你确定要${row.status == 1 ? '禁用' : '启用'}用户${row.nickName}吗？`, async () => {
    let result = await proxy.Request({
      url: api.updateUserStatus,
      params: {
        userId: row.userId,
        status: row.status == 1 ? 0 : 1,
      },
    });
    if (!result) {
      return;
    }
    loadDataList();
  });
};

onMounted(() => {
  loadDataList();
})

const dialogConfig = ref({
  show: false,
  title: "分配空间",
  buttons: [
   {
    type: "danger",
    text: "确定",
    click: (e) => {
      submitForm();
    },
  },
 ],
});

const formData = ref({});
const formDataRef = ref();
const rules = {
  changeSpace: [{ required: true, message: "请输入空间大小" }],
};

const updateSpace = (data) => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = Object.assign({}, data);
  });
};

const submitForm = () => {
  formDataRef.value.validate(async(valid) => {
    if (valid) {
      let params = Object.assign({}, formData.value);
      let result = await proxy.Request({
        url: api.updateUserSpace,
        params: params,
      });
      if (!result) {
        return;
      }
      dialogConfig.value.show = false;
      proxy.Message.success("分配空间成功");
      loadDataList();
    } 
  });
}
</script>

<style lang="scss" scoped>
.user-list {
  padding: 10px;
  max-width: 90vw;
  .top-panel {
      margin: 10px;
    }
  
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      overflow: hidden;
  
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  
    .file-list {
      margin: 10px;
  
      .op {
        display: flex;
        align-items: center;
        gap: 10px;
        /* 控件之间的间距 */
      }
  
      .el-button {
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 5px 10px;
        transition: background-color 0.3s, transform 0.3s;
  
        &:hover {
          transform: translateY(-2px);
        }
      }
  
      .btn-allocate-space {
        background-color: #409eff;
        /* 蓝色 */
  
        &:hover {
          background-color: #66b1ff;
          /* 浅蓝色 */
        }
      }
  
      .btn-toggle-status {
        background-color: #67C23A;
        /* 绿色 */
  
        &:hover {
          background-color: #85ce61;
          /* 浅绿色 */
        }
      }
  
      .el-divider {
        height: 20px;
        border-left: 1px solid #dcdfe6;
        /* 灰色 */
        margin: 0 5px;
      }
  
      .avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        overflow: hidden;
  
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
  
      .space,
      .status {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 5px;
      }
  
      .status span {
        font-weight: bold;
      }
  
      tr {
        transition: background-color 0.3s;
  
        &:hover {
          background-color: #f5f5f5;
          /* 浅灰色 */
        }
      }
    }
}
</style>