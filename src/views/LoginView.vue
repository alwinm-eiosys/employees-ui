<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Management } from '@element-plus/icons-vue'
import { apiRequest, AUTH_TOKEN_STORAGE_KEY } from '../services/api'
import { clearVerifiedSession } from '../router/session'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({ email: '', password: '' })
const rules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
  ],
  password: [{ required: true, message: 'Password is required', trigger: 'blur' }],
}

async function submit() {
  if (loading.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  loading.value = true
  try {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
    })
    if (!result?.access_token) throw new Error('The API did not return an access_token.')
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.access_token)
    clearVerifiedSession()
    await router.replace('/')
    ElMessage.success('Signed in successfully.')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to sign in.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">
    <el-card class="login-card" shadow="never">
      <div class="brand-mark"><el-icon><Management /></el-icon></div>
      <p class="eyebrow">EMPLOYEE MANAGEMENT SYSTEM</p>
      <h1>Admin sign in</h1>
      <p class="login-description">Sign in with your administrator account to manage employees.</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" autocomplete="username" placeholder="admin@company.com" clearable />
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="current-password" placeholder="Enter your password" show-password @keyup.enter="submit" />
        </el-form-item>
        <el-button class="submit-button" type="primary" size="large" :loading="loading" @click="submit">Sign in</el-button>
      </el-form>
    </el-card>
  </main>
</template>

<style scoped>
.login-page { display: grid; min-height: 100vh; place-items: center; padding: 24px 16px; background: radial-gradient(circle at top left, #eaf3ff, transparent 45%), #f5f7fa; }
.login-card { width: min(440px, 100%); padding: 18px 14px; border: 1px solid #e6eaf0; border-radius: 18px; box-shadow: 0 18px 50px rgb(31 41 55 / 7%); }
.brand-mark { display: grid; width: 48px; height: 48px; place-items: center; margin-bottom: 20px; border-radius: 13px; background: #ecf5ff; color: #409eff; font-size: 24px; }
.eyebrow { margin: 0 0 8px; color: #409eff; font-size: 11px; font-weight: 700; letter-spacing: .1em; }
h1 { margin: 0; color: #1f2937; font-size: 28px; }
.login-description { margin: 10px 0 24px; color: #6b7280; font-size: 14px; line-height: 1.55; }
.submit-button { width: 100%; margin-top: 6px; }
</style>
