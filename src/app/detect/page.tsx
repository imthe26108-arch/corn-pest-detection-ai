'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ScanLine,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bug,
  Leaf,
  Shield,
  Info,
  Copy,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function DetectPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [analysisReport, setAnalysisReport] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setShowResults(false);
        setAnalysisReport('');
        setAnalysisError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setShowResults(false);
        setAnalysisReport('');
        setAnalysisError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setShowResults(false);
    setAnalysisReport('');
    setAnalysisError('');

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          prompt: '请详细分析这张玉米叶片图片，识别可能存在的病虫害，给出完整的诊断报告和防治方案。',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || '检测服务请求失败');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let report = '';

      if (!reader) {
        throw new Error('检测服务没有返回可读取的响应');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) {
            continue;
          }

          const data = JSON.parse(line.slice(6));

          if (data.content) {
            report += data.content;
            setAnalysisReport(report);
          }

          if (data.error) {
            throw new Error(data.error);
          }
        }
      }

      setShowResults(true);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : '检测服务暂时不可用');
      setShowResults(false);
    } finally {
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex p-4 rounded-full bg-white/20 mb-6"
          >
            <ScanLine className="h-12 w-12" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            智能病虫害识别
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-green-100 max-w-3xl mx-auto"
          >
            上传您的玉米叶片图片，我们的 AI 系统将自动分析并识别可能存在的病虫害，提供详细的诊断报告和专业的防治建议
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Upload Area */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full shadow-xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Upload className="h-6 w-6" />
                    上传图片
                  </h2>
                  <p className="text-green-100 mt-2">支持拖拽或点击上传玉米叶片图片</p>
                </div>
                <CardContent className="p-6">
                  {!selectedImage ? (
                    <div
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-green-300 rounded-2xl p-12 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100">
                          <Upload className="h-12 w-12 text-green-600" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-700 mb-2">
                            点击或拖拽图片到此处上传
                          </p>
                          <p className="text-sm text-gray-500">
                            支持 JPG、PNG 格式，建议图片大小不超过 10MB
                          </p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative rounded-2xl overflow-hidden shadow-lg">
                        <img
                          src={selectedImage}
                          alt="Uploaded"
                          className="w-full h-auto max-h-96 object-contain bg-gray-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedImage(null);
                              setShowResults(false);
                              setAnalysisReport('');
                              setAnalysisError('');
                            }}
                          >
                            重新上传
                          </Button>
                        </div>
                      </div>

                      {!showResults && !isAnalyzing && (
                        <Button
                          onClick={handleAnalyze}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                          size="lg"
                        >
                          <ScanLine className="mr-2 h-5 w-5" />
                          开始分析
                        </Button>
                      )}
                    </div>
                  )}

                  {isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center py-8">
                        <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="h-16 w-16 text-green-600" />
                          </motion.div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                          AI 正在分析您的图片...
                        </h3>
                        <p className="text-gray-600 mb-6">
                          我们的深度学习模型正在识别病虫害类型，请稍候
                        </p>
                        <Progress value={analysisProgress} className="max-w-md mx-auto h-3" />
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          {Math.round(analysisProgress)}% 完成
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-green-50 rounded-xl">
                          <ScanLine className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">图像采集</p>
                          <p className="text-xs text-green-600">完成</p>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl">
                          <Bug className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">特征提取</p>
                          <p className="text-xs text-emerald-600">
                            {analysisProgress > 33 ? '完成' : '进行中'}
                          </p>
                        </div>
                        <div className="p-4 bg-teal-50 rounded-xl">
                          <Shield className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">诊断分析</p>
                          <p className="text-xs text-teal-600">
                            {analysisProgress > 66 ? '完成' : '等待中'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Results */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatePresence>
                {showResults && analysisReport && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        AI 诊断报告
                      </h2>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        分析完成
                      </Badge>
                    </div>

                    <Card className="border-0 shadow-lg overflow-hidden">
                      <CardContent className="p-6 space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                            <p className="text-sm text-blue-800">
                              识别结果由 AI 生成，仅供农业管理参考；严重病害请结合当地农技部门建议处理。
                            </p>
                          </div>
                        </div>

                        <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                          {analysisReport}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                            onClick={() => navigator.clipboard.writeText(analysisReport)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            复制报告
                          </Button>
                          <Link href="/chat" className="flex-1">
                            <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              咨询专家
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {analysisError && !isAnalyzing && (
                <Card className="border-red-200 bg-red-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-red-800 mb-2">检测暂时不可用</h3>
                        <p className="text-sm text-red-700">{analysisError}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Empty State */}
              {!showResults && !isAnalyzing && !analysisError && (
                <Card className="h-full border-2 border-dashed border-green-200 flex flex-col items-center justify-center py-20">
                  <div className="text-center">
                    <div className="p-6 rounded-full bg-green-100 mb-6 inline-block">
                      <ScanLine className="h-16 w-16 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">上传图片开始检测</h3>
                    <p className="text-gray-500 max-w-md">
                      请在左侧上传您的玉米叶片图片，我们的 AI 系统将自动识别可能存在的病虫害
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">叶片正面</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl text-center">
                      <Bug className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-700">病斑特写</p>
                    </div>
                  </div>

                  <div className="mt-8 text-sm text-gray-500">
                    <p className="flex items-center gap-2 justify-center">
                      <ExternalLink className="h-4 w-4" />
                      建议拍摄清晰、光照均匀的图片以获得最佳识别效果
                    </p>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">拍摄技巧</h2>
            <p className="text-gray-600">遵循以下建议可获得更准确的识别结果</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📷',
                title: '光线充足',
                description: '在自然光充足的环境下拍摄，避免强光直射或阴影',
              },
              {
                icon: '🔍',
                title: '对焦清晰',
                description: '确保病斑部位清晰可见，尽量拍摄病斑特写',
              },
              {
                icon: '📐',
                title: '多角度拍摄',
                description: '从不同角度拍摄多张照片，捕捉完整症状特征',
              },
            ].map((tip, index) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="text-5xl mb-4">{tip.icon}</div>
                    <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
