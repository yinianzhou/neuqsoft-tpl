<template>
  <div class="common-body">
    <div class="query-tab">
      <a-tabs default-active-key="APPLY" @change="onChange">
        <a-tab-pane key="APPLY" tab="{{description}}业务办理">
          <Apply ref="ApplyRef"></Apply>
        </a-tab-pane>
        <a-tab-pane key="RECORD" tab="已申报业务查询">
          <YsbywcxYtj
            :appcode="appcode"
            :applytype="applytype"
            @viewDetailInfo="viewDetailInfo"
            :pauseGuid="pauseGuid"
          ></YsbywcxYtj>
        </a-tab-pane>
      </a-tabs>
    </div>
    <a-drawer
      title="申报信息查看"
      placement="right"
      width="30%"
      :closable="false"
      :visible="visible"
      @close="onCloseSteps"
    >
      <Detail :detail-info="detailInfo" ref="detailInfoRef" :pauseGuid="pauseGuid"></Detail>
    </a-drawer>
  </div>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';
import Apply from './Components/Apply.vue';
import Detail from './Components/Detail.vue';
import YsbywcxYtj from '@/components/YsbywcxYtj';
import guid from '@/utils/guid';
import ConfirmTips from '@/components/confirmTips';
import { APP_CODE, APPLY_TYPE } from './constants';
@Component({
  name:{{name}},
  components: {
    YsbywcxYtj,
    Detail,
    Apply,
    ConfirmTips,
  },
})
export default class extends Vue {
  active = 'APPLY';
  appcode = APP_CODE;
  applytype = APPLY_TYPE;
  visible = false;
  showTips = true;
  disableEdit = false; //详情页面是否可编辑
  pauseGuid = '';
  detailInfo = {};

  created() {
    this.pauseGuid = guid.getCode();
  }
  onChange(key) {
    if (key == 'RECORD') {
      this.pauseGuid = guid.getCode();
    }
  }

  viewDetailInfo(item) {
    this.pauseGuid = guid.getCode();
    this.detailInfo = item;
    this.visible = true;
  }

  onCloseSteps() {
    this.visible = false;
  }
}
</script>
<style scoped lang="less">
@import '../../../../assets/less/ytj';
</style>
