export default [
  {
    path: '/xxx/xxx',
    name: 'xxx-xxx',
    meta: {
      name: {{description}},
    },
    component: () => import(/* webpackChunkName: "xxx-xxx" */ './index.vue'),
  },
];
