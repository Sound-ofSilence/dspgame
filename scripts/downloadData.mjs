// scripts/downloadData.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 这个地址是社区维护的 DSP 配方数据的国内镜像（antian369/dsp-calc 项目）
const RECIPES_URL = 'https://raw.githubusercontent.com/antian369/dsp-calc/master/data/Vanilla.json';

async function downloadData() {
  console.log('正在从国内镜像下载全量配方数据...');
  try {
    const response = await fetch(RECIPES_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    
    // 1. 保存原始配方文件
    fs.writeFileSync(
      path.join(__dirname, '../data/Vanilla.json'), 
      JSON.stringify(data, null, 2)
    );
    console.log('✅ 原始数据下载成功，已保存为 data/Vanilla.json');

    // 2. 数据清洗：转换为我们要的格式（这一步比较复杂，先只保存原始数据）
    console.log('💡 请下一步运行清洗脚本处理这个文件。');

  } catch (error) {
    console.error('❌ 下载失败，可能是网络问题。请尝试手动从 GitHub 下载：');
    console.error('   下载地址: https://github.com/antian369/dsp-calc/blob/master/data/Vanilla.json');
    console.error(error.message);
  }
}

downloadData();