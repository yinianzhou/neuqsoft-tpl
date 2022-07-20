<template>
  <div class="common-body">
    <NoData text v-if="showNoData" />
    <div v-else>
      <van-cell-group title="基本信息">
        <van-field input-align="right" label="姓名" v-model="detail.name" readonly></van-field>
      </van-cell-group>
      <van-cell-group title="其他信息">
        <van-field input-align="right" label="拓新" v-model="detail.tx" readonly></van-field>
      </van-cell-group>
      <van-cell-group title="编辑信息">
        <Picker
          v-model="formData.aae160"
          label="待遇终止原因"
          input-align="right"
          :readonly="true"
          placeholder="请选择待遇终止原因"
          :selectColumns="stopReasonList"
          :required="true"
          type="select"
        ></Picker>
        <Picker
          v-model="formData.aae035"
          label="待遇终止日期"
          input-align="right"
          :readonly="true"
          placeholder="请选择待遇终止日期"
          :required="true"
          type="date"
        ></Picker>
      </van-cell-group>
      <Button @click="check()">提交</Button>
    </div>
  </div>
</template>
<script>
import { Component, Vue, Emit } from 'vue-property-decorator';

import codeItem from '@/utils/code-item';
import string from '@/utils/string';
import Picker from '@/components/picker/RePicker';
import Button from '@/components/button/Button';
import moment from 'moment';
import NoData from '@/components/noData/NoData';
import Services from '../services';
import { APPLY_SRC, APP_CODE } from '../constants';
@Component({
  name:{{name}},
  components: {
    Picker,
    Button,
    NoData,
  },
})
export default class extends Vue {
  showNoData = false;
  appcode = APP_CODE;
  stopReasonList = [];
  applysrc = APPLY_SRC;

  detail = {};
  formData = {
    aae035: new Date(), // 变更日期
  };

  user = {
    idcard: '',
    aac003: '',
  };

  mounted() {
    this.getStopReasonList();
    this.getUserInfo();
  }

  getStopReasonList() {
    let reasonList = codeItem
      .getH5CodeList('AAE160_J')
      .sort(codeItem.compare('key'));
    this.stopReasonList = reasonList.map((item) => {
      return {
        id: item.key,
        text: item.value,
      };
    });
  }

  async getUserInfo() {
    try {
      const data = await Services.getUserInfo();
      this.user = {
        ...this.user,
        idcard: data.idcard,
        aac003: data.name,
      };
      this.getFormData();
    } catch (error) {
      this.alert('提示', error.message);
    }
  }

  async getFormData() {
    try {
      const params = {
        idcard: this.user.idcard,
        aac003: this.user.aac003,
        appcode: this.appcode,
      };
      const { data } = await Services.getFormData(params);
      const firstData = data.length ? data[0] : {};
      const dto = firstData.js05Dto || {};
      this.detail = dto;
      this.formData = {
        ...this.formData,
        ...dto,
      };
    } catch (error) {
      this.alert('提示', error.message);
    }
  }

  async check() {
    if (!this.formData.aae160) {
      return this.$toast('请填写待遇终止原因');
    }
    if (!this.formData.aae035) {
      return this.$toast('请填写待遇终止日期');
    }
    const params = {
      ...this.formData,
      aae035: moment(this.formData.aae035).format('YYYYMMDD'),
      appcode: this.appcode,
      applysrc: this.applysrc, //申请数据来源
    };

    this.startLoading();
    try {
      const { errors, errorsask } = await Services.check(params);

      this.stopLoading();
      if (errors) {
        this.$dialog.alert({
          title: '提示',
          message: '校验失败,' + errors,
        });
      } else if (errorsask) {
        this.$dialog
          .confirm({
            title: '提示',
            message: errorsask + ',是否继续?',
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning',
          })
          .then(() => {
            this.onSubmit(params);
          })
          .catch(() => {});
      } else {
        this.onSubmit(params);
      }
    } catch (error) {
      this.stopLoading();
      this.alert('提示', error.message);
    }
  }
  @Emit('toTab')
  toTab() {
    return 'RECORD';
  }

  async onSubmit(params) {
    this.startLoading();
    try {
      await Services.submit(params);
      this.stopLoading();
      this.alert('温馨提示', '提交成功').then(() => {});
      this.toTab();
    } catch (error) {
      this.stopLoading();
      this.alert('提示', error.message).then(() => {});
    }
  }
}
</script>
<style lang="less" scoped>
</style>
