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
                    <el-button @click="insert" type="primary" v-hasPermission="['MENU_INSERT']">添加信息</el-button>
                </el-col>
            </el-row>
             <el-table :data="tableData" stripe  row-key="id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                v-loading="loading"
                element-loading-spinner="el-icon-loading">
                <el-table-column prop="path" label="前端路由" />
                <el-table-column prop="icon" label="图标" />
                <el-table-column prop="title" label="标题" />
                <el-table-column prop="component" label="前端组件" />
                <el-table-column label="是否启用" v-hasPermission="['MENU_UPDATE']">
                    <template slot-scope="scope">
                        <el-switch @change="updateStatus(scope.row)" v-model="scope.row.status" />
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)" size="small" icon="el-icon-edit" circle v-hasPermission="['MENU_UPDATE']" />
                         <el-button type="danger" @click="deleteById(scope.row.id)" size="small" icon="el-icon-delete" circle v-hasPermission="['MENU_DELETE']" />
                    </template>
                </el-table-column>
             </el-table>
              <el-pagination
                v-if="total > 0"
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
            <el-form :model="menuForm" ref="menuForm" :rules="formRules" label-width="120px" style="margin-right:20px">
                <el-form-item label="是否父级菜单" v-if="insertType">
                    <el-checkbox v-model="hideParentMenu" style="margin-left:-90%;"/>
                </el-form-item>
                <el-form-item label="父级菜单" prop="parentId" v-if="!hideParentMenu" >
                    <el-select v-model="menuForm.parentId" placeholder="请选择"  style="width:100%;">
                        <el-option
                        v-for="(item, index) in parentList"
                        :key="index"
                        :label="item.title"
                        :value="item.id"
                        :disabled="!item.status">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="前端路径" prop="path" >
                    <el-input v-model="menuForm.path"/>
                </el-form-item>
                <el-form-item label="图标" prop="icon" >
                    <e-icon-picker v-model="menuForm.icon"></e-icon-picker>
                </el-form-item>
                <el-form-item label="标题" prop="title" >
                    <el-input v-model="menuForm.title"/>
                </el-form-item>
                <el-form-item label="前端组件" prop="component" >
                    <el-input v-model="menuForm.component"/>
                </el-form-item>
                <el-form-item label="是否启用" prop="status" >
                    <el-radio-group v-model="menuForm.status" style="margin-left:-70%;">
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
            insertType: true,
            // 是否展示父级菜单输入框
            hideParentMenu: false,
            menuForm: {
                status: true,
            },
            // 父级菜单
            parentList: [],
            formRules: {
                parentId: [
                    { required: true, message: "请选择父级菜单", trigger: "blur" },
                ],
                path: [
                    { required: true, message: "请输入菜单路径", trigger: "blur" },
                    { min: 1, max: 100, message: "长度为 1~100 位", trigger: "blur" }
                ],
                icon: [
                    { required: true, message: "请选择图标", trigger: "blur" },
                ],
                title: [
                    { required: true, message: "请输入菜单名称", trigger: "blur" },
                    { min: 1, max: 50, message: "长度为 1~50 位", trigger: "blur" }
                ],
                component: [
                    { required: true, message: "请输入菜单组件路径", trigger: "blur" },
                    { min: 1, max: 50, message: "长度为 1~50 位", trigger: "blur" }
                ],              
            },
        }
    },
    created() {
        this.findPage();
        this.findParent();
    },
    methods:{
        insert() {
            this.insertType = true;
            this.hideParentMenu = false;
            this.title = '添加菜单';
            this.open = true;
        },
         // 分页查询
        findPage() {
             this.loading = true;
            this.$ajax.post('/menu/findPage', this.queryInfo).then((res) => {
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
        updateStatus(row) {
            this.$ajax.post('/menu/update', row).then((res) => {
                this.$message.success('状态更新成功！');
            });
        },
        update(row) {
            this.insertType = false;
            this.menuForm = row;
            if(row.parentId === null) {
                this.hideParentMenu = true;
            }
            this.title = '修改菜单';
            this.open = true;
        },
        // 删除数据
        deleteById(id) {
            this.$confirm('您的操作将永久删除编号为 '+ id + ' 的数据', '是否继续?', '提示', {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            }).then(() => {
                this.$ajax.delete(`/menu/delete/${id}`).then((res) => {
                this.$message.success(res.data.message);
                this.queryInfo.pageNumber = 1;
                this.findPage();
            });
            }).catch(() => {
            this.$message.info("操作已取消!");
            });
        },
        // 取消弹窗
        cancel() {
            this.menuForm = {};
            this.hideParentMenu = false;
            this.open = false;
            this.findPage();
        },
        // 确定表单
        sure() {
            this.$refs.menuForm.validate((valid) => {
                if(!valid) return this.$message.error('表单校验不通过，请检查后提交'); 
                if(this.menuForm.id === undefined || this.menuForm.id === null) {
                    this.$ajax.post('/menu/insert', this.menuForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                } else {
                    this.$ajax.post('/menu/update', this.menuForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                }
            });
        },
        findParent() {
            this.$ajax.get('/menu/findParent').then((res) => {
                this.parentList = res.data.data;
            });
        },
    }
}
</script>

<style scoped>

</style>