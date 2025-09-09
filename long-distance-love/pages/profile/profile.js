// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    partnerInfo: {},
    relationshipDate: '',
    nextMeetDate: '',
    loveDays: 0,
    showEditModal: false,
    showCoupleModal: false,
    showStatsModal: false,
    editData: {
      nickName: '',
      status: ''
    },
    coupleData: {
      nickName: '',
      startDate: '',
      meetDate: '',
      meetLocation: ''
    },
    statistics: {
      loveDays: 0,
      totalMessages: 0,
      diaryCount: 0,
      photoCount: 0,
      meetCount: 0,
      totalDays: 0
    },
    today: ''
  },

  onLoad() {
    this.initData()
    this.loadUserInfo()
    this.loadStatistics()
  },

  onShow() {
    this.loadUserInfo()
    this.loadStatistics()
  },

  // 初始化数据
  initData() {
    const today = new Date()
    this.setData({
      today: today.toISOString().split('T')[0]
    })
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {}
    const partnerInfo = wx.getStorageSync('partnerInfo') || {}
    const relationshipStartDate = wx.getStorageSync('relationshipStartDate')
    const nextMeetDate = wx.getStorageSync('nextMeetDate')
    
    this.setData({
      userInfo,
      partnerInfo,
      relationshipDate: relationshipStartDate ? this.formatDate(relationshipStartDate) : '',
      nextMeetDate: nextMeetDate ? this.formatDate(nextMeetDate.split('T')[0]) : '',
      loveDays: app.getLoveDays()
    })
  },

  // 加载统计数据
  loadStatistics() {
    const chatMessages = wx.getStorageSync('chatMessages') || []
    const diaries = wx.getStorageSync('diaries') || []
    const photos = wx.getStorageSync('photos') || []
    const meetRecords = wx.getStorageSync('meetRecords') || []
    
    // 计算异地天数
    const relationshipStartDate = wx.getStorageSync('relationshipStartDate')
    let totalDays = 0
    if (relationshipStartDate) {
      const now = new Date()
      const start = new Date(relationshipStartDate)
      const totalRelationshipDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
      const totalMeetDays = meetRecords.reduce((sum, record) => sum + (record.duration || 0), 0)
      totalDays = Math.max(0, totalRelationshipDays - totalMeetDays)
    }
    
    this.setData({
      statistics: {
        loveDays: app.getLoveDays(),
        totalMessages: chatMessages.length,
        diaryCount: diaries.length,
        photoCount: photos.length,
        meetCount: meetRecords.length,
        totalDays
      }
    })
  },

  // 格式化日期
  formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN')
  },

  // 更换头像
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const avatarUrl = res.tempFilePaths[0]
        const userInfo = { ...this.data.userInfo, avatarUrl }
        
        wx.setStorageSync('userInfo', userInfo)
        this.setData({
          userInfo
        })
        
        wx.showToast({
          title: '头像更新成功',
          icon: 'success'
        })
      }
    })
  },

  // 编辑个人信息
  editProfile() {
    this.setData({
      showEditModal: true,
      editData: {
        nickName: this.data.userInfo.nickName || '',
        status: this.data.userInfo.status || ''
      }
    })
  },

  // 关闭编辑模态框
  closeEditModal() {
    this.setData({
      showEditModal: false
    })
  },

  // 昵称输入
  onNickNameInput(e) {
    this.setData({
      'editData.nickName': e.detail.value
    })
  },

  // 状态输入
  onStatusInput(e) {
    this.setData({
      'editData.status': e.detail.value
    })
  },

  // 保存个人信息
  saveProfile() {
    const { nickName, status } = this.data.editData
    
    if (!nickName.trim()) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      })
      return
    }
    
    const userInfo = {
      ...this.data.userInfo,
      nickName: nickName.trim(),
      status: status.trim()
    }
    
    wx.setStorageSync('userInfo', userInfo)
    this.setData({
      userInfo,
      showEditModal: false
    })
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  // 编辑情侣信息
  editCoupleInfo() {
    const relationshipStartDate = wx.getStorageSync('relationshipStartDate')
    const nextMeetDate = wx.getStorageSync('nextMeetDate')
    const meetLocation = wx.getStorageSync('meetLocation')
    
    this.setData({
      showCoupleModal: true,
      coupleData: {
        nickName: this.data.partnerInfo.nickName || '',
        startDate: relationshipStartDate ? relationshipStartDate.split('T')[0] : '',
        meetDate: nextMeetDate ? nextMeetDate.split('T')[0] : '',
        meetLocation: meetLocation || ''
      }
    })
  },

  // 关闭情侣信息模态框
  closeCoupleModal() {
    this.setData({
      showCoupleModal: false
    })
  },

  // 对方昵称输入
  onPartnerNameInput(e) {
    this.setData({
      'coupleData.nickName': e.detail.value
    })
  },

  // 开始日期选择
  onStartDateChange(e) {
    this.setData({
      'coupleData.startDate': e.detail.value
    })
  },

  // 见面日期选择
  onMeetDateChange(e) {
    this.setData({
      'coupleData.meetDate': e.detail.value
    })
  },

  // 见面地点输入
  onMeetLocationInput(e) {
    this.setData({
      'coupleData.meetLocation': e.detail.value
    })
  },

  // 保存情侣信息
  saveCoupleInfo() {
    const { nickName, startDate, meetDate, meetLocation } = this.data.coupleData
    
    if (!nickName.trim()) {
      wx.showToast({
        title: '请输入TA的昵称',
        icon: 'none'
      })
      return
    }
    
    // 保存对方信息
    const partnerInfo = {
      ...this.data.partnerInfo,
      nickName: nickName.trim()
    }
    wx.setStorageSync('partnerInfo', partnerInfo)
    
    // 保存恋爱开始日期
    if (startDate) {
      app.setRelationshipDate(startDate)
    }
    
    // 保存见面日期和地点
    if (meetDate) {
      const meetDateTime = `${meetDate}T12:00:00`
      app.setNextMeetDate(meetDateTime)
    }
    if (meetLocation) {
      wx.setStorageSync('meetLocation', meetLocation.trim())
    }
    
    this.setData({
      showCoupleModal: false
    })
    
    // 重新加载数据
    this.loadUserInfo()
    this.loadStatistics()
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    })
  },

  // 查看统计信息
  viewStatistics() {
    this.setData({
      showStatsModal: true
    })
  },

  // 关闭统计模态框
  closeStatsModal() {
    this.setData({
      showStatsModal: false
    })
  },

  // 导出数据
  exportData() {
    wx.showLoading({
      title: '导出中...'
    })
    
    setTimeout(() => {
      wx.hideLoading()
      
      const exportData = {
        userInfo: wx.getStorageSync('userInfo'),
        partnerInfo: wx.getStorageSync('partnerInfo'),
        relationshipStartDate: wx.getStorageSync('relationshipStartDate'),
        nextMeetDate: wx.getStorageSync('nextMeetDate'),
        chatMessages: wx.getStorageSync('chatMessages'),
        diaries: wx.getStorageSync('diaries'),
        photos: wx.getStorageSync('photos'),
        meetRecords: wx.getStorageSync('meetRecords'),
        exportTime: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      
      wx.setClipboardData({
        data: dataStr,
        success: () => {
          wx.showToast({
            title: '数据已复制到剪贴板',
            icon: 'success',
            duration: 3000
          })
        }
      })
    }, 2000)
  },

  // 导入数据
  importData() {
    wx.showModal({
      title: '导入数据',
      content: '请确保数据格式正确，导入将覆盖现有数据',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          })
        }
      }
    })
  },

  // 提醒设置
  setReminder() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 隐私设置
  privacySettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 主题设置
  themeSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 关于应用
  aboutApp() {
    wx.showModal({
      title: '关于爱在一起',
      content: '版本：1.0.0\n\n专为异地恋情侣打造的小程序，帮助维系感情，记录美好时光。\n\n愿天下有情人终成眷属！',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 意见反馈
  feedback() {
    wx.showModal({
      title: '意见反馈',
      content: '如有问题或建议，请联系开发者',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 分享应用
  shareApp() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    wx.showToast({
      title: '请点击右上角分享',
      icon: 'none'
    })
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '爱在一起 - 异地恋情侣专属小程序',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})