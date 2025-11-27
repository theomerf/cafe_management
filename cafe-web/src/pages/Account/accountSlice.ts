import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import requests from '../../services/api';
import { history } from '../../utils/history';
import type { FormError, ApiErrorResponse } from '../../types/apiError';
import type { LoginResponse } from '../../types/loginResponse';
import type { UserPreferences } from '../../types/account';

type userState = {
    user: LoginResponse | null;
    preferences: UserPreferences;
    status: string;
    error?: FormError | null;
}

const initialState: userState = {
    user: null,
    preferences: {
        darkMode: false,
    },
    status: "idle",
    error: null,
};

export const loginUser = createAsyncThunk(
    "account/login",
    async (data, thunkAPI) => {
        try {
            const response = await requests.account.login(data);
            localStorage.setItem("user", JSON.stringify(response));
            toast.success("Başarıyla giriş yaptınız.");
            history.push("/");

            return response as LoginResponse;
        }
        catch (error: any) {
            if (error.response?.status === 401) {
                return thunkAPI.rejectWithValue("Kullanıcı adı veya şifre yanlış.");
            }
            if (error.response?.data) {
                return thunkAPI.rejectWithValue(error.response.data as ApiErrorResponse);
            }
            return thunkAPI.rejectWithValue("Giriş işlemi sırasında bir hata oluştu.");
        }
    }
)

export const registerUser = createAsyncThunk(
    "account/register",
    async (data, thunkAPI) => {
        try {
            await requests.account.register(data);
            toast.success("Başarıyla kayıt oldunuz, lütfen giriş yapın.");
            history.push("/account/login");
            return null;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
            return thunkAPI.rejectWithValue({
                message: "Kayıt işlemi sırasında bir hata oluştu.",
                errors: {}
            } as ApiErrorResponse);
        }
    }
)

export const checkAuth = createAsyncThunk(
    "account/checkAuth",
    async (_, thunkAPI) => {
        try {
            const response = await requests.account.checkAuth(thunkAPI.signal);
            localStorage.setItem("user", JSON.stringify(response));
            return response as LoginResponse;
        }
        catch (error: any) {
            toast.error("Kimlik doğrulama kontrolü sırasında bir hata oluştu.");
            localStorage.removeItem("user");
            history.push("/login");
            return thunkAPI.rejectWithValue(null);
        }
    }
)

export const logout = createAsyncThunk(
    "account/logout",
    async (_) => {
        try {
            await requests.account.logout();
            localStorage.removeItem("user");
            toast.success("Başarıyla çıkış yaptınız.");
        } catch (error: any) {
            console.error("Logout hatası:", error);
            toast.warning("Çıkış işlemi tamamlandı.");
        } finally {
            history.push("/login");
        }
        return null;
    }
);

export const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<LoginResponse>) => {
            state.user = action.payload;
            localStorage.setItem("user", JSON.stringify(action.payload));
        },
        setPreferences: (state, action: PayloadAction<UserPreferences>) => {
            state.preferences = action.payload;
            localStorage.setItem("preferences", JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.error = null;
            state.status = "pending";
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.status = "idle";
            state.error = null;
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
            state.user = null;
        });

        builder.addCase(registerUser.pending, (state) => {
            state.error = null;
            state.status = "pending";
        });
        builder.addCase(registerUser.fulfilled, (state) => {
            state.status = "idle";
            state.error = null;
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(checkAuth.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            state.user = action.payload;
            state.status = "idle";
            state.error = null;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.user = null;
            state.status = "idle";
        });

        builder.addCase(logout.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.status = 'idle';
            state.error = null;
        });
        builder.addCase(logout.rejected, (state) => {
            state.user = null;
            state.status = 'idle';
        });
    }
});

export const { setUser, setPreferences } = accountSlice.actions;

