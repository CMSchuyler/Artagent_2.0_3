import axios from 'axios';

export class LiblibAIService {
  private apiKey: string;    // 保留用于兼容性，BFL API不需要
  private apiSecret: string; // 保留用于兼容性，BFL API不需要
  private baseURL: string = 'https://api.bfl.ai/v1'; // 保留用于兼容性
   /**
   * BFL API代理接口URL，开发环境下指向本地3002端口，生产环境下为相对路径
   * @type {string}
   */
  private proxyURL: string =
    typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
      ? 'http://localhost:3002/api/bfl'
      : 'https://artagent3.onrender.com/api/bfl';
  
  constructor(apiKey: string, apiSecret: string, baseURL?: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    if (baseURL) {
      this.baseURL = baseURL;
    }
  }

  // 处理base64图片数据，确保格式正确
  private processBase64Image(imageData: string): string {
    // 如果包含data:image前缀，提取纯base64部分
    if (imageData.includes('data:image')) {
      return imageData.split(',')[1];
    }
    // 如果已经是纯base64，直接返回
    return imageData;
  }

  // 运行BFL图片生成
  public async runComfy(params: {
    templateUuid: string;
    generateParams: {
      workflowUuid: string;
      [key: string]: any;
    };
  }): Promise<string> {
    try {
      console.log('开始使用BFL API生成图片...');
      
      // 从参数中提取图片base64数据和提示词
      let imageBase64 = '';
      let prompt = '';
      let aspectRatio = '1:1'; // 默认比例
      
      // 从generateParams中提取图片base64数据（通常在326节点的LoadImage中）
      if (params.generateParams && params.generateParams["326"] && 
          params.generateParams["326"].inputs && 
          params.generateParams["326"].inputs.image) {
        imageBase64 = params.generateParams["326"].inputs.image;
      }
      
      // 从generateParams中提取提示词（通常在329节点的LibLibTranslate中）
      if (params.generateParams && params.generateParams["329"] && 
          params.generateParams["329"].inputs && 
          params.generateParams["329"].inputs.text) {
        prompt = params.generateParams["329"].inputs.text;
      }
      
      // 从generateParams中提取宽高比（通常在362节点中）
      if (params.generateParams && params.generateParams["362"] && 
          params.generateParams["362"].inputs && 
          params.generateParams["362"].inputs.aspect_ratio) {
        aspectRatio = params.generateParams["362"].inputs.aspect_ratio;
      }
      
      if (!imageBase64 || !prompt) {
        throw new Error('缺少必要参数：图片base64数据或提示词');
      }
      
      console.log('提取的参数:', { imageBase64: 'base64数据已省略', prompt, aspectRatio });
      
      // 处理base64数据，确保格式正确
      const processedBase64 = this.processBase64Image(imageBase64);
      
      // 构建BFL API请求数据
      const requestData = {
        prompt: prompt,
        input_image: processedBase64,
        aspect_ratio: aspectRatio
      };
      
      console.log('BFL API请求数据:', { ...requestData, input_image: 'base64数据已省略' });
      
      // 发送请求到BFL API（通过代理）
      const response = await axios.post(this.proxyURL, requestData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false,
        timeout: 30000
      });
      
      console.log('BFL API响应:', response.data);
      
      if (!response.data.id) {
        throw new Error(`BFL API请求失败: ${response.data.error || '未知错误'}`);
      }
      
      // 返回请求ID和轮询URL
      return JSON.stringify({
        id: response.data.id,
        polling_url: response.data.polling_url
      });
    } catch (error) {
      console.error('BFL API请求失败:', error);
      if (axios.isAxiosError(error)) {
        console.error('请求配置:', error.config);
        if (error.response) {
          console.error('响应状态:', error.response.status);
          console.error('响应数据:', error.response.data);
          
          // 处理特定的错误状态码
          if (error.response.status === 429) {
            throw new Error('请求频率过高，请稍后重试');
          } else if (error.response.status === 402) {
            throw new Error('余额不足，请充值后重试');
          }
        }
      }
      throw error;
    }
  }

  // 获取BFL生成状态
  public async getComfyStatus(generateInfoJson: string): Promise<any> {
    try {
      // 解析生成信息
      const generateInfo = JSON.parse(generateInfoJson);
      const { id, polling_url } = generateInfo;
      
      console.log(`获取BFL生成状态, ID: ${id}, polling_url: ${polling_url}`);
      
      // 通过后端代理轮询BFL API，避免CORS问题
      const response = await axios.get(`${this.proxyURL}/poll`, {
        params: {
          polling_url: polling_url
        },
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false,
        timeout: 30000
      });
      
      console.log('BFL轮询响应:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('获取BFL生成状态失败:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('响应状态:', error.response.status);
          console.error('响应数据:', error.response.data);
        }
      }
      throw error;
    }
  }

  // 等待BFL生成结果
  public async waitAppResult(generateInfoJson: string, maxAttempts: number = 200, interval: number = 500): Promise<string> {
    console.log(`开始轮询BFL生成结果, 信息: ${generateInfoJson}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`轮询尝试 ${attempt}/${maxAttempts}`);
        const status = await this.getComfyStatus(generateInfoJson);
        console.log(`轮询尝试 ${attempt}, 状态: ${status.status}`);
        
        if (status.status === 'Ready') {
          // 返回生成的图片URL
          if (status.result && status.result.sample) {
            // 优先使用Cloudinary保存的URL，如果没有则使用原始URL
            const imageUrl = status.result.saved_url || status.result.sample;
            console.log('生成成功，图片URL:', imageUrl);
            if (status.result.saved_url) {
              console.log('使用Cloudinary永久存储URL');
            } else {
              console.log('使用BFL原始URL（临时）');
            }
            return imageUrl;
          }
          throw new Error('No sample image found in ready result');
        } else if (status.status === 'Error' || status.status === 'Failed') {
          // 对于失败状态，直接结束轮询
          console.error(`生成失败，状态: ${status.status}, 错误信息: ${status.error || '未知'}`);
          throw new Error(`Image generation failed: ${status.error || 'Unknown reason'}`);
        }
        
        // 等待指定时间后再次查询
        console.log(`等待${interval/1000}秒后再次查询...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error(`Polling attempt ${attempt} failed:`, error);
        
        // 如果错误信息中包含"failed"，表示是状态为Failed引起的错误，不再重试
        if (error instanceof Error && error.message.includes('failed')) {
          console.log('检测到失败状态，终止轮询');
          throw error;
        }
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // 等待后重试
        console.log(`轮询失败，等待${interval/1000}秒后重试...`);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    throw new Error('Max polling attempts reached');
  }

  // 为了兼容之前的代码，保留这个方法，但简化为直接调用BFL API
  public async generateImage(params: {
    templateUuid: string;
    workflowUuid: string;
    width: number;
    height: number;
    uploadedUrl: string | {key: string, ossBaseUrl?: string};
    prompt: string;
  }): Promise<string> {
    try {
      console.log('开始生成图像，参数:', params);
      
      // 获取图片base64数据
      let imageBase64: string;
      
      if (typeof params.uploadedUrl !== 'string') {
        // 如果是对象，提取key属性（现在应该是base64数据）
        const uploadObj = params.uploadedUrl as {key: string, ossBaseUrl?: string};
        if (uploadObj && uploadObj.key) {
          imageBase64 = uploadObj.key; // 现在这应该是base64数据
        } else {
          throw new Error('无效的图片base64数据格式');
        }
      } else {
        imageBase64 = params.uploadedUrl; // 现在这应该是base64数据
      }
      
      // 计算宽高比
      const aspectRatio = `${params.width}:${params.height}`;
      
      // 构造BFL兼容的参数
      const comfyParams = {
        templateUuid: params.templateUuid,
        generateParams: {
          workflowUuid: params.workflowUuid,
          "326": {
            class_type: "LoadImage",
            inputs: {
              image: imageBase64 // 现在直接传入base64数据
            }
          },
          "329": {
            class_type: "LibLibTranslate",
            inputs: {
              text: params.prompt
            }
          },
          "362": {
            class_type: "FluxKontextProImageNode",
            inputs: {
              aspect_ratio: aspectRatio
            }
          }
        }
      };
      
      console.log('转换后的参数:', { 
        templateUuid: comfyParams.templateUuid,
        generateParams: {
          ...comfyParams.generateParams,
          "326": { ...comfyParams.generateParams["326"], inputs: { image: 'base64数据已省略' } }
        }
      });
      const generateInfo = await this.runComfy(comfyParams);
      console.log('生成信息:', generateInfo);
      return generateInfo;
    } catch (error) {
      console.error('生成图像失败:', error);
      throw error;
    }
  }
  
  public async pollGenerationResult(generateInfoJson: string, maxAttempts: number = 60): Promise<string> {
    return this.waitAppResult(generateInfoJson, maxAttempts);
  }
}

// 创建服务实例（BFL API不需要API密钥和密钥，但保留构造函数兼容性）
export const liblibAIService = new LiblibAIService(
  '', // BFL不需要API Key
  '', // BFL不需要API Secret
  'https://api.bfl.ai/v1'
); 
