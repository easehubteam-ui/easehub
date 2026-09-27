import { insforge } from './insforge';

export const authApi = {
  register: async (data: any) => {
    const { email, password, name } = data;
    const { data: signUpData, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      autoConfirm: true
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data: { user: signUpData?.user } };
  },
  login: async (data: any) => {
    const email = data.email || data.emailOrPhone;
    const password = data.password;
    const { data: loginData, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data: { user: loginData?.user } };
  },
  adminLogin: async (data: any) => {
    const email = data.email || data.emailOrPhone;
    const password = data.password;
    const { data: loginData, error } = await insforge.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, data: { user: loginData?.user } };
  },
  logout: async () => {
    await insforge.auth.signOut();
    return { success: true };
  },
  getMe: async () => {
    const { data, error } = await insforge.auth.getCurrentUser();
    if (error || !data?.user) {
      return { success: false, data: { user: null } };
    }
    return { success: true, data: { user: data.user } };
  },
  forgotPassword: async (data: { emailOrPhone: string }) => {
    const { error } = await insforge.auth.sendResetPasswordEmail({
      email: data.emailOrPhone
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Password reset link sent to your email.' };
  },
  resetPassword: async (data: { token: string; newPassword: string }) => {
    const { error } = await insforge.auth.resetPassword({
      newPassword: data.newPassword,
      otp: data.token
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'Password updated successfully.' };
  },
  health: async () => {
    return { success: true, message: 'InsForge Auth is active' };
  },
};
