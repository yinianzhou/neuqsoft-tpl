export default [
  {
    path: '{{router}}',
    name: '{{routerName}}',
    meta: {
      name: '{{description}}',
    },
    component: () => import(/* webpackChunkName: "{{routerName}}" */ './index.vue'),
  },
];
