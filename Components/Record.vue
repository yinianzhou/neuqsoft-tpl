<template>
  <div style="padding: 20px 10px">
    <NoData text="暂未查询到提交过的申请" v-if="!recordList.length" />
    <van-pull-refresh v-else v-model="isLoading" @refresh="getRecordList">
      <div v-for="(item, key) in recordList" :key="key" style="margin-bottom: 20px">
        <van-cell-group>
          <van-field :value="item.apc001" label="业务流水号" readonly input-align="right" />
          <van-field :value="item.reviewStatusName" label="审核状态" readonly input-align="right" />
          <van-field
            v-if="item.reviewStatus === '2'"
            :value="item.reviewComment"
            label="不通过原因"
            readonly
            input-align="right"
          />
          <van-field :value="item.submitDate" label="提交时间" readonly input-align="right" />
          <van-field
            v-if="item.reviewDate"
            :value="item.reviewDate"
            label="审核时间"
            readonly
            input-align="right"
          />
          <van-cell>
            <template #title></template>
            <template #label>
              <div class="content-button">
                <ReButton type="1" @click="queryPersonInfo(item)">详情查看</ReButton>
                <CancelBtn
                  v-if="item.reviewStatus === '0'"
                  @finallyCb="finallyCb"
                  :apc001="item.apc001"
                >取消申报</CancelBtn>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </div>
    </van-pull-refresh>
    <van-popup v-model="detailShow" round style="width: 80%; padding: 10px 5px">
      <div>
        <van-cell-group title="基本信息">
          <van-field v-model="detail.aac003" label="姓名" input-align="right" readonly />
        </van-cell-group>
      </div>
    </van-popup>
  </div>
</template>
<script>
import { Component, Vue } from 'vue-property-decorator';
import NoData from '@/components/noData/NoData.vue';
import Services from '../services';
import codeItem from '@/utils/code-item';
import string from '@/utils/string';
import ReButton from '@/components/button/ReButton';
import { APPLY_TYPE, APP_CODE } from '../constants';
import CancelBtn from '@/components/cancelBtn';
@Component({
  components: {
    NoData,
    ReButton,
    CancelBtn,
  },
})
export default class extends Vue {
  detailShow = false;
  recordList = [];
  isLoading = false;
  applytype = APPLY_TYPE;
  appcode = APP_CODE;
  userInfo = {};
  detail = {};

  async getUserInfo() {
    try {
      const data = await Services.getUserInfo();
      this.userInfo = data || {};
      this.getRecordList();
    } catch (error) {
      this.alert('提示', error.message);
    }
  }

  async queryPersonInfo(item) {
    const params = {
      apc001: item.apc001,
      appcode: item.appcode,
    };
    try {
      const data = await Services.queryPersonInfo(params);
      this.detail = data || {};
      this.detailShow = true;
    } catch (error) {
      this.alert('提示', error.message);
    }
  }

  async getRecordList() {
    const params = {
      appcode: this.appcode,
      aac002: this.userInfo.aac002,
      applytype: this.applytype,
      page: '1',
      size: '9999',
    };
    try {
      const { content } = await Services.getRecordList(params);
      this.recordList = (content || []).map((item) => {
        return {
          ...item,
          submitDate: string.dateStrToFormat('YYYYMMDDHHmmss', item.submitDate),
          reviewDate: string.dateStrToFormat('YYYYMMDDHHmmss', item.reviewDate),
        };
      });

      this.isLoading = false;
    } catch (error) {
      this.$dialog.alert({
        title: '提示',
        message: error.message,
      });
      this.isLoading = false;
    }
  }

  finallyCb() {
    this.getRecordList();
  }

  created() {
    // init
    this.getUserInfo();
  }
}
</script>
<style lang="less" scoped>
.title {
  cursor: pointer;
  color: #1989fa;
}
</style>
