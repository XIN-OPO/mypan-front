<template>
  <div v-html="excelContent" class="table-info"> 

  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick ,onMounted} from "vue"
const { proxy } = getCurrentInstance();
import * as XLSX from 'xlsx';
const excelContent = ref();

const defineProps = defineProps({
    url: {
        type: String,
    }
});

const initExcel = async () => {
    let result = await proxy.Request({
        url: defineProps.url,
        responseType: "arraybuffer"
    });
    if(!result){
        return;
    }
    let workbook = XLSX.read(new Uint8Array(result), {type: "array"});
    var firstSheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[firstSheetName];
    excelContent.value = XLSX.utils.sheet_to_html(worksheet);
}
onMounted(() => {
    initExcel();
});
</script>

<style lang="scss" scoped>
.table-info{
    width: 100%;
    height: 100%;
    padding: 10px;
    :deep table{
        width:100%;
        border-collapse: collapse;
        border: 1px solid #000;
        td{
            border: 1px solid #000;
            border-collapse: collapse;
            padding: 5px;
            text-align: center;
            height: 30px;
            min-width: 50px;
        }
    }
}
</style>
