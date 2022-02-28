<template>
  <div class="app-container">
    <el-form ref="dataForm" label-position="right" label-width="7em" style="width:80%;">
      <el-form-item label="漏洞描述" prop="title">
        <editor ref="headerChild" v-model="value" :editor-type="'markdown1'" :height="400" />
      </el-form-item>
      <!-- <el-form-item label="复现步骤" prop="title">
        <editor ref="headerChild1" v-model="value1" :editor-type="'markdown2'" :height="400" />
      </el-form-item>
      <el-form-item label="POC" prop="title">
        <editor ref="headerChild2" v-model="value2" :editor-type="'markdown3'" :height="400" />
      </el-form-item> -->
    </el-form>
    <el-button type="primary" size="mini" @click="handle">确定</el-button>
  </div>
</template>

<script>
import Editor from '@/components/Cherry/index.vue'
export default {
  name: 'Cherry',
  components: { Editor },
  data() {
    return {
      value: '',
      value1: '',
      value2: ''
    }
  },
  watch: {
    value(val) {
      // console.log('value', val)
    }
  },
  created() {
    // console.log(this.$cherry)
  },
  methods: {
    handle() {
      this.handleBlur()
      console.log(this.value)
      console.log(this.value1)
      console.log(this.value2)
    },
    handleBlur() {
      // value
      this.value = this.$refs.headerChild.editor.getMarkdown()
      this.value = this.$refs.headerChild.editor.getHtml(this.value)

      // value1
      this.value1 = this.$refs.headerChild1.editor.getMarkdown()
      this.value1 = this.$refs.headerChild1.editor.getHtml(this.value1)

      // value2
      this.value2 = this.$refs.headerChild2.editor.getMarkdown()
      this.value2 = this.$refs.headerChild2.editor.getHtml(this.value2)
    }
  }
}
</script>

<style lang="scss">
.bug-desc-item {
  margin-bottom: 20px;
}
</style>
