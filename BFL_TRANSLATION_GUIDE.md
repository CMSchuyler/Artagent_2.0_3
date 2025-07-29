# BFL API 翻译功能集成说明

## 功能概述
已成功将翻译功能集成到BFL API代理中，现在系统会自动将中文提示词翻译成英文后再发送到BFL API，以获得更好的图片生成效果。

## 工作流程
1. **前端发送请求**：前端将包含中文prompt的请求发送到 `/api/bfl`
2. **自动翻译**：后端自动调用翻译API将中文prompt翻译成英文
3. **转发请求**：使用翻译后的英文prompt调用BFL API
4. **返回结果**：正常返回BFL API的响应

## 翻译API配置
- **翻译服务**：http://www.trans-home.com/api/index/translate
- **API Token**：TSnyMNFfrDynIp6CqfB5
- **超时时间**：10秒
- **目标语言**：英文 (en)

## 错误处理
- 如果翻译API调用失败，系统会自动使用原始中文prompt
- 翻译失败不会影响整个图片生成流程
- 所有翻译过程都有详细的日志记录

## 日志输出
系统会记录以下信息：
- 原始prompt（中文）
- 翻译后的prompt（英文）
- 翻译API的完整响应
- 任何翻译错误

## 示例
**输入**：
```
prompt: "一只可爱的小猫坐在花园里"
```

**翻译过程**：
```
开始翻译文本: 一只可爱的小猫坐在花园里
翻译API响应: {"code":1,"info":"翻译成功","data":{"text":"A cute little cat is sitting in the garden"}}
翻译成功: A cute little cat is sitting in the garden
```

**发送到BFL**：
```
prompt: "A cute little cat is sitting in the garden"
```

## 技术细节
- 翻译函数：`translateToEnglish(text)`
- 响应格式：`{code: 1, info: "翻译成功", data: {text: "翻译结果"}}`
- 集成位置：BFL API代理 (`/api/bfl`)

## 环境变量支持
可以通过环境变量配置翻译API Token：
```
TRANSLATE_API_TOKEN=your_token_here
```

如果没有设置环境变量，将使用默认值。
