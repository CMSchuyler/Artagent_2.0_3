// 统一导出所有图片的base64数据
export { xrk1Base64 } from './xrk1-base64';
export { xrk2Base64 } from './xrk2-base64';
export { xrk3Base64 } from './xrk3-base64';
export { xrk4Base64 } from './xrk4-base64';
export { xrk5Base64 } from './xrk5-base64';

// 图片base64数据映射
export const imageBase64Map: Record<string, string> = {
  'xrk1.jpeg': '', // 将在运行时动态填充
  'xrk2.jpeg': '',
  'xrk3.jpeg': '',
  'xrk4.jpeg': '',
  'xrk5.jpeg': ''
};
