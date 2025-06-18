'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

// 型定義
interface Communication {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  likes: string[]; // いいねしたユーザーIDの配列
  replies?: Communication[]; // 再帰的な構造
  quotedMessage?: string; // 引用メッセージ
  parentId?: string; // 親メッセージのID（リプライの場合）
}

interface CommunicationPanelProps {
  communications: Communication[];
  onSendMessage: (message: string) => void;
  onSendReply: (parentId: string, message: string) => void;
  onLikeMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onEditMessage: (messageId: string, newMessage: string) => void;
}

interface ReplyingState {
  messageId: string;
  userName: string;
  originalMessage: string;
  parentId?: string;
}

// 時間フォーマット関数
const formatTimestamp = (timestamp: string): string => {
  let date: Date;
  
  // 時間のみの文字列（例: "14:30:25"）の場合は今日の日付と組み合わせる
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timestamp)) {
    const today = new Date();
    const timeOnly = timestamp.split(':');
    date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 
                   parseInt(timeOnly[0]), parseInt(timeOnly[1]), parseInt(timeOnly[2] || '0'));
  } else {
    // 完全な日付文字列の場合
    date = new Date(timestamp);
  }
  
  // 無効な日付の場合はそのまま文字列を返す
  if (isNaN(date.getTime())) {
    return timestamp;
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diff / (1000 * 60 * 60));
  
  if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
    // 今日で24時間以内は時間のみ表示
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    // 24時間以上または別の日は年月日と時間を表示
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const CommunicationPanel: React.FC<CommunicationPanelProps> = ({
  communications,
  onSendMessage,
  onSendReply,
  onLikeMessage,
  onDeleteMessage,
  onEditMessage,
}) => {
  const [newMessage, setNewMessage] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<ReplyingState | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ messageId: string; open: boolean } | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ messageId: string; content: string } | null>(null);

  // メッセージ送信
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  // リプライ開始
  const handleStartReply = (messageId: string, userName: string, originalMessage: string, parentId?: string) => {
    setReplyingTo({ messageId, userName, originalMessage, parentId });
    setReplyMessage('');
  };

  // リプライ送信
  const handleSendReply = () => {
    if (!replyMessage.trim() || !replyingTo) return;
    onSendReply(replyingTo.messageId, replyMessage.trim());
    setReplyingTo(null);
    setReplyMessage('');
  };

  // リプライキャンセル
  const handleCancelReply = () => {
    setReplyingTo(null);
    setReplyMessage('');
  };

  // 削除確認ダイアログの表示
  const handleDeleteClick = (messageId: string) => {
    setDeleteConfirm({ messageId, open: true });
  };

  // 削除確認ダイアログのキャンセル
  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  // 削除実行
  const handleConfirmDelete = () => {
    if (deleteConfirm?.messageId) {
      onDeleteMessage(deleteConfirm.messageId);
      
      // 削除されたメッセージに返信中だった場合はキャンセル
      if (replyingTo?.messageId === deleteConfirm.messageId) {
        setReplyingTo(null);
        setReplyMessage('');
      }
    }
    setDeleteConfirm(null);
  };

  // 編集開始
  const handleStartEdit = (messageId: string, currentMessage: string) => {
    setEditingMessage({ messageId, content: currentMessage });
  };

  // 編集保存
  const handleSaveEdit = () => {
    if (!editingMessage || !editingMessage.content.trim()) return;
    onEditMessage(editingMessage.messageId, editingMessage.content.trim());
    setEditingMessage(null);
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  // 再帰的なコミュニケーション表示コンポーネント
  const renderCommunication = (communication: Communication, depth: number = 0, parentUserName?: string): React.ReactNode => {
    const isReply = depth > 0;
    
    return (
      <Box 
        key={communication.id} 
        sx={{ 
          mb: 2, 
          p: 3, 
          border: '1px solid #e1e8ed', 
          borderRadius: '0px', 
          backgroundColor: '#ffffff',
          '&:hover': { backgroundColor: '#f7f9fa' },
          transition: 'background-color 0.2s',
          ml: isReply ? 3 : 0
        }}
      >
        {/* リプライ表示 */}
        {isReply && parentUserName && (
          <Box sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            pb: 1,
            borderBottom: '1px solid #eff3f4'
          }}>
            <ReplyIcon sx={{ 
              fontSize: 'small', 
              color: '#536471',
              transform: 'scaleX(-1)'
            }} />
            <Typography variant="caption" sx={{ 
              color: '#536471',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {parentUserName} への返信
            </Typography>
          </Box>
        )}

        {/* メインツイート/リプライ */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* アバター */}
          <Box sx={{ 
            width: '40px',
            height: '40px',
            borderRadius: '50%', 
            backgroundColor: isReply ? '#17bf63' : '#1da1f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            flexShrink: 0
          }}>
            {communication.userName.charAt(0)}
          </Box>
          
          {/* ツイート内容 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* ヘッダー */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: '700', 
                color: '#0f1419',
                fontSize: '0.9rem'
              }}>
                {communication.userName}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#536471',
                fontSize: '0.8rem'
              }}>
                ·
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#536471',
                fontSize: '0.8rem'
              }}>
                {formatTimestamp(communication.timestamp)}
              </Typography>
              
              {/* 編集・削除ボタン（投稿者本人のみ表示） */}
              {communication.userId === 'user1' && (
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    size="small" 
                    onClick={() => handleStartEdit(communication.id, communication.message)}
                    sx={{ 
                      color: '#536471',
                      opacity: 0.6,
                      '&:hover': { 
                        backgroundColor: 'rgba(29, 161, 242, 0.1)',
                        color: '#1da1f2',
                        opacity: 1
                      },
                      p: 0.5
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDeleteClick(communication.id)}
                    sx={{ 
                      color: '#536471',
                      opacity: 0.6,
                      '&:hover': { 
                        backgroundColor: 'rgba(244, 33, 46, 0.1)',
                        color: '#f4212e',
                        opacity: 1
                      },
                      p: 0.5
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            {/* ツイート本文 */}
            {editingMessage?.messageId === communication.id ? (
              // 編集モード
              <Box sx={{ mb: 2 }}>
                <TextField
                  value={editingMessage.content}
                  onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                  multiline
                  maxRows={6}
                  variant="outlined"
                  sx={{ 
                    width: '100%',
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      '& fieldset': {
                        borderColor: '#e1e8ed',
                      },
                      '&:hover fieldset': {
                        borderColor: '#1da1f2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1da1f2',
                        borderWidth: '2px',
                      },
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={!editingMessage.content.trim()}
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: !editingMessage.content.trim() ? '#e1e8ed' : '#1da1f2',
                      color: 'white',
                      borderRadius: '16px',
                      px: 2,
                      py: 0.5,
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: !editingMessage.content.trim() ? '#e1e8ed' : '#1991db',
                      },
                      '&:disabled': {
                        backgroundColor: '#e1e8ed',
                        color: '#aab8c2',
                      }
                    }}
                  >
                    保存
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderRadius: '16px',
                      px: 2,
                      py: 0.5,
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      borderColor: '#d0d7de',
                      color: '#656d76',
                      '&:hover': {
                        borderColor: '#bcc4cc',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                      }
                    }}
                  >
                    キャンセル
                  </Button>
                </Box>
              </Box>
            ) : (
              // 通常表示モード
              <Typography variant="body2" sx={{ 
                mb: 2, 
                whiteSpace: 'pre-line',
                color: '#0f1419',
                fontSize: '0.9rem',
                lineHeight: 1.3
              }}>
                {communication.message}
              </Typography>
            )}
            
            {/* アクションボタン */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={() => handleStartReply(communication.id, communication.userName, communication.message)}
                  sx={{ 
                    color: '#536471',
                    '&:hover': { 
                      backgroundColor: 'rgba(29, 161, 242, 0.1)',
                      color: '#1da1f2'
                    },
                    p: 1
                  }}
                >
                  <ReplyIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ 
                  color: '#536471',
                  fontSize: '0.8rem',
                  minWidth: '16px'
                }}>
                  {communication.replies?.length || ''}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton 
                  size="small" 
                  onClick={() => onLikeMessage(communication.id)}
                  sx={{ 
                    color: communication.likes.includes('user1') ? '#f91880' : '#536471',
                    '&:hover': { 
                      backgroundColor: 'rgba(249, 24, 128, 0.1)',
                      color: '#f91880'
                    },
                    p: 1
                  }}
                >
                  <ThumbUpIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ 
                  color: communication.likes.includes('user1') ? '#f91880' : '#536471',
                  fontSize: '0.8rem',
                  minWidth: '16px'
                }}>
                  {communication.likes.length || ''}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* 返信入力欄（個別メッセージに対して） */}
        {replyingTo?.messageId === communication.id && (
          <Box sx={{ 
            mt: 3, 
            pl: 6,
            pt: 2,
            borderTop: '1px solid #eff3f4'
          }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* 返信者アバター */}
              <Box sx={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#1da1f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                田
              </Box>
              
              {/* 返信入力 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ 
                  color: '#536471', 
                  mb: 1, 
                  display: 'block',
                  fontSize: '0.8rem'
                }}>
                  {replyingTo.userName} への返信
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                  <TextField
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="返信を入力する"
                    size="small"
                    multiline
                    maxRows={3}
                    sx={{ 
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        '& fieldset': {
                          borderColor: '#e1e8ed',
                        },
                        '&:hover fieldset': {
                          borderColor: '#1da1f2',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1da1f2',
                          borderWidth: '2px',
                        },
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  <IconButton 
                    onClick={handleSendReply}
                    disabled={!replyMessage.trim()}
                    sx={{
                      backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1da1f2',
                      color: 'white',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      '&:hover': {
                        backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1991db',
                      },
                      '&:disabled': {
                        backgroundColor: '#e1e8ed',
                        color: '#aab8c2',
                      }
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={handleCancelReply}
                    sx={{ 
                      color: '#536471',
                      '&:hover': { 
                        backgroundColor: 'rgba(83, 100, 113, 0.1)' 
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* リプライ表示（親投稿の外枠内に表示） */}
        {communication.replies && communication.replies.length > 0 && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #eff3f4' }}>
            {communication.replies.map((reply, index) => {
              // すべてのリプライを同じレベルで表示
              const allReplies = [reply];
              if (reply.replies && reply.replies.length > 0) {
                allReplies.push(...reply.replies);
              }
              
              return allReplies.map((currentReply, index) => (
                <Box key={currentReply.id} sx={{ 
                  mb: 2, 
                  ml: 3, // リプライのインデント
                  last: { mb: 0 } 
                }}>
                  {/* リプライヘッダー */}
                  <Box sx={{ 
                    mb: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1 
                  }}>
                    <ReplyIcon sx={{ 
                      fontSize: 'small', 
                      color: '#536471',
                      transform: 'scaleX(-1)'
                    }} />
                    <Typography variant="caption" sx={{ 
                      color: '#536471',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {index === 0 ? communication.userName : reply.userName} への返信
                    </Typography>
                  </Box>

                  {/* リプライ内容 */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* リプライアバター */}
                    <Box sx={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      backgroundColor: '#17bf63',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}>
                      {currentReply.userName.charAt(0)}
                    </Box>
                    
                    {/* リプライ本文 */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {/* リプライヘッダー */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ 
                          fontWeight: '700', 
                          color: '#0f1419',
                          fontSize: '0.8rem'
                        }}>
                          {currentReply.userName}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#536471',
                          fontSize: '0.75rem'
                        }}>
                          ·
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: '#536471',
                          fontSize: '0.75rem'
                        }}>
                          {formatTimestamp(currentReply.timestamp)}
                        </Typography>
                        
                        {/* リプライ編集・削除ボタン */}
                        {currentReply.userId === 'user1' && (
                          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleStartEdit(currentReply.id, currentReply.message)}
                              sx={{ 
                                color: '#536471',
                                opacity: 0.6,
                                '&:hover': { 
                                  backgroundColor: 'rgba(29, 161, 242, 0.1)',
                                  color: '#1da1f2',
                                  opacity: 1
                                },
                                p: 0.5
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteClick(currentReply.id)}
                              sx={{ 
                                color: '#536471',
                                opacity: 0.6,
                                '&:hover': { 
                                  backgroundColor: 'rgba(244, 33, 46, 0.1)',
                                  color: '#f4212e',
                                  opacity: 1
                                },
                                p: 0.5
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                      
                      {/* リプライ本文 */}
                      {editingMessage?.messageId === currentReply.id ? (
                        // 編集モード
                        <Box sx={{ mb: 1.5 }}>
                          <TextField
                            value={editingMessage.content}
                            onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
                            multiline
                            maxRows={4}
                            variant="outlined"
                            sx={{ 
                              width: '100%',
                              mb: 1,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                '& fieldset': {
                                  borderColor: '#e1e8ed',
                                },
                                '&:hover fieldset': {
                                  borderColor: '#1da1f2',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: '#1da1f2',
                                  borderWidth: '2px',
                                },
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit();
                              }
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              onClick={handleSaveEdit}
                              disabled={!editingMessage.content.trim()}
                              size="small"
                              variant="contained"
                              sx={{
                                backgroundColor: !editingMessage.content.trim() ? '#e1e8ed' : '#1da1f2',
                                color: 'white',
                                borderRadius: '12px',
                                px: 1.5,
                                py: 0.3,
                                fontWeight: '600',
                                fontSize: '0.7rem',
                                textTransform: 'none',
                                minHeight: 'auto',
                                '&:hover': {
                                  backgroundColor: !editingMessage.content.trim() ? '#e1e8ed' : '#1991db',
                                },
                                '&:disabled': {
                                  backgroundColor: '#e1e8ed',
                                  color: '#aab8c2',
                                }
                              }}
                            >
                              保存
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: '12px',
                                px: 1.5,
                                py: 0.3,
                                fontWeight: '600',
                                fontSize: '0.7rem',
                                textTransform: 'none',
                                minHeight: 'auto',
                                borderColor: '#d0d7de',
                                color: '#656d76',
                                '&:hover': {
                                  borderColor: '#bcc4cc',
                                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                }
                              }}
                            >
                              キャンセル
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        // 通常表示モード
                        <Typography variant="body2" sx={{ 
                          mb: 1.5, 
                          whiteSpace: 'pre-line',
                          color: '#0f1419',
                          fontSize: '0.8rem',
                          lineHeight: 1.3
                        }}>
                          {currentReply.message}
                        </Typography>
                      )}
                      
                      {/* リプライアクションボタン */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleStartReply(currentReply.id, currentReply.userName, currentReply.message)}
                            sx={{ 
                              color: '#536471',
                              '&:hover': { 
                                backgroundColor: 'rgba(29, 161, 242, 0.1)',
                                color: '#1da1f2'
                              },
                              p: 1
                            }}
                          >
                            <ReplyIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ 
                            color: '#536471',
                            fontSize: '0.8rem',
                            minWidth: '16px'
                          }}>
                            {currentReply.replies?.length || ''}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => onLikeMessage(currentReply.id)}
                            sx={{ 
                              color: currentReply.likes.includes('user1') ? '#f91880' : '#536471',
                              '&:hover': { 
                                backgroundColor: 'rgba(249, 24, 128, 0.1)',
                                color: '#f91880'
                              },
                              p: 1
                            }}
                          >
                            <ThumbUpIcon fontSize="small" />
                          </IconButton>
                          <Typography variant="caption" sx={{ 
                            color: currentReply.likes.includes('user1') ? '#f91880' : '#536471',
                            fontSize: '0.8rem',
                            minWidth: '16px'
                          }}>
                            {currentReply.likes.length || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* リプライの返信入力欄 */}
                  {replyingTo?.messageId === currentReply.id && (
                    <Box sx={{ 
                      mt: 2, 
                      pl: 5,
                      pt: 1.5,
                      borderTop: '1px solid #f1f3f4'
                    }}>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        {/* 返信者アバター */}
                        <Box sx={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          backgroundColor: '#1da1f2',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                          flexShrink: 0
                        }}>
                          田
                        </Box>
                        
                        {/* 返信入力 */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ 
                            color: '#536471', 
                            mb: 0.5, 
                            display: 'block',
                            fontSize: '0.7rem'
                          }}>
                            {replyingTo.userName} への返信
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                            <TextField
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder="返信を入力する"
                              size="small"
                              multiline
                              maxRows={3}
                              sx={{ 
                                flex: 1,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '16px',
                                  fontSize: '0.8rem',
                                  '& fieldset': {
                                    borderColor: '#e1e8ed',
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#1da1f2',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#1da1f2',
                                    borderWidth: '2px',
                                  },
                                }
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendReply();
                                }
                              }}
                            />
                            <IconButton 
                              onClick={handleSendReply}
                              disabled={!replyMessage.trim()}
                              sx={{
                                backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1da1f2',
                                color: 'white',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                '&:hover': {
                                  backgroundColor: !replyMessage.trim() ? '#e1e8ed' : '#1991db',
                                },
                                '&:disabled': {
                                  backgroundColor: '#e1e8ed',
                                  color: '#aab8c2',
                                }
                              }}
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              onClick={handleCancelReply}
                              sx={{ 
                                color: '#536471',
                                '&:hover': { 
                                  backgroundColor: 'rgba(83, 100, 113, 0.1)' 
                                },
                                width: '28px',
                                height: '28px',
                              }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
              ));
            })}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      {/* メッセージリスト */}
      <Box sx={{ mb: 3, maxHeight: '400px', overflowY: 'auto' }}>
        {communications.map(communication => renderCommunication(communication, 0))}
        
        {communications.length === 0 && (
          <Box sx={{ 
            textAlign: 'center', 
            py: 6,
            border: '1px solid #e1e8ed',
            borderRadius: '0px',
            backgroundColor: '#ffffff'
          }}>
            <Typography variant="body1" sx={{ 
              color: '#536471',
              fontSize: '1rem',
              fontWeight: '600',
              mb: 1
            }}>
              まだ投稿がありません
            </Typography>
          </Box>
        )}
      </Box>
      
      {/* 新規ツイート入力 */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        p: 3,
        border: '1px solid #e1e8ed',
        borderRadius: '0px',
        backgroundColor: '#ffffff'
      }}>
        {/* ツイート者アバター */}
        <Box sx={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: '#1da1f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          flexShrink: 0
        }}>
          田
        </Box>
        
        {/* ツイート入力 */}
        <Box sx={{ flex: 1 }}>
          <TextField
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="投稿文を入力する"
            multiline
            maxRows={6}
            variant="outlined"
            sx={{ 
              width: '100%',
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '0px',
                fontSize: '1.1rem',
                minHeight: '80px',
                '& fieldset': {
                  border: 'none',
                },
                '&:hover fieldset': {
                  border: 'none',
                },
                '&.Mui-focused fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                padding: '12px 0',
                '&::placeholder': {
                  color: '#536471',
                  fontSize: '1.1rem',
                }
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          
          {/* 投稿ボタン */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{
                backgroundColor: !newMessage.trim() ? '#e1e8ed' : '#1da1f2',
                color: 'white',
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'none',
                minWidth: '80px',
                '&:hover': {
                  backgroundColor: !newMessage.trim() ? '#e1e8ed' : '#1991db',
                },
                '&:disabled': {
                  backgroundColor: '#e1e8ed',
                  color: '#aab8c2',
                }
              }}
            >
              投稿
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 削除確認ダイアログ */}
      {deleteConfirm && (
        <Dialog
          open={deleteConfirm.open}
          onClose={handleDeleteCancel}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              minWidth: '320px',
              maxWidth: '400px',
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 'bold', 
            fontSize: '1.2rem',
            pb: 1
          }}>
            投稿を削除
          </DialogTitle>
          
          <DialogContent sx={{ pb: 2 }}>
            <Typography variant="body1" sx={{ 
              color: '#536471',
              fontSize: '0.95rem',
              lineHeight: 1.4
            }}>
              この投稿を削除しますか？この操作は取り消せません。リプライがある場合は、それらも一緒に削除されます。
            </Typography>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button 
              onClick={handleDeleteCancel}
              variant="outlined"
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'none',
                borderColor: '#d0d7de',
                color: '#656d76',
                '&:hover': {
                  borderColor: '#bcc4cc',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }
              }}
            >
              キャンセル
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              variant="contained"
              sx={{
                borderRadius: '20px',
                px: 3,
                py: 1,
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'none',
                backgroundColor: '#f4212e',
                '&:hover': {
                  backgroundColor: '#dc1c2e',
                }
              }}
            >
              削除
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CommunicationPanel; 