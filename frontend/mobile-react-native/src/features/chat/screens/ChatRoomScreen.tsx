import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, SafeAreaView, Modal, Alert } from 'react-native';
import { Image } from 'expo-image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/RootNavigator';
import { useChatStore } from '../../../store/chatStore';
import { chatSignalRService } from '../../../services/api/chatSignalR';
import { apiClient } from '../../../services/api/apiClient';
import { chatService } from '../../../services/api/chatService';
import { useAuthStore } from '../../../store/authStore';
import { useToast } from '../../../shared/components/ToastProvider';
import { UserReportModal } from '../../../shared/components/UserReportModal';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const EMPTY_ARRAY: any[] = [];

// SVGs
const BackIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15 18L9 12L15 6" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MenuIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="5" r="2" fill="#111111" />
    <Circle cx="12" cy="12" r="2" fill="#111111" />
    <Circle cx="12" cy="19" r="2" fill="#111111" />
  </Svg>
);

const MicIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2Z" fill="#EE3F57" />
    <Path d="M19 10V11C19 14.866 15.866 18 12 18C8.13401 18 5 14.866 5 11V10" stroke="#EE3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 18V22M8 22H16" stroke="#EE3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SendIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13" stroke="#EE3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#EE3F57" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const StickerIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M15.5 3H8.5C5.46243 3 3 5.46243 3 8.5V15.5C3 18.5376 5.46243 21 8.5 21H15.5C18.5376 21 21 18.5376 21 15.5V8.5C21 5.46243 18.5376 3 15.5 3Z" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15.5 3L21 8.5M21 21L3 3" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DoubleCheckIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M7 12L10.5 15.5L20 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 12L6.5 15.5M16 6L11 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SingleCheckIcon = ({ color }: { color: string }) => (
  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <Path d="M5 12L10 17L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const ChatRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { conversationId, receiverId, receiverName, receiverAvatar } = route.params;
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const messages = useChatStore((state) => state.messages[conversationId]) || EMPTY_ARRAY;
  const addMessage = useChatStore((state) => state.addMessage);
  
  const [inputText, setInputText] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    chatSignalRService.startConnection();
    fetchHistory();
    
    return () => {
      chatSignalRService.stopConnection();
    };
  }, [conversationId]);

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get(`/api/chat/${conversationId}/history`);
      const chatData = response.data?.data;
      if (chatData && Array.isArray(chatData)) {
        const mappedMessages = chatData.map((msg: any) => ({
          id: msg.id || msg.clientMsgId || msg.reqId,
          conversationId: conversationId,
          senderId: msg.senderId,
          payload: msg.content || msg.payload,
          timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
          isDelivered: true,
        }));
        // API returns newest first, we want oldest first in store
        useChatStore.getState().setMessages(conversationId, mappedMessages.reverse());
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const reqId = Math.random().toString(36).substring(7);
    const currentText = inputText;
    setInputText('');

    addMessage(conversationId, {
      id: reqId,
      conversationId,
      senderId: user?.id || 'me',
      payload: currentText,
      timestamp: new Date().toISOString(),
      isDelivered: false,
    });

    try {
      await chatSignalRService.sendMessage(conversationId, receiverId, currentText, reqId);
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast({
        title: 'Gửi tin thất bại',
        message: 'Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối.',
        type: 'error'
      });
    }
  };

  const handleDeleteChat = () => {
    setIsMenuVisible(false);
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Toàn bộ tin nhắn sẽ bị xóa vĩnh viễn.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              await chatService.deleteConversation(conversationId);
              useChatStore.getState().setMessages(conversationId, []);
              
              showToast({
                title: 'Đã xóa',
                message: 'Cuộc trò chuyện đã được xóa.',
                type: 'success'
              });
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete conversation:', error);
              showToast({
                title: 'Lỗi',
                message: 'Không thể xóa cuộc trò chuyện. Vui lòng thử lại.',
                type: 'error'
              });
            }
          }
        }
      ]
    );
  };

  const handleReport = () => {
    setIsMenuVisible(false);
    setIsReportModalVisible(true);
  };

  const handleViewProfile = () => {
    setIsMenuVisible(false);
    navigation.navigate('UserProfile', { userId: receiverId });
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.senderId === user?.id || item.senderId === 'me';
    const displayMessages = [...messages].reverse();
    
    // With inverted, displayMessages is [newest, ..., oldest]
    // showDateSeparator if it's the last item or different day from the next (older) one
    let showDateSeparator = false;
    if (index === displayMessages.length - 1) {
      showDateSeparator = true;
    } else {
      const nextMsg = displayMessages[index + 1];
      const nextDate = new Date(nextMsg.timestamp).toDateString();
      const currDate = new Date(item.timestamp).toDateString();
      if (nextDate !== currDate) showDateSeparator = true;
    }

    return (
      <View style={styles.messageWrapper}>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <Text style={styles.dateText}>
                {new Date(item.timestamp).toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })}
            </Text>
            <View style={styles.dateLine} />
          </View>
        )}
        
        <View style={[styles.messageBubble, isMe ? styles.messageMe : styles.messageThem]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
            {item.payload}
          </Text>
        </View>

        <View style={[styles.timestampContainer, isMe ? styles.timestampContainerMe : styles.timestampContainerThem]}>
          <Text style={styles.timestampText}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </Text>
          {isMe && (
            <View style={styles.statusIcon}>
              {item.isDelivered ? <DoubleCheckIcon color="#EE3F57" /> : <SingleCheckIcon color="#A1A1AA" />}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Drag Handle Indicator */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <BackIcon />
          </TouchableOpacity>
          <View style={styles.avatarRing}>
            <Image 
              source={receiverAvatar ? { uri: receiverAvatar } : require('../../../../assets/images/anh2.jpg')} 
              style={styles.avatar} 
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{receiverName}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <MenuIcon />
        </TouchableOpacity>
      </View>

      {/* Options Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleViewProfile}>
              <Text style={styles.menuItemText}>Xem thông tin</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Text style={styles.menuItemText}>Báo cáo người dùng</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteChat}>
              <Text style={[styles.menuItemText, { color: '#EE3F57' }]}>Xóa đoạn chat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={[...messages].reverse()}
          inverted={true}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputAreaWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Your message"
              placeholderTextColor="#A1A1AA"
              multiline
            />
            <TouchableOpacity style={styles.stickerBtn}>
              <StickerIcon />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={inputText.trim() ? handleSend : undefined}
          >
            {inputText.trim() ? <SendIcon /> : <MicIcon />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <UserReportModal 
        visible={isReportModalVisible}
        targetUserId={receiverId}
        targetUserName={receiverName}
        onClose={() => setIsReportModalVisible(false)}
        onSuccess={() => {
          showToast({
            title: 'Đã gửi báo cáo',
            message: 'Cảm ơn bạn đã giúp cộng đồng an toàn hơn.',
            type: 'success'
          });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: -8,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#EE3F57',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EE3F57',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  dateText: {
    marginHorizontal: 12,
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageThem: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF0F2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
  },
  messageMe: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 4,
    borderBottomLeftRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextThem: {
    color: '#111111',
  },
  messageTextMe: {
    color: '#111111',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timestampContainerThem: {
    alignSelf: 'flex-start',
  },
  timestampContainerMe: {
    alignSelf: 'flex-end',
  },
  timestampText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputAreaWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 12,
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    minHeight: 48,
    paddingLeft: 16,
    paddingRight: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111111',
    maxHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  stickerBtn: {
    padding: 6,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100, // Adjust based on header height
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111111',
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
