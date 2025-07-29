import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图片文件路径映射
const imageFiles = {
  'xrk1.jpeg': path.join(__dirname, 'public/paintings/xrk1.jpeg'),
  'xrk2.jpeg': path.join(__dirname, 'public/paintings/xrk2.jpeg'),
  'xrk3.jpeg': path.join(__dirname, 'public/paintings/xrk3.jpeg'),
  'xrk4.jpeg': path.join(__dirname, 'public/paintings/xrk4.jpeg'),
  'xrk5.jpeg': path.join(__dirname, 'public/paintings/xrk5.jpeg')
};

// Base64文件路径映射
const base64Files = {
  'xrk1.jpeg': path.join(__dirname, 'src/data/xrk1-base64.ts'),
  'xrk2.jpeg': path.join(__dirname, 'src/data/xrk2-base64.ts'),
  'xrk3.jpeg': path.join(__dirname, 'src/data/xrk3-base64.ts'),
  'xrk4.jpeg': path.join(__dirname, 'src/data/xrk4-base64.ts'),
  'xrk5.jpeg': path.join(__dirname, 'src/data/xrk5-base64.ts')
};

function convertImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64String = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error(`Error reading image ${imagePath}:`, error.message);
    return null;
  }
}

function updateBase64File(filename, base64Data) {
  const base64FilePath = base64Files[filename];
  const variableName = filename.replace('.jpeg', 'Base64');
  
  const content = `// Base64 data for ${filename}
export const ${variableName} = \`${base64Data}\`;
`;
  
  try {
    fs.writeFileSync(base64FilePath, content, 'utf8');
    console.log(`✅ Updated ${base64FilePath}`);
  } catch (error) {
    console.error(`❌ Error writing ${base64FilePath}:`, error.message);
  }
}

function main() {
  console.log('🔄 开始转换图片为Base64...\n');
  
  let successCount = 0;
  let totalCount = Object.keys(imageFiles).length;
  
  for (const [filename, imagePath] of Object.entries(imageFiles)) {
    console.log(`正在处理: ${filename}`);
    
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  图片文件不存在: ${imagePath}`);
      continue;
    }
    
    const base64Data = convertImageToBase64(imagePath);
    if (base64Data) {
      updateBase64File(filename, base64Data);
      successCount++;
    }
  }
  
  console.log(`\n🎉 转换完成！成功处理 ${successCount}/${totalCount} 个文件`);
  
  if (successCount === totalCount) {
    console.log('\n📝 所有图片已成功转换为Base64格式');
    console.log('💡 现在你可以在项目中使用这些Base64数据了');
  } else {
    console.log('\n⚠️  部分文件转换失败，请检查图片文件是否存在');
  }
}

// 运行脚本
main();
