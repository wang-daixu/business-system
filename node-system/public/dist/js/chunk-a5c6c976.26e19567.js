(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-a5c6c976"],{4411:function(e,t,a){"use strict";var n=a("8334"),r=a.n(n);r.a},8334:function(e,t,a){},a3f4:function(e,t,a){"use strict";a.r(t);var n=function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("el-container",[a("el-header",{attrs:{height:"100px"}},[e._v(" 会员号码"),a("el-input",{staticClass:"searchPhone",attrs:{placeholder:"请输入手机号码"},nativeOn:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.searchBtn()}},model:{value:e.searchPhone,callback:function(t){e.searchPhone=t},expression:"searchPhone"}},[a("template",{slot:"append"},[a("el-button",{attrs:{type:"primary",icon:"el-icon-search"},on:{click:function(t){return e.searchBtn()}}},[e._v("搜索")])],1)],2)],1),a("el-main",[a("div",{staticClass:"bottons"},[a("el-button",{attrs:{type:"success",round:"",plain:""},on:{click:function(t){return e.addBtn()}}},[e._v("添加会员")]),a("el-button",{attrs:{type:"warning",round:"",plain:""},on:{click:function(t){return e.exportExcel()}}},[e._v("导出")])],1),a("div",[a("el-table",{staticStyle:{width:"100%"},attrs:{data:e.tableData,border:"",stripe:"",id:"out-table"}},[a("el-table-column",{attrs:{prop:"member_id",label:"会员编号",width:"80"}}),a("el-table-column",{attrs:{prop:"member_name",label:"会员名称",width:"180"}}),a("el-table-column",{attrs:{prop:"phone_number",label:"会员号码",width:"300"}}),a("el-table-column",{attrs:{prop:"integral",label:"积分数",width:"180"}}),a("el-table-column",{attrs:{prop:"count",label:"下单数",width:"180"}}),a("el-table-column",{attrs:{prop:"create_time",label:"注册时间",width:"180"}}),a("el-table-column",{attrs:{label:"操作"},scopedSlots:e._u([{key:"default",fn:function(t){return[a("el-button",{attrs:{size:"mini",type:"danger"},on:{click:function(a){return e.handleDelete(t.$index,t.row)}}},[e._v("删除")])]}}])})],1)],1),a("div",{staticClass:"pagination"},[a("el-pagination",{attrs:{"current-page":e.currentPage,"page-size":e.pageSize,layout:"total,prev, pager, next, jumper",total:e.total},on:{"current-change":e.handleCurrentChange,"update:currentPage":function(t){e.currentPage=t},"update:current-page":function(t){e.currentPage=t}}})],1)]),a("el-dialog",{attrs:{title:"添加会员",visible:e.dialogFormVisible},on:{"update:visible":function(t){e.dialogFormVisible=t},closed:function(t){return e.handleClose()}}},[a("el-form",[a("el-form-item",{attrs:{label:"会员名称","label-width":"120px"}},[a("el-input",{attrs:{autocomplete:"off"},model:{value:e.member_name,callback:function(t){e.member_name=t},expression:"member_name"}})],1),a("el-form-item",{attrs:{label:"会员手机号","label-width":"120px"}},[a("el-input",{attrs:{autocomplete:"off"},model:{value:e.phone_number,callback:function(t){e.phone_number=t},expression:"phone_number"}})],1)],1),a("div",{staticClass:"dialog-footer",attrs:{slot:"footer"},slot:"footer"},[a("el-button",{on:{click:function(t){e.dialogFormVisible=!1}}},[e._v("取 消")]),a("el-button",{attrs:{type:"success",plain:""},on:{click:function(t){return e.handleSave()}}},[e._v("添 加")])],1)],1)],1)},r=[],o=(a("6a61"),a("327b")),i=a("b775");function l(e,t){return s.apply(this,arguments)}function s(){return s=Object(o["a"])(regeneratorRuntime.mark((function e(t,a){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return n=i["a"].request({method:"get",url:"/console/memberList",params:{currentPage:t,pageSize:a}}),e.abrupt("return",n);case 2:case"end":return e.stop()}}),e)}))),s.apply(this,arguments)}function c(e){return u.apply(this,arguments)}function u(){return u=Object(o["a"])(regeneratorRuntime.mark((function e(t){var a;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return a=i["a"].request({method:"get",url:"/console/deleteMember",params:{member_id:t}}),e.abrupt("return",a);case 2:case"end":return e.stop()}}),e)}))),u.apply(this,arguments)}function p(e){return m.apply(this,arguments)}function m(){return m=Object(o["a"])(regeneratorRuntime.mark((function e(t){var a;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return a=i["a"].request({method:"get",url:"/console/searchMember",params:{phone_number:t}}),e.abrupt("return",a);case 2:case"end":return e.stop()}}),e)}))),m.apply(this,arguments)}function d(e,t){return h.apply(this,arguments)}function h(){return h=Object(o["a"])(regeneratorRuntime.mark((function e(t,a){var n;return regeneratorRuntime.wrap((function(e){while(1)switch(e.prev=e.next){case 0:return n=i["a"].request({method:"get",url:"/console/addMember",params:{member_name:t,phone_number:a}}),e.abrupt("return",n);case 2:case"end":return e.stop()}}),e)}))),h.apply(this,arguments)}var b=a("ecc0"),f=a.n(b),g=a("d85b"),v=a.n(g),_={data:function(){return{searchPhone:"",tableData:[],currentPage:1,pageSize:10,total:0,dialogFormVisible:!1,member_name:"",phone_number:""}},created:function(){var e=this;l(this.currentPage,this.pageSize).then((function(t){200===t.data.code&&(e.tableData=t.data.data.memberList,e.total=t.data.data.total)}))},methods:{handleClose:function(){this.member_name="",this.phone_number=""},handleSave:function(){var e=this;""!==this.phone_number?d(this.member_name,this.phone_number).then((function(t){200===t.data.code?(e.$message({message:"添加成功!",type:"success"}),l(e.currentPage,e.pageSize).then((function(t){200===t.data.code&&(e.tableData=t.data.data.memberList,e.total=t.data.data.total)})),e.dialogFormVisible=!1):e.$message.error("添加失败!")})):this.$message({message:"手机号不能为空!",type:"warning"})},addBtn:function(){this.dialogFormVisible=!0},exportExcel:function(){var e=v.a.utils.table_to_book(document.querySelector("#out-table")),t=v.a.write(e,{bookType:"xlsx",bookSST:!0,type:"array"});try{f.a.saveAs(new Blob([t],{type:"application/octet-stream"}),"会员信息.xlsx")}catch(a){"undefined"!==typeof console&&console.log(a,t)}return t},handleDelete:function(e,t){var a=this;this.$confirm("此操作将删除该会员不可复原, 是否继续?","提示",{confirmButtonText:"确定",cancelButtonText:"取消",type:"warning"}).then((function(){c(t.member_id).then((function(e){200===e.data.code?(a.$message({message:"删除成功!",type:"success"}),l(a.currentPage,a.pageSize).then((function(e){200===e.data.code?(a.tableData=e.data.data.memberList,a.total=e.data.data.total):a.tableData=[]}))):a.$message.error("删除失败,请稍后再试!")}))}))},handleCurrentChange:function(e){var t=this;this.currentPage=e,l(this.currentPage,this.pageSize).then((function(e){200===e.data.code&&(t.tableData=e.data.data.memberList,t.total=e.data.data.total)}))},searchBtn:function(){var e=this;""===this.searchPhone?l(this.currentPage,this.pageSize).then((function(t){200===t.data.code?(e.tableData=t.data.data.memberList,e.total=t.data.data.total):e.tableData=[]})):p(this.searchPhone).then((function(t){200===t.data.code?(e.$message({message:"查询成功!",type:"success"}),e.tableData=t.data.data.member,e.total=t.data.data.total):e.$message("未查到相关手机号!")}))}}},y=_,w=(a("4411"),a("9ca4")),k=Object(w["a"])(y,n,r,!1,null,"8eb447c6",null);t["default"]=k.exports}}]);
//# sourceMappingURL=chunk-a5c6c976.26e19567.js.map