<template>
  <div class="canvas-main">
    <!-- 操作栏 -->
    <div class="menuBar">
      <ul>
        <li v-for="item in menubarFun" :key="item.id" @click="clickEvent(item.name)" :title="item.title" :style="iconStyle(item)"></li>
        <!--  -->
      </ul>
      <!-- 图形操作栏 -->
      <ul class="action-bar">
        <li>
          <input type="color" title="设置画笔颜色" v-model="borderColor" @input="changePenColor">
        </li>
        <li style="margin-right:20px">
          <el-select v-model.number="borderWidth" size="mini" title="线框宽度" @change="changPenWidth">
            <el-option v-for="item in selectValue" :key="item" :label="item" :value="item">
              <span :style="lineWidth(item)"></span>
            </el-option>
          </el-select>
        </li>
        <li v-for="item in operationMenubarFun" :key="item.id" @click="operationClickEvent(item.name)" :title="item.title" :style="operationIconStyle(item)">
          <el-upload ref="upload" class="upload-demo" v-if="item.name == 'upload'" action="" :http-request="handleUpload" accept=".jpg,.png" :on-change="changFileStatus" :on-success="successFile" :on-preview="handlePreview" :before-upload="beforeUploadType">
          </el-upload>
        </li>
      </ul>
    </div>
    <!-- 画布元素 -->
    <canvas id="canvas-box"></canvas>
    <!-- 背景图片 -->
    <!-- <img src="../../public/chuang.png" ref="bgInfo" v-if="bgInfo" style="width:0;height: 0;"> -->
    <!-- 下载图片 -->
    <a href="" ref="savePng" style="display:none" v-if="aShow"></a>
    <!-- 弹出框，用于设置画布 -->
    <el-dialog title="设置画布" :visible.sync="dialogFormVisible">
      <div class="dialog-canvas">
        <!-- 设置画布的宽和高 -->
        <el-form :model="form" :rules="rules" ref="form" label-width="150px" class="demo-ruleForm">
          <el-form-item label="画布的宽度：" prop="setWidth">
            <el-input v-model="form.setWidth" title="填写画布宽度" placeholder="请输入画布的宽度" oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3').replace(/^\./g, '')">
              <template slot="append">px</template>
            </el-input>
          </el-form-item>
          <el-form-item label="画布的高度：" prop="setHeight">
            <el-input v-model="form.setHeight" title="填写画布的高度" placeholder="请输入画布的高度" oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d).*$/, '$1$2.$3').replace(/^\./g, '')">
              <template slot="append">px</template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="clearForm">取 消</el-button>
        <el-button type="primary" @click="configDrawingSize">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fabric } from 'fabric'
export default {
  name: 'Drawing',
  data() {
    return {
      menubarFun: [
        {
          id: 1,
          name: 'select',
          title: '选择', //提示
          icon: require('../assets/menubar_icon/point.png') //图标
        },
        {
          id: 2,
          name: 'drawing',
          title: '自由绘画',
          icon: require('../assets/menubar_icon/pen.png')
        },
        {
          id: 3,
          name: 'line',
          title: '直线',
          icon: require('../assets/menubar_icon/line.png')
        },
        {
          id: 4,
          name: 'dotted',
          title: '虚线',
          icon: require('../assets/menubar_icon/dotted.png')
        },
        {
          id: 11,
          name: 'arrow',
          title: '箭头',
          icon: require('../assets/menubar_icon/arrow.png')
        },
        // {
        //   id:9,
        //   name:'broken',
        //   title:'折线',
        //   icon:require('../assets/menubar_icon/broken.png'),
        // },
        {
          id: 5,
          name: 'rect',
          title: '矩形',
          icon: require('../assets/menubar_icon/rect.png')
        },
        {
          id: 6,
          name: 'circle',
          title: '圆形',
          icon: require('../assets/menubar_icon/circle.png')
        },
        {
          id: 7,
          name: 'ellipse',
          title: '椭圆形',
          icon: require('../assets/menubar_icon/ellipse.png')
        },
        {
          id: 8,
          name: 'triangle',
          title: '三角形',
          icon: require('../assets/menubar_icon/triangle.png')
        },
        {
          id: 10,
          name: 'text',
          title: '文本',
          icon: require('../assets/menubar_icon/text.png')
        }
      ],
      operationMenubarFun: [
        {
          id: 13,
          name: 'back',
          title: '上一步',
          icon: require('../assets/menubar_icon/back.png')
        },
        {
          id: 14,
          name: 'next',
          title: '下一步',
          icon: require('../assets/menubar_icon/next.png')
        },
        {
          id: 10,
          name: 'delete',
          title: '删除',
          icon: require('../assets/menubar_icon/delete.png')
        },
        {
          id: 11,
          name: 'remove',
          title: '重置画布',
          icon: require('../assets/menubar_icon/remove.png')
        },
        {
          id: 12,
          name: 'save',
          title: '下载图片',
          icon: require('../assets/menubar_icon/save.png')
        },
        {
          id: 15,
          name: 'upload',
          title: '更换背景图片',
          icon: require('../assets/menubar_icon/upload.png')
        },
        {
          id: 16,
          name: 'config',
          title: '设置',
          icon: require('../assets/menubar_icon/config.png')
        }
      ],
      bgInfo: true, //背景图显示
      aShow: false, //下载图片链接
      imgWidth: '', //导入背景图片的大小
      imgHeight: '',
      canvasObj: '', //存储的绘图对象
      clickMenubarName: 'select', //当前点击的name
      lastPosX: '', //鼠标移动的最后坐标
      lastPosY: '',
      patternClass: '', //鼠标按下绘制的对象
      downPoint: {}, //鼠标按下的点位置
      selectValue: [1, 2, 3, 5, 10], //边框线条选择数据
      borderWidth: 1, //所有图形边框的宽度
      borderColor: '#000000', //所有图形边框的颜色
      brokenArr: [], //折线存储的点位
      textObj: '', //存储绘制文字对象
      backStack: [], //所有的绘画对象栈
      nextStack: [], //删除的绘画对象栈
      canvasObjLength: 0, //当前画布上对象长度
      dialogFormVisible: false, //弹出框
      form: {
        setWidth: 350, //设置画布宽度
        setHeight: 150 //设置画布高度
      },
      rules: {
        setWidth: [{ required: true, message: '画布的宽度不能为空！', trigger: 'blur' }],
        setHeight: [{ required: true, message: '画布的高度不能为空！', trigger: 'blur' }]
      },
      flagUp: false, //当前活动的组
      fileData: null //上传文件的文件对象
    }
  },
  props: {
    //画布宽
    canvasWidth: {
      default: null,
      type: Number
    },
    //画布高
    canvasHeight: {
      default: null,
      type: Number
    }
  },
  computed: {
    iconStyle() {
      //菜单栏样式
      return item => {
        return {
          'background-color': item.name === this.clickMenubarName ? '#ccc' : '',
          'background-image': 'url(' + item.icon + ')'
        }
      }
    },
    operationIconStyle() {
      //操作栏样式
      return item => {
        return {
          'background-image': 'url(' + item.icon + ')'
        }
      }
    },
    lineWidth() {
      //线条的粗细样式
      return item => {
        return {
          'border-top': `${item}px solid black`,
          'margin-top': '10px',
          height: '1px',
          display: 'block'
        }
      }
    }
  },
  methods: {
    //绑定点击事件
    init() {
      //监听键盘事件
      document.addEventListener('keyup', e => {
        //当按下delete删除选中的对象
        if (this.flagUp && e.keyCode == 46) {
          //判断文字是否在编辑状态
          if (this.flagUp.selected[0].isEditing === true) return
          this.flagUp.selected.forEach(item => {
            this.canvasObj.remove(item)
          })
          //抛弃当前处于活动状态的Object
          this.canvasObj.discardActiveObject()
          this.flagUp = false
        }
      })
      this.canvasObj.on({
        //鼠标按下
        'mouse:down': opt => {
          //对文字对象的判断
          this.isTextObj(opt)

          let evt = opt.e
          this.downPoint = opt.absolutePointer
          // 是否按住alt，可以拖拽画布
          if (evt.altKey === true && this.canvasObj.selection === true) {
            this.canvasObj.isDragging = true // isDragging 是自定义的，开启移动状态
            this.lastPosX = evt.clientX // lastPosX 是自定义的,直接添加在对象身上，也可以定义在data中
            this.lastPosY = evt.clientY // lastPosY 是自定义的
          }
          this.drawing()
        },
        //鼠标抬起
        'mouse:up': opt => {
          this.canvasObj.setViewportTransform(this.canvasObj.viewportTransform) // 设置此画布实例的视口转换
          this.canvasObj.isDragging = false // 关闭移动状态
          //当没有选择绘制图案时，返回
          if (!this.patternClass || this.clickMenubarName == 'text') {
            //将自由绘画的对象存在栈中
            if (!this.patternClass && this.canvasObj.selection === false) {
              //比较对象长度是否发生变化，是否有新增
              let getObj = this.canvasObj.getObjects()
              if (this.canvasObjLength !== getObj.length) {
                this.canvasObjLength = getObj.length
                //将最新的自由绘画对象存储在back栈中
                this.backStack.push(getObj[getObj.length - 1])
              }
            }
            this.patternClass = null
            return
          }
          if (JSON.stringify(this.downPoint) === JSON.stringify(opt.absolutePointer)) {
            this.canvasObj.remove(this.patternClass)
          } else {
            //将当前对象压入栈中
            this.backStack.push(this.patternClass)
          }
          //将创建的对象置空
          this.patternClass = null
        },
        //鼠标移动
        'mouse:move': opt => {
          //画布移动
          if (this.canvasObj.isDragging) {
            let evt = opt.e
            let vpt = this.canvasObj.viewportTransform // 聚焦视图的转换

            vpt[4] += evt.clientX - this.lastPosX
            vpt[5] += evt.clientY - this.lastPosY
            this.lastPosX = evt.clientX
            this.lastPosY = evt.clientY
            this.canvasObj.requestRenderAll() // 重新渲染
          }
          //图案绘制
          this.patternFun(opt)
        },
        //滚轮滚动(鼠标位置缩放)
        'mouse:wheel': opt => {
          let delta = opt.e.deltaY
          let zoom = this.canvasObj.getZoom() //获取当前画布缩放值

          if (opt.e.preventDefault) {
            opt.e.preventDefault()
          } else {
            opt.e.returnValue = false
          }
          if (opt.e && opt.e.stopPropagation) opt.e.stopPropagation()
          else window.event.cancelBubble = true

          zoom *= 0.999 ** delta
          // 控制缩放范围在 1~5 的区间内(只允许放大，不允许缩小)
          if (zoom > 5) zoom = 5
          if (zoom < 1) zoom = 1
          //设置缩放点
          this.canvasObj.zoomToPoint(
            {
              x: opt.e.offsetX,
              y: opt.e.offsetY
            },
            zoom
          )
          opt.e.preventDefault()
          opt.e.stopPropagation()

          this.keepPositionInBounds(true)
        },
        //选中画布
        'selection:cleared': opt => {
          this.flagUp = false
        },
        //更换选中对象
        'selection:updated': opt => {
          this.flagUp = opt
        },
        //选中对象
        'selection:created': opt => {
          this.flagUp = opt
        }
      })
    },
    drawing() {
      //创建图形
      switch (this.clickMenubarName) {
        case 'rect':
          this.patternClass = new fabric.Rect({
            top: this.downPoint.y, //创建对象的坐标
            left: this.downPoint.x,
            width: 0, //宽和高
            height: 0,
            fill: 'transparent', //填充颜色
            stroke: this.borderColor, //线条颜色
            strokeWidth: this.borderWidth //线条宽度
          })
          this.canvasObj.add(this.patternClass)
          break
        case 'ellipse':
          this.patternClass = new fabric.Ellipse({
            top: this.downPoint.y,
            left: this.downPoint.x,
            rx: 0, //椭圆的两个中心点
            ry: 0,
            fill: 'transparent',
            stroke: this.borderColor,
            strokeWidth: this.borderWidth
          })
          this.canvasObj.add(this.patternClass)
          break
        case 'line':
          this.patternClass = new fabric.Line(
            [
              this.downPoint.x, //直线的开始坐标
              this.downPoint.y,
              this.downPoint.x,
              this.downPoint.y
            ],
            {
              fill: 'transparent',
              stroke: this.borderColor,
              strokeWidth: this.borderWidth
            }
          )
          this.canvasObj.add(this.patternClass)
          break
        case 'dotted':
          this.patternClass = new fabric.Line(
            [
              this.downPoint.x, //虚线的开始坐标
              this.downPoint.y,
              this.downPoint.x, //第二个结束的坐标
              this.downPoint.y
            ],
            {
              fill: 'transparent',
              strokeDashArray: [10, 3], //设置为虚线，第一个值是实线的长度，第二个是虚线的长度
              stroke: this.borderColor,
              strokeWidth: this.borderWidth
            }
          )
          this.canvasObj.add(this.patternClass)
          break
        case 'circle':
          this.patternClass = new fabric.Circle({
            top: this.downPoint.y,
            left: this.downPoint.x,
            radius: 0, // 圆的半径
            fill: 'transparent',
            stroke: this.borderColor,
            strokeWidth: this.borderWidth
          })
          this.canvasObj.add(this.patternClass)
          break
        case 'triangle':
          this.patternClass = new fabric.Triangle({
            left: this.downPoint.x,
            top: this.downPoint.y,
            width: 0, //三角形底边的宽度
            height: 0, //底边到顶部角的高度
            fill: 'transparent',
            stroke: this.borderColor,
            strokeWidth: this.borderWidth
          })
          this.canvasObj.add(this.patternClass)
          break
        // case 'broken':      //出现很多bug，后续待开发，可以使用线段替代
        //   //将当前的点添加到数组中
        //   this.brokenArr = [
        //     {x: this.downPoint.x,y: this.downPoint.y},
        //     {x: this.downPoint.x,y: this.downPoint.y}
        //   ]
        //   this.patternClass = new fabric.Polyline(//Polygon和Polyline，前者是绘制多边形，线段是首尾相连
        //     this.brokenArr,{
        //     fill: 'transparent',
        //     stroke: this.borderColor,
        //     strokeWidth:1
        //   })
        //   this.canvasObj.add(this.patternClass)
        //   break;
        case 'arrow':
          let path = this.changePath(this.downPoint.x, this.downPoint.y, this.downPoint.x, this.downPoint.y, 17.5, 17.5)
          this.patternClass = new fabric.Path(path, {
            stroke: this.borderColor,
            fill: 'transparent',
            strokeWidth: this.borderWidth
          })
          this.canvasObj.add(this.patternClass)
          break
        case 'text':
          this.patternClass = new fabric.Textbox('', {
            left: this.downPoint.x,
            top: this.downPoint.y,
            fontSize: 20,
            hasBorders: true, //修改的时候，是否显示文字所在区域
            width: 450,
            splitByGrapheme: true, //超过宽度自动换行
            fill: this.borderColor, //字体颜色
            borderColor: 'rgb(102,153,255,0.35)' //当元素被拖动或输入内容时的边框
          })
          this.canvasObj.add(this.patternClass)
          this.textObj = this.patternClass
          this.patternClass.enterEditing()
          break
      }
    },
    changePath(fromX, fromY, toX, toY, theta, headlen) {
      //返回路径值
      theta = typeof theta != 'undefined' ? theta : 30
      headlen = typeof theta != 'undefined' ? headlen : 10
      // 计算各角度和对应的P2,P3坐标
      let angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
        angle1 = ((angle + theta) * Math.PI) / 180,
        angle2 = ((angle - theta) * Math.PI) / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2)
      let arrowX = fromX - topX,
        arrowY = fromY - topY
      let path = ' M ' + fromX + ' ' + fromY
      path += ' L ' + toX + ' ' + toY
      arrowX = toX + topX
      arrowY = toY + topY
      path += ' M ' + arrowX + ' ' + arrowY
      path += ' L ' + toX + ' ' + toY
      arrowX = toX + botX
      arrowY = toY + botY
      path += ' L ' + arrowX + ' ' + arrowY
      return path
    },
    patternFun(e) {
      //修改图形大小
      if (this.patternClass) {
        switch (this.clickMenubarName) {
          case 'rect':
            let rectW = Math.abs(this.downPoint.x - e.absolutePointer.x)
            let rectH = Math.abs(this.downPoint.y - e.absolutePointer.y)
            // 设置尺寸和所在位置
            this.patternClass.set('width', rectW)
            this.patternClass.set('height', rectH)
            this.patternClass.set('top', Math.min(e.absolutePointer.y, this.downPoint.y))
            this.patternClass.set('left', Math.min(e.absolutePointer.x, this.downPoint.x))
            // 刷新一下画布
            this.canvasObj.requestRenderAll()
            break
          case 'ellipse':
            let rx = Math.abs(this.downPoint.x - e.absolutePointer.x) / 2
            let ry = Math.abs(this.downPoint.y - e.absolutePointer.y) / 2
            let top = e.absolutePointer.y > this.downPoint.y ? this.downPoint.y : this.downPoint.y - ry * 2
            let left = e.absolutePointer.x > this.downPoint.x ? this.downPoint.x : this.downPoint.x - rx * 2
            // 设置椭圆尺寸和所在位置
            this.patternClass.set('rx', rx)
            this.patternClass.set('ry', ry)
            this.patternClass.set('top', top)
            this.patternClass.set('left', left)
            this.canvasObj.requestRenderAll()
            break
          case 'line':
            this.patternClass.set('x1', e.absolutePointer.x)
            this.patternClass.set('y1', e.absolutePointer.y)
            this.patternClass.set('x2', this.downPoint.x)
            this.patternClass.set('y2', this.downPoint.y)
            this.canvasObj.requestRenderAll()
            break
          case 'arrow':
            //先移除当前的图形，在重新生成新的
            this.canvasObj.remove(this.patternClass)
            let path = this.changePath(this.downPoint.x, this.downPoint.y, e.absolutePointer.x, e.absolutePointer.y, 17.5, 17.5)
            this.patternClass = new fabric.Path(path, {
              stroke: this.borderColor,
              fill: 'transparent',
              strokeWidth: this.borderWidth
            })
            this.canvasObj.add(this.patternClass)
            this.canvasObj.requestRenderAll()
            break
          case 'dotted':
            this.patternClass.set('x1', e.absolutePointer.x)
            this.patternClass.set('y1', e.absolutePointer.y)
            this.patternClass.set('x2', this.downPoint.x)
            this.patternClass.set('y2', this.downPoint.y)
            this.canvasObj.requestRenderAll()
            break
          case 'circle':
            let circleX = Math.abs(this.downPoint.x - e.absolutePointer.x) / 2
            let circleY = Math.abs(this.downPoint.y - e.absolutePointer.y) / 2
            let circleTop = e.absolutePointer.y > this.downPoint.y ? this.downPoint.y : this.downPoint.y - circleY * 2
            let circleLeft = e.absolutePointer.x > this.downPoint.x ? this.downPoint.x : this.downPoint.x - circleX * 2
            this.patternClass.set('radius', Math.max(circleX, circleY))
            this.patternClass.set('top', circleTop)
            this.patternClass.set('left', circleLeft)
            this.canvasObj.requestRenderAll()
            break
          case 'triangle':
            let triangleHeight = Math.abs(e.absolutePointer.y - this.downPoint.y)
            this.patternClass.set('width', Math.sqrt(Math.pow(triangleHeight, 2) + Math.pow(triangleHeight / 2.0, 2)))
            this.patternClass.set('height', triangleHeight)
            this.patternClass.set('top', Math.min(e.absolutePointer.y, this.downPoint.y))
            this.patternClass.set('left', Math.min(e.absolutePointer.x, this.downPoint.x))
            this.canvasObj.requestRenderAll()
            break
          case 'broken':
            //移动的时候只是修改最后一个节点的值
            this.$set(this.brokenArr, this.brokenArr.length - 1, { x: e.absolutePointer.x, y: e.absolutePointer.y })
            this.patternClass.set('points', [...this.brokenArr])
            console.log(this.brokenArr)
            this.canvasObj.requestRenderAll()
            break
        }
      }
    },
    keepPositionInBounds() {
      //让缩放的画布回到初始位置
      let zoom = this.canvasObj.getZoom()
      let xMin = ((2 - zoom) * this.canvasObj.getWidth()) / 2
      let xMax = (zoom * this.canvasObj.getWidth()) / 2
      let yMin = ((2 - zoom) * this.canvasObj.getHeight()) / 2
      let yMax = (zoom * this.canvasObj.getHeight()) / 2
      let point = new fabric.Point(this.canvasObj.getWidth() / 2, this.canvasObj.getHeight() / 2)
      let center = fabric.util.transformPoint(point, this.canvasObj.viewportTransform)
      let clampedCenterX = this.clamp(center.x, xMin, xMax)
      let clampedCenterY = this.clamp(center.y, yMin, yMax)
      let diffX = clampedCenterX - center.x
      let diffY = clampedCenterY - center.y
      if (diffX != 0 || diffY != 0) {
        this.relativeMouseX += diffX //累计每一次移动时候的偏差
        this.relativeMouseY += diffY
        this.canvasObj.relativePan(new fabric.Point(diffX, diffY))
      }
    },
    clamp(value, min, max) {
      return Math.max(min, Math.min(value, max))
    },
    clickEvent(value) {
      //菜单栏按钮点击事件
      this.clickMenubarName = value
      if (value == 'select') {
        this.canvasObj.selection = true // 允许框选
        // this.canvasObj.selectionColor = 'rgba(100, 100, 255, 0.3)' // 选框填充色：半透明的蓝色
        // this.canvasObj.selectionBorderColor = 'rgba(255, 255, 255, 0.3)' // 选框边框颜色：半透明灰色
        this.canvasObj.skipTargetFind = false // 允许选中
        this.canvasObj.isDrawingMode = false //关闭自由绘画
      } else if (value == 'drawing') {
        this.canvasObj.selection = false // 去除框选
        this.canvasObj.skipTargetFind = true // 不允许选中
        this.canvasObj.isDrawingMode = true //开启自由绘画
      } else {
        this.canvasObj.selection = false
        this.canvasObj.skipTargetFind = true
        this.canvasObj.isDrawingMode = false
      }
    },
    operationClickEvent(value) {
      //操作栏点击事件
      switch (value) {
        case 'delete':
          //获取画布上活动的元素
          let activeObj = this.canvasObj.getActiveObject()
          //执行删除操作
          if (activeObj && activeObj._objects) {
            //当选择的是一组的时候
            let arrObj = activeObj._objects
            arrObj.forEach(item => {
              this.canvasObj.remove(item)
              //把删除的对象从back栈中删除
              this.backStack.splice(this.backStack.indexOf(item), 1)
              //把删除的对象添加到next栈中
              this.nextStack.push(item)
            })
          } else if (activeObj) {
            //选择是单个对象的时候
            this.canvasObj.remove(activeObj)
            //把删除的对象从back栈中删除
            this.backStack.splice(this.backStack.indexOf(activeObj), 1)
            //把删除的对象添加到next栈中
            this.nextStack.push(activeObj)
          } else {
            this.$message({
              type: 'info',
              message: '请选择一个图形！'
            })
          }
          this.canvasObj.requestRenderAll()
          break
        case 'save': //下载图片
          this.saveBasePng()
          //下载后需要刷新一下画布，不然有bug
          this.canvasObj.requestRenderAll()
          break
        case 'remove': //重置画布
          //获取所有画布所有的元素，然后调用删除
          this.canvasObj.getObjects().forEach(item => {
            this.canvasObj.remove(item)
          })
          this.canvasObj.requestRenderAll()
          break
        case 'back':
          //需要将每次绘画的对象存在一个栈中，对栈顶的元素进行删除操作
          if (this.backStack.length == 0) return
          //要删除的对象
          let backObj = this.backStack[this.backStack.length - 1]
          this.canvasObj.remove(backObj)
          //将删除的元素存到删除栈中
          this.nextStack.push(backObj)
          //更改栈的长度
          this.backStack.length = this.backStack.length - 1
          this.canvasObj.requestRenderAll()
          break
        case 'next':
          //将删除的元素在压入栈顶
          if (this.nextStack.length == 0) return
          console.log(this.nextStack)
          //将最后元素添加在画布中
          let nextObj = this.nextStack[this.nextStack.length - 1]
          this.canvasObj.add(nextObj)
          //将刚刚元素加入到back栈中
          this.backStack.push(nextObj)
          //改变栈的长度
          this.nextStack.length = this.nextStack.length - 1
          this.canvasObj.requestRenderAll()
          break
        case 'upload': //上传图片
          break
        case 'config':
          //获取当前画布的宽和高
          this.form = {
            setWidth: this.canvasObj.getWidth(),
            setHeight: this.canvasObj.getHeight()
          }
          //显示设置
          this.dialogFormVisible = true
          this.canvasObj.requestRenderAll()
          break
      }
    },
    saveBasePng() {
      //下载图片
      //保存为png格式，也可以更改为jpeg
      let pngBase64 = this.canvasObj.toDataURL('image/png', 1.0)
      this.aShow = true //创建下载链接
      this.$nextTick(() => {
        this.$refs.savePng.download = Date.now() + '.png' //下载名称
        this.$refs.savePng.href = pngBase64 //下载链接
        this.$refs.savePng.click() //点击下载
        this.aShow = false //删除链接
      })
    },
    isTextObj(opt) {
      //判断上次的文字对象内容和编辑状态
      if (this.textObj !== '') {
        if (this.textObj.isEditing === true) {
          this.textObj.exitEditing()
          //将文字对象存在栈中
          this.backStack.push(this.textObj)
        }
        if (this.textObj.text === '') {
          this.canvasObj.remove(this.textObj) //空文本删除
          this.textObj = ''
        }
      }
      //判断当前点击的对象是不是文字
      if (opt.target) {
        this.textObj = opt.target
      }
    },
    changePenColor() {
      //修改自由绘画画笔颜色
      this.canvasObj.freeDrawingBrush.color = this.borderColor
    },
    changPenWidth() {
      //改变自由绘画笔触的大小,这里的this.penWidth必须是number类型，否则会出现平移旋转
      this.canvasObj.freeDrawingBrush.width = this.borderWidth
    },
    configDrawingSize() {
      //关闭弹出框
      this.$refs['form'].validate(valid => {
        if (valid) {
          //设置画布的最小值
          if (this.form.setWidth < 350 || this.form.setHeight < 150) {
            if (document.querySelector('.el-message--error')) return
            this.$message({
              type: 'error',
              message: '画布的宽度必须大于350px,高度必须大于150px!'
            })
            return false
          }
          this.dialogFormVisible = false
          //设置画布大小
          this.canvasObj.setWidth(this.form.setWidth)
          this.canvasObj.setHeight(this.form.setHeight)
          this.canvasObj.requestRenderAll()
        } else {
          return false
        }
      })
    },
    clearForm() {
      //清空表单
      this.$refs['form'].resetFields()
      this.form = {}
      this.dialogFormVisible = false
    },
    successFile(response, file, fileList) {
      //文件上传成功的函数
      console.log(response, file, fileList)
    },
    handlePreview(file) {
      // console.log(file)
    },
    beforeUploadType(file) {
      //文件长传之前的操作，判断文件大小和类型
      //判断文件的类型
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
      } else {
        this.$message.error('上传图片只能是 JPG、PNG 格式!')
        return false
      }
      //判断文件大小
      if (file.size / 1024 / 1024 < 1.5) {
      } else {
        this.$message.error('上传的图片大小不能超过1.5MB！')
        return false
      }
      return true
    },
    changFileStatus(file, fileList) {
      //文件选择内容改变触发
      this.fileData = fileList[fileList.length - 1]
    },
    handleUpload(params) {
      //自定义上传
      this.getBase64(this.fileData.raw).then((res, err) => {
        // console.log(res)
        //获取图片的尺寸
        const image = new Image()
        image.onload = () => {
          let imageWidth = (this.canvasObj.width / image.naturalWidth).toFixed(4)
          let imageHeight = (this.canvasObj.height / image.naturalHeight).toFixed(4)

          console.log([imageWidth, imageHeight])
          this.canvasObj.setBackgroundImage(res, this.canvasObj.renderAll.bind(this.canvasObj), {
            width: image.naturalWidth,
            height: image.naturalHeight,
            scaleX: imageWidth,
            scaleY: imageHeight,
            crossOrigin: 'anonymous'
          })
        }
        image.src = res
      })
    },
    getBase64(file) {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        let imgResult = ''
        reader.readAsDataURL(file)
        reader.onload = function () {
          imgResult = reader.result
        }
        reader.onerror = function (error) {
          reject(error)
        }
        reader.onloadend = function () {
          resolve(imgResult)
        }
      })
    }
  },
  mounted() {
    //1.首先要先设置画布，才能在画布上面进行绘图等操作
    let bodyParam = document.body
    //第一个参数指定容器id，第二个参数为配置对象
    //如果没有设置画布的宽和高，按照当前body的宽高设置
    let canvas = new fabric.Canvas('canvas-box', {
      width: this.canvasWidth == null ? bodyParam.clientWidth : this.canvasWidth, // 画布宽度
      height: this.canvasHeight == null ? bodyParam.clientHeight : this.canvasHeight - 34, // 画布高度（34为状态栏高度）
      backgroundColor: '#FFFFFF', // 画布背景色
      isDrawingMode: false, // 自由绘图模式
      devicePixelRatio: true, //Retina 高清屏 屏幕支持
      targetFindTolerance: 10, //当元素以实际内容选择时，这个值越大越表面容易被选择到
      perPixelTargetFind: true // 选择绘画对象时，以对象实际内容选择，而不是所处边界
    })
    //修改原型上面的控制器样式
    fabric.Object.prototype.transparentCorners = false
    fabric.Object.prototype.padding = 10

    //2.获取图片的真实尺寸，让图片大小和画布大小相等
    // let img = this.$refs.bgInfo
    // img.onload = () => {
    //   this.imgWidth = (canvas.width / img.naturalWidth).toFixed(4) //img.naturalWidth获取元素的真实大小
    //   this.imgHeight = (canvas.height / img.naturalHeight).toFixed(4) //四舍五入取小数点后4位

    //   //3.设置画布背景图片相关配置
    //   canvas.setBackgroundImage(
    //     require('../../public/chuang.png'), //在线链接下载会出错
    //     canvas.renderAll.bind(canvas),
    //     {
    //       opacity: 0.8, //透明度
    //       // angle: 15,             // 旋转背景图,这里暂时不需要
    //       width: img.naturalWidth, //设置的宽度和高度不能超过图片本身的大小
    //       height: img.naturalHeight, //如放大图片，使用scaleX、scaleY
    //       scaleX: this.imgWidth, //放大的水平图片大小
    //       scaleY: this.imgHeight, //放大的垂直图片大小
    //       originX: 'left', //图片位置水平停靠位置
    //       originY: 'top', //图片位置垂直停靠位置
    //       crossOrigin: 'anonymous' //允许图片跨域，用于图片下载
    //     }
    //   )

    //4.存储全局画布对象
    this.canvasObj = canvas
    //5.给画布添加事件
    this.init()
    //   //隐藏图片元素
    //   this.bgInfo = false
    // }
  },
  beforeDestroy() {
    // 清除一个画布元素并删除所有事件侦听器
    this.canvasObj.dispose()
  }
}
</script>

<style lang="scss" scoped>
ul,
li {
  list-style: none;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.canvas-main {
  width: 100%;
  height: 100%;

  .menuBar {
    width: 100%;
    height: 34px;
    background: skyblue;
    border: 2px solid rgba(204, 204, 204, 0.8);
    display: flex;
    justify-content: flex-start;
    align-items: center;

    ul {
      height: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;

      li {
        width: 30px;
        height: 30px;
        margin: 0 5px;
        cursor: pointer;
        user-select: none;
        background-size: cover;
      }
    }

    input[type='color'] {
      width: 30px;
      height: 20px;
      margin-top: 5px;
      border: none;
      padding: 0;
    }
  }
}

.upload-demo {
  width: 100%;
  height: 100%;
  ::v-deep .el-upload {
    width: 100%;
    height: 100%;
  }
}

//弹出框样式
.dialog-canvas {
  width: 100%;
  height: 100%;
}
::v-deep .el-dialog {
  width: 500px;
}

::v-deep .el-dialog__header {
  border-bottom: 1px solid #ccc;
  padding: 15px 20px 15px;
}
::v-deep .el-form-item__label {
  font-size: 16px;
  font-weight: 600;
}

::v-deep .el-dialog__footer {
  padding: 10px 20px;
  border-top: 1px solid #ccc;
}

//线条选择框修改样式
.el-select-dropdown__item {
  padding: 0 8px;
  box-sizing: border-box;
}

::v-deep .el-input__suffix {
  right: 0px;
}

::v-deep .el-select .el-input .el-select__caret {
  font-size: 11px;
}

::v-deep .el-input--mini .el-input__inner {
  margin-top: 3px;
  height: 24px;
  width: 48px;
}

::v-deep .el-input--suffix .el-input__inner {
  padding-right: 0px;
}

::v-deep .el-input--mini .el-input__icon {
  line-height: 14px;
}
::v-deep .el-dialog__header {
  border-bottom: 1px solid #ccc;
}
</style>