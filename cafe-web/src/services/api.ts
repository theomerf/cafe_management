import axios from 'axios';
import { toast } from 'react-toastify';
import { history } from '../utils/history';
import { store } from '../store/store';
import { logout, setUser } from '../pages/Account/accountSlice';
import type { LoginResponse } from '../types/loginResponse';

const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || 'https://localhost:7214';

axios.defaults.baseURL = `${apiBase}/api/`;
axios.interceptors.request.use((request) => {
    const token = store.getState().account.user?.accessToken;
    if (token) request.headers["Authorization"] = `Bearer ${token}`;
    return request;
})

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.name === "AbortError" || error.name === "CanceledError" ||
            error.code === "ERR_CANCELED" || error.message?.includes("canceled")) {
            return Promise.reject(error);
        }

        if (!error.response) {
            toast.error("Sunucuya ulaşılamıyor");
            return Promise.reject(error);
        }

        const { data, status } = error.response;

        switch (status) {
            case 401:
                if (!error.config._retry) {
                    error.config._retry = true;
                }
                const user = store.getState().account.user;
                if (user) {
                    try {
                        const res = await requests.account.refresh({
                            accessToken: user.accessToken,
                            refreshToken: user.refreshToken,
                            userName: user.userName,
                        });
                        const newUser = res.data;

                        const updatedUser = newUser;

                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        store.dispatch(setUser(updatedUser));

                        error.config.headers["Authorization"] = `Bearer ${updatedUser.accessToken}`;
                        return axios(error.config);
                    }
                    catch (refreshError) {
                        store.dispatch(logout());
                        return Promise.reject(refreshError);
                    }

                }
                return Promise.reject(error);
            case 422:
            case 400:
            case 403:
                break;
            case 404:
            case 500:
                history.push("/Error", {
                    state: { error: data, status: status },
                });
                toast.error(data?.message ?? "Sunucu hatası");
                break;
            default:
                toast.error("Bilinmeyen hata");
                break;
        }
        return Promise.reject(error);
    }
);

const methods = {
    get: (url: string, params?: any, signal?: AbortSignal) => axios.get(url, { ...params, signal }).then((response) => ({ data: response.data, headers: response.headers })),
    getWithoutHeaders: (url: string, params?: any, signal?: AbortSignal) => axios.get(url, { ...params, signal }).then((response) => response.data),
    post: (url: string, body: any | null, config?: any | null) => axios.post(url, body, config).then((response) => response.data),
    put: (url: string, body: any, config?: any | null) => axios.put(url, body, config).then((response) => response.data),
    patch: (url: string, body: any, config?: any | null) => axios.patch(url, body, config).then((response) => response.data),
    delete: (url: string) => axios.delete(url).then((response) => response.data),
};

const account = {
    login: (formData: any) => methods.post("account/login", formData),
    register: (formData: any) => methods.post("account/register", formData),
    refresh: (user: LoginResponse) => methods.post("account/refresh", user),
    getAllAccounts: (params: any, signal?: AbortSignal) => methods.get("account", { params }, signal),
    accountsCount: (signal?: AbortSignal) => methods.getWithoutHeaders("account/count", {}, signal),
    createAccount: (formData: any) => methods.post("account/create", formData),
    updateAccount: (formData: any) => methods.put("account/update", formData),
    deleteAccount: (id: string) => methods.delete(`account/delete/${id}`),
};

const product = {
    getAllProducts: (params: any, signal?: AbortSignal) => methods.get("product", { params }, signal),
    getProductsForOrder: (params: any, signal?: AbortSignal) => methods.getWithoutHeaders("product/list", { params }, signal),
    productsCount: (signal?: AbortSignal) => methods.getWithoutHeaders("product/count", {}, signal),
    getOneProduct: (id: string, signal?: AbortSignal) => methods.getWithoutHeaders(`product/${id}`, {}, signal),
    createProduct: (formData: FormData) => methods.post("product/create", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateProduct: (formData: FormData) => methods.put(`product/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProduct: (id: string) => methods.delete(`product/delete/${id}`),
};

const category = {
    getAllCategories: (params: any, signal?: AbortSignal) => methods.get("category", { params }, signal),
    getCategoriesList: (signal?: AbortSignal) => methods.getWithoutHeaders("category/list", {}, signal),
    categoriesCount: (signal?: AbortSignal) => methods.getWithoutHeaders("category/count", {}, signal),
    getOneCategory: (id: string, signal?: AbortSignal) => methods.getWithoutHeaders(`category/${id}`, {}, signal),
    createCategory: (formData: any) => methods.post("category/create", formData),
    updateCategory: (formData: any) => methods.put(`category/update`, formData),
    deleteCategory: (id: string) => methods.delete(`category/delete/${id}`),
}

const order = {
    getAllOrders: (params: URLSearchParams, signal?: AbortSignal) => methods.get("order", { params }, signal),
    getOrdersOfOneTable: (tableId: string, signal?: AbortSignal) => methods.getWithoutHeaders(`order/table/${tableId}`, {}, signal),
    ordersCount: (signal?: AbortSignal) => methods.getWithoutHeaders("order/count", {}, signal),
    dailyIncome: (signal?: AbortSignal) => methods.getWithoutHeaders("order/daily-income", {}, signal),
    dailyOrdersCount: (signal?: AbortSignal) => methods.getWithoutHeaders("order/daily-count", {}, signal),
    statusesStats: (signal?: AbortSignal) => methods.getWithoutHeaders("order/statuses-stats", {}, signal),
    getOneOrder: (id: string, signal?: AbortSignal) => methods.getWithoutHeaders(`order/${id}`, {}, signal),
    createOrder: (formData: any) => methods.post("order/create", formData),
    changeOrderStatus: (formData: any) => methods.patch("order/change-status", formData),
    updateOrder: (formData: any) => methods.put(`order/update`, formData),
    deleteOrder: (id: string) => methods.delete(`order/delete/${id}`),
};

const table = {
    getAllTables: (signal?: AbortSignal) => methods.getWithoutHeaders("table", {}, signal),
    getTablesStatuses: (signal?: AbortSignal) => methods.getWithoutHeaders("table/statuses", {}, signal),
    statusesStats: (signal?: AbortSignal) => methods.getWithoutHeaders("table/statuses-stats", {}, signal),
    tablesCount: (signal?: AbortSignal) => methods.getWithoutHeaders("table/count", {}, signal),
    getOneTable: (id: string, signal?: AbortSignal) => methods.getWithoutHeaders(`table/${id}`, {}, signal),
    createTable: (formData: any) => methods.post("table/create", formData),
    changeTableStatus: (formData: any) => methods.patch("table/change-status", formData),
    updateTable: (formData: any) => methods.put("table/update", formData),
    deleteTable: (id: string) => methods.delete(`table/delete/${id}`),
};

const errors = {
    get400Error: () => methods.get("errors/bad-request"),
    get401Error: () => methods.get("errors/unauthorized"),
    get403Error: () => methods.get("errors/validation-error"),
    get404Error: () => methods.get("errors/not-found"),
    get500Error: () => methods.get("errors/server-error"),
};

const requests = {
    account,
    product,
    category,
    order,
    table,
    errors,
};

export default requests;