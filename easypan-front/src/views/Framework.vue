<template>
  <div class="framework">
    <div class="header">
      <div class="logo">
        <span class="iconfont icon-pan"></span>
        <div class="name">MyPan</div>
      </div>
      <div class="right-panel">
        <el-popover :width="800" trigger="click" :v-model:visible="true" :offset="20" transition="none" :hide-after="0"
          :popper-style="{padding:'0px'}">
          <template #reference>
            <span class="iconfont icon-transfer"></span>
          </template>
          <template #default>
            这里是上传区域
          </template>
        </el-popover>
        <el-dropdown>
          <div class="user-info">
            <div class="avatar"></div>
            <span class="nick-name">{{ userInfo.nickName}}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                修改头像
              </el-dropdown-item>
              <el-dropdown-item>
                修改密码
              </el-dropdown-item>
              <el-dropdown-item>
                退出
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="body">
      <div class="left-sider">
        <div class="menu-list">
          <div class="menu-item" v-for="item in menus">
            <div :class="['iconfont','icon-'+item.icon]"></div>
            <div class="text">{{item.name}}</div>
          </div>
        </div>
        <div class="menu-sub-list">
          <div :class="['item-item-sub']" v-for="sub in currentMenu.chidren">
            <span :class="['iconfont','icon-'+sub.icon]" v-if="sub.icon"></span>
            <span class="text">{{ sub.name }}</span>
          </div>
        </div>
      </div>
      <div class="body-content"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const { proxy } = getCurrentInstance();

const userInfo = ref({
  nickName: "helle world"
});

const menus = [
  {
    icon: "cloude",
    name: "首页",
    menuCode: "main",
    path: "/main/all",
    allShow: true,
    chidren: [
      {
        icon: "all",
        name: "全部",
        category: "all",
        path: "/main/all"
      },
      {
        icon: "video",
        name: "视频",
        category: "video",
        path: "/main/video"
      },
      {
        icon: "music",
        name: "音频",
        category: "music",
        path: "/main/music"
      },
      {
        icon: "image",
        name: "图片",
        category: "image",
        path: "/main/image"
      },
      {
        icon: "doc",
        name: "文档",
        category: "doc",
        path: "/main/doc"
      },
      {
        icon: "more",
        name: "其他",
        category: "more",
        path: "/main/more"
      }
    ]
  },
  {
    path: "/myShare",
    icon: "share",
    name: "分享",
    menuCode: "share",
    allShow: true,
    chidren: [
      {
        name: "分享记录",
        path: "myShare"
      },
    ],
  },
  {
    path: "/recycle",
    icon: "del",
    name: "回收站",
    menuCode: "recycle",
    allShow: true,
    chidren: [
      {
        name: "删除的文件",
        path: "/recycle",
      },
    ],
  },
  {
    path: "/settings/fileList",
    icon: "settings",
    name: "设置",
    menuCode: "settings",
    allShow: false,
    chidren: [
      {
        name: "用户文件",
        path: "/settings/fileList",
      },
      {
        name: "用户管理",
        path: "/settings/userList"
      },
      {
        path: "/settings/sysSetting",
        name: "系统设置",
      },
    ],
  },
];

const currentMenu = ref({});
 

</script>

<style lang="scss" scoped>
.header {
  box-shadow: 0 3px 10px 0 rgb(0 0 0 / 20%);
  height: 56px;
  padding-left: 24px;
  padding-right: 24px;
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .logo {
    display: flex;
    align-items: center;

    .icon-pan {
      font-size: 40px;
      color: #1296db;
    }

    .name {
      font-weight: bold;
      margin-left: 5px;
      font-size: 25px;
      color: #05a1f5;
    }

  }

  .right-panel {
    display: flex;
    align-items: center;

    .icon-transfer {
      cursor: pointer;
    }

    .user-info {
      margin-left: 10px;
      display: flex;
      align-items: center;
      cursor: pointer;

      .avatar {
        margin: 0px 5px 0px 15px;
      }

      .nick-name {
        color: #05a1f5;
      }
    }
  }
}

.body {
  display: flex;

  .left-sider {
    border-right: 1px solid #f1f2f4;
    display: flex;

    .menu-list {
      height: calc(100vh - 56px);
      width: 80px;
      box-shadow: 0 3px 10px 0 rgb(0 0 0 /6%);
      border-right: 1px solid #f1f2f4;

      .menu-item {
        text-align: center;
        font-size: 14px;
        padding: 20px 0px;
        cursor: pointer;

        &:hover {
          background: #f3f3f3;
        }

        .iconfont {
          font-weight: normal;
          font-size: 28px;
        }
      }

      .active {
        .iconfont {
          background:#eef9fe;
          .iconfont{
            color: #05a1f5;
          }
          .text{
            color: #05a1f5;
          }
        }
        .tips{
          margin-top: 10px;
          color: #888888;
          font-size: 13px;
        }
        .space-info{
          position: absolute;
          bottom: 10px;
          width: 100%;
          padding: 0px 5px;
          .percent{
            padding-right: 10px;
          }
          .space-use{
            margin-top: 5px;
            color: #7e7e7e;
            display: flex;
            justify-content: space-around;
            .use{
              flex:1;
            }
            .iconfont{
              cursor: pointer;
              margin-top: 20px;
              color: #05a1f5;
            }
          }
        }
      }
    }
  }
  .body-content{
    flex: 1;
    width: 0;
    padding-left: 20px;
  }
}
</style>
