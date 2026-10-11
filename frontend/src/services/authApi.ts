import { insforge } from './insforge';

export const authApi = {
  register: async (data: any) => {
    const { email, password, name } = data;
    const { error: signUpError } = await insforge.auth.signUp({
      email,
      password,
      name,
      autoConfirm: true
    });
    if (signUpError) {
      throw new Error(signUpError.message);
    }
    const { data: signInData, error: signInError } = await insforge.auth.signInWithPassword({ email, password });
    if (signInError) {
      throw new Error(signInError.message);
    }
    return { success: true, data: { user: signInData?.user } };
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
    const email = data.emailOrPhone.trim().toLowerCase();
    const { error } = await insforge.auth.sendResetPasswordEmail({
      email,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { success: true, message: 'If an account exists for this email, a password reset code has been sent.' };
  },
  resetPassword: async (data: { email?: string; code?: string; token?: string; newPassword: string }) => {
    let resetToken = data.token;

    if (!resetToken) {
      if (!data.email || !data.code) {
        throw new Error('Enter the email address and reset code from your message.');
      }

      const { data: tokenData, error: tokenError } = await insforge.auth.exchangeResetPasswordToken({
        email: data.email.trim().toLowerCase(),
        code: data.code.trim(),
      });
      if (tokenError || !tokenData?.token) {
        throw new Error(tokenError?.message || 'That reset code is invalid or expired.');
      }
      resetToken = tokenData.token;
    }

    const { error } = await insforge.auth.resetPassword({
      newPassword: data.newPassword,
      otp: resetToken,
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
