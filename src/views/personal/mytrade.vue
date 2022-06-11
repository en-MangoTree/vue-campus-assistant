<template>
    <div>
        <el-card style="min-height:640px;">
            <el-row>
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.queryString" clearable @clear="findPage">
                        <el-button slot="append" icon="el-icon-search" @click="findPage"></el-button>
                    </el-input>
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
            // 表格加载
            loading: false,
        }
    },
    created() {
        this.findPage();
    },
    methods: {
        // 分页查询
        findPage() {
             this.loading = true;
            this.$ajax.post('/personal/mytrade', this.queryInfo).then((res) => {
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