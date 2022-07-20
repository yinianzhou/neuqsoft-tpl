<template>
  <div class="common-body">
    <NoData v-if="showNoData" />
    <div v-else>
      <van-cell-group title="展示信息">
        <van-field input-align="right" label="姓名" v-model="formData.name" readonly></van-field>
      </van-cell-group>
      <van-cell-group title="可编辑信息">
        <van-field
          input-align="right"
          label="输入框"
          v-model="formData.xxx"
          placeholder="请填写"
          required
        />
        <Picker
          v-model="formData.xxx"
          label="select"
          input-align="right"
          :readonly="true"
          placeholder="请选择"
          :selectColumns="optionList"
          :required="true"
          type="select"
        ></Picker>
        <Picker
          v-model="formData.xxx"
          label="日期"
          input-align="right"
          :readonly="true"
          placeholder="请选择"
          :required="true"
          type="date"
        ></Picker>
      </van-cell-group>
      <Button @click="submit()">提交</Button>
    </div>
  </div>
</template>
<script>
import { Component, Vue, Emit } from 'vue-property-decorator';

import codeItem from '@/utils/code-item';
import string from '@/utils/string';
import Picker from '@/components/picker/RePicker';
import Button from '@/components/button/Button';
import NoData from '@/components/noData/NoData';
import Services from '../services';

@Component({
  components: {
    Picker,
    Button,
    NoData,
  },
})
export default class extends Vue {
  showNoData = false;
  optionList = [];
  formData = {};

  mounted() {
    this.getRequiredData();
  }

  async getRequiredData() {
    try {
      const { data, code } = await Services.getRequiredData();
      if (code == '200') {
        this.formData = data || {};
      } else {
        this.showNoData = true;
      }
    } catch (error) {
      this.alert('提示', error.message);
      this.showNoData = true;
    }
  }

  async check() {
    const { paramsA, paramsB } = this.formData;
    if (!paramsA) {
      this.$toast('请填写');
      return false;
    }
    return true;
  }

  @Emit('toTab')
  toTab() {
    return 'RECORD';
  }

  async submit() {
    if (!this.check()) {
      return;
    }
    this.startLoading();
    try {
      const params = {};
      const { message, code } = await Services.submit(params);
      this.stopLoading();
      if (code == '200') {
        this.toTab();
      }
      this.alert(message);
    } catch (error) {
      this.stopLoading();
      this.alert('提示', error.message);
    }
  }
}
</script>
<style lang="less" scoped>
</style>
