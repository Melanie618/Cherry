<template>
  <div class="app-container">
    <div class="bug-plane left">
      <div class="bug-plane-cont">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="right" label-width="7em">
          <el-form-item label="标题" prop="title">
            <el-input v-model="temp.title" placeholder="请简明扼要描述漏洞点及漏洞类型如：用户注册功能存在存储型XSS漏洞" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="漏洞类型" prop="cat_first_level" style="float: left;">
            <el-select v-model="temp.cat_first_level" class="filter-item" placeholder="请选择漏洞类型" :disabled="isEdit">
              <el-option v-for="item in cat_first_levelOptions" :key="item.display_name" :label="item.display_name" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item prop="cat_second_level" style="float: left;margin-left:-4em;">
            <el-select v-model="temp.cat_second_level" class="filter-item" placeholder="请选择漏洞类型" :disabled="isEdit || !temp.cat_first_level">
              <el-option v-for="item in cat_second_levelOptions" :key="item.display_name" :label="item.display_name" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="漏洞级别" prop="level" style="clear: both;">
            <el-select v-model="temp.level" class="filter-item" placeholder="请选择漏洞级别" :disabled="isEdit">
              <el-option v-for="item in levelOptions" :key="item.display_name" :label="item.display_name" :value="item.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="危害等级" prop="vuln_risk_level">
            <el-rate v-model="temp.vuln_risk_level" style="line-height:38px;" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="URL" prop="url" style="clear: both;">
            <el-input v-model="temp.url" :disabled="isEdit" />
          </el-form-item>
          <el-form-item label="漏洞描述" prop="description">
            <Cherry ref="headerChild" v-model="temp.description" :editor-type="'markdown1'" :height="400" />
            <!-- <Editor v-model="temp.description" class="editor" :editor-type="desc" :height="300" /> -->
          </el-form-item>
          <el-form-item label="复现步骤" prop="recurrent_step">
            <Cherry ref="headerChild1" v-model="temp.recurrent_step" :editor-type="'markdown2'" :height="400" />
            <!-- <Editor v-model="temp.recurrent_step" class="editor" :editor-type="recurrent" :height="300" /> -->
          </el-form-item>
          <el-form-item label="POC" prop="poc">
            <Cherry ref="headerChild2" v-model="temp.poc" :editor-type="'markdown3'" :height="400" />
            <!-- <Editor v-model="temp.poc" class="editor" :editor-type="poc1" :height="300" /> -->
          </el-form-item>
          <el-form-item label="修复建议" prop="fix_advice">
            <el-input v-model="temp.fix_advice" placeholder="请输入漏洞修复建议。优秀报告修复建议一般对开发有较大实用性，如修复思路，修复代码样式，伪代码等" rows="10" type="textarea" />
          </el-form-item>
          <el-form-item label="漏洞附件" prop="report_url">
            <div class="flex" style="display: flex">
              <el-input v-model="temp.report_url" disabled />
              <el-upload
                class=""
                :show-file-list="false"
                :on-success="uploadSuccess"
                action="/api/upload/file"
                :headers="headers"
              >
                <el-button style="margin-left: 10px;" type="primary">点击上传</el-button>
              </el-upload>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saveDataBtnDisabled" @click="saveData">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div class="bug-plane right">
      <!-- <h3 class="bug-plane-title">审核日志</h3> -->
      <div class="bug-plane-cont">
        <el-timeline>
          <el-timeline-item v-for="(item, idx) in operateList" :key="item.id" :color="idx===0?'#e6a23c':''" :timestamp="item.created_at" placement="top">
            <!-- <el-card> -->
            <!-- <h4> -->
            <!-- {{ item.operator.username }} 从 {{ item.status_before_label }} 修改为
            <el-tag :type="item.status_after | statusFilter">{{ item.status_after_label }}</el-tag>
            <template v-if="item.reason"><div>忽略原因:{{ item.reason }}</div></template> -->
            <!-- </h4> -->
            <!-- </el-card> -->
            <h4 v-if="item.status_before_label">
              {{ item.operator.username }} 从 {{ item.status_before_label }} 修改为
              <el-tag :type="item.status_after | statusFilter">{{ item.status_after_label }}</el-tag>
              {{ item.reason?' 忽略原因:':'' }} {{ item.reason }}
            </h4>
            <h4 v-else-if="operateList.length-1==idx">{{ item.operator.username }} 创建了漏洞</h4>
            <h4 v-else>{{ item.operator.username }} 修改了漏洞</h4>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>

<script>
// const IS_DEVELOPMENT_NODE_ENV = process.env.NODE_ENV === 'development'
// console.log(IS_DEVELOPMENT_NODE_ENV, 'IS_DEVELOPMENT_NODE_ENV', 'user.index')

import showdown from 'showdown'
// import Editor from '@/components/Simditor'
import Cherry from '@/components/Cherry/index.vue'
import { getToken } from '@/utils/auth'
// import { getUserInfo } from '@/api/user'
import {
  insertVulnerability,
  updateVulnerability,
  getVulnerability,
  getCategoryList,
  getVulnerabilityOperateLogs
} from '@/api/vulnerability'
const levelOptions = [
  { key: '3', display_name: '严重' },
  { key: '2', display_name: '高危' },
  { key: '1', display_name: '中危' },
  { key: '0', display_name: '低危' }
]
const cat_first_levelOptions = []
const cat_second_levelOptions = []
export default {
  name: 'Vulnerability',
  components: { Cherry }, //  Editor,
  filters: {
    statusFilter(status) {
      const statusMap = {
        'apply': 'info',
        'wait': '',
        'finish': 'success',
        'ignore': 'warning'
      }
      // console.log(status, statusMap[status])
      return statusMap[status]
    },
    idFilter(id) {
      return 'SRC-' + String(id).padStart(6, '0')
    }
  },
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === 0) {
        callback(new Error('请选择危害等级'))
      } else {
        callback()
      }
    }
    return {
      headers: null,
      levelOptions,
      cat_second_levelOptions,
      cat_first_levelOptions,
      saveDataBtnDisabled: false,
      temp: {
        id: undefined,
        title: '',
        cat_first_level: '',
        cat_second_level: '',
        level: '',
        url: '',
        vuln_risk_level: 0,
        organization_id: '',
        description: '',
        recurrent_step: '',
        poc: '',
        fix_advice: '',
        report_url: ''
      },
      operateList: [],
      rules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        cat_first_level: [{ required: true, message: '请选择一级漏洞类型' }],
        cat_second_level: [{ required: true, message: '请选择二级漏洞类型' }],
        level: [{ required: true, message: '请选择漏洞级别' }],
        vuln_risk_level: [
          { required: true, message: '请选择危害等级' },
          { validator: validatePass, trigger: 'blur' }
        ],
        url: [{ required: true, message: '请输入url', trigger: 'blur' }],
        description: [{ required: true, message: '请输入漏洞描述', trigger: 'blur' }],
        recurrent_step: [{ required: true, message: '请输入复现步骤', trigger: 'blur' }],
        poc: [{ required: true, message: '请输入poc', trigger: 'blur' }]
      },
      desc: 'description',
      recurrent: 'recurrent',
      poc1: 'poc'
    }
  },
  computed: {
    isEdit() {
      return !!this.temp.id
    }
  },
  watch: {
    'temp.vuln_risk_level'() {
      this.$refs.dataForm.validateField('vuln_risk_level')
    },
    'temp.cat_first_level': function(val) {
      this.temp.cat_second_level = ''
      this.getCategory_cat_second_levelOptions(val)
    }
  },
  created() {
    this.temp.id = this.$route.params.id || ''
    if (this.temp.id) {
      this.getInfo()
    }
    this.getCategory()
    this.headers = { 'ACCESS-TOKEN': getToken() }
  },
  methods: {
    handleBlur() {
      const converter = new showdown.Converter()

      // 漏洞描述
      this.temp.description = this.$refs.headerChild.editor.getMarkdown()
      this.temp.description = converter.makeHtml(this.temp.description)

      // 复现步骤
      this.temp.recurrent_step = this.$refs.headerChild1.editor.getMarkdown()
      this.temp.recurrent_step = converter.makeHtml(this.temp.recurrent_step)

      // poc
      this.temp.poc = this.$refs.headerChild2.editor.getMarkdown()
      this.temp.poc = converter.makeHtml(this.temp.poc)
    },
    uploadSuccess(response) {
      if (response && response.meta) {
        if (response.meta.code === 200) {
          this.temp.report_url = response.response.path
        } else {
          this.$notify({
            type: 'error',
            title: '上传失败',
            message: response.meta.error || '未知原因'
          })
        }
      }
      // console.log('uploadSuccess', arguments)
    },
    getInfo() {
      const id = this.$route.params.id
      getVulnerability({ project_id: this.$route.params.project_id }, id).then(response => {
        const data = response.response
        if (response.meta.code === 200) {
          this.temp.id = data.id
          this.temp.title = data.title
          this.temp.cat_first_level = data.cat_first_level + ''
          this.$nextTick(() => {
            this.temp.cat_second_level = data.cat_second_level + ''
          })
          this.temp.vuln_risk_level = data.vuln_risk_level
          this.temp.level = data.level_self + ''
          this.temp.url = data.url
          this.temp.description = data.description
          this.temp.recurrent_step = data.recurrent_step
          this.temp.poc = data.poc
          this.temp.fix_advice = data.fix_advice
          this.temp.report_url = data.report_url
          this.temp.organization_id = data.organization_id
        }
      })
      getVulnerabilityOperateLogs({ project_id: this.$route.params.project_id }, id)
        .then(v => {
          this.operateList = v.response
        })
    },
    getCategory() {
      getCategoryList({ project_id: this.$route.params.project_id }).then(response => {
        const data = response.response
        if (response.meta.code === 200) {
          this.cat_first_levelOptions.length = 0
          data.forEach(v => {
            this.cat_first_levelOptions.push({ key: v.id + '', display_name: v.cate_name })
          })
        }
      })
    },
    getCategory_cat_second_levelOptions(id) {
      if (!id) return
      getCategoryList({ root_id: id, project_id: this.$route.params.project_id }).then(response => {
        const data = response.response
        if (response.meta.code === 200) {
          this.cat_second_levelOptions.length = 0
          data.forEach(v => {
            this.cat_second_levelOptions.push({ key: v.id + '', display_name: v.cate_name })
          })
        }
      })
    },
    saveData() {
      this.handleBlur()
      this.temp.project_id = this.$route.params.project_id
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.saveDataBtnDisabled = true
          if (this.temp.id) {
            updateVulnerability(this.temp).then(() => {
              this.$notify({
                title: 'Success',
                message: '修改成功',
                type: 'success',
                duration: 2000
              })
              this.$router.push(`/amateur/vulnerability/list/${this.$route.params.project_id}`)
            }).catch(() => {
              this.saveDataBtnDisabled = false
            })
          } else {
            delete this.temp.id
            insertVulnerability(this.temp).then(() => {
              this.$notify({
                title: 'Success',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.$router.push(`/amateur/vulnerability/list/${this.$route.params.project_id}`)
            }).catch(() => {
              this.saveDataBtnDisabled = false
            })
          }
        }
      })
    }
  }
}

</script>

<style lang="scss" scoped>
  .app-container{
    display: flex;
    width: 100%;
    overflow: hidden;
    .bug-plane{
      padding: 10px;
    }
    .left{
    min-width:0;
    flex:1;
    }
    .right{
      width: 380px;
      flex-shrink: 0;
      margin-left: 20px;
    }
    .bug-plane-title{
      margin:0;
      margin-bottom: 10px;
    }
    .bug-plane-title{
      text-align: center;
    }
  }
  .editor {
    width: 100%;
  }
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }

  .box-card {
    width: 480px;margin: 10px
  }
</style>
