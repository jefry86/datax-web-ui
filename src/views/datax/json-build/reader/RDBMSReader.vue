<template>
  <div class="app-container">
    <el-form label-position="right" label-width="120px" :model="readerForm" :rules="rules">
      <el-form-item label="数据库源：" prop="datasourceId">
        <el-select v-model="readerForm.datasourceId" filterable @change="rDsChange" style="width: 300px">
          <el-option
            v-for="item in rDsList"
            :key="item.id"
            :label="item.datasourceName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="数据库表名：" prop="tableName">
        <el-select v-model="readerForm.tableName" filterable @change="rTbChange" style="width: 300px">
          <el-option v-for="item in rTbList" :key="item" :label="item" :value="item"/>
        </el-select>
      </el-form-item>
      <el-form-item label="SQL语句：">
        <el-input v-model="readerForm.querySql" :autosize="{ minRows: 3, maxRows: 20}" type="textarea"
                  placeholder="sql查询，一般用于多表关联查询时才用" style="width: 42%"/>
        <el-button type="primary" @click.prevent="getColumns('reader')">解析字段</el-button>
        <el-button @click="addColums()">手动填写字段</el-button>

      </el-form-item>
      <el-form-item label="切分字段：">
        <el-input v-model="readerForm.splitPk" placeholder="切分主键" style="width: 13%"/>
      </el-form-item>
      <el-form-item label="表所有字段：">
        <el-checkbox
          v-model="readerForm.checkAll"
          :indeterminate="readerForm.isIndeterminate"
          @change="rHandleCheckAllChange"
          v-show="checkAllIsShow"
        >全选
        </el-checkbox>
        <div style="margin: 15px 0;"/>
        <el-checkbox-group v-model="readerForm.columns" @change="rHandleCheckedChange"  v-show="checkAllIsShow">
          <el-checkbox v-for="c in rColumnList" :key="c" :label="c">{{ c }}</el-checkbox>
        </el-checkbox-group>
        <el-input v-model="readerForm.customColumns" placeholder="请填写字段，使用,分隔" style="width: 60%"
                  v-show="customColumnsIsShow"/>
      </el-form-item>
      <el-form-item label="where条件：" prop="where">
        <el-input v-model="readerForm.where" placeholder="where条件，不需要再加where" type="textarea" style="width: 42%"/>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import * as dsQueryApi from '@/api/ds-query'
  import {list as jdbcDsList} from '@/api/datax-jdbcDatasource'

  export default {
    name: 'RDBMSReader',
    data() {
      return {
        jdbcDsQuery: {
          current: 1,
          size: 50,
          ascs: 'datasource_name'
        },
        rDsList: [],
        rTbList: [],
        rColumnList: [],
        loading: false,
        customColumnsIsShow: false,
        checkAllIsShow: true,
        active: 1,
        customFields: '',
        customType: '',
        customValue: '',
        dataSource: '',
        readerForm: {
          datasourceId: undefined,
          tableName: '',
          columns: [],
          where: '',
          querySql: '',
          checkAll: false,
          isIndeterminate: true,
          splitPk: '',
          customColumns: ''
        },
        rules: {
          datasourceId: [{required: true, message: 'this is required', trigger: 'change'}],
          tableName: [{required: true, message: 'this is required', trigger: 'change'}]
        }
      }
    },
    created() {
      this.getJdbcDs()
    },
    methods: {
      // 获取可用数据源
      getJdbcDs() {
        this.loading = true
        jdbcDsList(this.jdbcDsQuery).then(response => {
          const {records} = response
          this.rDsList = records
          this.loading = false
        })
      },
      // 获取表名
      getTables(type) {
        if (type === 'reader') {
          const obj = {
            datasourceId: this.readerForm.datasourceId
          }
          // 组装
          dsQueryApi.getTables(obj).then(response => {
            this.rTbList = response
          })
        }
      },
      // reader 数据源切换
      rDsChange(e) {
        // 清空
        this.readerForm.tableName = ''
        this.readerForm.datasourceId = e
        this.rDsList.find((item) => {
          if (item.id === e) {
            this.dataSource = item.datasource
          }
        })
        this.$emit('selectDataSource', this.dataSource)
        // 获取可用表
        this.getTables('reader')
      },
      getTableColumns() {
        const obj = {
          datasourceId: this.readerForm.datasourceId,
          tableName: this.readerForm.tableName
        }
        dsQueryApi.getColumns(obj).then(response => {
          this.rColumnList = response
          this.readerForm.columns = response
          this.readerForm.checkAll = true
          this.readerForm.isIndeterminate = false
        })
      },
      getColumnsByQuerySql() {
        const obj = {
          datasourceId: this.readerForm.datasourceId,
          querySql: this.readerForm.querySql
        }
        dsQueryApi.getColumnsByQuerySql(obj).then(response => {
          this.rColumnList = response
          this.readerForm.columns = response
          this.readerForm.checkAll = true
          this.readerForm.isIndeterminate = false
        })
      },
      // 获取表字段
      getColumns(type) {
        if (type === 'reader') {
          this.customColumnsIsShow = false
          this.checkAllIsShow = true
          if (this.readerForm.querySql !== '') {
            this.getColumnsByQuerySql()
          } else {
            this.getTableColumns()
          }
        }
      },
      addColums() {
        this.customColumnsIsShow = true
        this.checkAllIsShow = false
      },
      // 表切换
      rTbChange(t) {
        this.readerForm.tableName = t
        this.rColumnList = []
        this.readerForm.columns = []
        this.getColumns('reader')
      },
      rHandleCheckAllChange(val) {
        this.readerForm.columns = val ? this.rColumnList : []
        this.readerForm.isIndeterminate = false
      },
      rHandleCheckedChange(value) {
        const checkedCount = value.length
        this.readerForm.checkAll = checkedCount === this.rColumnList.length
        this.readerForm.isIndeterminate = checkedCount > 0 && checkedCount < this.rColumnList.length
      },
      getData() {
        if (this.customColumnsIsShow) {
          this.readerForm.columns = this.readerForm.customColumns.split(",")
        }
        console.log(this.readerForm)
        return this.readerForm
      }
    }
  }
</script>
