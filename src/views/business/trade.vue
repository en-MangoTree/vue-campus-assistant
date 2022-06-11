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
                <el-table-column prop="title" label="标题"/>
                <el-table-column label="图片">
                    <template slot-scope="scope">
                        <el-image
                            style="width:100%;height:100%;"
                            :src="scope.row.images"
                            :preview-src-list="preview(scope.row.images)"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
                <el-table-column prop="price" label="价格" />
                <el-table-column prop="sort" label="所属分类" />
                <el-table-column label="是否启用" v-hasPermission="['PRE_PERMISSION_UPDATE']">
                    <template slot-scope="scope">
                        <el-switch @change="updateStatus(scope.row)" v-model="scope.row.status" />
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="150">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="update(scope.row)" size="small" icon="el-icon-edit" circle v-hasPermission="['PRE_PERMISSION_UPDATE']" />
                        <el-button type="danger" @click="deleteById(scope.row.id)" size="small" icon="el-icon-delete" circle v-hasPermission="['PRE_PERMISSION_DELETE']" />
                        <el-button type="warning" size="small" icon="el-icon-star-off" circle></el-button>
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
            <el-form :model="tradeForm" ref="tradeForm" :rules="formRules" label-width='120px' style="margin-right:20px">
                <el-form-item label="标题" prop="title" >
                    <el-input v-model="tradeForm.title" />
                </el-form-item>
                <el-form-item label="图片" prop="images" >
                    <el-input v-model="tradeForm.images" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="tradeForm.description" />
                </el-form-item>
                <el-form-item label="价格" prop="price">
                    <el-input v-model="tradeForm.price" />
                </el-form-item>
                <el-form-item label="是否启用" prop="status">
                    <el-radio-group v-model="tradeForm.status">
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
            tradeForm: {
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
            this.$ajax.post('/trade/findPage', this.queryInfo).then((res) => {
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
            this.tradeForm = row;
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
                this.$ajax.delete(`/trade/delete/${id}`).then((res) => {
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
            this.tradeForm = {};
            this.open = false;
            this.findPage();
        },
        // 确定表单
        sure() {
            this.$refs.tradeForm.validate((valid) => {
                if(!valid) return this.$message.error('表单校验不通过，请检查后提交'); 
                if(this.tradeForm.id === undefined || this.tradeForm.id === null) {
                    this.$ajax.post('/trade/insert', this.tradeForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                } else {
                    this.$ajax.post('/trade/update', this.tradeForm).then((res) => {
                        this.$message.success(res.data.message);
                        this.open = false;
                        this.findPage();
                    });
                }
            });
        },
        updateStatus(row) {
            this.$ajax.post('/trade/update', row).then((res) => {
                        this.$message.success('状态更新成功！');
                    });
        },
        // 图片预览
        preview(src) {
            let arr = [];
            arr.push(src);
            return arr;
        },

    }
};
</script>

<style scoped>
</style>