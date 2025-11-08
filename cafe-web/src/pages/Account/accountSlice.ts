import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'
import requests from '../../services/api';
import { history } from '../../utils/history';
import type { FormError, ApiErrorResponse } from '../../types/apiError';
import { jwtDecode } from 'jwt-decode';
import type { LoginResponse } from '../../types/loginResponse';

type userState = {
    user: LoginResponse | null;
    status: string;
    error?: FormError | null;
}

const initialState: userState = {
    user: null,
    status: "idle",
    error: null,
};

export const loginUser = createAsyncThunk(
    "account/login",
    async (data, thunkAPI) => {
        try {
            const result = await requests.account.login(data);
            history.push("/");
            await new Promise(resolve => setTimeout(resolve, 100));
            toast.success("Başarıyla giriş yaptınız.");
            return result;
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
            var result = await requests.account.register(data);
            toast.success("Başarıyla kayıt oldunuz, lütfen giriş yapın.");
            history.push("/account/login");
            return result;
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

export const logout = createAsyncThunk(
    "account/logout",
    async (_) => {
        localStorage.removeItem("user");
        toast.success("Başarıyla çıkış yaptınız.");
        history.push("/login");
    }
);

export const refresh = createAsyncThunk(
    "account/refresh",
    async (data: LoginResponse, thunkAPI) => {
        const storedUser = localStorage.getItem("user");

        const user: LoginResponse | null = storedUser ? JSON.parse(storedUser) as LoginResponse : null;
        if (user) thunkAPI.dispatch(setUser(user));
        try {
            var result = await requests.account.refresh(data);
            const newUser = result.data;

            const updatedUser = newUser;
            localStorage.setItem("user", JSON.stringify(updatedUser));

            return result;
        }
        catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data as ApiErrorResponse;
                return thunkAPI.rejectWithValue(errorData);
            }
        }
    }
)

export const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(loginUser.pending, (state) => {
            state.error = null;
            state.status = "pending";
        });
        builder.addCase(loginUser.fulfilled, (state, action) => {
            const decoded: any = jwtDecode(action.payload.accessToken);

            state.user = {
                ...action.payload,
                userName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
                avatarUrl: decoded["picture"]
            };

            localStorage.setItem("user", JSON.stringify(state.user));
            state.status = "idle";
        });
        builder.addCase(loginUser.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(registerUser.pending, (state) => {
            state.error = null;
            state.status = "pending";
        });
        builder.addCase(registerUser.fulfilled, (state) => {
            state.status = "idle";
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.status = "idle";
            state.error = action.payload as FormError;
        });

        builder.addCase(logout.pending, (state) => {
            state.status = "pending";
        })

        builder.addCase(logout.fulfilled, (state) => {
            state.status = "idle";
            state.user = null;
        });

        builder.addCase(refresh.pending, (state) => {
            state.status = "pending";
        });
        builder.addCase(refresh.fulfilled, (state, action) => {
            state.user = action.payload;
        });
        builder.addCase(refresh.rejected, (state) => {
            state.user = null;
            localStorage.removeItem("user");
            history.push("/login");
        });
    }
});

export const { setUser } = accountSlice.actions;

