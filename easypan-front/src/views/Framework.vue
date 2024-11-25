<template>
  <div class="framework">
    <div class="header">
      <div class="logo">
        <span class="iconfont icon-pan"></span>
        <div class="name">MyPan</div>
      </div>
      <div class="right-panel">
        <el-popover :width="800" trigger="click" v-model:visible="showUpLoader" :offset="20" transition="none"
          :hide-after="0" :popper-style="{ padding: '0px' }">
          <template #reference>
            <span class="iconfont icon-transfer"></span>
          </template>
          <template #default>
            <Uploader ref="uploaderRef" @uploadCallback="uploadCallbackHandler"></Uploader>
          </template>
        </el-popover>
        <el-dropdown>
          <div class="user-info">
            <div class="avatar">
              <Avatar :userId="userInfo.userId" :avatar="userInfo.avatar" :timestamp="timestamp"></Avatar>
            </div>
            <span class="nick-name">{{ userInfo.nickName }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="updateAvatar">
                修改头像
              </el-dropdown-item>
              <el-dropdown-item @click="updatePassword">
                修改密码
              </el-dropdown-item>
              <el-dropdown-item @click="logout">
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
          <div :class="['menu-item', item.menuCode == currentMenu.menuCode ? 'active' : '']" v-for="item in menus"
            @click="jump(item)">
            <div :class="['iconfont', 'icon-' + item.icon]"></div>
            <div class="text">{{ item.name }}</div>
          </div>
        </div>
        <div class="menu-sub-list">
          <div :class="['menu-item-sub', currentPath == sub.path ? 'active' : '']" v-for="sub in currentMenu.chidren"
            @click="jump(sub)">
            <span :class="['iconfont', 'icon-' + sub.icon]" v-if="sub.icon"></span>
            <span class="text">{{ sub.name }}</span>
          </div>
          <div class="tips" v-if="currentMenu && currentMenu.tips">{{ currentMenu.tips }}</div>
          <div class="space-info">
            <div>空间使用</div>
            <div class="percent">
              <el-progress :percentage="Math.floor((useSpaceInfo.useSpace / useSpaceInfo.totalSpace) * 10000) / 100"
                color="#4094ff"></el-progress>
            </div>
            <div class="space-use">
              <div class="use">
                {{ proxy.Utils.sizeToStr(useSpaceInfo.useSpace) }} / {{ proxy.Utils.sizeToStr(useSpaceInfo.totalSpace)
                }}
              </div>
              <div class="iconfont icon-refresh" @click="getUseSpace"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="body-content">
        <router-view v-slot="{ Component }">
          <component ref="routerViewRef" :is="Component" @addFile="addFile"></component>
        </router-view>
      </div>
    </div>
    <UpdateAvatar ref="updateAvatarRef" @updateAvatar="reloadAvatar"></UpdateAvatar>
    <UpdatePassword ref="updatePasswordRef"></UpdatePassword>
  </div>
</template>

<script setup>
import Avatar from "@/components/Avatar.vue";
import UpdateAvatar from "@/views/UpdateAvatar.vue";
import UpdatePassword from "@/views/UpdatePassword.vue";
import { ref, reactive, getCurrentInstance, nextTick, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router"; 
import Uploader from "./main/Uploader.vue";
import FolderSelect from "@/components/FolderSelect.vue";
const router = useRouter();
const route = useRoute();
const { proxy } = getCurrentInstance();
const timestamp = ref(0);
const userInfo = ref(proxy.VueCookies.get("userInfo"));

const api = {
  logout: "/logout",
  getUseSpace: "/getUseSpace"
}

const showUpLoader = ref(false);

const uploaderRef = ref();
const addFile = (fileData) => {
  const {file,filePid} = fileData;
  showUpLoader.value = true;
  uploaderRef.value.addFile(file, filePid);
};

const routerViewRef = ref();
//上传文件回调
const uploadCallbackHandler = () => {
  nextTick(() => {
    //todo 更新用户空间                                                                                                                                            
    routerViewRef.value.reload();
    getUseSpace();
  });
};

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
        category: "others",
        path: "/main/others"
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
  }
];

const currentMenu = ref({});
const currentPath = ref();
const jump = (item) => {
  if (!item.path || item.menuCode == currentMenu.value.menuCode) {
    return;
  }
  router.push(item.path);
};

const setMenu = (menuCode, path) => {
  const menu = menus.find(item => {
    return item.menuCode == menuCode;
  });
  currentMenu.value = menu;
  currentPath.value = path;
};

 watch(() => route,(newVal, oldVal) => {
  if (newVal.meta.menuCode) {
    setMenu(newVal.meta.menuCode, newVal.path);
  }
 },
   { immediate: true, deep: true }
 );

const updateAvatarRef = ref();
const updateAvatar = () => {
  updateAvatarRef.value.show(userInfo.value);
};
const reloadAvatar = () => {
  userInfo.value = proxy.VueCookies.get("userInfo");
  timestamp.value = new Date().getTime();
};

const updatePasswordRef = ref();
const updatePassword = () => {
  updatePasswordRef.value.show();
};
 
const logout = async () => {
  proxy.Confirm("确定要退出吗？", async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (result) {
      proxy.VueCookies.remove("userInfo");
      router.push("/login");
    } else {
      return;
    }
  });
};

//使用空间
const useSpaceInfo = ref({ useSpace: 0, totalSpace: 1 });
const getUseSpace = async () => {
  let result = await proxy.Request({
    url: api.getUseSpace,
    showLoading: false,
  });
  if (result) {
    useSpaceInfo.value = result.data;
  }
  console.log(useSpaceInfo.value);
};
getUseSpace();
</script>

<style lang="scss" scoped>
.header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff5e6; /* 浅暖色背景 */

  .logo {
    display: flex;
    align-items: center;

    .icon-pan {
      font-size: 36px;
      color: #ff8c00; /* 橙色 */
    }

    .name {
      font-weight: bold;
      margin-left: 8px;
      font-size: 24px;
      color: #cc5500; /* 深橙色 */
    }
  }

  .right-panel {
    display: flex;
    align-items: center;

    .icon-transfer {
      cursor: pointer;
      transition: transform 0.3s;
      &:hover {
        transform: scale(1.1);
      }
    }

    .user-info {
      margin-left: 15px;
      display: flex;
      align-items: center;
      flex-direction: row-reverse;
      
      cursor: pointer;

      .avatar {
        margin: 0 10px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
      }

      .nick-name {
        color: #ff8c00; /* 橙色 */
        font-weight: 600;
      }
    }
  }
}

.body {
  display: flex;
  height: 100vh;

  .left-sider {
    border-right: 1px solid #ffe4b5; /* 浅暖色 */
    background-color: #fffaf0; /* 浅暖色背景 */
    display: flex;
    flex-direction: column;
    width: 240px;
    height: 100vh;
    .menu-list {
      width: 80px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      flex-shrink: 0;

      .menu-item {
        text-align: center;
        font-size: 14px;
        padding: 20px 0;
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: #ffe4b5; /* 浅暖色 */
        }

        .iconfont {
          font-size: 28px;
          color: #d87093; /* 粉色 */
        }
      }

      .active {
        .iconfont {
          color: #ff8c00; /* 橙色 */
        }

        .text {
          color: #ff8c00; /* 橙色 */
        }
      }
    }

    .menu-sub-list {
      flex-grow: 1;
      padding: 20px 10px 0;
      overflow-y: auto;

      .menu-item-sub {
        text-align: center;
        line-height: 40px;
        cursor: pointer;
        border-radius: 5px;
        transition: background 0.3s;

        &:hover {
          background: #ffe4b5; /* 浅暖色 */
        }

        .iconfont {
          font-size: 14px;
          margin-right: 20px;
          color: #9370db; /* 紫色 */
        }

        .text {
          font-size: 14px;
        }
        .space-info {
        position: absolute;
        bottom: 10px;
        width: 100%;
        padding: 0 5px;

        .percent {
          padding-right: 10px;
        }

        .space-use {
          margin-top: 5px;
          color: #cc5500; /* 深橙色 */
          display: flex;
          justify-content: space-around;

          .use {
            flex: 1;
          }

          .iconfont {
            cursor: pointer;
            margin-top: 20px;
            color: #ff8c00; /* 橙色 */
          }
        }
      }
      }

      .active {
        background: #ffdab9; /* 浅暖色 */

        .iconfont {
          color: #ff8c00; /* 橙色 */
        }

        .text {
          color: #ff8c00; /* 橙色 */
        }
      }

      .tips {
        margin-top: 10px;
        color: #cc5500; /* 深橙色 */
        font-size: 13px;
      }
      .space-info {
        position: absolute;
        bottom: 10px;
        width: 12%;
        padding: 0 5px;
      
              .percent {
                padding-right: 10px;
              }
      
              .space-use {
                margin-top: 5px;
                color: #cc5500;
                /* 深橙色 */
                display: flex;
                justify-content: space-around;
      
                .use {
                  flex: 1;
                }
      
                .iconfont {
                  cursor: pointer;
                  margin-top: 20px;
                  color: #ff8c00;
                  /* 橙色 */
                }
              }
            }
      
    }
  }

  .body-content {
    flex: 1;
    padding: 20px;
    background-color: #fffaf0; /* 浅暖色背景 */
  }
}
</style>
