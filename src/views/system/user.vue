<template>
    <div>
        <el-card style="min-height:640px;">
            <div>
                <el-row>
                    <el-col :span="8">
                        <el-input placeholder="请输入内容" v-model="queryInfo.queryString" clearable @clear="findPage">
                            <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
                        </el-input>
                    </el-col>
                    <el-col :span="3">
                        <el-button @click="insert" type="primary" v-hasPermission="['USER_INSERT']">添加信息</el-button>
                    </el-col>
                </el-row>
                 <el-table 
                    :data="tableData" 
                    stripe
                    v-loading="loading"
                    element-loading-spinner="el-icon-loading">
                    <el-table-column type="index" label="序号" width="60"/>
                    <el-table-column prop="loginName" label="用户名"/>
                    <el-table-column prop="nickName" label="昵称" />
                    <!-- <el-table-column prop="sex" label="性别" :formatter="formatterSex"/> -->
                    <el-table-column label="头像">
                        <template slot-scope="scope">
                            <el-image
                                style="width:100%;height:100%;"
                                :src="scope.row.avatar"
                                :preview-src-list="preview(scope.row.avatar)"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column prop="phone" label="电话" />
                    <el-table-column prop="wxNumber" label="微信" />
                    <el-table-column prop="email" label="邮箱" />
                    <el-table-column label="角色标签">
                        <template slot-scope="scope">
                        <el-tag size="mini" v-for="(item, index) in scope.row.roles" :key="index">{{ item.label }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="university" label="所处大学" />
                    <el-table-column label="是否启用" v-hasPermission="['USER_UPDATE']">
                        <template slot-scope="scope">
                            <el-switch @change="updateStatus(scope.row)" v-model="scope.row.status" />
                        </template>
                    </el-table-column>
                    <el-table-column fixed="right" label="操作" width="150">
                        <template slot-scope="scope">
                            <el-button type="primary" @click="update(scope.row)" size="small" icon="el-icon-edit" circle v-hasPermission="['USER_UPDATE']" />
                            <el-button type="danger" @click="deleteById(scope.row.id)" size="small" icon="el-icon-delete" circle v-hasPermission="['USER_DELETE']" />
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
            </div>

            <el-drawer
            :title="title"
            :visible.sync="open"
            direction="rtl"
            :before-close="cancel">
            <el-form :model="userForm" ref="userForm" :rules="formRules" label-width='120px' style="margin-right:20px">
                <el-form-item label="用户名" prop="userName" >
                    <el-input v-model="userForm.userName" />
                </el-form-item>
                <el-form-item label="昵称" prop="nickName">
                    <el-input v-model="userForm.nickName" />
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="userForm.password" />
                </el-form-item>
                <el-form-item label="手机" prop="phone">
                    <el-input v-model="userForm.phone" />
                </el-form-item>
                <el-form-item label="微信" prop="wxNumber">
                    <el-input v-model="userForm.wxNumber" />
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="userForm.email" />
                </el-form-item>
                <el-form-item label="所处高校" prop="university">
                    <el-input v-model="userForm.university" />
                </el-form-item>
                <el-form-item label="头像" prop="avatar">
                    <el-input v-model="userForm.avatar" />
                </el-form-item>
                <el-form-item label="是否启用" prop="status">
                    <el-radio-group v-model="userForm.status">
                        <el-radio :label="true">是</el-radio>
                        <el-radio :label="false">否</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div class="demo-drawer__footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="sure" :loading="formLoading">{{ formLoading ? '提交中 ...' : '确 定' }}</el-button>
            </div>
        </el-drawer>
        </el-card>
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
            // 打开抽屉
            open: false,
            userForm: {
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
        }
    },
    created() {
        this.findPage();
    },
    methods: {
        insert() {
            this.title = '添加用户';
            this.open = true;
        },
        // 分页查询
        findPage() {
            this.loading = true;
            this.$ajax.post('/user/findPage', this.queryInfo).then((res) => {
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
            this.userForm = row;
            this.title = '修改用户';
            this.open = true;
        },
        // 删除数据
        deleteById(id) {
            this.$confirm('您的操作将永久删除编号为 '+ id + ' 的数据', '是否继续?', '提示', {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            }).then(() => {
                this.$ajax.delete(`/user/delete/${id}`).then((res) => {
                this.$message.success(res.data.message);
                this.queryInfo.pageNumber = 1;
                this.findPage();
            });
            }).catch(() => {
            this.$message.info("操作已取消!");
            });
        },
        // 取消表单
        cancel() {
            this.userForm = {};
            this.open = false;
            this.findPage();
        },
        // 确定表单
        sure() {
            this.$refs.userForm.validate((valid) => {
                if(!valid) return this.$message.error('表单校验不通过，请检查后提交'); 
                if(this.userForm.id === undefined || this.userForm.id === null) {
                    this.$ajax.post('/user/insert', this.userForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                } else {
                    this.$ajax.post('/user/update', this.userForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                }
            });
        },
        updateStatus(row) {
            this.$ajax.post('/user/update', row).then((res) => {
                        this.$message.success('状态更新成功！');
                    });
        },
        // 头像预览
        preview(src) {
            let arr = [];
            arr.push(src);
            return arr;
        },
        // 格式化性别
        // formatterSex(row){
        //     if(row.sex === 0){
        //         return '男';
        //     } else if (row.sex === 1) {
        //         return '女';
        //     } else {
        //         return '未知';
        //     }
            
        // },

    }
};
</script>

<style scoped>
</style>