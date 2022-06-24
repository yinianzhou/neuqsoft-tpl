export default [
  {
    path: '/xxx/xxx',
    name: 'xxx-xxx',
    meta: {
      name: '模块名称',
    },
    component: () => import(/* webpackChunkName: "xxx-xxx" */ './index.vue'),
  },
];
