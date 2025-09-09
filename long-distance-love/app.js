// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功', res.code)
      }
    })
  },
  
  globalData: {
    userInfo: null,
    partnerInfo: null,
    relationshipStartDate: null,
    nextMeetDate: null
  },

  // 设置恋爱开始日期
  setRelationshipDate(date) {
    this.globalData.relationshipStartDate = date
    wx.setStorageSync('relationshipStartDate', date)
  },

  // 设置下次见面日期
  setNextMeetDate(date) {
    this.globalData.nextMeetDate = date
    wx.setStorageSync('nextMeetDate', date)
  },

  // 获取恋爱天数
  getLoveDays() {
    const startDate = this.globalData.relationshipStartDate || wx.getStorageSync('relationshipStartDate')
    if (!startDate) return 0
    
    const now = new Date()
    const start = new Date(startDate)
    const diffTime = Math.abs(now - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  },

  // 获取距离下次见面的天数
  getDaysUntilMeet() {
    const meetDate = this.globalData.nextMeetDate || wx.getStorageSync('nextMeetDate')
    if (!meetDate) return null
    
    const now = new Date()
    const meet = new Date(meetDate)
    const diffTime = meet - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }
})