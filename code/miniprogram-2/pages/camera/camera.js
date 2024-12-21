// camera.js
const request = require('../../utils/request.js'); // 引入请求模块
Page({
  data: {
    flash: 'auto', // 闪光灯初始状态
    devicePosition: 'back', // 初始摄像头位置
    flashIcon:'../../images/flashlight_off.svg'
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 切换闪光灯状态
  toggleFlash() {
    const newFlash = this.data.flash === 'auto' ? 'off' : 'auto';
    const newFlashIcon = newFlash === 'auto' 
      ? '../../images/flashlight_on.svg' 
      : '../../images/flashlight_off.svg';
    this.setData({ 
      flash: newFlash,
      flashIcon: newFlashIcon
    });
  },

  // 切换前后摄像头
  toggleCamera() {
    const newPosition = this.data.devicePosition === 'back' ? 'front' : 'back';
    this.setData({ devicePosition: newPosition });
  },

  // 拍照功能
  // takePhoto() {
  //   // debugger;
  //   const ctx = wx.createCameraContext();
  //   ctx.takePhoto({
  //     // bitrate: 5000,       // 设置比特率（单位 kbps），可以根据需要调整以提高图像质量
  //     // fps: 30,             // 设置帧率，影响视频流的流畅度
  //     // resolution: '4096x3072', // 设置分辨率，指定高分辨率以获取高像素图像
  //     quality: 'original',//从high改成original
  //     success: (res) => {
  //       // wx.previewImage({
  //       //   urls: [res.tempImagePath]
  //       // });
  //       //调用上传图片的接口
  //       this.cameraUploadImage(res.tempImagePath);
  //     },
      
  //     fail: (err) => {
  //       debugger;
  //       console.error("拍照失败：", err);
  //     }
  //   });
  // },

  takePhoto() {
    const ctx = wx.createCameraContext();
    ctx.takePhoto({
      quality: 'original', // 使用原始质量
      success: (res) => {
        // 获取图片的详细信息，包括宽度和高度
        wx.getImageInfo({
          src: res.tempImagePath,
          success: (info) => {
            console.log(`图片宽度: ${info.width}, 图片高度: ${info.height}`);
            
            // 可以在这里处理或显示图片的宽高信息
            // 例如，输出到页面或做进一步处理
          },
          fail: (err) => {
            console.error("获取图片信息失败：", err);
          }
        });
  
        // 调用上传图片的接口
        this.cameraUploadImage(res.tempImagePath);
      },
      fail: (err) => {
        console.error("拍照失败：", err);
      }
    });
  },
  


   
  

  cameraUploadImage: function(filePath) {
    // 调用 request.js 中的上传接口
    request.uploadImage(filePath)
        .then((response) => {
            if (response.code === 200) {
                console.log('图片上传成功:', response);

                // 检查识别结果
                if (response.buildings && response.buildings.length > 0) {
                    const resultData = response.buildings[0];
                    // 带着识别结果跳转到结果展示页面
                    wx.navigateTo({
                        url: `/pages/basic_description/basic_description?buildingData=${encodeURIComponent(JSON.stringify(resultData))}`,
                    });
                } else {
                    // 无识别结果，返回上一个页面
                    wx.showToast({
                        title: '未识别到有效结果',
                        icon: 'none',
                        duration: 2000,
                        success: () => {
                            wx.navigateBack(); // 返回上一页
                        },
                    });
                }
            } else {
                console.error('图片上传失败:', response.msg);
                wx.showToast({
                    title: '图片上传失败，请重试',
                    icon: 'none',
                    duration: 2000,
                });
            }
        })
        .catch((error) => {
            console.error(error);
            wx.showToast({
                title: error,
                icon: 'none',
                duration: 2000,
            });
        });
  },
  
  
  
  cameraError(e) {
    console.error("相机出错：", e.detail);
  }
});
