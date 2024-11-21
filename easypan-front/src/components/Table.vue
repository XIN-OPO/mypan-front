<template>
  <div>
    <el-table
    ref="dataTable"
    :data="dataSource.list || []"
    :height="tableHeight"
      :stripe="options.stripe"
      :border="options.border"
      header-row-class-name="table-header-row"
      highlight-current-row
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    >
        <!-- 选择框 -->
        <el-table-column
        v-if="options.selectType && options.selectType == 'checkbox'"
        type="selection"
        width="55"
        align="center"
        >
        </el-table-column>
        <!-- 序号 -->
        <el-table-column
        v-if="options.showIndex"
        type="index"
        width="50"
        align="center"
        label="序号"
        >
        </el-table-column>
        <!-- 数据列 -->
        <template v-for="(column,index) in columns">
            <template v-if="column.scopedSlots">
                <el-table-column
                :key="index"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                :align="column.align || 'left'"
                >
                    <template #default="scope">
                        <slot :name="column.scopedSlots" :row="scope.row" :index="scope.$index"></slot>
                    </template>
                </el-table-column>
            </template>
            <template v-else>
                <el-table-column
                :key="index"
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                :align="column.align || 'left'"
                :fixed="column.fixed"
                ></el-table-column>
            </template>
        </template>
    </el-table>
    <!-- 分页 -->
     <div class="pagination"  v-if="showPagination">
        <el-pagination
        v-if="dataSource.totalCount"
        background
        :page-sizes="[15,30,50,100]"
        :total="dataSource.totalCount"
        :page-size="dataSource.pageSize"
        :current-page.sync="dataSource.pageNo"
        @current-change="handlePageNoChange"
        @size-change="handlePageSizeChange"
        style="text-align: right;"
        :layout="layout"
        ></el-pagination>
     </div>
  </div>
</template>

<script setup>


import { ref ,computed, onMounted} from 'vue';

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
const setCurrentRow = (rowKey,rowValue) => {
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

.el-table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-table__header, .el-table__body {
  background-color: var(--background-color);
}

.el-table__cell {
  padding: 0.5rem 1rem;
  color: var(--text-color);
  transition: background-color 0.3s, color 0.3s;
  &:hover {
    background-color: var(--border-color);
    color: var(--secondary-color);
  }
}

.pagination {
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  background-color: var(--background-color);
}

.el-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-color: var(--background-color);
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.el-pagination .el-pager li.active {
  background-color: var(--primary-color);
  color: #fff;
}

.el-pagination .el-pager li:hover {
  background-color: var(--secondary-color);
  color: #fff;
}
</style>