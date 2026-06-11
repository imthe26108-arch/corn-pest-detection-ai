'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Bug,
  Leaf,
  Thermometer,
  Droplets,
  Wind,
  CalendarDays,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const diseases = [
  {
    id: 1,
    name: '玉米大斑病',
    latinName: 'Exserohilum turcicum',
    category: '真菌病害',
    severity: 'high',
    affectedParts: ['叶片', '叶鞘'],
    symptoms: [
      '叶片上出现大型梭形病斑',
      '病斑颜色由灰绿色变为褐色',
      '病斑周围有黄色晕圈',
      '严重时叶片枯死',
    ],
    spreadConditions: '高湿、阴雨天气',
    occurrencePeriod: '7-8月',
    prevention: ['选择抗病品种', '合理轮作', '加强通风透光'],
    image: '/corn-bingban.jpeg',
    rating: 4.8,
    views: 12580,
    description: '玉米大斑病是玉米生产中最常见的叶部病害之一，由大斑突脐蠕孢菌引起。该病主要危害玉米叶片，严重时可使叶片大面积枯死，影响光合作用，导致产量下降10%-30%。',
    causes: ['病原菌以菌丝体或分生孢子在病残体上越冬', '翌年春季产生分生孢子借风雨传播', '高温高湿条件下病害迅速蔓延', '连作田块发病较重'],
    chemicalControl: ['75%百菌清可湿性粉剂600倍液喷雾', '50%多菌灵可湿性粉剂500倍液', '25%粉锈宁可湿性粉剂1000倍液', '发病初期开始喷药，间隔7-10天一次'],
    agriculturalControl: ['选用抗病品种如郑单958', '实行轮作倒茬，避免连作', '合理密植，改善通风透光条件', '及时清除病残体，深翻土壤'],
  },
  {
    id: 2,
    name: '玉米小斑病',
    latinName: 'Bipolaris maydis',
    category: '真菌病害',
    severity: 'medium',
    affectedParts: ['叶片', '苞叶'],
    symptoms: [
      '叶片出现小型褐色斑点',
      '病斑呈椭圆形或长方形',
      '病斑常有同心轮纹',
      '严重时叶片干枯',
    ],
    spreadConditions: '高温高湿',
    occurrencePeriod: '6-9月',
    prevention: ['选用抗病品种', '清除病残体', '药剂防治'],
    image: '/corn-xiaoban.jpeg',
    rating: 4.5,
    views: 9860,
    description: '玉米小斑病由玉蜀黍平脐蠕孢菌引起，是玉米上重要的叶部病害。病斑较小，但数量多时也会严重影响光合作用，造成产量损失。',
    causes: ['病菌以菌丝和分生孢子在病残体上越冬', '分生孢子借风雨传播进行初侵染', '高温高湿有利于病害流行', '偏施氮肥发病重'],
    chemicalControl: ['50%扑海因可湿性粉剂1000倍液', '75%百菌清可湿性粉剂600倍液', '70%甲基托布津可湿性粉剂500倍液', '发病初期喷药，连续2-3次'],
    agriculturalControl: ['推广种植抗病品种', '合理施肥，增施磷钾肥', '及时摘除下部病叶', '收获后清除田间病残体'],
  },
  {
    id: 3,
    name: '玉米锈病',
    latinName: 'Puccinia polysora',
    category: '真菌病害',
    severity: 'medium',
    affectedParts: ['叶片', '叶鞘', '苞叶'],
    symptoms: [
      '叶片出现黄褐色粉末状孢子堆',
      '孢子堆呈圆形或椭圆形',
      '发病初期有褪绿斑点',
      '严重时孢子堆布满叶片',
    ],
    spreadConditions: '温暖潮湿',
    occurrencePeriod: '8-9月',
    prevention: ['抗病品种', '合理密植', '增施磷钾肥'],
    image: '/corn-xiu.jpeg',
    rating: 4.6,
    views: 11230,
    description: '玉米锈病是由锈菌引起的真菌性病害，包括普通锈病、南方锈病等。南方锈病近年发生较重，对产量影响较大，严重时可减产20%以上。',
    causes: ['锈菌以夏孢子在病残体上越冬', '夏孢子随气流远距离传播', '温暖潮湿天气利于侵染', '偏施氮肥、密植田块发病重'],
    chemicalControl: ['25%粉锈宁可湿性粉剂1500倍液', '15%三唑酮可湿性粉剂1000倍液', '12.5%烯唑醇可湿性粉剂2000倍液', '发病初期喷药，间隔10天一次'],
    agriculturalControl: ['选用抗锈品种', '合理密植，增施磷钾肥', '适时早播避开发病高峰', '清除田间杂草减少菌源'],
  },
  {
    id: 4,
    name: '玉米螟',
    latinName: 'Ostrinia furnacalis',
    category: '虫害',
    severity: 'high',
    affectedParts: ['心叶', '茎秆', '果穗'],
    symptoms: [
      '心叶出现整齐排孔',
      '茎秆被钻蛀易折断',
      '果穗受害影响产量',
      '可见虫粪从虫孔排出',
    ],
    spreadConditions: '温暖潮湿',
    occurrencePeriod: '5-9月',
    prevention: ['生物防治', '灯光诱杀', '药剂防治'],
    image: '/corn-mang.jpeg',
    rating: 4.9,
    views: 15890,
    description: '玉米螟是玉米最重要的害虫之一，幼虫钻蛀心叶、茎秆和果穗，造成直接危害，同时钻蛀伤口易引发病害。一般年份可造成减产10%-15%，大发生年份减产可达30%以上。',
    causes: ['以老熟幼虫在茎秆和穗轴中越冬', '翌年春季化蛹羽化产卵', '成虫趋光性强', '高温高湿利于发生'],
    chemicalControl: ['3%辛硫磷颗粒剂灌心', '1.5%辛硫磷颗粒剂丢心', 'Bt乳剂200倍液灌心', '心叶末期是最佳防治时期'],
    agriculturalControl: ['种植抗虫品种', '及时处理越冬寄主', '设置诱虫灯诱杀成虫', '释放赤眼蜂进行生物防治'],
  },
  {
    id: 5,
    name: '玉米粘虫',
    latinName: 'Mythimna separata',
    category: '虫害',
    severity: 'high',
    affectedParts: ['叶片', '嫩茎', '穗粒'],
    symptoms: [
      '叶片被咬成缺刻',
      '严重时吃光叶片',
      '群居迁移危害',
      '幼虫暴食',
    ],
    spreadConditions: '高温干燥',
    occurrencePeriod: '6-8月',
    prevention: ['糖醋诱杀', '草把诱卵', '药剂喷洒'],
    image: '/corn-zhanc.jpeg',
    rating: 4.7,
    views: 13450,
    description: '玉米粘虫是一种迁飞性害虫，幼虫食性杂，暴食性强，大发生时可将整片玉米田叶片吃光，造成严重减产甚至绝收。',
    causes: ['成虫远距离迁飞', '适宜气候条件下大量繁殖', '幼虫3龄后进入暴食期', '杂草多的田块发生重'],
    chemicalControl: ['4.5%高效氯氰菊酯1500倍液', '2.5%敌杀死2000倍液', '25%灭幼脲3号1500倍液', '幼虫3龄前是最佳防治期'],
    agriculturalControl: ['设置糖醋液诱杀成虫', '草把诱卵集中销毁', '清除田间杂草', '人工捕杀低龄幼虫'],
  },
  {
    id: 6,
    name: '玉米黑粉病',
    latinName: 'Ustilago maydis',
    category: '真菌病害',
    severity: 'high',
    affectedParts: ['茎秆', '果穗', '雄穗'],
    symptoms: [
      '植株各部位形成肿瘤',
      '肿瘤初期包有白色薄膜',
      '破裂后散出黑粉',
      '严重影响产量',
    ],
    spreadConditions: '高温干旱交替',
    occurrencePeriod: '7-9月',
    prevention: ['抗病品种', '轮作倒茬', '早期摘除病瘤'],
    image: '/corn-heisen.jpeg',
    rating: 4.4,
    views: 8970,
    description: '玉米黑粉病又称瘤黑粉病，是由黑粉菌引起的系统性病害。病菌侵染玉米任何地上部位，形成肿瘤，破裂后散出大量黑粉状孢子，对产量影响极大。',
    causes: ['冬孢子在土壤中越冬', '通过伤口或气孔侵入', '高温干旱交替利于发病', '机械损伤增加侵染机会'],
    chemicalControl: ['种子用2%戊唑醇拌种', '3%苯醚甲环唑悬浮种衣剂包衣', '发病初期喷施15%三唑酮', '及时割除病瘤并带出田外'],
    agriculturalControl: ['选用抗病品种', '实行2-3年轮作', '及时摘除早期病瘤', '避免偏施氮肥'],
  },
  {
    id: 7,
    name: '玉米灰斑病',
    latinName: 'Cercospora zeae-maydis',
    category: '真菌病害',
    severity: 'medium',
    affectedParts: ['叶片'],
    symptoms: [
      '叶片出现矩形灰色病斑',
      '病斑受叶脉限制',
      '后期病斑变褐坏死',
      '严重时叶片大面积枯死',
    ],
    spreadConditions: '多雨高湿',
    occurrencePeriod: '7-9月',
    prevention: ['抗病品种', '合理密植', '药剂防治'],
    image: '/corn-huiban.jpeg',
    rating: 4.3,
    views: 7650,
    description: '玉米灰斑病是近年来危害日趋严重的叶部病害，主要在玉米生长中后期发生，严重时叶片大面积枯死，影响籽粒灌浆，造成产量损失。',
    causes: ['病菌在病残体上越冬', '分生孢子借风雨传播', '多雨年份发病重', '免耕或少耕田块发病重'],
    chemicalControl: ['25%嘧菌酯悬浮剂1500倍液', '75%百菌清可湿性粉剂600倍液', '10%苯醚甲环唑1500倍液', '发病初期喷药，间隔7-10天'],
    agriculturalControl: ['选用抗病品种', '合理密植改善通风', '清除田间病残体', '适当增施钾肥'],
  },
  {
    id: 8,
    name: '玉米茎腐病',
    latinName: 'Pythium/Fusarium',
    category: '真菌病害',
    severity: 'high',
    affectedParts: ['茎基部', '根系'],
    symptoms: [
      '茎基部变褐软腐',
      '植株萎蔫枯死',
      '用手轻推即倒伏',
      '根系腐烂变黑',
    ],
    spreadConditions: '雨后骤晴',
    occurrencePeriod: '8-9月',
    prevention: ['抗病品种', '合理灌溉', '增施钾肥'],
    image: '/corn-jingfu.jpeg',
    rating: 4.6,
    views: 10890,
    description: '玉米茎腐病又称青枯病，是玉米生长中后期的毁灭性病害。发病后植株迅速萎蔫枯死，严重田块病株率可达50%以上，对产量影响极大。',
    causes: ['多种病原菌复合侵染', '土壤中病残体是主要菌源', '雨后骤晴利于发病', '偏施氮肥植株抗性差'],
    chemicalControl: ['种子用25%适乐时包衣', '3%广枯灵水剂灌根', '发病初期用70%甲基托布津灌根', '重点保护茎基部'],
    agriculturalControl: ['选用抗病品种', '合理排灌避免积水', '增施钾肥提高抗性', '及时拔除病株'],
  },
  {
    id: 9,
    name: '玉米穗腐病',
    latinName: 'Fusarium/Aspergillus',
    category: '真菌病害',
    severity: 'medium',
    affectedParts: ['果穗', '籽粒'],
    symptoms: [
      '果穗顶部变褐腐烂',
      '籽粒表面有霉层',
      '穗轴变软发霉',
      '严重时整穗腐烂',
    ],
    spreadConditions: '多雨高湿',
    occurrencePeriod: '8-10月',
    prevention: ['抗病品种', '适时收获', '防治虫害'],
    image: '/corn-genfu.jpeg',
    rating: 4.2,
    views: 6540,
    description: '玉米穗腐病是多种真菌引起的果穗腐烂病害，不仅造成产量损失，部分病菌还会产生毒素，影响玉米品质和食用安全。',
    causes: ['多种真菌复合侵染', '虫害造成伤口利于侵入', '多雨高湿利于发病', '收获后晾晒不充分'],
    chemicalControl: ['播种前种子包衣处理', '穗期喷施50%多菌灵500倍液', '防治穗部害虫减少伤口', '收获后及时晾晒脱水'],
    agriculturalControl: ['选用抗病品种', '适时早播避开发病期', '及时防治玉米螟等害虫', '收获后充分晾晒贮藏'],
  },
  {
    id: 10,
    name: '玉米粗缩病',
    latinName: 'RBSDV',
    category: '病毒病害',
    severity: 'high',
    affectedParts: ['全株'],
    symptoms: [
      '植株矮化节间缩短',
      '叶片浓绿僵硬',
      '叶背叶脉有蜡白色条状突起',
      '雄穗不分化果穗不实',
    ],
    spreadConditions: '灰飞虱传毒',
    occurrencePeriod: '5-7月',
    prevention: ['调整播期', '防治灰飞虱', '抗病品种'],
    image: '/corn-cusu.jpeg',
    rating: 4.5,
    views: 9120,
    description: '玉米粗缩病是由水稻黑条矮缩病毒引起的病毒病害，通过灰飞虱传播。一旦感染，植株严重矮化，基本绝收，是玉米上的毁灭性病害。',
    causes: ['灰飞虱带毒传播', '小麦-玉米轮作区发病重', '早播田块发病重', '田间杂草多利于灰飞虱繁殖'],
    chemicalControl: ['种子用60%吡虫啉拌种', '苗期喷施10%吡虫啉防治灰飞虱', '25%吡蚜酮防治传毒介体', '出苗后连喷2-3次杀虫剂'],
    agriculturalControl: ['调整播期避开灰飞虱高峰', '选用抗病品种', '清除田间及周边杂草', '小麦收获后及时灭茬'],
  },
  {
    id: 11,
    name: '玉米矮花叶病',
    latinName: 'SCMV',
    category: '病毒病害',
    severity: 'medium',
    affectedParts: ['叶片'],
    symptoms: [
      '叶片出现花叶斑驳',
      '脉间褪绿变黄',
      '植株矮化生长缓慢',
      '严重时全株黄化',
    ],
    spreadConditions: '蚜虫传毒',
    occurrencePeriod: '6-8月',
    prevention: ['抗病品种', '防治蚜虫', '清除杂草'],
    image: '/corn-bingdu.jpeg',
    rating: 4.1,
    views: 5890,
    description: '玉米矮花叶病由甘蔗花叶病毒引起，蚜虫传播。感病植株叶片出现花叶症状，生长发育受阻，产量下降，严重时可减产30%-50%。',
    causes: ['蚜虫带毒传播', '田间杂草是毒源', '高温干旱蚜虫繁殖快', '早播田块发病重'],
    chemicalControl: ['种子处理用70%噻虫嗪', '苗期喷施10%吡虫啉防蚜', '3%啶虫脒乳油2000倍液', '发现蚜虫立即喷药'],
    agriculturalControl: ['选用抗病品种', '清除田间杂草减少毒源', '适当晚播避开蚜虫高峰', '发现病株及时拔除'],
  },
  {
    id: 12,
    name: '玉米细菌性茎腐病',
    latinName: 'Erwinia chrysanthemi',
    category: '细菌病害',
    severity: 'high',
    affectedParts: ['茎基部', '叶鞘'],
    symptoms: [
      '茎基部水浸状腐烂',
      '有恶臭味',
      '病部变褐软腐',
      '植株倒伏枯死',
    ],
    spreadConditions: '高温高湿',
    occurrencePeriod: '7-8月',
    prevention: ['合理排水', '避免伤口', '药剂防治'],
    image: '/corn-xijun.jpeg',
    rating: 4.3,
    views: 7230,
    description: '玉米细菌性茎腐病由菊欧文氏菌引起，主要危害茎基部和叶鞘。发病迅速，常造成植株倒伏枯死，对产量影响较大。',
    causes: ['细菌从伤口或气孔侵入', '高温高湿利于发病', '暴风雨后发病重', '虫害伤口增加侵染机会'],
    chemicalControl: ['72%农用链霉素4000倍液', '3%中生菌素600倍液', '77%氢氧化铜可湿性粉剂600倍液', '发病初期喷施茎基部'],
    agriculturalControl: ['合理排灌避免积水', '及时防治害虫减少伤口', '避免偏施氮肥', '发现病株及时拔除销毁'],
  },
  {
    id: 13,
    name: '玉米丝黑穗病',
    latinName: 'Sporisorium reilianum',
    category: '真菌病害',
    severity: 'high',
    affectedParts: ['果穗', '雄穗'],
    symptoms: [
      '果穗变成黑粉包',
      '无籽粒只有黑粉',
      '雄穗花器变形',
      '植株矮化',
    ],
    spreadConditions: '种子带菌土壤带菌',
    occurrencePeriod: '抽穗期表现',
    prevention: ['种子包衣', '轮作倒茬', '拔除病株'],
    image: '/corn-heisui.jpeg',
    rating: 4.4,
    views: 8340,
    description: '玉米丝黑穗病是玉米重要的系统性病害，苗期侵染，抽穗期表现症状。果穗全部变为黑粉，造成绝收。近年由于品种抗性下降，发病有加重趋势。',
    causes: ['病菌从种子萌发期侵入', '土壤中冬孢子是主要菌源', '低温出苗慢侵染时间长', '连作田块菌源积累'],
    chemicalControl: ['种子用2%戊唑醇湿拌种剂拌种', '15%三唑酮可湿性粉剂拌种', '12.5%烯唑醇拌种', '拌种是防治的关键措施'],
    agriculturalControl: ['选用抗病品种', '实行3年以上轮作', '适时播种促进快出苗', '发现病株及时拔除并销毁'],
  },
  {
    id: 14,
    name: '玉米红蜘蛛',
    latinName: 'Tetranychus cinnabarinus',
    category: '虫害',
    severity: 'medium',
    affectedParts: ['叶片'],
    symptoms: [
      '叶片出现黄白色小斑点',
      '叶面有红色小虫活动',
      '叶片变黄干枯',
      '叶背有蛛丝网',
    ],
    spreadConditions: '高温干燥',
    occurrencePeriod: '6-9月',
    prevention: ['清除杂草', '保护天敌', '药剂防治'],
    image: '/corn-hongspider.jpeg',
    rating: 4.2,
    views: 6780,
    description: '玉米红蜘蛛又称朱砂叶螨，是玉米上常见的害螨。以成螨和若螨在叶背刺吸汁液，造成叶片失绿变黄，严重时叶片干枯，影响光合作用和产量。',
    causes: ['高温干燥利于繁殖', '杂草是重要寄主', '天敌减少时大发生', '干旱年份发生重'],
    chemicalControl: ['1.8%阿维菌素3000倍液', '15%哒螨灵乳油2000倍液', '73%克螨特乳油2000倍液', '重点喷施叶背面'],
    agriculturalControl: ['清除田间及周边杂草', '保护利用捕食螨等天敌', '干旱时适当灌溉增加湿度', '发现点片发生时及时防治'],
  },
  {
    id: 15,
    name: '玉米蚜虫',
    latinName: 'Rhopalosiphum maidis',
    category: '虫害',
    severity: 'medium',
    affectedParts: ['心叶', '雄穗', '果穗苞叶'],
    symptoms: [
      '心叶和雄穗布满蚜虫',
      '分泌蜜露引起煤污病',
      '影响光合作用和授粉',
      '传播病毒病',
    ],
    spreadConditions: '高温干旱',
    occurrencePeriod: '6-9月',
    prevention: ['保护天敌', '清除杂草', '药剂防治'],
    image: '/corn-ya.jpeg',
    rating: 4.0,
    views: 5670,
    description: '玉米蚜虫是玉米上常见的刺吸式害虫，群集在心叶和雄穗上吸食汁液，同时分泌蜜露引起煤污病，还传播玉米矮花叶病毒，双重危害。',
    causes: ['蚜虫繁殖速度快', '高温干旱利于发生', '天敌减少时大发生', '田间杂草多时虫口密度大'],
    chemicalControl: ['10%吡虫啉可湿性粉剂2000倍液', '3%啶虫脒乳油2000倍液', '25%吡蚜酮可湿性粉剂2000倍液', '心叶期和抽雄期重点防治'],
    agriculturalControl: ['保护瓢虫草蛉等天敌', '清除田间杂草减少虫源', '合理灌溉调节田间小气候', '黄板诱杀有翅蚜'],
  },
  {
    id: 16,
    name: '玉米蓟马',
    latinName: 'Frankliniella tenuicornis',
    category: '虫害',
    severity: 'low',
    affectedParts: ['心叶', '嫩叶'],
    symptoms: [
      '心叶出现银灰色斑纹',
      '叶片畸形卷缩',
      '生长点受害植株矮化',
      '严重时心叶不能展开',
    ],
    spreadConditions: '温暖干燥',
    occurrencePeriod: '5-7月',
    prevention: ['清除杂草', '保护天敌', '药剂防治'],
    image: '/corn-mlg.jpeg',
    rating: 3.9,
    views: 4320,
    description: '玉米蓟马是玉米苗期的重要害虫，以成虫和若虫锉吸心叶和嫩叶汁液，造成叶片畸形卷缩，严重时影响植株正常生长。',
    causes: ['成虫在杂草上越冬', '春季转移到玉米苗上', '温暖干燥利于繁殖', '苗期防治不及时'],
    chemicalControl: ['10%吡虫啉可湿性粉剂2000倍液', '4.5%高效氯氰菊酯1500倍液', '种子用60%吡虫啉悬浮种衣剂包衣', '苗期发现虫害及时喷药'],
    agriculturalControl: ['清除田间杂草减少虫源', '保护利用小花蝽等天敌', '适当灌水增加湿度', '苗期加强虫情监测'],
  },
];

export default function DiseaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [disease, setDisease] = useState<typeof diseases[0] | null>(null);

  useEffect(() => {
    const id = Number(params.id);
    const found = diseases.find((d) => d.id === id);
    if (found) {
      setDisease(found);
    }
  }, [params.id]);

  if (!disease) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">未找到该病虫害信息</h2>
          <Button onClick={() => router.push('/knowledge')} variant="outline">
            返回知识库
          </Button>
        </div>
      </div>
    );
  }

  const severityConfig = {
    high: { label: '高发', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
    medium: { label: '中等', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    low: { label: '低发', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  };

  const severity = severityConfig[disease.severity as keyof typeof severityConfig];
  const SeverityIcon = severity.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* 顶部导航 */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-green-600"
            onClick={() => router.push('/knowledge')}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            返回知识库
          </Button>
          <div className="h-5 w-px bg-green-400" />
          <span className="text-green-100 text-sm">玉米病虫害知识库</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 标题区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{disease.name}</h1>
            <Badge className={severity.color}>
              <SeverityIcon className="w-3.5 h-3.5 mr-1" />
              {severity.label}
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700">
              {disease.category}
            </Badge>
          </div>
          <p className="text-gray-500 italic">{disease.latinName}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 图片 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-80">
                  <Image
                    src={disease.image}
                    alt={disease.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={severity.color}>
                      <SeverityIcon className="w-3.5 h-3.5 mr-1" />
                      {severity.label}危害
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* 概述 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <BookOpen className="w-5 h-5" />
                    病害概述
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{disease.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* 症状 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <AlertTriangle className="w-5 h-5" />
                    主要症状
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {disease.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-gray-700">{symptom}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* 防治方案 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Shield className="w-5 h-5" />
                    综合防治方案
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 化学防治 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Droplets className="w-4 h-4" />
                      </span>
                      化学防治
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {disease.chemicalControl.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
                        >
                          <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 农业防治 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                        <Leaf className="w-4 h-4" />
                      </span>
                      农业防治
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {disease.agriculturalControl.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* 右侧信息栏 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800 text-lg">基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Bug className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">分类</p>
                      <p className="font-medium text-gray-800">{disease.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">高发期</p>
                      <p className="font-medium text-gray-800">{disease.occurrencePeriod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">传播条件</p>
                      <p className="font-medium text-gray-800">{disease.spreadConditions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">危害部位</p>
                      <p className="font-medium text-gray-800">{disease.affectedParts.join('、')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 发病原因 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-800 text-lg">发病原因</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {disease.causes.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {cause}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* 快速操作 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                <CardHeader>
                  <CardTitle className="text-white">需要帮助？</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-white text-green-700 hover:bg-green-50"
                    onClick={() => router.push('/detect')}
                  >
                    上传图片识别
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white text-white hover:bg-green-500"
                    onClick={() => router.push('/chat')}
                  >
                    AI在线咨询
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
