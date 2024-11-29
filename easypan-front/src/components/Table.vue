<template>
  <div>
    <el-table ref="dataTable" :data="dataSource.list || []" :stripe="options.stripe" :border="options.border"
      header-row-class-name="table-header-row" highlight-current-row @row-click="handleRowClick"
      @selection-change="handleSelectionChange" :height="tableHeight">
      <!-- 选择框 -->
      <el-table-column v-if="options.selectType && options.selectType == 'checkbox'" type="selection" width="55"
        align="center">
      </el-table-column>
      <!-- 序号 -->
      <el-table-column v-if="options.showIndex" type="index" width="50" align="center" label="序号">
      </el-table-column>
      <!-- 数据列 -->
      <template v-for="(column, index) in columns">
        <template v-if="column.scopedSlots">
          <el-table-column :key="index" :prop="column.prop" :label="column.label" :width="column.width"
            :align="column.align || 'left'">
            <template #default="scope">
              <slot :name="column.scopedSlots" :row="scope.row" :index="scope.$index"></slot>
            </template>
          </el-table-column>    
        </template>
        <template v-else>
          <el-table-column :key="index" :prop="column.prop" :label="column.label" :width="column.width"
            :align="column.align || 'left'" :fixed="column.fixed"></el-table-column>
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="pagination" v-if="showPagination">
      <el-pagination v-if="dataSource.totalCount" background :page-sizes="[15, 30, 50, 100]"
        :total="dataSource.totalCount" :page-size="dataSource.pageSize" :current-page.sync="dataSource.pageNo"
        @current-change="handlePageNoChange" @size-change="handlePageSizeChange" style="text-align: right;"
        :layout="layout"></el-pagination>
    </div>
  </div>
</template>zz

<script setup>


import { ref, computed, onMounted } from 'vue';

const emit = defineEmits(['rowSelected', 'row-click']);
const props = defineProps({
  dataSource: Object,
  showPagination: {
    type: Boolean,
    default: true
  },
  showPageSize: {
    type: Boolean,
    default: true
  },
  options: {
    type: Object,
    default: {
      extHeight: 0,
      showIndex: false,
    },
  },
  columns: Array,
  fetch: Function,
  initFetch: {
    type: Boolean,
    default: true
  },
})
const layout = computed(() => {
  return `total, ${props.showPageSize ? "sizes, " : ""} ,prev, pager, next, jumper`;
});
//顶部60 内容区域距离顶部20 内容上下内间距15 分页区域高度 46
const topHeight = 60 + 20 + 30 + 46;


const tableHeight = computed(() => {
  return props.options.tableHeight ? props.options.tableHeight : window.innerHeight - topHeight - props.options.extHeight;
});


const init = () => {
  if (props.initFetch && props.fetch) {
    props.fetch();
  }
};

onMounted(() => {
  init();
});


const dataTable = ref();

//消除选中
const clearSelection = () => {
  dataTable.value.clearSelection();
};

//选中
const setCurrentRow = (rowKey, rowValue) => {
  let row = props.dataSource.list.find((item) => {
    return item[rowKey] === rowValue;
  });
  if (row) {
    dataTable.value.setCurrentRow(row);
  }
};
//将子组件暴露出去
defineExpose({
  clearSelection,
  setCurrentRow
});

//行点击
const handleRowClick = (row) => {
  emit('row-click', row);
};

//多选
const handleSelectionChange = (selection) => {
  emit('rowSelected', selection);
};

//切换每页大小
const handlePageSizeChange = (size) => {
  props.dataSource.pageSize = size;
  props.dataSource.pageNo = 1;
  props.fetch();
};

//切换页码
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo;
  props.fetch();
};

init();
</script>

<style lang="scss" scoped>
:root {
  --primary-color: #ff8c00; // 橙色
  --secondary-color: #cc5500; // 深橙色
  --background-color: #fffaf0; // 浅暖色背景
  --border-color: #ffe4b5; // 浅暖色
  --text-color: #333; // 深色文本
  --font-family: 'Arial', sans-serif; // 统一字体
}

body {
  font-family: var(--font-family);
  color: var(--text-color);
  background-color: var(--background-color);
  margin: 0;
  padding: 0;
}

// 定义渐变色变量
$gradient-primary: linear-gradient(135deg, #dbbe99 0%, #f5c2b0 100%);
$gradient-hover: linear-gradient(135deg, #FFA500 0%, #cb6654 100%);
$gradient-active: linear-gradient(135deg, #FF7F00 0%, #9b5942 100%);
$shadow-color: rgba(255, 140, 0, 0.2);

.el-table {
  width: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px $shadow-color;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 140, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 10px 0;
  height: 100%;
  flex: 1;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px $shadow-color;
  }

  :deep(thead) {
    tr th {
      background: $gradient-primary !important;
      color: #fff;
      font-weight: 600;
      font-size: 15px;
      padding: 18px 12px;
      position: relative;
      overflow: hidden;
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent);
        animation: shimmer 3s infinite;
      }
    }
  }

  :deep(tbody) {
    tr {
      transition: all 0.3s ease;
      position: relative;

      td {
        padding: 16px 12px;
        color: #444;
        font-size: 14px;
        border-bottom: 1px solid rgba(255, 140, 0, 0.1);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 100%;
          background: rgba(255, 140, 0, 0.05);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }
      }

      &:hover {
        background: rgba(255, 140, 0, 0.05);
      }
    }
  }

  :deep(.el-table__body-wrapper) {
    // 优化滚动条样式
    overflow-y: auto;

    // 自定义滚动条样式
    &::-webkit-scrollbar {
      width: 10px; // 加宽滚动条
      height: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 5px;
      border: 2px solid transparent;
      background-clip: padding-box;

      &:hover {
        background: #ccc;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}

.pagination {
  position: sticky;
  bottom: 0;
  z-index: 1; // 确保分页器在最上层
  padding: 12px 24px;
  background: transparent;
  flex-shrink: 0;

  :deep(.el-pagination) {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;

    .btn-prev,
    .btn-next {
      background: rgba(255, 140, 0, 0.1);
      border: none;
      color: #ff8c00;

      &:disabled {
        background: rgba(0, 0, 0, 0.05);
        color: #999;
      }
    }

    .el-pager li {
      background: transparent;
      border: 1px solid rgba(255, 140, 0, 0.2);
      color: #666;

      &.active {
        background: linear-gradient(135deg, #ff8c00 0%, #ff4500 100%);
        color: #fff;
        border: none;
      }
    }

    .el-pagination__total,
    .el-pagination__sizes {
      margin-right: 16px;
      color: #666;

      .el-select .el-input {
        margin: 0;

        .el-input__inner {
          background: transparent;
          border-color: rgba(255, 140, 0, 0.2);
        }
      }
    }
  }
}

// 为表格内容添加底部内边距，防止被固定的分页器遮挡
.el-table {
  margin-bottom: 70px; // 留出分页器的空间

  :deep(.el-table__body-wrapper) {
    // 如果表格内容较少，也确保有足够空间
    min-height: calc(100vh - 250px); // 根据实际情况调整数值
  }
}

// 如果需要在小屏幕上调整
@media screen and (max-height: 600px) {
  .pagination {
    position: static; // 在小屏幕上取消固定定位
    margin-top: 20px;
  }

  .el-table {
    margin-bottom: 20px;
  }
}

// 移除表格hover效果
.el-table {
  :deep(.el-table__body-wrapper) {
    tr {
      td {
        background: transparent;
      }
    }
  }
}
</style>