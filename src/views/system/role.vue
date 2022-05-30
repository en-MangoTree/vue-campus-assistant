<template>
    <div>
        <el-card style="min-height:640px;">
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.queryString" clearable @clear="findPage">
                        <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="3">
                    <el-button @click="insert" type="primary" v-hasPermission="['PRE_ROLE__INSERT']">添加信息</el-button>
                </el-col>
            </el-row>
            <el-table :data="tableData" stripe
                v-loading="loading"
                element-loading-spinner="el-icon-loading">
                <el-table-column type="index" label="序号" width="80"/>
                <el-table-column prop="label" label="角色标签"/>
                <el-table-column prop="code" label="标签值" />
                <el-table-column label="是否启用" v-hasPermission="['PRE_ROLE_UPDATE']">
                    <template slot-scope="scope">
                        <el-switch @change="updateStatus(scope.row)" v-model="scope.row.status" />
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)" size="small" icon="el-icon-edit" circle v-hasPermission="['PRE_ROLE_UPDATE']" />
                         <el-button type="danger" @click="deleteById(scope.row.id)" size="small" icon="el-icon-delete" circle v-hasPermission="['PRE_ROLE_DELETE']" />
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pageNumber"
                :page-sizes="[7, 20, 50, 100]"
                :page-size="queryInfo.pageSize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total" />
        </el-card>

        <el-drawer
            :title="title"
            :visible.sync="open"
            direction="rtl"
            :before-close="cancel">
            <el-form :model="roleForm" ref="roleForm" :rules="formRules"  label-width="120px" style="margin-right:20px">
                <el-form-item label="角色标签" prop="label" >
                    <el-input v-model="roleForm.label"/>
                </el-form-item>
                <el-form-item label="标签值" prop="code" >
                    <el-input v-model="roleForm.code"/>
                </el-form-item>
                <el-card style="margin:20px 0 0 30px;">
                    <div slot="header" class="clearfix">
                        <span>菜单列表</span>
                    </div>
                    <el-tree 
                        ref="tree"
                        :data="menuList"
                        show-checkbox
                        node-key="id"
                        :props="{label: 'title', children: 'children'}"
                        @check-change="checkNode"
                    />
                </el-card>

                <el-card style="margin:20px 0 0 30px;">
                    <div slot="header" class="clearfix">
                        <span>权限列表</span>
                    </div>
                    <el-checkbox-group v-model="checkLabel">
                        <el-checkbox 
                            border size="mini" 
                            :disabled="!item.status" 
                            v-for="(item,index) in permissionList" 
                            :label="item.label" 
                            :key="index" 
                        />
                    </el-checkbox-group>
                </el-card>

                <el-form-item label="是否启用" prop="status" >
                    <el-radio-group v-model="roleForm.status">
                        <el-radio :label="true">是</el-radio>
                        <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div class="demo-drawer__footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="sure">确 定</el-button>
            </div>
        </el-drawer>

    </div>
</template>

<script>
export default {
    data() {
        return {
            // 分页查询条件
            queryInfo: {
                "pageNumber": 1,
                "pageSize": 7,
                "queryString": ""
            },
            tableData: [],
            total: 0,
            // 表单标题
            title: null,
            // 表格加载
            loading: false,
            // 打开弹框
            open: false,
            roleForm: {
                status: true,
            },
            formRules: {
                label: [
                    { required: true, message: "请输入用户名", trigger: "blur" },
                    { min: 1, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
                ],
                code: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    { min: 2, max: 12, message: "密码为 2~12 位", trigger: "blur" }
                ]
            },
            // 菜单列表
            menuList:[],
            checkMenu:[],
            // 权限列表
            permissionList:[],
            // 选中权限列表
            checkLabel:[],
            checkPermission:[],
        }
    },
    created() {
        this.findPage();
        this.findMenuAndPermission();
    },
    methods: {
        findMenuAndPermission() {
            this.$ajax.get('/menu/findParent').then((res) => {
                this.menuList = res.data.data;
                // 对菜单进行改造
                this.menuList.filter(item => {
                    item.disabled = !item.status;
                    if(item.children && item.children.length > 0) {
                        item.children.filter(children => {
                            children.disabled = !children.status
                        });
                    }
                });
            });
            this.$ajax.get('/permission/findAll').then((res) => {
                this.permissionList = res.data.data;
            });
        },
        insert() {
            this.checkPermission = [];
            this.title = '添加角色';
            this.open = true;
        },
        // 分页查询
        findPage() {
             this.loading = true;
            this.$ajax.post('/role/findPage', this.queryInfo).then((res) => {
                 this.loading = false;
                this.tableData = res.data.rows;
                this.total = res.data.total;
            });
        },
        // 页码改变事件
        handleCurrentChange(newPageNumber) {
            this.queryInfo.pageNumber = newPageNumber;
            this.findPage();
        },
        // 页面大小改变事件
        handleSizeChange(newPageSize) {
            this.queryInfo.pageSize = newPageSize;
            this.findPage();
        },
        update(row) {
            console.log(row);
            this.checkMenu = [];
            this.checkLabel = [];
            this.checkPermission = [];
            this.roleForm = row;
            this.title = '修改角色';
            row.menus.forEach(item => {
                if(item.children && item.children.length > 0){
                    item.children.forEach(i => {
                        this.checkMenu.push(i);
                    });
                }
            });
             row.permissions.forEach(item => {
                this.checkLabel.push(item.label);
                this.checkPermission.push(item);
            });
            this.$nextTick(() => {
                this.$refs.tree.setCheckedNodes(this.checkMenu);
            });
            this.open = true;
        },
        // 删除数据
        deleteById(id) {
            this.$confirm('您的操作将永久删除编号为 '+ id + ' 的数据', '是否继续?', '提示', {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            }).then(() => {
                this.$ajax.delete(`/role/delete/${id}`).then((res) => {
                this.$message.success(res.data.message);
                this.queryInfo.pageNumber = 1;
                this.findPage();
            });
            }).catch(() => {
            this.$message.info("操作已取消!");
            });
        },
        // 关闭弹窗
        dialogClose() {
            this.$refs.tree.setCheckedKeys([]);
            this.checkLabel = [],
            this.checkMenu = [];
            this.roleForm = {};
        },
        // 取消弹窗
        cancel() {
            this.roleForm = {};
            this.$refs.tree.setCheckedKeys([]);
            this.checkLabel = [],
            this.checkMenu = [];
            this.open = false;
            this.findPage();
        },
        // 确定表单
        sure() {
            this.$refs.roleForm.validate((valid) => {
                if(!valid) return this.$message.error('表单校验不通过，请检查后提交'); 
                this.roleForm.menus = this.checkMenu;
                this.checkLabel.forEach((item) => {
                    this.permissionList.forEach((i) => {
                        if( item === i.label ) {
                            this.checkPermission.push(i);
                        }
                    });
                });
                this.roleForm.permissions = this.checkPermission;
                if(this.roleForm.id === undefined || this.roleForm.id === null) {
                    this.$ajax.post('/role/insert', this.roleForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                } else {
                    this.$ajax.post('/role/update', this.roleForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                }
            });
        },
        updateStatus(row) {
            this.$ajax.post('/role/update', row).then((res) => {
                        this.$message.success('状态更新成功！');
                    });
        },
        
        /** 获取树形控件选中节点
         * getCheckedNodes接收两个 boolean 类型的参数，
         * 1. 是否只是叶子节点，默认值为 false
         * 2. 是否包含半选节点，默认值为 false 
         */ 
        checkNode() {
            this.checkMenu = [];
            const node = this.$refs.tree.getCheckedNodes(false, true);
            node.forEach(item => {
                this.checkMenu.push(item);
            });
        },

    }
};
</script>

<style scoped>
    .el-checkbox{
        margin: 5px 0;
    }
</style>