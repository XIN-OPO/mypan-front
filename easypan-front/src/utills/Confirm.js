import { ElMessageBox } from "element-plus";

const confirm = (msg, callback) => {
    ElMessageBox.confirm(msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "info"
    }).then(() => {
        callback();
    }).catch(() => { });    
}

export default confirm;