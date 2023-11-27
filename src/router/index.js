import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path:"/",
        name: "view",
        component: () => import("../views/view.vue"),
      },
]
const router = new VueRouter({
    routes,
  });
  
  export default router;