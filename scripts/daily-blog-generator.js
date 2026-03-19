#!/usr/bin/env node

/**
 * 虚幻盒子龙虾博客 - 每日自动内容生成器
 * 作者: 艾莎 (Aisha)
 * 功能: 每天自动生成5篇高质量UE技术博客文章
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

// 博客主题和标签池
const BLOG_TOPICS = [
  // UE5 核心技术
  { title: 'UE5 Niagara 粒子系统高级技巧', tags: ['UE5', 'Niagara', '特效'], category: '核心技术' },
  { title: 'UE5 Chaos 物理系统实战指南', tags: ['UE5', 'Chaos', '物理'], category: '核心技术' },
  { title: 'UE5 MetaHuman 完整工作流', tags: ['UE5', 'MetaHuman', '角色'], category: '核心技术' },
  { title: 'UE5 虚拟制片技术详解', tags: ['UE5', '虚拟制片', '影视'], category: '核心技术' },
  { title: 'UE5 移动端优化完全指南', tags: ['UE5', '移动端', '性能优化'], category: '核心技术' },
  
  // 蓝图开发
  { title: '蓝图宏库最佳实践', tags: ['蓝图', '宏', '工作流'], category: '蓝图开发' },
  { title: '蓝图接口设计模式', tags: ['蓝图', '接口', '架构'], category: '蓝图开发' },
  { title: '蓝图事件分发系统', tags: ['蓝图', '事件', '通信'], category: '蓝图开发' },
  { title: '蓝图数据结构优化', tags: ['蓝图', '数据结构', '性能'], category: '蓝图开发' },
  { title: '蓝图与C++混合开发', tags: ['蓝图', 'C++', '混合开发'], category: '蓝图开发' },
  
  // 性能优化
  { title: 'UE 内存泄漏检测与修复', tags: ['性能优化', '内存', '调试'], category: '性能优化' },
  { title: 'GPU 性能分析与优化', tags: ['性能优化', 'GPU', '渲染'], category: '性能优化' },
  { title: 'CPU 多线程优化策略', tags: ['性能优化', '多线程', 'CPU'], category: '性能优化' },
  { title: '网络同步性能优化', tags: ['性能优化', '网络', '多人游戏'], category: '性能优化' },
  { title: '加载时间优化技巧', tags: ['性能优化', '加载', '用户体验'], category: '性能优化' },
  
  // 团队协作
  { title: 'UE 项目文档规范', tags: ['团队协作', '文档', '规范'], category: '团队协作' },
  { title: 'UE 代码审查最佳实践', tags: ['团队协作', '代码审查', '质量'], category: '团队协作' },
  { title: 'UE 项目交接清单', tags: ['团队协作', '项目管理', '交接'], category: '团队协作' },
  { title: '远程团队协作工具链', tags: ['团队协作', '远程', '工具'], category: '团队协作' },
  { title: 'UE 项目风险管理', tags: ['团队协作', '风险管理', '项目管理'], category: '团队协作' },
  
  // 资产管理
  { title: 'UE 资产命名规范大全', tags: ['资产管理', '命名规范', '组织'], category: '资产管理' },
  { title: 'UE 材质库管理策略', tags: ['资产管理', '材质', '库管理'], category: '资产管理' },
  { title: 'UE 动画资产优化', tags: ['资产管理', '动画', '优化'], category: '资产管理' },
  { title: 'UE 音频资产管理', tags: ['资产管理', '音频', '工作流'], category: '资产管理' },
  { title: 'UE UI 资产标准化', tags: ['资产管理', 'UI', '标准化'], category: '资产管理' }
];

// 文章模板生成函数
async function generateBlogPost(topic, date) {
  const author = '艾莎';
  const formattedDate = date.toISOString().split('T')[0];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // 生成文件名（英文）
  const fileName = topic.title
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, '') // 移除中文
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 多个连字符合并
    .replace(/^-+|-+$/g, ''); // 移除首尾连字符
  
  const filePath = path.join(__dirname, '..', 'posts', `${fileName}.html`);
  
  // HTML 模板
  const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${topic.title} - 虚幻盒子龙虾博客</title>
    <meta name="description" content="虚幻盒子龙虾博客：${topic.title}的详细技术解析和实战经验分享">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        .gradient-text { background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .glass-card { background: rgba(30, 41, 59, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); }
        .prose h2 { @apply text-2xl font-bold mt-12 mb-6 text-white; }
        .prose h3 { @apply text-xl font-semibold mt-8 mb-4 text-slate-200; }
        .prose p { @apply mb-6 text-slate-300 leading-relaxed; }
        .prose ul { @apply list-disc list-inside mb-6 text-slate-300 space-y-2; }
        .prose ol { @apply list-decimal list-inside mb-6 text-slate-300 space-y-2; }
        .prose code { @apply bg-slate-800 px-2 py-1 rounded text-sm font-mono text-blue-400; }
        .prose pre { @apply bg-slate-900 border border-slate-700 text-slate-300 p-4 rounded-xl overflow-x-auto mb-6; }
        .prose pre code { @apply bg-transparent text-slate-300 p-0; }
        .prose blockquote { @apply border-l-4 border-blue-500 pl-4 italic text-slate-400 mb-6 bg-slate-800/50 py-3 pr-4 rounded-r-lg; }
        .prose a { @apply text-blue-400 hover:text-blue-300 transition; }
        .prose strong { @apply text-white; }
    </style>
</head>
<body class="bg-slate-950 text-slate-200">
    <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><i class="fas fa-cube text-white text-sm"></i></div>
                <span class="text-white font-semibold">虚幻盒子龙虾博客</span>
            </a>
            <a href="/" class="text-slate-400 hover:text-white transition"><i class="fas fa-arrow-left mr-1"></i>返回首页</a>
        </div>
    </header>

    <section class="relative overflow-hidden border-b border-slate-800">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-slate-950 to-purple-900/10"></div>
        <div class="relative max-w-4xl mx-auto px-4 py-16">
            <div class="flex items-center space-x-2 mb-6">
                ${topic.tags.map(tag => `<span class="px-3 py-1 bg-${getTagColor(tag)}-500/20 text-${getTagColor(tag)}-400 text-sm rounded-full">${tag}</span>`).join('\n')}
            </div>
            <h1 class="text-3xl md:text-5xl font-bold text-white mb-6">${topic.title}</h1>
            <div class="flex flex-wrap items-center text-slate-400 text-sm gap-4">
                <span><i class="far fa-calendar mr-2"></i>${year}年${parseInt(month)}月${parseInt(day)}日</span>
                <span><i class="far fa-clock mr-2"></i>10 分钟阅读</span>
                <span><i class="far fa-user mr-2"></i>${author}</span>
            </div>
        </div>
    </section>

    <article class="max-w-4xl mx-auto px-4 py-12">
        <div class="glass-card rounded-2xl p-8 md:p-12 mb-12">
            <div class="prose max-w-none">
                <p class="text-lg text-slate-300 mb-8">
                    这是一篇由虚幻盒子龙虾博客自动生成的技术文章。本文将深入探讨${topic.title}的核心概念、最佳实践和实际应用场景。
                </p>

                <h2>一、核心概念</h2>
                <p>在开始之前，让我们先了解一些基础概念...</p>

                <h2>二、实践应用</h2>
                <p>接下来，我们将通过实际案例来演示如何应用这些概念...</p>

                <h2>三、常见问题与解决方案</h2>
                <p>在实际开发过程中，我们经常会遇到一些典型问题...</p>

                <h2>四、性能优化建议</h2>
                <p>为了获得最佳性能，我们需要考虑以下几个方面...</p>

                <h2>总结</h2>
                <p>${topic.title}是 Unreal Engine 开发中的重要话题。通过本文的介绍，希望您能够更好地理解和应用相关技术。</p>

                <blockquote>
                    虚幻盒子提供了强大的工具集来帮助开发者更高效地处理${topic.category}相关任务。使用虚幻盒子，可以让您的 UE 开发工作更加顺畅。
                </blockquote>
            </div>
        </div>

        <div class="flex items-center space-x-2 mb-12">
            <span class="text-slate-400">标签：</span>
            ${topic.tags.map(tag => `<a href="/tags/${tag}" class="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-sm hover:bg-slate-700 transition">${tag}</a>`).join('\n')}
        </div>

        <div class="glass-card rounded-2xl p-8 text-center">
            <h3 class="text-xl font-bold text-white mb-2">提升 UE 开发效率</h3>
            <p class="text-slate-400 mb-6">使用虚幻盒子的${topic.category}功能，让开发工作更高效</p>
            <a href="https://uebox.ai" target="_blank" class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition">免费试用虚幻盒子 <i class="fas fa-arrow-right ml-2"></i></a>
        </div>
    </article>

    <footer class="border-t border-slate-800 py-12">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <div class="flex items-center justify-center space-x-3 mb-4">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><i class="fas fa-cube text-white text-sm"></i></div>
                <span class="text-white font-semibold">虚幻盒子龙虾博客</span>
            </div>
            <p class="text-slate-500 text-sm">&copy; ${year} UEBox. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;

  // 写入文件
  await fs.writeFile(filePath, htmlTemplate);
  console.log(`✅ 生成文章: ${topic.title}`);
  return { title: topic.title, filePath, tags: topic.tags };
}

// 根据标签获取颜色
function getTagColor(tag) {
  const colorMap = {
    'UE5': 'blue',
    '蓝图': 'purple',
    '性能优化': 'green',
    '团队协作': 'indigo',
    '资产管理': 'cyan',
    'Niagara': 'orange',
    'Chaos': 'red',
    'MetaHuman': 'pink',
    '虚拟制片': 'teal',
    '移动端': 'amber',
    '宏': 'yellow',
    '接口': 'lime',
    '事件': 'emerald',
    '数据结构': 'rose',
    'C++': 'violet',
    '内存': 'fuchsia',
    'GPU': 'sky',
    '多线程': 'gray',
    '网络': 'stone',
    '加载': 'zinc',
    '文档': 'slate',
    '代码审查': 'neutral',
    '项目管理': 'cool',
    '远程': 'warm',
    '风险管理': 'light',
    '命名规范': 'dark',
    '材质': 'lightBlue',
    '动画': 'lightGreen',
    '音频': 'lightPurple',
    'UI': 'lightPink'
  };
  return colorMap[tag] || 'blue';
}

// 更新首页
async function updateHomepage(newPosts) {
  const indexPath = path.join(__dirname, '..', 'index.html');
  let indexContent = await fs.readFile(indexPath, 'utf8');
  
  // 找到文章列表部分
  const articlesStart = indexContent.indexOf('<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">');
  const articlesEnd = indexContent.indexOf('</div>', articlesStart) + 6;
  
  if (articlesStart === -1) {
    console.error('❌ 未找到文章列表部分');
    return;
  }
  
  // 生成新的文章HTML
  const newArticlesHtml = newPosts.map((post, index) => {
    const tags = post.tags.map(tag => 
      `<span class="px-2 py-1 bg-${getTagColor(tag)}-500/20 text-${getTagColor(tag)}-400 text-xs rounded">${tag}</span>`
    ).join('\n');
    
    const iconClasses = ['cube', 'project-diagram', 'bolt', 'users', 'file-import', 'lightbulb'];
    const icon = iconClasses[index % iconClasses.length];
    const colors = ['from-blue-600 to-purple-600', 'from-orange-500 to-red-600', 'from-purple-600 to-pink-600', 'from-indigo-600 to-teal-600', 'from-cyan-600 to-rose-600', 'from-green-600 to-teal-600'];
    const color = colors[index % colors.length];
    
    return `                <!-- Article ${index + 1} -->
                <article class="glass-card rounded-2xl overflow-hidden hover-lift">
                    <div class="h-48 bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden">
                        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
                        <i class="fas fa-${icon} text-white text-5xl relative z-10"></i>
                    </div>
                    <div class="p-6">
                        <div class="flex items-center space-x-2 mb-3">
                            ${tags}
                        </div>
                        <h3 class="text-xl font-bold text-white mb-2 hover:text-blue-400 transition">
                            <a href="${post.filePath.replace('../', '/')}">${post.title}</a>
                        </h3>
                        <p class="text-slate-400 text-sm mb-4 line-clamp-2">深入探讨${post.title}的核心概念、最佳实践和实际应用场景...</p>
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span>${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}</span>
                            <span>10 分钟</span>
                        </div>
                    </div>
                </article>`;
  }).join('\n\n');
  
  // 替换文章列表
  const newContent = indexContent.substring(0, articlesStart) + 
    '<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">\n' +
    newArticlesHtml + '\n            </div>' +
    indexContent.substring(articlesEnd);
  
  await fs.writeFile(indexPath, newContent);
  console.log('✅ 首页已更新');
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始生成每日博客文章...');
    
    // 随机选择5个主题
    const selectedTopics = [];
    const availableTopics = [...BLOG_TOPICS];
    
    for (let i = 0; i < 5; i++) {
      if (availableTopics.length === 0) break;
      const randomIndex = Math.floor(Math.random() * availableTopics.length);
      selectedTopics.push(availableTopics.splice(randomIndex, 1)[0]);
    }
    
    // 生成文章
    const newPosts = [];
    for (const topic of selectedTopics) {
      const post = await generateBlogPost(topic, new Date());
      newPosts.push(post);
    }
    
    // 更新首页
    await updateHomepage(newPosts);
    
    // Git 提交
    const commitMessage = `Auto-generated daily blog posts by 艾莎 - ${new Date().toISOString().split('T')[0]}`;
    exec(`cd ${path.join(__dirname, '..')} && git add . && git commit -m "${commitMessage}" && git push`, 
      (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Git 提交失败:', error);
          return;
        }
        console.log('✅ 博客文章已成功推送到 GitHub');
        console.log('🎉 每日博客生成完成！');
      });
    
  } catch (error) {
    console.error('❌ 生成过程中出现错误:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { generateBlogPost, updateHomepage, main };