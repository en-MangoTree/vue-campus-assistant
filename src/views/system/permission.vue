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
                    <el-button @click="insert" type="primary" v-hasPermission="['PRE_PERMISSION_INSERT']">添加信息</el-button>
                </el-col>
            </el-row>
            <el-table :data="tableData" stripe
                v-loading="loading"
                element-loading-spinner="el-icon-loading">
                <el-table-column type="index" label="序号" width="80"/>
                <el-table-column prop="label" label="权限标签"/>
                <el-table-column prop="code" label="标签值" />
                <el-table-column label="是否启用" v-hasPermission="['PRE_PERMISSION_UPDATE']">
                    <template slot-scope="scope">
                        <el-switch @change="updateStatus(scope.row)" v-model="scope.row.status" />
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)" size="small" icon="el-icon-edit" circle v-hasPermission="['PRE_PERMISSION_UPDATE']" />
                         <el-button type="danger" @click="deleteById(scope.row.id)" size="small" icon="el-icon-delete" circle v-hasPermission="['PRE_PERMISSION_DELETE']" />
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
            <el-form :model="permiForm" ref="permiForm" :rules="formRules" label-width='120px' style="margin-right:20px">
                <el-form-item label="权限标签" prop="label" >
                    <el-input v-model="permiForm.label" />
                </el-form-item>
                <el-form-item label="标签值" prop="code">
                    <el-input v-model="permiForm.code" />
                </el-form-item>
                <el-form-item label="是否启用" prop="status">
                    <el-radio-group v-model="permiForm.status">
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
            // 表单确定加载
            formLoading: false,
            // 打开抽屉
            open: false,
            permiForm: {
                status: true,
            },
            formRules: {
                label: [
                    { required: true, message: "请输入权限标签", trigger: "blur" },
                    { min: 1, max: 50, message: "长度在 2 到 50 个字符", trigger: "blur" }
                ],
                code: [
                    { required: true, message: "请输入标签值", trigger: "blur" },
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
            this.title = '添加权限';
            this.open = true;
        },
        // 分页查询
        findPage() {
             this.loading = true;
            this.$ajax.post('/permission/findPage', this.queryInfo).then((res) => {
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
            this.permiForm = row;
            this.title = '修改权限';
            this.open = true;
        },
        // 删除数据
        deleteById(id) {
            this.$confirm('您的操作将永久删除编号为 '+ id + ' 的数据', '是否继续?', '提示', {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
            }).then(() => {
                this.$ajax.delete(`/permission/delete/${id}`).then((res) => {
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
            this.permiForm = {};
            this.open = false;
            this.findPage();
        },
        // 确定表单
        sure() {
            this.$refs.permiForm.validate((valid) => {
                if(!valid) return this.$message.error('表单校验不通过，请检查后提交'); 
                if(this.permiForm.id === undefined || this.permiForm.id === null) {
                    this.$ajax.post('/permission/insert', this.permiForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                } else {
                    this.$ajax.post('/permission/update', this.permiForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                }
            });
        },
        updateStatus(row) {
            this.$ajax.post('/permission/update', row).then((res) => {
                        this.$message.success('状态更新成功！');
                    });
        },

    }
};
</script>

<style scoped>
</style>