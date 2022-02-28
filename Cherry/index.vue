<template>
  <div class="">
    <div :id="editorType" :ref="editorType" />
  </div>
</template>

<script>
import Cherry from 'cherry-markdown'
import { uploadImage, uploadFile } from '@/api/upload'

export default {
  name: 'Editor',
  props: {
    value: {
      type: String,
      default: ''
    },
    height: {
      type: [Number, String],
      required: false,
      default: 400
    },
    editorType: {
      type: String,
      str: '',
      default: 'markdown1'
    }
  },
  data() {
    return {
      editor: null
    }
  },
  watch: {
    value(val) {
      this.editor.setMarkdown(this.editor.engine.makeMarkdown(val))
    }
  },
  created() {
    this.editor = null
  },
  mounted() {
    this.init()
  },
  deactivated() {
    this.destroyTinymce()
  },
  destroyed() {
    this.destroyTinymce()
  },
  methods: {
    init() {
      this.editor = new Cherry({
        id: this.editorType,
        value: this.value,
        editor: { theme: 'default', height: this.height + 'px' },
        toolbars: {
          theme: 'light', // light, dark
          // 顶部工具栏及菜单按钮顺序
          toolbar: ['bold', 'italic', 'underline', 'strikethrough', '|', 'color', 'header', '|', 'list', { insert: ['image', 'link', 'br', 'formula', 'toc', 'table', 'line-table', 'bar-table', 'word'] }, 'settings'], //
          // 选中后的悬浮菜单
          bubble: ['bold', 'italic', 'underline', 'strikethrough', 'sub', 'sup', '|', 'size', 'color'],
          // 新行的行内菜单
          float: ['h1', 'h2', 'h3', '|', 'checklist', 'quote', 'quickTable', 'code'],
          customMenu: []
        },
        engine: {
          // 内置语法配置
          syntax: {
            list: {
              listNested: true // 同级列表类型转换后变为子级
            },
            // pro 版本功能
            table: {
              enableChart: false, // 激活表格绘制图形
              // chartRenderEngine: EChartsTableEngine, // 绘制图形的依赖
              externals: ['echarts'] // 绘制图形的类，应该包括以下方法
            },
            codeBlock: {
              customRenderer: { // 自定义语法渲染器
                // mermaid: new MermaidCodeEngine({ mermaidAPI, theme: 'neutral' })
              }
            }
          },
          // 自定义语法
          customSyntax: {
            // 'SyntaxClass': SyntaxClass   <[Object]> 自定义语法规则，同名语法会覆盖编辑器默认的语法
            // 名字冲突时强制覆盖内置语法解析器
            // 'SyntaxClass': {             <[String]> hook 名字
            //    syntax: SyntaxClass,      <[SyntaxBase]> hook 构造函数
            //    force: true,              <[Boolean]> 是否强制覆盖同名 hook
            //    before: 'HOOK_NAME',      <[String]> hookName，在这个 hook 之前执行
            //    after: 'HOOK_NAME'        <[String]> hookName，在这个 hook 之后执行
            // }
          }
        },
        externals: {},
        fileUpload(file, callback) {
          // callback(file)
          if (file.type.indexOf('image') !== -1) {
            uploadImage(file).then(v => {
              callback(v.file_path)
            })
          } else {
            // doc,docx,xls,xlsx,txt,pdf
            uploadFile(file).then(v => {
              callback(v.response.path)
            })
          }
        }
      })
      this.editor.setMarkdown(this.editor.engine.makeMarkdown(this.value))
    },
    getContent() {
      return this.editor.getMarkdown()
    },
    destroyTinymce() {
      if (this.editor) {
        this.editor = null
      }
    }
  }
}
</script>

<style lang="scss">
#markdown-container {
  margin-left: 210px;
}
</style>
