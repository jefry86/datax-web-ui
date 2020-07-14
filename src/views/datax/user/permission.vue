<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="名称" style="width: 200px;" class="filter-item"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">
        搜索
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >
        添加
      </el-button>
      <!-- <el-checkbox v-model="showReviewer" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">
        reviewer
      </el-checkbox> -->
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      row-key="id"
      default-expand-all
      :tree-props="{children:'children',hasChildren:'hasChildren'}"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">{{ scope.row.id }}</template>
      </el-table-column>
      <el-table-column label="名称" width="180" align="center">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>

      <el-table-column label="URL" align="center">
        <template slot-scope="scope">
          {{ scope.row.url }}
        </template>
      </el-table-column>

      <el-table-column label="备注" width="100" align="center">
        <template slot-scope="scope">{{ scope.row.description }}</template>
      </el-table-column>

      <el-table-column label="method" width="80">
        <template slot-scope="scope">
          {{ scope.row.method }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">

          <el-switch
            v-model="scope.row.status"
            active-color="#00A854"
            :active-value="1"
            inactive-color="#F04134"
            :inactive-value="0"
            @change="changeSwitch(scope.row)"
          />

        </template>

      </el-table-column>

      <el-table-column label="新增时间" width="180" align="center">
        <template slot-scope="scope">{{ scope.row.dtCreate }}</template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdata(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="fetchData"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="right"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" placeholder="名称"/>
        </el-form-item>
        <el-form-item label="URL" prop="url">
          <el-input v-model="temp.url" placeholder="URL"/>
        </el-form-item>
        <el-form-item label="method" prop="method">
          <el-select v-model="temp.method" placeholder="请选择method">
            <el-option v-for="item in methodList" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="状   态" prop="status">
          <el-switch
            v-model="temp.status==1?true:false"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="父级" prop="father">
          <el-select v-model="temp.pid" filterable placeholder="请选择">
            <el-option
              v-for="item in allPermission"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="temp.description" placeholder="备注"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import * as role from '@/api/datax-role'
  import * as permission from '@/api/datax-permission'
  import waves from '@/directive/waves' // waves directive
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  export default {
    name: 'role',
    components: {Pagination},
    directives: {waves},
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    data() {
      return {
        list: null,
        listLoading: true,
        total: 0,
        listQuery: {
          current: 1,
          size: 10,
          name: ''
        },
        allPermission: [],
        status: [
          {value: 0, label: '禁用'},
          {value: 1, label: '启用'},
        ],
        methodList: [
          {value: "GET", label: "GET"},
          {value: "POST", label: "POST"},
          {value: "PUT", label: "PUT"},
          {value: "DELETE", label: "DELETE"}
        ],
        dialogPluginVisible: false,
        pluginData: [],
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: 'Edit',
          create: 'Create'
        },
        rules: {
          name: [{required: true, message: 'name is required', trigger: 'blur'}],
          url: [{required: true, message: 'url is required', trigger: 'blur'}],
          method: [{required: true, message: 'method is required', trigger: 'blur'}]
        },
        temp: {
          id: undefined,
          url: '',
          name: '',
          method: '',
          status: true,
          description: '',
          pid: " "
        },
        permission: [],
        resetTemp() {
          this.temp = this.$options.data().temp
        },
        defaultProps: {
          label: 'name'
        }
      }
    },
    created() {
      this.fetchData()
      this.handleAll()
    },
    methods: {
      fetchData() {
        this.listLoading = true
        permission.getList(this.listQuery).then(response => {
          const {content} = response
          this.total = content.recordsTotal
          this.list = content.data
          this.listLoading = false
        })
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            this.temp.status = this.temp.status === true ? 1 : 0;
            permission.add(this.temp).then(() => {
              this.fetchData()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Created Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleUpdata(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          this.temp.status = this.temp.status === true ? 1 : 0;
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            permission.update(tempData).then(() => {
              this.fetchData()
              this.dialogFormVisible = false
              this.$notify({
                title: 'Success',
                message: 'Update Successfully',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },
      handleDelete(row) {
        permission.del(row.id).then(response => {
          this.fetchData()
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
        })
      },
      changeSwitch(row) {
        const data = {
          "id": row.id,
          "status": row.status
        }
        permission.changeStatus(data).then(response => {
            this.fetchData()
            this.$notify({
              title: 'success',
              message: 'Change Successfully',
              type: 'success',
              duration: 2000
            })
          }
        )
      },
      handleAll() {
        permission.getAll().then(response => {
          const {content} = response
          this.allPermission = content
        })
      }
    }
  }
</script>
<style>
  .tag-group .el-tag {
    margin: 6px;
  }
</style>
