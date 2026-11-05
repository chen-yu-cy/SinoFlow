import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '@/components/auth/auth-modal';

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe('AuthModal Component', () => {
  const mockTranslations = {
    loginTitle: '登录账号',
    emailLabel: '邮箱',
    passwordLabel: '密码',
    loginButton: '登录',
    noAccount: '还没有账号？',
    registerLink: '立即注册',
    loginError: '邮箱或密码错误',
    emailPlaceholder: 'name@example.com',
    passwordPlaceholder: '请输入密码',
    closeButton: '关闭',
    registerTitle: '免费注册账号',
    nameLabel: '用户名',
    namePlaceholder: '您的姓名或昵称',
    registerButton: '注册',
    haveAccount: '已有账号？',
    loginLink: '立即登录',
    registerSuccess: '注册成功，请登录',
  };

  it('应该支持点击眼睛图标切换密码的明文/密文显示', () => {
    render(<AuthModal initialMode="login" translations={mockTranslations} />);

    const passwordInput = screen.getByPlaceholderText('请输入密码');
    expect(passwordInput.getAttribute('type')).toBe('password');

    const toggleButton = screen.getByLabelText('Show password');
    fireEvent.click(toggleButton);

    expect(passwordInput.getAttribute('type')).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeDefined();

    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(passwordInput.getAttribute('type')).toBe('password');
  });
});
