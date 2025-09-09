// pages/countdown/countdown.js
const app = getApp()

Page({
  data: {
    meetDate: null,
    meetDateText: '',
    meetLocation: '',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    loveDays: 0,
    meetCount: 0,
    totalDays: 0,
    meetRecords: [],
    showDateModal: false,
    showRecordModal: false,
    selectedDate: '',
    selectedTime: '12:00',
    today: '',
    recordData: {
      title: '',
      date: '',
      location: '',
      duration: 1,
      mood: '😍'
    },
    moods: ['😍', '🥰', '😘', '🤗', '😊', '🥳', '😭', '🤔'],
    timer: null
  },

  onLoad() {
    this.initData()
    this.startCountdown()
  },

  onShow() {
    this.loadData()
    if (!this.data.timer) {
      this.startCountdown()
    }
  },

  onHide() {
    this.stopCountdown()
  },

  onUnload() {
    this.stopCountdown()
  },

  // 初始化数据
  initData() {
    const today = new Date()
    this.setData({
      today: today.toISOString().split('T')[0]
    })
    
    this.loadData()
  },

  // 加载数据
  loadData() {
    // 加载见面日期
    const meetDate = wx.getStorageSync('nextMeetDate')
    const meetLocation = wx.getStorageSync('meetLocation') || ''
    
    if (meetDate) {
      this.setData({
        meetDate,
        meetLocation,
        meetDateText: this.formatMeetDate(meetDate)
      })
    }
    
    // 加载统计数据
    const loveDays = app.getLoveDays()
    const meetRecords = wx.getStorageSync('meetRecords') || []
    const totalDays = this.calculateTotalDays()
    
    this.setData({
      loveDays,
      meetCount: meetRecords.length,
      totalDays,
      meetRecords: this.processMeetRecords(meetRecords)
    })
  },

  // 格式化见面日期
  formatMeetDate(dateStr) {
    const date = new Date(dateStr)
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    }
    return date.toLocaleDateString('zh-CN', options)
  },

  // 计算异地总天数
  calculateTotalDays() {
    const startDate = wx.getStorageSync('relationshipStartDate')
    if (!startDate) return 0
    
    const meetRecords = wx.getStorageSync('meetRecords') || []
    const totalMeetDays = meetRecords.reduce((sum, record) => sum + (record.duration || 0), 0)
    
    const now = new Date()
    const start = new Date(startDate)
    const totalDays = Math.ceil((now - start) / (1000 * 60 * 60 * 24))
    
    return Math.max(0, totalDays - totalMeetDays)
  },

  // 处理见面记录
  processMeetRecords(records) {
    return records.map(record => {
      const date = new Date(record.date)
      return {
        ...record,
        day: date.getDate().toString().padStart(2, '0'),
        month: (date.getMonth() + 1).toString().padStart(2, '0') + '月'
      }
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  // 开始倒计时
  startCountdown() {
    if (!this.data.meetDate) return
    
    this.updateCountdown()
    this.data.timer = setInterval(() => {
      this.updateCountdown()
    }, 1000)
  },

  // 停止倒计时
  stopCountdown() {
    if (this.data.timer) {
      clearInterval(this.data.timer)
      this.setData({
        timer: null
      })
    }
  },

  // 更新倒计时
  updateCountdown() {
    if (!this.data.meetDate) return
    
    const now = new Date().getTime()
    const meetTime = new Date(this.data.meetDate).getTime()
    const diff = meetTime - now
    
    if (diff <= 0) {
      this.setData({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      })
      this.stopCountdown()
      return
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    this.setData({
      days: days.toString().padStart(2, '0'),
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    })
  },

  // 设置见面日期
  setMeetDate() {
    this.setData({
      showDateModal: true,
      selectedDate: this.data.meetDate ? this.data.meetDate.split('T')[0] : '',
      selectedTime: this.data.meetDate ? this.data.meetDate.split('T')[1]?.substring(0, 5) || '12:00' : '12:00',
      meetLocation: this.data.meetLocation
    })
  },

  // 设置下次见面日期
  setNextMeetDate() {
    this.setMeetDate()
  },

  // 关闭日期模态框
  closeDateModal() {
    this.setData({
      showDateModal: false
    })
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      selectedDate: e.detail.value
    })
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      selectedTime: e.detail.value
    })
  },

  // 地点输入
  onLocationInput(e) {
    this.setData({
      meetLocation: e.detail.value
    })
  },

  // 确认日期
  confirmDate() {
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      })
      return
    }
    
    const meetDateTime = `${this.data.selectedDate}T${this.data.selectedTime}:00`
    const meetDate = new Date(meetDateTime)
    
    if (meetDate <= new Date()) {
      wx.showToast({
        title: '请选择未来的日期',
        icon: 'none'
      })
      return
    }
    
    // 保存到全局和本地存储
    app.setNextMeetDate(meetDateTime)
    wx.setStorageSync('meetLocation', this.data.meetLocation)
    
    this.setData({
      meetDate: meetDateTime,
      meetDateText: this.formatMeetDate(meetDateTime),
      showDateModal: false
    })
    
    // 重新开始倒计时
    this.stopCountdown()
    this.startCountdown()
    
    wx.showToast({
      title: '设置成功',
      icon: 'success'
    })
  },

  // 记录见面
  addMeetRecord() {
    this.setData({
      showRecordModal: true,
      recordData: {
        title: '',
        date: this.data.today,
        location: '',
        duration: 1,
        mood: '😍'
      }
    })
  },

  // 关闭记录模态框
  closeRecordModal() {
    this.setData({
      showRecordModal: false
    })
  },

  // 记录标题输入
  onRecordTitleInput(e) {
    this.setData({
      'recordData.title': e.detail.value
    })
  },

  // 记录日期选择
  onRecordDateChange(e) {
    this.setData({
      'recordData.date': e.detail.value
    })
  },

  // 记录地点输入
  onRecordLocationInput(e) {
    this.setData({
      'recordData.location': e.detail.value
    })
  },

  // 记录天数输入
  onRecordDurationInput(e) {
    this.setData({
      'recordData.duration': parseInt(e.detail.value) || 1
    })
  },

  // 选择记录心情
  selectRecordMood(e) {
    const mood = e.currentTarget.dataset.mood
    this.setData({
      'recordData.mood': mood
    })
  },

  // 保存见面记录
  saveRecord() {
    const { title, date, location, duration, mood } = this.data.recordData
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return
    }
    
    if (!location.trim()) {
      wx.showToast({
        title: '请输入地点',
        icon: 'none'
      })
      return
    }
    
    const records = wx.getStorageSync('meetRecords') || []
    const newRecord = {
      id: Date.now(),
      title: title.trim(),
      date,
      location: location.trim(),
      duration,
      mood,
      timestamp: Date.now()
    }
    
    records.push(newRecord)
    wx.setStorageSync('meetRecords', records)
    
    this.setData({
      showRecordModal: false,
      meetRecords: this.processMeetRecords(records),
      meetCount: records.length,
      totalDays: this.calculateTotalDays()
    })
    
    wx.showToast({
      title: '记录成功',
      icon: 'success'
    })
  },

  // 分享倒计时
  shareCountdown() {
    if (!this.data.meetDate) {
      wx.showToast({
        title: '请先设置见面日期',
        icon: 'none'
      })
      return
    }
    
    const { days, hours, minutes } = this.data
    const shareText = `距离我们见面还有 ${days}天${hours}小时${minutes}分钟！`
    
    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 分享功能
  onShareAppMessage() {
    const { days, hours } = this.data
    return {
      title: `距离见面还有${days}天${hours}小时！`,
      path: '/pages/countdown/countdown',
      imageUrl: '/images/countdown-share.jpg'
    }
  }
})