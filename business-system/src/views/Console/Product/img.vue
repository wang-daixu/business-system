<template>
  <div>
    <h1>添加产品</h1>
      <el-upload
      action="http://up-z0.qiniu.com"
      accept="image/jpeg,image/gif,image/png,image/bmp"
      :show-file-list="false"
      :data="uploadData"
      :on-success="handleSuccess"
      :on-error="uploadError"
      :before-upload="beforeUpload"
    >
    <img :src="imageUrl">
    </el-upload>
  </div>
</template>
<script>
import { getUploadToken } from "@/api/product";
import { getRandom } from "@/utils/util";
export default {
  data() {
    return {
      uploadData: { key: "", token: "" }, //key为上传的文件名
      qiniuConfig: {
        qiniuPath: "http://qi4h218o0.hd-bkt.clouddn.com/"
      },
      imageUrl: 'https://dss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1689053532,4230915864&fm=26&gp=0.jpg'
    };
  },
  mounted() {
    getUploadToken().then(res => {
      if (res.data.code === 200) {
        this.uploadData.token = res.data.data.uploadToken;
      }
    });
  },
  methods: {
    handleSuccess(res, file, fileList) {
      //上传成功返回执行
      console.log(res, file, fileList);
      console.log(this.qiniuConfig.qiniuPath + res.key);
      this.imageUrl = this.qiniuConfig.qiniuPath + res.key;
      this.$message({
        message: "上传成功",
        type: "success"
      });
    },
    beforeUpload(file) {
      //上传之前
      const isPNG = file.type === "image/png";
      const isJPEG = file.type === "image/jpeg";
      const isJPG = file.type === "image/jpg";
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isPNG && !isJPEG && !isJPG) {
        this.$message.error("上传头像图片只能是 jpg、png、jpeg 格式!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
        return false;
      }
      for (let i = 0; i < 5; i++) {
        this.uploadData.key = this.uploadData.key + getRandom(0, 9);
      }
      this.uploadData.key = this.uploadData.key + `${new Date().getTime()}`;
    },
    uploadError(err, file, fileList) {
      //上传失败调用
      this.$message({
        message: "上传出错，请重试！",
        type: "error",
        center: true
      });
    }
  }
};
</script>
<style lang="scss" scoped>
h1 {
  font-size: 30px;
}
</style>