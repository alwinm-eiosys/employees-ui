<script setup>
import { nextTick, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['authenticated'])
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const AUTH_TOKEN_STORAGE_KEY = 'access_token'

// The first screen is account registration. Existing users can switch to sign-in.
const mode = ref('register')
const formRef = ref()
const loading = ref(false)
const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!value) return callback(new Error('Password is required'))
        if (mode.value === 'register' && value.length < 8) {
          return callback(new Error('Password must be at least 8 characters'))
        }
        if (mode.value === 'register' && value.length > 72) {
          return callback(new Error('Password must be no more than 72 characters'))
        }
        return callback()
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    {
      validator: (_rule, value, callback) => {
        if (mode.value !== 'register') return callback()
        if (!value) return callback(new Error('Please confirm your password'))
        if (value !== form.password) return callback(new Error('Passwords do not match'))
        return callback()
      },
      trigger: 'blur',
    },
  ],
}

const switchMode = async (nextMode) => {
  mode.value = nextMode
  form.password = ''
  form.confirmPassword = ''
  await nextTick()
  formRef.value?.clearValidate()
}

const submit = async () => {
  if (!formRef.value || loading.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  loading.value = true

  const isRegistering = mode.value === 'register'
  const endpoint = isRegistering ? '/auth/register' : '/auth/login'
  const requestBody = {
    email: form.email.trim().toLowerCase(),
    password: form.password,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      const message = Array.isArray(result?.message)
        ? result.message.join(', ')
        : result?.message || `Request failed with status ${response.status}`
      throw new Error(message)
    }

    if (isRegistering) {
      // The backend registration endpoint creates the account but does not return a JWT.
      ElMessage.success('Account created. Sign in with your new credentials.')
      await switchMode('login')
      return
    }

    if (!result?.access_token) {
      throw new Error('The login response did not contain an access_token.')
    }

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.access_token)
    ElMessage.success('Signed in successfully.')
    emit('authenticated')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to contact the API.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <el-card class="auth-card" shadow="never">
      <div class="auth-heading">
        <p class="eyebrow">EMPLOYEE MANAGEMENT SYSTEM</p>
        <h1>{{ mode === 'register' ? 'Create your account' : 'Sign in' }}</h1>
        <p>
          {{ mode === 'register'
            ? 'Create an application account to access employee management.'
            : 'Sign in with the application account you already created.' }}
        </p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @submit.prevent="submit"
      >
        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="username"
            placeholder="you@company.com"
            clearable
          />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            :autocomplete="mode === 'register' ? 'new-password' : 'current-password'"
            :placeholder="mode === 'register' ? 'At least 8 characters' : 'Enter your password'"
            show-password
            @keyup.enter="submit"
          />
        </el-form-item>

        <el-form-item v-if="mode === 'register'" label="Confirm password" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            autocomplete="new-password"
            placeholder="Re-enter your password"
            show-password
            @keyup.enter="submit"
          />
        </el-form-item>

        <el-button type="primary" size="large" class="auth-button" :loading="loading" @click="submit">
          {{ mode === 'register' ? 'Create account' : 'Sign in' }}
        </el-button>
      </el-form>

      <p class="mode-switch" v-if="mode === 'register'">
        Already registered?
        <el-link type="primary" :underline="false" @click="switchMode('login')">Sign in</el-link>
      </p>
      <p class="mode-switch" v-else>
        Don't have an account?
        <el-link type="primary" :underline="false" @click="switchMode('register')">Create account</el-link>
      </p>

      <el-alert
        title="This account is separate from an employee record. After signing in, use the employee registration form to create an employee."
        type="info"
        :closable="false"
        show-icon
        class="auth-note"
      />
    </el-card>
  </main>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px 16px;
  background: #f5f7fa;
}

.auth-card {
  width: 100%;
  max-width: 460px;
  border: 1px solid #e6eaf0;
  border-radius: 16px;
}

.auth-heading {
  margin-bottom: 26px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #409eff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.auth-heading h1 {
  margin: 0 0 8px;
  color: #1f2937;
  font-size: 28px;
}

.auth-heading p:last-child {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.auth-button {
  width: 100%;
  margin-top: 8px;
}

.mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 20px 0 0;
  color: #606266;
  font-size: 14px;
}

.auth-note {
  margin-top: 24px;
}
</style>
