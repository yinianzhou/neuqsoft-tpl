export default [
  {
    path: '{{router}}',
    name: '{{router}}',
    meta: {
      name: '{{description}}',
    },
    component: () => import(/* webpackChunkName: "{{router}}" */ './index.vue'),
  },
];
