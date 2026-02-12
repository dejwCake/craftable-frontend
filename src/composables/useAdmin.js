import { ref, onMounted } from 'vue';
import axios from 'axios';

export function useAdmin() {
  const loading = ref(false);

  function setLoading(value) {
    loading.value = !!value;
  }

  onMounted(() => {
    axios.interceptors.request.use(
      (config) => {
        setLoading(true);
        return config;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => {
        setLoading(false);
        return response;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );
  });

  return {
    loading,
    setLoading,
  };
}
