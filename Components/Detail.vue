<template>
  <div style="background-color: #F5F5F5;">
    <a-spin :spinning="spinning" tip="正在加载中...">
      <NBox title="基本信息">
        <a-row>
          <a-col :span="12">
            <p>姓名：</p>
          </a-col>
          <a-col :span="12">
            <p>{{detail.aac003 }}</p>
          </a-col>
        </a-row>
      </NBox>
    </a-spin>
  </div>
</template>

<script>
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import string from '@/utils/string';
import codeItem from '@/utils/code-item';
import guid from '@/utils/guid';
import Services from '../services';
import NBox from '@/components/NBox/index.vue';

@Component({
  components: {
    NBox,
  },
})
export default class extends Vue {
  @Prop({ type: Object, required: true }) detailInfo;
  @Prop({ type: String, required: false }) pauseGuid;
  spinning = false;

  detail = {};

  @Watch('pauseGuid')
  changePauseGuid() {
    this.queryPersonInfo();
  }
  mounted() {
    this.pauseGuid = guid.getCode();
  }

  async queryPersonInfo() {
    this.spinning = true;
    const params = {
      apc001: this.detailInfo.apc001,
      appcode: this.detailInfo.appcode,
    };
    try {
      const { data } = await Services.queryPersonInfo(params);
      this.spinning = false;
      this.detail = this.handleData(data || {});
    } catch (error) {
      this.spinning = false;
      this.$error({
        title: '提示',
        content: error.message,
      });
    }
  }
  handleData(data) {
    return {
      ...data,
      aae135: string.hiddenIdCard(data.aae135),
      aab034: data.aab034
        ? codeItem.transH5Code('AAB034', data.aab034)
        : data.aab034,
    };
  }
}
</script>

<style scoped lang="less"></style>
