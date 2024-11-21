<template>
  <div class="no-data">
    <Icon :width="120" iconName="no_data" fit="fill"/>
    <div class="msg">{{ msg }}</div>
  </div>
</template>

<script setup>
const props = defineProps({
    msg: {
        type: String,
        default: "暂无数据"
    }
});
</script>

<style scoped lang="scss">
.no-data {
    text-align: center;
    padding: 10px 0;
    .icon-empty {
        font-size: 50px;
        color: #bbb;
    }
    .msg {
        margin-top: 10px;
        color: #909090;
        font-size: 14px;
    }
}
</style>