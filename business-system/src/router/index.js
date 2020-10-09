import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "LoginIndex",
    component: () => import("@/views/Login/index.vue"),
    redirect: "/login",
    children: [
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Login/login.vue")
      },
      {
        path: "/forgetPwd",
        name: "ForgetPwd",
        component: () => import("@/views/Login/forgetPwd.vue")
      },
      {
        path: "/register",
        name: "Register",
        component: () => import("@/views/Login/register.vue")
      }
    ]
  },
  {
    path: "/console",
    name: "Console",
    component: () => import("@/views/Console/console.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});
router.beforeEach((to,from,next)=>{
  if(localStorage.getItem("token")){//判断是否需要登录
      next()
  }else{
      if(to.name!=="Login"&&to.name!=="ForgetPwd"&&to.name!=="Register"){
        next("/login")
      }else{
        next()
      }
  }
});
export default router;
