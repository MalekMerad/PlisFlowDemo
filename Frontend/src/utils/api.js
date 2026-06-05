import * as yup from 'yup';
import { mockApiRequest } from '../mock/mockApiRouter';

const api = async (url, method, body = null, schema = null) => {
  try {
    if (schema && body) {
      await schema.validate(body, { abortEarly: false });
    }

    console.log(`[mock API] ${method} ${url}`);
    const data = await mockApiRequest(url, method, body);
    console.log('Response data:', data);
    console.log('✅ Mock API request successful');
    return data;
  } catch (error) {
    console.error('❌ API request failed:', error);
    if (error instanceof yup.ValidationError) {
      throw { validationError: error.errors };
    }
    throw error;
  }
};

export default api;
