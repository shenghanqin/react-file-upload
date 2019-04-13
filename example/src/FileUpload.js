import React, { Component, Fragment } from 'react'

import FileUpload from 'react-file-upload-cc'
// import FileUploadOne from '@cctalk/one-upload'
import styles from './FileUpload.css'
let cx = require('classnames/bind').bind(styles)

const UPLOAD_URL = '//ccfile.hjapi.com/file/v1/upload_image?type=content'
const EMPTY_FUNC = () => { }

export default class FileUploadExample extends Component {

  static defaultProps = {
    uploadUrl: UPLOAD_URL,
    accept: 'image/jpeg,image/jpg,image/png,image/gif',
    sizeLimit: 10,
    defaultAvatar: '',
    beforeUpload: EMPTY_FUNC,
    onUploadSuccess: EMPTY_FUNC,
    onUploadError: EMPTY_FUNC,
  }

  constructor(props) {
    super(props)
    this.curMill = 0 // 当前上传的进程id
    this.state = {
      isUploading: false,
      bannerImage: '',
      errorInfo: {
        msg: '',
        show: false
      }
    }
  }

  onToast = (message) => {
    console.log('onToast :', message);
    // this.toast.show({
    //   message
    // })
  }

  beforeUploadHandler = (file, mill) => {
    let sizeLimit = 20
    const fileUpload = this.fileUploadRef
    if (sizeLimit && file && typeof file.size !== 'undefined') {
      let maxSize = sizeLimit * 1024 * 1024
      if (file.size > maxSize) {
        let msg = `图片限制${sizeLimit}M`
        this.setState({
          errorInfo: {
            msg: msg,
            show: true
          }
        })
        this.onToast(msg)
        return false
      }
    }
    if (this.curMill && fileUpload) {
      fileUpload.abort(this.curMill)
    }
    this.curMill = mill
    this.setState({
      isUploading: true
    })
    return true
  }

  uploadSuccessHandeler = (resp, mill) => {

    this.curMill = 0
    this.setState({
      isUploading: false
    })
    if (resp.status === 0) {
      this.setState({
        bannerImage: resp.data.info[0].url
      })
      this.setState({
        errorInfo: {
          msg: '',
          show: false
        }
      })
    } else {
      this.uploadError()
    }
  }

  uploadErrorHandler = () => {
    this.curMill = 0
    this.setState({
      isUploading: false
    })
    let msg = '上传失败'
    this.setState({
      errorInfo: {
        msg,
        show: true
      }
    })
    this.onToast(msg)
  }

  render() {
    const { uploadUrl, accept } = this.props
    const { isUploading, errorInfo, bannerImage } = this.state
    const options = {
      baseUrl: uploadUrl,
      accept: accept,
      useWebWorker: true,
      multiple: true,
      // chooseAndUpload: true,
      beforeUpload: this.beforeUploadHandler,
      uploadSuccess: this.uploadSuccessHandeler,
      uploadError: this.uploadErrorHandler
    }
    let style = {}
    if (bannerImage) {
      style = { backgroundImage: `url(${bannerImage})` }
    }
    return (
      <div>
        <div
          className={cx('banner-image-wrap', 'cf')}>
          <label className={cx('item-label')}>宣传头图</label>
          <Fragment>
            <div
              className={cx({ 'banner-image': true, 'banner-image-error': !!errorInfo.msg && errorInfo.show })}
              style={style}
            >
              <FileUpload className={cx('upload-banner')} {...options} ref={fileUpload => this.fileUploadRef = fileUpload}>
                <div className={cx('upload-btn')}>
                  {console.log('isUploading', isUploading)}
                  {
                    isUploading ?
                      <Fragment>
                        {console.log('LogoLoading :', isUploading)}
                        <div>Loading</div>
                        {console.log('isUploading2222', isUploading)}
                        <div className={cx('upload-status')}>上传中</div>
                      </Fragment> :
                      <div className={cx('add-upload-btn')}></div>
                  }
                </div>
              </FileUpload>
              {/* <FileUploadOne className={cx('upload-banner')} options={options} ref={fileUpload => this.fileUploadRef = fileUpload}>
                <div className={cx('upload-btn')} ref="chooseAndUpload">
                  {console.log('isUploading', isUploading)}
                  {
                    isUploading ?
                      <Fragment>
                        {console.log('LogoLoading :', isUploading)}
                        <LogoLoading style={{ height: '28px', width: '28px', margin: '0 auto' }} skin="white" />
                        {console.log('isUploading2222', isUploading)}
                        <div className={cx('upload-status')}>上传中</div>
                      </Fragment> :
                      <div className={cx('add-upload-btn')}></div>
                  }
                </div>
              </FileUploadOne> */}
              
            </div>
            <div className={cx('upload-desc')}>
              <div>将展示在页面头部</div>
              <span>图片比例为16:9，大小不超过20M，支持JPG、PNG、GIF等常见格式</span>
              {!!errorInfo.msg && errorInfo.show &&
                <div className={cx('error-tips', 'banner-image-error-tips')}>
                  <span>{errorInfo.msg}</span>
                </div>
              }
            </div>
          </Fragment>
        </div>
      </div>
    )
  }
}