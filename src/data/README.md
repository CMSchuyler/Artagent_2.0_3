# 图片Base64数据填充指南

## 概述
此项目现在使用base64数据而不是外部URL来存储图片数据。每张图片的base64数据都存储在单独的文件中。

## 文件结构
```
src/data/
├── index.ts           # 统一导出文件
├── xrk1-base64.ts     # xrk1.jpeg 的 base64 数据
├── xrk2-base64.ts     # xrk2.jpeg 的 base64 数据
├── xrk3-base64.ts     # xrk3.jpeg 的 base64 数据
├── xrk4-base64.ts     # xrk4.jpeg 的 base64 数据
└── xrk5-base64.ts     # xrk5.jpeg 的 base64 数据
```

## 如何填充base64数据

### 方法1：使用在线工具
1. 访问 https://www.base64-image.de/ 或类似的在线base64转换工具
2. 上传对应的图片文件
3. 复制生成的base64字符串（包含 `data:image/jpeg;base64,` 前缀）
4. 粘贴到对应的文件中

### 方法2：使用JavaScript代码
```javascript
// 在浏览器控制台中运行
function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 使用方法：
// const input = document.createElement('input');
// input.type = 'file';
// input.accept = 'image/*';
// input.onchange = async (e) => {
//   const file = e.target.files[0];
//   const base64 = await convertImageToBase64(file);
//   console.log(base64);
// };
// input.click();
```

### 方法3：使用Node.js脚本
```javascript
const fs = require('fs');
const path = require('path');

function convertImageToBase64(imagePath) {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64String = imageBuffer.toString('base64');
  const mimeType = path.extname(imagePath) === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mimeType};base64,${base64String}`;
}

// 使用方法：
// const base64 = convertImageToBase64('./public/paintings/xrk1.jpeg');
// console.log(base64);
```

## 填充步骤

1. **获取原图片文件**
   - 从 `public/paintings/` 目录获取原始图片文件
   - 确保图片文件存在且可访问

2. **转换为base64**
   - 使用上述任一方法将图片转换为base64格式
   - 确保包含正确的MIME类型前缀

3. **更新对应文件**
   - 打开对应的 `*-base64.ts` 文件
   - 将TODO注释替换为实际的base64字符串
   - 保存文件

4. **验证**
   - 确保没有语法错误
   - 运行项目确保图片正确显示

## 注意事项

- base64字符串会很长，这是正常的
- 确保完整复制，不要截断
- 保留 `data:image/jpeg;base64,` 前缀
- 检查文件编码为UTF-8
- 避免在base64字符串中添加额外的换行符或空格

## 示例
正确的base64格式应该类似：
```typescript
export const xrk1Base64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
```
