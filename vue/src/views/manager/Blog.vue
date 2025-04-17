<template>
  <div>
    <!-- 查询区域 -->
    <div class="search">
      <el-input placeholder="请输入标题查询" style="width: 200px; margin-right: 10px" v-model="title" />
      <el-input placeholder="请输入分类查询" style="width: 200px; margin-right: 10px" v-model="categoryName" />
      <el-input placeholder="请输入用户名称查询" style="width: 200px" v-model="userName" />
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <!-- 操作区域 -->
    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新增</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>

    <!-- 表格显示 -->
    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="序号" width="70" align="center" sortable />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column prop="descr" label="简介" show-overflow-tooltip />
        <el-table-column prop="cover" label="封面">
          <template v-slot="scope">
            <div style="display: flex; align-items: center">
              <el-image
                  style="width: 50px; height: 50px; border-radius: 5px"
                  v-if="scope.row.cover"
                  :src="scope.row.cover"
                  :preview-src-list="[scope.row.cover]"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" />
        <el-table-column prop="tags" label="标签">
          <template v-slot="scope">
            <el-tag v-for="item in JSON.parse(scope.row.tags || '[]')" :key="item" style="margin-right: 5px">{{ item }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="发布人" />
        <el-table-column prop="date" label="发布日期" />
        <el-table-column prop="readCount" label="浏览量" />
        <el-table-column label="操作" align="center" width="180">
          <template v-slot="scope">
            <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="mini" type="danger" plain @click="del(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
        <el-table-column label="查看内容">
          <template v-slot="scope">
            <el-button @click="preview(scope.row.content)">查看内容</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            background
            @current-change="handleCurrentChange"
            :current-page="pageNum"
            :page-sizes="[5, 10, 20]"
            :page-size="pageSize"
            layout="total, prev, pager, next"
            :total="total"
        />
      </div>
    </div>

    <!-- 弹窗：添加/编辑 -->
    <el-dialog title="信息" :visible.sync="fromVisible" width="60%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="标题" />
        </el-form-item>
        <el-form-item label="简介" prop="descr">
          <el-input type="textarea" v-model="form.descr" placeholder="简介" />
        </el-form-item>
        <el-form-item label="封面" prop="cover">
          <el-upload :action="$baseUrl + '/files/upload'" :headers="{ token: user.token }" list-type="picture" :on-success="handleCoverSuccess">
            <el-button type="primary">上传封面</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" style="width: 100%">
            <el-option v-for="item in categoryList" :key="item.id" :value="item.id" :label="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="tagsArr" multiple filterable allow-create default-first-option style="width: 100%">
            <el-option value="后端" />
            <el-option value="Java" />
            <el-option value="面试" />
            <el-option value="Vue" />
            <el-option value="前端" />
            <el-option value="大数据" />
            <el-option value="算法" />
            <el-option value="程序员" />
            <el-option value="小白" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <div style="margin-bottom: 10px">
            <el-switch v-model="useMarkdown" active-text="使用 Markdown 编辑" inactive-text="使用富文本编辑" />
          </div>
          <div v-show="!useMarkdown" id="editor"></div>
          <div v-show="useMarkdown" id="markdownEditor" style="border: 1px solid #dcdfe6"></div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 文章预览 -->
    <el-dialog title="文章内容" :visible.sync="fromVisible1" width="50%" :close-on-click-modal="false" destroy-on-close>
      <div class="w-e-text">
        <div v-html="content"></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible1 = false">关 闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import E from "wangeditor"
import hljs from "highlight.js"
import Editor from "@toast-ui/editor"
import "@toast-ui/editor/dist/toastui-editor.css"

export default {
  name: "Blog",
  data() {
    return {
      tableData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      title: null,
      categoryName: null,
      userName: null,
      fromVisible: false,
      form: {},
      user: JSON.parse(localStorage.getItem("xm-user") || "{}"),
      rules: {},
      ids: [],
      categoryList: [],
      tagsArr: [],
      editor: null,
      content: "",
      fromVisible1: false,
      markdownEditor: null,
      useMarkdown: false,
    }
  },
  watch: {
    useMarkdown() {
      this.setRichText()
    },
  },
  created() {
    this.load(1)
  },
  methods: {
    handleAdd() {
      this.form = {}
      this.tagsArr = []
      this.setRichText()
      this.fromVisible = true
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row))
      this.tagsArr = JSON.parse(this.form.tags || "[]")
      this.fromVisible = true
      this.setRichText()
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.form.tags = JSON.stringify(this.tagsArr)
          this.form.content = this.useMarkdown ? this.markdownEditor.getMarkdown() : this.editor.txt.html()
          this.$request({
            url: this.form.id ? "/blog/update" : "/blog/add",
            method: this.form.id ? "PUT" : "POST",
            data: this.form,
          }).then((res) => {
            if (res.code === "200") {
              this.$message.success("保存成功")
              this.load(1)
              this.fromVisible = false
            } else {
              this.$message.error(res.msg)
            }
          })
        }
      })
    },
    del(id) {
      this.$confirm("\u60a8\u786e\u5b9a\u5220\u9664\u5417\uff1f", "\u786e\u8ba4\u5220\u9664", { type: "warning" }).then(() => {
        this.$request.delete("/blog/delete/" + id).then((res) => {
          if (res.code === "200") {
            this.$message.success("\u64cd\u4f5c\u6210\u529f")
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    handleSelectionChange(rows) {
      this.ids = rows.map((v) => v.id)
    },
    delBatch() {
      if (!this.ids.length) {
        this.$message.warning("\u8bf7\u9009\u62e9\u6570\u636e")
        return
      }
      this.$confirm("\u60a8\u786e\u5b9a\u6279\u91cf\u5220\u9664\u8fd9\u4e9b\u6570\u636e\u5417\uff1f", "\u786e\u8ba4\u5220\u9664", {type: "warning"}).then(() => {
        this.$request.delete("/blog/delete/batch", {data: this.ids}).then((res) => {
          if (res.code === "200") {
            this.$message.success("\u64cd\u4f5c\u6210\u529f")
            this.load(1)
          } else {
            this.$message.error(res.msg)
          }
        })
      })
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum
      this.$request.get("/blog/selectPage", {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          title: this.title,
          categoryName: this.categoryName,
          userName: this.userName,
        },
      }).then((res) => {
        this.tableData = res.data?.list
        this.total = res.data?.total
      })
      this.$request.get("/category/selectAll").then((res) => {
        this.categoryList = res.data || []
      })
    },
    reset() {
      this.title = null
      this.categoryName = null
      this.userName = null
      this.load(1)
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum)
    },
    handleCoverSuccess(res) {
      this.form.cover = res.data
    },
    setRichText() {
      this.$nextTick(() => {
        if (this.editor) {
          this.editor.destroy()
          this.editor = null
        }
        if (this.markdownEditor) {
          this.markdownEditor.destroy()
          this.markdownEditor = null
        }
        if (this.useMarkdown) {
          this.markdownEditor = new Editor({
            el: document.querySelector("#markdownEditor"),
            height: "400px",
            initialEditType: "markdown",
            previewStyle: "vertical",
            initialValue: this.form.content || "",
          })
        } else {
          this.editor = new E("#editor")
          this.editor.highlight = hljs
          this.editor.config.uploadImgServer = this.$baseUrl + "/files/editor/upload"
          this.editor.config.uploadFileName = "file"
          this.editor.config.uploadImgHeaders = {token: this.user.token}
          this.editor.config.uploadImgParams = {type: "img"}
          this.editor.create()
          this.editor.txt.html(this.form.content || "")
        }
      })
    },
    preview(content) {
      this.content = content
      this.fromVisible1 = true
    },
  },
}
</script>

<style scoped>
/* 使用更现代的系统字体 */
* {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 搜索区按钮及输入框的间距优化 */
.search {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 15px;
}

.operation {
  margin-bottom: 15px;
}

/* 表格整体美化 */
.el-table th, .el-table td {
  padding: 10px 8px;
  font-size: 13px;
  vertical-align: middle;
}

.el-table {
  font-size: 13px;
}

/* 标签样式调整为行内不换行 */
.el-tag {
  font-size: 12px;
  padding: 2px 6px;
  line-height: 1.2;
  display: inline-block;
  white-space: nowrap;
}

/* 封面图像圆角 & 宽高固定 */
.el-image {
  width: 40px !important;
  height: 40px !important;
  border-radius: 50%;
  object-fit: cover;
}

/* 预览弹窗内容区域美观 */
.w-e-text {
  padding: 10px;
  font-size: 14px;
  line-height: 1.6;
}

/* 分页靠右 */
.pagination {
  margin-top: 20px;
  text-align: right;
}

/* Dialog 中按钮靠右排列一致 */
.dialog-footer {
  text-align: right;
}

/* 表格查看内容按钮靠中 */
.el-table .el-button {
  font-size: 12px;
  padding: 4px 10px;
}
/* 自定义斑马纹每行背景颜色 */
.el-table__body tr:nth-child(odd) {
  background-color: #f9f9f9;
}

.el-table__body tr:nth-child(even) {
  background-color: #ffffff;
}

/* 鼠标悬停时高亮 */
.el-table__body tr:hover > td {
  background-color: #e6f7ff !important;
}

/* 保证点击、悬浮时颜色不影响文字对比度 */
.el-table__body td {
  transition: background-color 0.3s ease;
}

</style>
