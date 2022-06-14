<template>
  <van-tabs v-model="activeName" line-width="100px">
    <van-tab title="申请" name="APPLY">
      <Apply v-if="activeName==='APPLY'" @toTab="toTab"></Apply>
    </van-tab>
    <van-tab title="已申报业务查询" name="RECORD">
      <Record v-if="activeName==='RECORD'"></Record>
    </van-tab>
  </van-tabs>
</template>

<script>
import { Component, Vue } from 'vue-property-decorator';
import Record from './Components/Record.vue';
import Apply from './Components/Apply.vue';

@Component({
  components: {
    Record,
    Apply,
  },
})
export default class extends Vue {
  activeName = 'APPLY';

  loading = false;

  toTab(activeName) {
    this.activeName = activeName;
  }

  created() {
    // init
  }
}
</script>

