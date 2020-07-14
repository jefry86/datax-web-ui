<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.username" placeholder="用户名" style="width: 200px;" class="filter-item"/>
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
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">{{ scope.$index+1 }}</template>
      </el-table-column>
      <el-table-column label="角色名称" width="" align="center">
        <template slot-scope="scope">{{ scope.row.name }}</template>
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
      <el-table-column label="修改时间" width="180" align="center">
        <template slot-scope="scope">{{ scope.row.dtModify }}</template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
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
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="temp.name" placeholder="用户名"/>
        </el-form-item>
        <el-form-item label="状   态" prop="status">
          <el-switch
            v-model="temp.status?1:0"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="权   限" prop="role">
          <el-tree
            :props="props"
            :load="loadNode"
            node-key="id"
            lazy
            show-checkbox
            v-model="temp.permission"
            :default-checked-keys="temp.permission"
            @check-change="handleCheckChange">
          </el-tree>
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
          username: undefined
        },
        status: [
          {value: '0', label: '禁用'},
          {value: '1', label: '启用'},
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
          name: [{required: true, message: 'name is required', trigger: 'blur'}]
        },
        temp: {
          id: undefined,
          name: '',
          permission: [],
          status: true
        },
        permission: [],
        resetTemp() {
          this.temp = this.$options.data().temp
        },
        props: {
          label: 'name',
          value: 'id',
          children: 'zones'
        },
        count: 1
      }
    },
    created() {
      this.fetchData()
      this.fetchPermission()
    },
    methods: {
      fetchData() {
        this.listLoading = true
        role.getList(this.listQuery).then(response => {
          const {content} = response
          this.total = content.recordsTotal
          this.list = content.data
          this.listLoading = false
        })
      },
      fetchPermission() {
        permission.findByPid(0).then(response => {
          const {content} = response
          this.permission = content
        })
      },
      handleCreate() {
        this.resetTemp()
        this.temp.permission = []
        console.log(this.temp.permission)
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          this.temp.status = this.temp.status === true ? 1 : 0;
          if (valid) {
            role.addRole(this.temp).then(() => {
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
      handleUpdate(row) {
        let obj = Object.assign({}, row) // copy obj
        const jobPermissionList = row.jobPermissionList;
        for (let i = 0; i < jobPermissionList.length; i++) {
          this.temp.permission.push(jobPermissionList[i].id)
        }
        this.temp.status = obj.status == true ? 1 : 0;
        this.temp.name = obj.name;
        this.temp.id = obj.id;

        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.temp)
            tempData.status = tempData.status ? 1 : 0
            role.updateData(tempData).then(() => {
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
        role.deleteRole(row.id).then(response => {
          this.fetchData()
          this.$notify({
            title: 'Success',
            message: 'Delete Successfully',
            type: 'success',
            duration: 2000
          })
        })
      },
      handleClose(tag) {
        this.dynamicTags.splice(this.dynamicTags.indexOf(tag.name), 1);
      },
      handleCheckChange(data, checked, indeterminate) {
        if (checked) {
          this.temp.permission.push(data.id)
        } else {
          for (let i = 0; i < this.temp.permission.length; i++) {
            if (this.temp.permission[i]) {
              this.temp.permission.splice(i, 1)
            }
          }
        }
      },
      handleNodeClick(data) {
        this.temp.permission.append(data.id)
      },
      loadNode(node, resolve) {
        if (node.level === 0) {
          return resolve(this.permission);

        }
        if (node.level > 3) return resolve([]);

        var hasChild;
        if (node.data.depth > 0) {
          hasChild = true;
        } else {
          hasChild = false;
        }

        setTimeout(() => {
          if (hasChild) {
            permission.findByPid(node.data.id).then(reponse => {
              const {content} = reponse
              resolve(content);
            });
          } else {
            resolve([])
          }
        }, 500);
      },
      changeSwitch(row) {
        const data = {
          "id": row.id,
          "status": row.status
        }
        role.changeStatus(data).then(response => {
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
    }
  }
</script>
<style>
  .tag-group .el-tag {
    margin: 6px;
  }
</style>
