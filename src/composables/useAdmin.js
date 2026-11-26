import { ref, onMounted } from 'vue';
const axios = window.axios;

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
            },
        );

        axios.interceptors.response.use(
            (response) => {
                setLoading(false);
                return response;
            },
            (error) => {
                setLoading(false);
                // The admin gate (e.g. a pending two-factor challenge) answers JSON requests with 403 + redirect.
                const redirect = error.response?.status === 403 ? error.response.data?.redirect : null;
                if (redirect) {
                    window.location.assign(redirect);
                    return new Promise(() => {});
                }
                return Promise.reject(error);
            },
        );
    });

    return {
        loading,
        setLoading,
    };
}
