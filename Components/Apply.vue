<template>
  <div>
    <a-spin :spinning="spinning" tip="正在加载中...">
      <div v-if="!queryresult">
        <a-form-model
          style="background-color: #F5F5F5;"
          ref="ruleForm"
          :model="formData"
          class="ant-advanced-search-form"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 10 }"
        >
          <NBox title="展示信息">
            <a-row>
              <a-col span="12">
                <a-form-model-item label="姓名：" prop="xxx">{{formData.xxx}}</a-form-model-item>
              </a-col>
            </a-row>
          </NBox>

          <NBox title="编辑信息">
            <a-row>
              <a-col span="12">
                <a-form-model-item label="输入：" :required="true" prop="xxx">
                  <a-input v-model="formData.xxx" v-keyboard></a-input>
                </a-form-model-item>
              </a-col>
              <a-col span="12">
                <a-form-model-item label="选择：" :required="true" prop="select">
                  <a-select v-model="formData.select" placeholder="请选择" :options="optionList"></a-select>
                </a-form-model-item>
              </a-col>
              <a-col span="12">
                <a-form-model-item label="日期：" :required="true" prop="date">
                  <a-date-picker :valueFormat="'YYYYMMDD'" v-model="formData.date" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </NBox>
        </a-form-model>
        <div class="_submit_btnGroup">
          <a-row>
            <a-button type="primary" @click="check" class="button-large">提交</a-button>
          </a-row>
        </div>
      </div>
    </a-spin>
    <div v-if="queryresult">
      <QueryResult :message="queryResultMessage"></QueryResult>
    </div>
    <a-modal
      v-model="submitSuccessDialog"
      v-if="submitSuccessDialog"
      width="60%"
      centered
      :footer="null"
    >
      <SubmitSuccess v-if="submitSuccessDialog" @cancelModal="cancelModal" ref="submitSuccessRef"></SubmitSuccess>
    </a-modal>
    <a-modal v-model="submitFailDialog" v-if="submitFailDialog" width="60%" centered :footer="null">
      <SubmitFail
        v-if="submitFailDialog"
        :msg="submitFail.msg"
        @cancelModal="cancelModal"
        ref="submitSuccessRef"
      ></SubmitFail>
    </a-modal>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';
import string from '@/utils/string';
import SubmitSuccess from '@/components/SubmitSuccess.vue';
import SubmitFail from '@/components/SubmitFail.vue';
import QueryResult from '@/components/QueryResult.vue';
import codeItem from '@/utils/code-item';
import Services from '../services';
import { APP_CODE } from '../constants';
import NBox from '@/components/NBox/index.vue';

@Component({
  components: {
    SubmitSuccess,
    SubmitFail,
    QueryResult,
    NBox,
  },
})
export default class extends Vue {
  spinning = false;
  queryresult = false;
  queryResultMessage = '';
  isSending = false;
  submitSuccessDialog = false;
  submitFailDialog = false;
  submitFail = {
    msg: '',
  };
  optionList = [];

  formData = {};
  // 用户数据
  user = {
    idcard: '', //证件号码
    aac003: '', //姓名
  };

  appcode = APP_CODE;

  handleH5Code(item, value) {
    return codeItem.transH5Code(item, value);
  }

  cancelModal() {
    this.submitSuccessDialog = false;
    this.submitFailDialog = false;
  }

  mounted() {
    this.init();
  }

  init() {
    this.getUserInfo();
  }

  async getUserInfo() {
    this.spinning = true;
    try {
      const data = await Services.getUserInfo();
      this.spinning = false;
      this.user = {
        ...this.user,
        idcard: data.idcard,
        aac003: data.name,
      };
      this.getFormData();
    } catch (error) {
      this.spinning = false;
      this.$warning({
        title: '提示',
        content: error.message,
      });
    }
  }

  // 获取详情，具体逻辑根据业务更改
  async getFormData() {
    this.spinning = true;
    try {
      const params = {
        idcard: this.user.idcard,
        aac003: this.user.aac003,
        appcode: this.appcode,
      };
      const { data = [], status, message } = await Services.getFormData(params);
      this.spinning = false;
      if (status === '-1') {
        this.queryResultMessage = message;
        this.queryresult = true;
        return;
      }

      const firstData = data && data.length ? data[0] : {};

      const dto = firstData.js02Dto || {};
      this.detail = this.handleData(dto);
      this.formData = {
        ...this.formData,
        ...dto,
      };
    } catch (error) {
      this.spinning = false;
      let msg = error.message || '';
      this.queryResultMessage = msg;
      this.queryresult = true;
    }
  }

  handleData(data) {
    return {
      ...data,
      aae135: string.hiddenIdCard(data.aae135),
      bae010: data.bae010
        ? codeItem.transH5Code('BAE010_SY', data.bae010)
        : data.bae010,
    };
  }

  async check() {
    if (this.isSending) {
      return;
    }

    if (!string.isPhone(this.formData.bae017)) {
      return this.$warning({
        title: '提示',
        content: '请填写正确手机号',
      });
    }
    if (!this.formData.aae006) {
      return this.$warning({
        title: '提示',
        content: '请填写居住地',
      });
    }
    const params = {
      ...this.formData,
      aae035: this.formData.aae035,
      appcode: this.appcode,
      applysrc: this.applysrc, //申请数据来源
    };
    this.spinning = true;
    try {
      this.isSending = true;
      const {
        data: { errors, errorsask },
      } = await Services.check(params);
      this.spinning = false;
      this.isSending = false;
      if (errors) {
        this.$warning({
          title: '提示',
          content: '校验失败,' + errors,
        });
      } else if (errorsask) {
        this.$confirm({
          title: '提示',
          content: response.errorsask + ',是否继续?',
          okText: '是',
          cancelText: '否',
          onOk() {
            this.onSave(params);
          },
        });
      } else {
        this.onSave(params);
      }
    } catch (error) {
      this.isSending = false;
      this.spinning = false;
      this.$error({
        title: '提示',
        content: error.message,
      });
    }
  }

  async onSave(params) {
    this.spinning = true;
    try {
      const { data, code, message } = await Services.save(params);
      this.spinning = false;
      if (code === 1) {
        this.onSubmit(data.apc001);
      } else {
        this.submitFail.msg = message;
        this.submitFailDialog = true;
      }
    } catch (error) {
      this.spinning = false;
      this.submitFail.msg = error.response ? error.response.data.message : '';
      this.submitFailDialog = true;
    }
  }
  async onSubmit(apc001) {
    this.spinning = true;
    try {
      const data = await Services.submit({ apc001 });
      this.spinning = false;
      const first = data && data.length ? data[0] : {};

      if (
        first.applyEventDtoList &&
        first.applyEventDtoList.length &&
        first.applyEventDtoList[0].reviewComment
      ) {
        this.submitFail.msg = first.applyEventDtoList[0].reviewComment;
        this.submitFailDialog = true;
      } else {
        this.submitSuccessDialog = true;
      }
    } catch (error) {
      this.spinning = false;
      this.submitFail.msg = error.response ? error.response.data.message : '';
      this.submitFailDialog = true;
    }
  }
}
</script>

<style scoped lang="less">
@import '../../../../../assets/less/ytj';
</style>
