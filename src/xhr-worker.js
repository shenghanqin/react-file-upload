var gamma = require('gamma')


// function uuid (len, radix) {
//   var chars = CHARS, uuid = [], i;

//   radix = radix || chars.length

//   if (len) {
//     // Compact form
//     for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
//   } else {
//     // rfc4122, version 4 form
//     var r;

//     // rfc4122 requires these characters
//     uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
//     uuid[14] = '4';

//     // Fill in random data.  At i==19 set the high bits of clock sequence as
//     // per rfc4122, sec. 4.1.5
//     for (i = 0; i < 36; i++) {
//       if (!uuid[i]) {
//         r = 0 | Math.random() * 16;
//         uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
//       }
//     }
//   }

//   return uuid.join('')
// }

// const CODE = {
//   SUCCESS: 0,
//   UPLOADING: 1,
//   FAILED: -100,
//   TIMEOUT: -101,
//   FINISHERROR: -102,
//   XHRERROR: -103
// }

// // let xhrProgress

// // class XHR {
// //   constructor(config) {
// //     this.requestUrl = this.initRuquestUrl(config)
// //     this.withCredentials = config.withCredentials || false
// //     this.requestHeaders = config.requestHeaders || false
// //     this.timeout = config.timeout || 0
// //     this.xhrStorage = {}
// //     return this
// //   }

// //   initRuquestUrl = (config) => {
// //     let paramStr = ''
// //     let { baseUrl, param } = config

// //     if (param) {
// //       const paramArr = []

// //       param['_'] = uuid()
// //       Object.keys(param).forEach(key =>
// //         typeof param[key] !== 'undefined' && paramArr.push(`${key}=${param[key]}`)
// //       )

// //       paramStr = '?' + paramArr.join('&')
// //     }

// //     return baseUrl + paramStr
// //   }

// //   initRuquestHeader = (xhr) => {
// //     const { requestHeaders } = this

// //     requestHeaders && Object.keys(requestHeaders).forEach(key => {
// //       xhr.setRequestHeader(key, requestHeaders[key])
// //     })

// //     return xhr
// //   }

// //   initContext = (file) => {
// //     /* 组装FormData */
// //     let formData = new FormData()

// //     formData.append(file.name, file)

// //     return formData
// //   }

// //   initXHR = (mill, file) => {
// //     let xhr = new XMLHttpRequest()

// //     xhr.withCredentials = this.withCredentials

// //     if (this.timeout) {
// //       xhr.timeout = this.timeout

// //       xhr.ontimeout = () => {
// //         this.requestError(mill, CODE.TIMEOUT, { type: 'TIMEOUT', message: 'timeout' })
// //         this.isTimeout = false
// //       }

// //       this.isTimeout = false

// //       setTimeout(() => this.isTimeout = true, this.timeout)
// //     }

// //     xhr.onreadystatechange = () => {
// //       /* xhr finish */
// //       try {
// //         if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 400) {
// //           this.requestSuccess(mill, xhr.responseText)
// //         } else if (xhr.readyState === 4) {
// //           /* xhr fail */
// //           this.requestFailed(mill, xhr.responseText)
// //         }
// //       } catch (e) {
// //         /* 超时抛出不一样的错误，不在这里处理 TODO 老的里面是scope.isTimeout */
// //         !this.isTimeout && this.requestError(mill, CODE.FINISHERROR, JSON.stringify({
// //           type: 'FINISHERROR', message: e.message
// //         }))
// //       }
// //     }

// //     xhr.onerror = () => {
// //       try {
// //         this.requestError(mill, CODE.XHRERROR, JSON.stringify({
// //           type: 'XHRERROR', message: xhr.responseText
// //         }))
// //       } catch (e) {
// //         this.requestError(mill, CODE.XHRERROR, JSON.stringify({
// //           type: 'XHRERROR', message: e.message
// //         }))
// //       }
// //     }

// //     xhr.onprogress = xhr.upload.onprogress = progress => {
// //       this.uploading(mill, progress)
// //     }

// //     xhr.open('POST', this.requestUrl, true)
// //     this.initRuquestHeader(xhr)
// //     xhr.send(this.initContext(file))

// //     return xhr
// //   }

// //   requestError = (mill, status, resp) => {
// //     self.postMessage({ cmd: 'error', mill, status, payload: resp })
// //   }

// //   requestSuccess = (mill, resp) => {
// //     self.postMessage({ cmd: 'success', mill, status: CODE.SUCCESS, payload: resp })
// //   }

// //   requestFailed = (mill, resp) => {
// //     self.postMessage({ cmd: 'failed', mill, status: CODE.FAILED, payload: resp })
// //   }

// //   uploading = (mill, progress) => {
// //     const { loaded, total } = progress
// //     self.postMessage({ cmd: 'uploading', mill, status: CODE.UPLOADING, payload: JSON.stringify({ loaded, total }) })
// //   }

// //   abort = mill => {
// //     if (mill in this.xhrStorage) {
// //       this.xhrStorage[mill].abort()
// //       delete this.xhrStorage[mill]
// //     } else {
// //       let keys = Object.keys(this.xhrStorage)

// //       if (keys.length) {
// //         keys.forEach(key => {
// //           this.xhrStorage[key].abort()
// //         })

// //         this.xhrStorage = {}
// //       }
// //     }
// //   }

// //   upload = (mill = uuid(), file) => {
// //     this.xhrStorage[mill] = this.initXHR(mill, file)
// //   }
// // }

// // self.addEventListener('message', e => {
// //   let { data } = e

// //   switch (data.cmd) {
// //     case 'init':
// //       xhrProgress = new XHR(data.config)

// //       break
// //     case 'upload':
// //       xhrProgress && xhrProgress.upload(data.mill, data.file)

// //       break
// //     case 'abort':
// //       xhrProgress && xhrProgress.abort(data.mill)

// //       break
// //   }
// // })


module.exports = function (self) {
  self.addEventListener('message', function (e) {
    var startNum = parseInt(e.data); // e.data=4 from main.js

    setInterval(function () {
      var r = startNum / Math.random() - 1
      self.postMessage([startNum, r, gamma(r)])
    }, 500)
  })
}