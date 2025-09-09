// pages/chat/chat.js
const app = getApp()

Page({
  data: {
    userInfo: {},
    partnerInfo: {},
    messages: [],
    inputText: '',
    inputFocus: false,
    isVoiceMode: false,
    isRecording: false,
    scrollTop: 0,
    scrollIntoView: '',
    onlineStatus: '在线',
    messageIdCounter: 1
  },

  onLoad() {
    this.initUserInfo()
    this.loadMessages()
    this.simulatePartnerOnline()
  },

  onShow() {
    this.scrollToBottom()
  },

  // 初始化用户信息
  initUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {
      nickName: '我',
      avatarUrl: ''
    }
    const partnerInfo = wx.getStorageSync('partnerInfo') || {
      nickName: '我的爱人',
      avatarUrl: ''
    }
    
    this.setData({
      userInfo,
      partnerInfo
    })
  },

  // 加载历史消息
  loadMessages() {
    const messages = wx.getStorageSync('chatMessages') || []
    
    // 添加一些示例消息
    if (messages.length === 0) {
      const sampleMessages = [
        {
          id: 1,
          type: 'received',
          messageType: 'text',
          content: '想你了💕',
          timestamp: Date.now() - 3600000,
          status: 'read',
          showTime: true,
          timeText: '1小时前'
        },
        {
          id: 2,
          type: 'sent',
          messageType: 'text',
          content: '我也想你，什么时候能见面呀',
          timestamp: Date.now() - 3500000,
          status: 'read'
        },
        {
          id: 3,
          type: 'received',
          messageType: 'love',
          content: '给你一个大大的拥抱',
          timestamp: Date.now() - 1800000,
          status: 'read',
          showTime: true,
          timeText: '30分钟前'
        }
      ]
      
      this.setData({
        messages: sampleMessages
      })
      this.messageIdCounter = 4
    } else {
      this.setData({
        messages: this.processMessages(messages)
      })
      this.messageIdCounter = messages.length + 1
    }
    
    this.scrollToBottom()
  },

  // 处理消息显示时间
  processMessages(messages) {
    return messages.map((msg, index) => {
      const showTime = index === 0 || 
        (msg.timestamp - messages[index - 1].timestamp > 300000) // 5分钟间隔显示时间
      
      return {
        ...msg,
        showTime,
        timeText: showTime ? this.formatTime(msg.timestamp) : ''
      }
    })
  },

  // 格式化时间
  formatTime(timestamp) {
    const now = new Date()
    const msgTime = new Date(timestamp)
    const diff = now - msgTime
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    
    return msgTime.toLocaleDateString()
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    })
  },

  // 发送文本消息
  sendTextMessage() {
    const content = this.data.inputText.trim()
    if (!content) return
    
    const message = {
      id: this.messageIdCounter++,
      type: 'sent',
      messageType: 'text',
      content,
      timestamp: Date.now(),
      status: 'sending'
    }
    
    this.addMessage(message)
    this.setData({
      inputText: ''
    })
    
    // 模拟发送成功
    setTimeout(() => {
      this.updateMessageStatus(message.id, 'sent')
    }, 1000)
    
    // 模拟对方回复
    setTimeout(() => {
      this.simulatePartnerReply()
    }, 3000)
  },

  // 添加消息
  addMessage(message) {
    const messages = [...this.data.messages]
    
    // 检查是否需要显示时间
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || message.timestamp - lastMessage.timestamp > 300000) {
      message.showTime = true
      message.timeText = this.formatTime(message.timestamp)
    }
    
    messages.push(message)
    
    this.setData({
      messages
    })
    
    this.saveMessages()
    this.scrollToBottom()
    this.updateTotalMessages()
  },

  // 更新消息状态
  updateMessageStatus(messageId, status) {
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, status }
      }
      return msg
    })
    
    this.setData({
      messages
    })
    this.saveMessages()
  },

  // 保存消息到本地
  saveMessages() {
    wx.setStorageSync('chatMessages', this.data.messages)
  },

  // 更新消息总数
  updateTotalMessages() {
    const total = this.data.messages.length
    wx.setStorageSync('totalMessages', total)
  },

  // 滚动到底部
  scrollToBottom() {
    const lastMessage = this.data.messages[this.data.messages.length - 1]
    if (lastMessage) {
      this.setData({
        scrollIntoView: `msg-${lastMessage.id}`
      })
    }
  },

  // 切换语音输入模式
  toggleVoiceInput() {
    this.setData({
      isVoiceMode: !this.data.isVoiceMode,
      inputFocus: false
    })
  },

  // 开始录音
  startRecord() {
    this.setData({
      isRecording: true
    })
    
    wx.vibrateShort()
    
    // 这里可以集成微信录音API
    wx.startRecord({
      success: (res) => {
        console.log('开始录音', res)
      }
    })
  },

  // 停止录音
  stopRecord() {
    this.setData({
      isRecording: false
    })
    
    wx.stopRecord({
      success: (res) => {
        console.log('录音完成', res)
        this.sendVoiceMessage(res.tempFilePath, res.duration)
      }
    })
  },

  // 取消录音
  cancelRecord() {
    this.setData({
      isRecording: false
    })
    
    wx.stopRecord()
  },

  // 发送语音消息
  sendVoiceMessage(filePath, duration) {
    const message = {
      id: this.messageIdCounter++,
      type: 'sent',
      messageType: 'voice',
      content: filePath,
      duration: Math.ceil(duration / 1000),
      timestamp: Date.now(),
      status: 'sending'
    }
    
    this.addMessage(message)
    
    setTimeout(() => {
      this.updateMessageStatus(message.id, 'sent')
    }, 1000)
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.sendImageMessage(tempFilePath)
      }
    })
  },

  // 发送图片消息
  sendImageMessage(imagePath) {
    const message = {
      id: this.messageIdCounter++,
      type: 'sent',
      messageType: 'image',
      content: imagePath,
      timestamp: Date.now(),
      status: 'sending'
    }
    
    this.addMessage(message)
    
    setTimeout(() => {
      this.updateMessageStatus(message.id, 'sent')
    }, 1000)
  },

  // 发送爱心
  sendLove() {
    const loveMessages = [
      '给你一个大大的拥抱 🤗',
      '么么哒 😘',
      '爱你哟 💕',
      '想抱抱你 🥰',
      '给你比心 💖'
    ]
    
    const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)]
    
    const message = {
      id: this.messageIdCounter++,
      type: 'sent',
      messageType: 'love',
      content: randomMessage,
      timestamp: Date.now(),
      status: 'sending'
    }
    
    this.addMessage(message)
    
    setTimeout(() => {
      this.updateMessageStatus(message.id, 'sent')
    }, 1000)
  },

  // 预览图片
  previewImage(e) {
    const src = e.currentTarget.dataset.src
    wx.previewImage({
      current: src,
      urls: [src]
    })
  },

  // 播放语音
  playVoice(e) {
    const src = e.currentTarget.dataset.src
    wx.playVoice({
      filePath: src
    })
  },

  // 视频通话
  makeVideoCall() {
    wx.showToast({
      title: '正在呼叫...',
      icon: 'loading',
      duration: 2000
    })
    
    setTimeout(() => {
      wx.showModal({
        title: '视频通话',
        content: '对方暂时无法接听，请稍后再试',
        showCancel: false
      })
    }, 2000)
  },

  // 语音通话
  makeVoiceCall() {
    wx.showToast({
      title: '正在呼叫...',
      icon: 'loading',
      duration: 2000
    })
    
    setTimeout(() => {
      wx.showModal({
        title: '语音通话',
        content: '对方暂时无法接听，请稍后再试',
        showCancel: false
      })
    }, 2000)
  },

  // 模拟对方在线状态
  simulatePartnerOnline() {
    const statuses = ['在线', '1分钟前在线', '刚刚在线']
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    
    this.setData({
      onlineStatus: randomStatus
    })
  },

  // 模拟对方回复
  simulatePartnerReply() {
    const replies = [
      '我也想你呢 💕',
      '今天过得怎么样？',
      '等不及见到你了',
      '爱你 ❤️',
      '晚安，好梦 🌙'
    ]
    
    const randomReply = replies[Math.floor(Math.random() * replies.length)]
    
    const message = {
      id: this.messageIdCounter++,
      type: 'received',
      messageType: 'text',
      content: randomReply,
      timestamp: Date.now(),
      status: 'read'
    }
    
    this.addMessage(message)
  }
})