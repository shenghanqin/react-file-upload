import 'core-js/es6/map'
import 'core-js/es6/set'
import React from 'react'
import PropTypes from 'prop-types'
import MathExtend from './math-extend'
import styles from './styles.css'
import classNames from 'classnames/bind'

// import XhrWorker from 'worker-loader:worker/xhr-worker'

const FILE_CLASSNAME = 'rap-file-upload'

function isIOS() {
  if (typeof window === 'undefined') return false

  const u = window.navigator.userAgent
  return !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
}

let cx = classNames.bind(styles)
const EMPTY_FN = () => { }

export default class FileUpload extends React.Component {

  constructor(props) {
    super(props)

    this.styles = styles

    this.xhrList = []
    this.uploadQueue = []
    this.uploadSuccessQueue = []
    this.currentIEID = 0
    this.currentXHRID = 0
  }

  /* 触发隐藏的input框选择 */
  /* 触发beforeChoose */
  commonChooseFile = () => {
    const { beforeChoose } = this.props
    const oneUpload = this.oneUploadRef

    if (beforeChoose() === false) return

    oneUpload && oneUpload.click()
  }

  /* 执行上传 */
  commonUpload = file => { // mill参数是当前时刻毫秒数，file第一次进行上传时会添加为file的属性，也可在beforeUpload为其添加，之后同一文件的mill不会更改，作为文件的识别id
    console.log('this.files :', this.files, this.files[0])
    file = file || this.files[0]

    const {
      baseUrl,
      param,
      beforeUpload,
      doUpload } = this.props
    const oneUpload = this.oneUploadRef
    const mill = file && file.mill ? file.mill : MathExtend.uuid()
    // const mill = file.mill || MathExtend.uuid()

    console.log('mill :', mill)

    this.uploadQueue.push(mill)

    if (beforeUpload(file, mill) === false) {
      if (this.uploadQueue.length === this.files.length && oneUpload) {
        oneUpload.value = ''
        this.uploadQueue = []
      }

      return
    }

    if (!file) return

    /* url参数 */
    let paramStr = ''

    if (param) {
      let paramArr = []

      param['_'] = mill

      Object.keys(param).forEach(key =>
        typeof param[key] !== 'undefined' && paramArr.push(`${key}=${param[key]}`)
      )

      paramStr = '?' + paramArr.join('&')
    }

    let uploadUrl = baseUrl + paramStr

    if (isIOS()) {
      return this.lrz
        ? this.compressPic(mill, uploadUrl, file)
        : import('lrz').then(lrz => {
          this.lrz = lrz
          this.compressPic(mill, uploadUrl, file)
        })
    }

    /* 组装FormData */
    let formData = new FormData()

    formData.append(file.name, file)

    this.createXHR(mill, uploadUrl, formData)

    // 触发上传动作回调
    doUpload(file, mill, this.currentXHRID)

    if (this.uploadQueue.length === this.files.length && oneUpload) {
      oneUpload.value = ''
      this.uploadQueue = []
    }
  }

  compressPic = (mill, url, file) => { // lrz压缩图片，暂只支持ios
    const { doUpload, uploadError } = this.props
    const oneUpload = this.oneUploadRef

    this.lrz(file).then(rst => {
      // 添加文件长度参数
      rst.formData.append('fileLen', rst.fileLen)

      this.createXHR(mill, url, rst.formData)

      // 触发上传动作回调
      doUpload(file, mill, this.currentXHRID)

      if (this.uploadQueue.length === this.files.length && oneUpload) {
        oneUpload.value = ''
        this.uploadQueue = []
      }
    }).catch(e => {
      uploadError({
        type: 'TRANSFORMERROR',
        message: e.message
      }, mill)
    })
  }

  // 现代浏览器input change事件。File API保存文件
  commonChange = e => {
    let {
      multiple,
      filesLimit,
      useWebWorker,
      chooseAndUpload,
      chooseFile } = this.props
    let oneUpload = this.oneUploadRef
    let files

    e.dataTransfer
      ? files = e.dataTransfer.files
      : e.target ? files = e.target.files : ''

    if (chooseFile(files) === false) {
      if (oneUpload) { // 清除upload的值
        oneUpload.value = ''
        this.uploadQueue = []
      }

      return
    }

    // 如果限制了多文件上传时的数量
    if (multiple && filesLimit && files && files.length > filesLimit) {
      const newFiles = {}

      for (let i = 0; i < filesLimit; i++) newFiles[i] = files[i]

      newFiles.length = filesLimit

      files = newFiles
    }

    this.files = files

    if (chooseAndUpload) {
      if (multiple || useWebWorker) {
        this.createMultiProgress()
      } else {
        this.commonUpload()
      }
    }
  }

  createMultiProgress = () => {
    const { useWebWorker } = this.props

    useWebWorker && !this.worker && this.createWorker()

    if (this.files) {
      for (let i = 0; i < this.files.length; i++) {
        this[useWebWorker ? 'commonWorkerUpload' : 'commonUpload'](this.files[i])
      }
    }
  }

  createXHR = (mill, url, formData) => {
    let {
      requestHeaders,
      withCredentials,
      timeout,
      dataType,
      uploading,
      uploadSuccess,
      uploadFail,
      uploadError,
      onabort } = this.props
    let xhr = new XMLHttpRequest()

    xhr.open('POST', url, true)

    xhr.withCredentials = withCredentials // 跨域是否开启验证信息

    requestHeaders && Object.keys(requestHeaders).forEach(key => { // 设置请求头
      xhr.setRequestHeader(key, requestHeaders[key])
    })

    if (timeout) { // 处理超时。用定时器判断超时，不然xhr state=4 catch的错误无法判断是超时
      xhr.timeout = timeout

      xhr.ontimeout = () => {
        uploadError({ type: 'TIMEOUTERROR', message: 'timeout' }, mill)
        this.isTimeout = false
      }

      this.isTimeout = false

      setTimeout(() => this.isTimeout = true, timeout)
    }

    xhr.onreadystatechange = () => {
      try { // xhr finish
        if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
          uploadSuccess(
            dataType === 'json' ? JSON.parse(xhr.responseText) : xhr.responseText,
            mill
          )
        } else if (xhr.readyState == 4) { // xhr fail
          uploadFail(
            dataType === 'json' ? JSON.parse(xhr.responseText) : xhr.responseText,
            mill
          )
        }
      } catch (e) {
        !this.isTimeout && uploadError({
          type: 'FINISHERROR',
          message: e.message
        }, mill)
      }
    }

    xhr.onerror = () => { // xhr error
      try {
        uploadError({
          type: 'XHRERROR',
          message: dataType === 'json' ? JSON.parse(xhr.responseText) : xhr.responseText
        }, mill)
      } catch (e) {
        uploadError({
          type: 'XHRERROR',
          message: e.message
        }, mill)
      }
    }

    xhr.onprogress = xhr.upload.onprogress = progress => { // 这里部分浏览器实现不一致，而且IE没有这个方法
      uploading(progress, mill)
    }

    xhr.send(formData)

    // 备份xhr及id
    this.xhrList[mill] = xhr
    this.currentXHRID = mill

    /* 有响应abort的情况 */
    xhr.onabort = () => onabort(mill, this.currentXHRID)
  }

  createWorker = () => {
    const {
      baseUrl,
      param,
      timeout,
      dataType,
      requestHeaders,
      uploadSuccess,
      uploadFail,
      uploadError,
      uploading } = this.props
    // const worker = this.worker = new XhrWorker()

    // worker.addEventListener('message', resp => {
    //   const { data } = resp
    //   const { mill, payload } = data

    //   let res = payload
    //   if (dataType === 'json') {
    //     res = res ? JSON.parse(res) : {}
    //   }

    //   switch (data.cmd) {
    //     case 'success':
    //       uploadSuccess(res, mill)
    //       break
    //     case 'failed':
    //       uploadFail(resp, mill)
    //       break
    //     case 'error':
    //       uploadError(resp, mill)
    //       break
    //     case 'uploading':
    //       uploading(resp, mill)
    //       break
    //   }
    // })

    // worker.postMessage({
    //   cmd: 'init',
    //   config: {
    //     baseUrl: /^(?:http|https):\/\//i.test(baseUrl) ? baseUrl : location.origin + baseUrl,
    //     param: param,
    //     timeout: timeout,
    //     requestHeaders: requestHeaders
    //   }
    // })
  }

  commonWorkerUpload = file => {
    const { beforeUpload } = this.props
    const oneUpload = this.oneUploadRef
    const mill = file.mill || Math.uuid()

    this.uploadQueue.push(mill)

    if (this.uploadQueue.length === this.files.length && oneUpload) {
      oneUpload.value = ''
      this.uploadQueue = []
    }

    if (beforeUpload(file, mill) === false) return

    // this.worker.postMessage({ cmd: 'upload', mill, file })
  }

  /* 外部调用方法，主动触发选择文件（等同于调用btn.click()), 仅支持现代浏览器 */
  forwardChoose = () => {
    this.commonChooseFile()
  }

  /**
   * 外部调用方法，当多文件上传时，用这个方法主动删除列表中某个文件
   * TODO: 此方法应为可以任意操作文件数组
   * @param func 用户调用时传入的函数，函数接收参数files（filesAPI 对象）
   * @return Obj File API 对象
   * File API Obj:
   * {
   *   0 : file,
   *   1 : file,
   *   length : 2
   * }
   */
  fowardRemoveFile = func => {
    this.files = func(this.files)
  }

  /* 外部调用方法，传入files（File API）对象可以立刻执行上传动作，IE不支持。调用随后会触发beforeUpload */
  filesToUpload = files => {

    const { multiple, useWebWorker } = this.props

    this.files = files

    if (multiple || useWebWorker) {
      this.createMultiProgress()
    } else {
      this.commonUpload()
    }
  }

  /* 外部调用方法，取消一个正在进行的xhr，传入id指定xhr（doupload时返回）或者默认取消最近一个。*/
  abort = (mill) => {
    if (this.useWebWorker) {
      mill === undefined
        ? this.workers
        && this.workers.postMessage({ cmd: 'abort', mill: this.currentXHRID })
        : this.workers
        && this.workers.postMessage({ cmd: 'abort', mill })
    } else {
      mill === undefined
        ? this.xhrList[this.currentXHRID]
        && this.xhrList[this.currentXHRID].abort
        && this.xhrList[this.currentXHRID].abort()
        : this.xhrList[mill]
        && this.xhrList[mill].abort
        && this.xhrList[mill].abort()
    }
  }

  render() {
    const { accept, multiple, chooseAndUpload, btnType } = this.props
    const restAttrs = { accept, multiple }

    return (
      <div className={cx(`${FILE_CLASSNAME}-wrap`)}>
        {
          chooseAndUpload || btnType === 'chooseBtn'
            ? <div className={cx(`${FILE_CLASSNAME}-choose-btn`)} onClick={this.commonChooseFile}>
              {this.props.children}
            </div>
            : (
              btnType === 'uploadBtn'
                ? (
                  <div className={cx(`${FILE_CLASSNAME}-upload-btn`, { hide: chooseAndUpload })} onClick={() => {
                    this.uploadQueue = [] // 重置上传队列
                    this.commonUpload()
                  }}>
                    {this.props.children}
                  </div>
                )
                : null
            )

        }
        <input
          type='file'
          style={{ display: 'none' }} // 渲染的时候不显示
          {...restAttrs}
          className={cx(`${FILE_CLASSNAME}-file-input`)}
          onChange={this.commonChange}
          name="one_upload"
          ref={(one_upload => this.oneUploadRef = one_upload)} />
      </div>
    )
  }
}


FileUpload.propTypes = {
  /**
   * 上传的地址
   */
  baseUrl: PropTypes.string.isRequired,
  /**
   * url 参数
   */
  param: PropTypes.object,
  /**
   * 选中即传，比btnType优先级高
   */
  chooseAndUpload: PropTypes.bool,
  /**
   * 上传按钮类型
   */
  btnType: PropTypes.string,
  /**
   * 返回数据类型
   */
  dataType: PropTypes.string,
  /**
   * 是否使用webworker
   */
  useWebWorker: PropTypes.bool,
  /**
   * 超时时间
   */
  timeout: PropTypes.number,
  /**
   * 接受的上传文件类型
   */
  accept: PropTypes.string,
  /**
   * 多文件上传
   */
  multiple: PropTypes.bool,
  /**
   * 限制多文件上传文件数
   */
  filesLimit: PropTypes.number,
  /**
   * 跨域标识
   */
  withCredentials: PropTypes.bool,
  /**
   * 请求头
   */
  requestHeaders: PropTypes.object,
  /**
   * 选择前的方法
   */
  beforeChoose: PropTypes.func,
  /**
   * 选择文件的方法
   */
  chooseFile: PropTypes.func,
  /**
   * 上传前的方法
   */
  beforeUpload: PropTypes.func,
  /**
   * 进行上传
   */
  doUpload: PropTypes.func,
  /**
   * 上传中的方法
   */
  uploading: PropTypes.func,
  /**
   * 上传成功的回调
   */
  uploadSuccess: PropTypes.func,
  /**
   * 上传失败的回调，更通用一些
   */
  uploadError: PropTypes.func,
  /**
   * 上传失败的回调2？偏内部错误？
   */
  uploadFail: PropTypes.func,
  /**
   * 有响应abort的情况
   */
  onabort: PropTypes.func
}
FileUpload.defaultProps = {
  baseUrl: '',
  param: null,
  chooseAndUpload: true,
  btnType: 'chooseBtn',
  dataType: 'json',
  useWebWorker: false,
  timeout: 0,
  accept: '*',
  multiple: false,
  filesLimit: 0,
  withCredentials: false,
  requestHeaders: null,
  beforeChoose: EMPTY_FN,
  chooseFile: EMPTY_FN,
  beforeUpload: EMPTY_FN,
  doUpload: EMPTY_FN,
  uploading: EMPTY_FN,
  uploadSuccess: EMPTY_FN,
  uploadError: EMPTY_FN,
  uploadFail: EMPTY_FN,
  onabort: EMPTY_FN
}