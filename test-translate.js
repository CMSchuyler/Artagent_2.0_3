/**
 * 翻译API测试脚本 (ES模块版本)
 */
import axios from 'axios';

const TRANSLATE_API_TOKEN = 'TSnyMNFfrDynIp6CqfB5';

async function testTranslate() {
  try {
    console.log('测试翻译API...');
    
    const testText = '一只可爱的小猫坐在花园里';
    console.log('原始文本:', testText);
    
    const response = await axios.post(
      `http://www.trans-home.com/api/index/translate?token=${TRANSLATE_API_TOKEN}`,
      {
        keywords: testText,
        targetLanguage: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('翻译API完整响应:', JSON.stringify(response.data, null, 2));
    
    // 尝试不同的响应格式
    if (response.data && response.data.data && response.data.data.translateResult) {
      console.log('翻译结果 (格式1):', response.data.data.translateResult);
    } else if (response.data && typeof response.data === 'string') {
      console.log('翻译结果 (格式2):', response.data);
    } else if (response.data && response.data.result) {
      console.log('翻译结果 (格式3):', response.data.result);
    } else {
      console.log('未知的响应格式，需要检查API文档');
    }
    
  } catch (error) {
    console.error('翻译测试失败:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
  }
}

testTranslate();
