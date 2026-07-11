'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Leaf,
  Bug,
  Sprout,
  Sun,
  Droplets,
  AlertCircle,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api-url';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  likes?: number;
}

const quickQuestions = [
  {
    icon: Bug,
    text: '玉米叶片发黄是什么原因？',
    color: 'from-red-400 to-orange-400',
  },
  {
    icon: Leaf,
    text: '如何预防玉米大斑病？',
    color: 'from-green-400 to-emerald-400',
  },
  {
    icon: Sprout,
    text: '玉米追肥的最佳时期是什么时候？',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    icon: Sun,
    text: '高温天气下如何管理玉米？',
    color: 'from-yellow-400 to-amber-400',
  },
  {
    icon: Droplets,
    text: '玉米灌溉需要注意什么？',
    color: 'from-purple-400 to-pink-400',
  },
  {
    icon: AlertCircle,
    text: '玉米螟虫怎么防治最有效？',
    color: 'from-indigo-400 to-violet-400',
  },
];

const initialMessages: Message[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content: `您好！我是您的玉米种植智能助手 👋

很高兴为您服务！我可以帮您：

🌱 病虫害诊断 - 识别玉米病虫害，提供防治方案
🧪 栽培技术 - 播种、施肥、灌溉等管理建议
🌾 品种推荐 - 根据地区推荐合适品种
📅 农时安排 - 根据季节提供管理指导
⚠️ 农药使用 - 科学用药，安全用药

请随时向我咨询任何关于玉米种植的问题，我会尽我所能为您提供专业的建议！`,
    timestamp: new Date(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  // Keep route navigation at the top; enable follow mode only after a user sends a message.
  const [autoScroll, setAutoScroll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, autoScroll]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isAtBottom);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setStreamContent('');
    setAutoScroll(true);

    try {
      const response = await fetch(getApiUrl('/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({
              role: m.role,
              content: m.content,
            }))
            .concat([{ role: 'user', content: text }]),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorData?.error || `AI 服务请求失败（HTTP ${response.status}）`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  setStreamContent(fullContent);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fullContent || '抱歉，我暂时无法回答您的问题，请稍后重试。',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'AI 咨询服务暂时不可用，请稍后重试。',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
      setStreamContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex p-4 rounded-full bg-white/20 mb-6"
          >
            <MessageCircle className="h-12 w-12" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            AI 智能咨询
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            24 小时在线的农业专家，随时解答您在玉米种植过程中遇到的各种问题
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-4 flex-wrap"
          >
            <Badge className="bg-white/20 text-white px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              AI 驱动的智能对话
            </Badge>
            <Badge className="bg-white/20 text-white px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              24/7 全天候服务
            </Badge>
            <Badge className="bg-white/20 text-white px-4 py-2">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              专业可靠
            </Badge>
          </motion.div>
        </div>
      </section>

      {/* Main Chat Area */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Quick Questions Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-24 border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    常见问题
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {quickQuestions.map((q, index) => {
                      const Icon = q.icon;
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02, x: 5 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleQuickQuestion(q.text)}
                          className={`w-full text-left p-3 rounded-xl bg-gradient-to-r ${q.color} text-white shadow-md hover:shadow-lg transition-all flex items-center gap-3`}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm font-medium">{q.text}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-bold text-gray-700 mb-3">快捷链接</h4>
                    <div className="space-y-2">
                      <Link
                        href="/detect"
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                      >
                        <Bug className="h-4 w-4" />
                        病虫害图片识别
                      </Link>
                      <Link
                        href="/knowledge"
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                      >
                        <Leaf className="h-4 w-4" />
                        病虫害知识库
                      </Link>
                      <Link
                        href="/statistics"
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700"
                      >
                        <Sprout className="h-4 w-4" />
                        区域病虫害统计
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chat Interface */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <Card className="h-[calc(100vh-300px)] min-h-[600px] flex flex-col border-0 shadow-xl">
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">玉米种植智能助手</h3>
                      <p className="text-xs text-gray-500">基于先进 AI 技术 • 24 小时在线</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearChat}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    清空对话
                  </Button>
                </div>

                {/* Messages Area */}
                <ScrollArea 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 p-4"
                >
                  <div className="space-y-6">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                              : 'bg-gradient-to-br from-green-400 to-emerald-500'
                          }`}
                        >
                          {message.role === 'user' ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <Bot className="h-5 w-5 text-white" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`flex-1 max-w-[80%] ${
                            message.role === 'user' ? 'text-right' : ''
                          }`}
                        >
                          <div
                            className={`inline-block p-4 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-tr-sm'
                                : 'bg-white border shadow-sm text-gray-800 rounded-tl-sm'
                            }`}
                          >
                            {message.role === 'user' ? (
                              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                {message.content}
                              </div>
                            ) : (
                              <div className="text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-2 mt-2 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <span className="text-xs text-gray-400">
                              {formatTime(message.timestamp)}
                            </span>
                            {message.role === 'assistant' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                                  title="复制"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-green-600"
                                  title="有帮助"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button
                                  className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600"
                                  title="没帮助"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Streaming Response */}
                    {streamContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 max-w-[80%]">
                          <div className="inline-block p-4 rounded-2xl bg-white border shadow-sm text-gray-800 rounded-tl-sm">
                            <div className="text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {streamContent}
                              </ReactMarkdown>
                              <span className="inline-block w-2 h-4 bg-green-600 ml-1 rounded-sm"></span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Loading Indicator */}
                    {isLoading && !streamContent && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 max-w-[80%]">
                          <div className="inline-block p-4 rounded-2xl bg-white border shadow-sm">
                            <div className="flex items-center gap-3">
                              <Loader2 className="h-5 w-5 animate-spin text-green-600" />
                              <span className="text-gray-600">AI 正在思考中...</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                  <div className="flex gap-3">
                    <Textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="输入您的问题... (按 Enter 发送，Shift+Enter 换行)"
                      className="min-h-[60px] max-h-[200px] resize-none border-green-200 focus:border-green-500"
                      rows={1}
                    />
                    <Button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || isLoading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    AI 助手可以出错，建议仅供参考。如有重要问题，请咨询当地农业技术部门。
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">为什么选择我们的 AI 咨询</h2>
            <p className="text-gray-600">专业的 AI 技术，为您的农业生产保驾护航</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Sparkles,
                title: '智能识别',
                description: '基于深度学习的病虫害识别技术',
              },
              {
                icon: Clock,
                title: '快速响应',
                description: '秒级响应，及时解决您的疑问',
              },
              {
                icon: BookOpen,
                title: '知识丰富',
                description: '庞大的农业知识库作为支撑',
              },
              {
                icon: CheckCircle2,
                title: '专业可靠',
                description: '来自农业专家团队的精心调校',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center h-full hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                        <Icon className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
