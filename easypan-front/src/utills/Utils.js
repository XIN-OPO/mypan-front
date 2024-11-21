export default {
    sizeToStr: (limit) => {
        var size = "";
        if (limit < 1024) {
            size = limit + "B";
        } else if (limit < 1024 * 1024) {
            size = (limit / 1024).toFixed(2) + "KB";
        } else if (limit < 1024 * 1024 * 1024) {
            size = (limit / (1024 * 1024)).toFixed(2) + "MB";
        } else {
            size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB";
        }
        return size;
    }   
}