import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Se true, as requisições para event, product, category e order serão interceptadas e salvarão no LocalStorage.
export const USE_LOCAL_MOCK = false;

const readLS = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    return [];
  }
};
const writeLS = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.code === 22 || e.message?.includes('quota')) {
      console.warn(`LocalStorage quota exceeded for ${key}. Attempting to clear older data...`);
      if (Array.isArray(data) && data.length > 0) {
        // Mantenha apenas os últimos 5 itens para liberar espaço
        const keepCount = Math.min(5, Math.floor(data.length / 2));
        const reducedData = data.slice(-keepCount);
        try {
          localStorage.setItem(key, JSON.stringify(reducedData));
          return;
        } catch (retryErr) {
          console.error('Still exceeding quota after reducing data', retryErr);
        }
      }
    }
    throw e;
  }
};
const generateId = () => Math.random().toString(36).substr(2, 9);

export const applyLocalMock = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  if (!USE_LOCAL_MOCK) return config;

  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Rotas que queremos interceptar
  const isMocked = url.match(/^\/event/i) || url.match(/^\/category/i) || url.match(/^\/product/i) || url.match(/^\/order/i) || url.match(/^\/user\/me/i);

  if (isMocked) {
    // Sobrescreve o adaptador apenas para essa requisição
    config.adapter = async (cfg: any) => {
      const parsedData = cfg.data ? JSON.parse(cfg.data) : {};
      
      return new Promise<AxiosResponse>((resolve, reject) => {
        setTimeout(() => {
          try {
            // --- EVENT ---
            if (url.match(/^\/event\/?$/)) {
              let events = readLS('mock_events');
              if (method === 'post') {
                const newEvent = { ...parsedData, _id: generateId(), createdAt: new Date().toISOString() };
                writeLS('mock_events', [...events, newEvent]);
                return resolve({ data: { data: newEvent }, status: 201, statusText: 'Created', headers: {}, config: cfg });
              }
              if (method === 'get') {
                if (cfg.params?.status) events = events.filter((e: any) => e.status === cfg.params.status);
                if (cfg.params?.active) events = events.filter((e: any) => String(e.active) === String(cfg.params.active));
                return resolve({ data: { data: events }, status: 200, statusText: 'OK', headers: {}, config: cfg });
              }
            }

            if (url.match(/^\/event\/me\/?$/) && method === 'get') {
              const events = readLS('mock_events');
              return resolve({ data: { data: events }, status: 200, statusText: 'OK', headers: {}, config: cfg });
            }

            const eventIdMatch = url.match(/^\/event\/([^/]+)$/);
            if (eventIdMatch) {
              const id = eventIdMatch[1];
              let events = readLS('mock_events');
              const index = events.findIndex((e: any) => e._id === id);
              
              if (method === 'get') {
                if (index === -1) throw new Error('Not found');
                return resolve({ data: { event: events[index] }, status: 200, statusText: 'OK', headers: {}, config: cfg });
              }
              if (method === 'put') {
                if (index > -1) {
                  events[index] = { ...events[index], ...parsedData };
                  writeLS('mock_events', events);
                  return resolve({ data: { data: events[index] }, status: 200, statusText: 'OK', headers: {}, config: cfg });
                }
              }
              if (method === 'delete') {
                if (index > -1) {
                  events.splice(index, 1);
                  writeLS('mock_events', events);
                }
                return resolve({ data: { success: true }, status: 200, statusText: 'OK', headers: {}, config: cfg });
              }
            }

            // --- CATEGORY ---
            if (url.match(/^\/category\/?$/)) {
              let categories = readLS('mock_categories');
              if (method === 'post') {
                const newCat = { ...parsedData, _id: generateId(), createdAt: new Date().toISOString() };
                writeLS('mock_categories', [...categories, newCat]);
                return resolve({ data: { data: newCat }, status: 201, statusText: 'Created', headers: {}, config: cfg });
              }
              if (method === 'get') {
                if (cfg.params?.event) categories = categories.filter((c: any) => c.event === cfg.params.event);
                return resolve({ data: { data: categories }, status: 200, statusText: 'OK', headers: {}, config: cfg });
              }
            }

            // --- PRODUCT ---
            if (url.match(/^\/product\/?$/)) {
              let products = readLS('mock_products');
              if (method === 'post') {
                const newProd = { ...parsedData, _id: generateId(), createdAt: new Date().toISOString() };
                writeLS('mock_products', [...products, newProd]);
                return resolve({ data: { data: newProd }, status: 201, statusText: 'Created', headers: {}, config: cfg });
              }
              if (method === 'get') {
                if (cfg.params?.event) products = products.filter((p: any) => p.event === cfg.params.event);
                return resolve({ data: { data: products }, status: 200, statusText: 'OK', headers: {}, config: cfg });
              }
            }

            // --- ORDER ---
            if (url.match(/^\/order\/?$/)) {
              let orders = readLS('mock_orders');
              if (method === 'post') {
                const newOrder = { ...parsedData, _id: generateId(), createdAt: new Date().toISOString() };
                writeLS('mock_orders', [...orders, newOrder]);
                return resolve({ data: { data: newOrder }, status: 201, statusText: 'Created', headers: {}, config: cfg });
              }
              if (method === 'get') {
                return resolve({ data: { data: orders }, status: 200, statusText: 'OK', headers: {}, config: cfg });
              }
            }

            // --- USER ---
            if (url.match(/^\/user\/me\/?$/) && method === 'put') {
               return resolve({ data: parsedData, status: 200, statusText: 'OK', headers: {}, config: cfg });
            }

            reject({ response: { data: { message: 'Mock route not fully implemented for this method' } } });
          } catch (e: any) {
            reject({ response: { data: { message: e.message } } });
          }
        }, 500); // 500ms delay to simulate network
      });
    };
  }

  return config;
};
