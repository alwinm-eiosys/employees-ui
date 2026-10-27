<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Management, CircleCheck } from '@element-plus/icons-vue'
import { apiRequest, AUTH_TOKEN_STORAGE_KEY } from '@/services/api'
import { clearVerifiedSession } from '@/router/session'

const router = useRouter()
const formRef = ref()
const loading = ref(false) //acts as a status flag to track whether an API request is currently in progress. It also binds to your submit button (:loading="loading"), which automatically turns the button into a spinning loading state and disables it so the user knows the app is working.
const form = reactive({ email: '', password: '' })
const rules = {
  email: [
    { required: true, message: 'Email required', trigger: ['blur', 'change'] },
    { type: 'email', max: 254, message: 'Enter valid email address', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: 'Password required', trigger: ['blur', 'change'] },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback() //fake success here,so that empty pwd doesn't trigger 2 error messages from both pwd-object-rules

        // pwd length-check
        if (value.length < 6 || value.length > 30) {
          return callback(new Error('Min length:6/Max length:30'))
        }

        //password complex validation
        const hasUpperCase = /[A-Z]/.test(value)
        const hasNumber = /[0-9]/.test(value)
        const hasSpecial = /[^a-zA-Z0-9]/.test(value)

        if (!hasUpperCase || !hasNumber || !hasSpecial) {
          return callback(new Error('Password must have an uppercase letter,a digit and a special character!'))
        }

        // Success if everything passess
        callback()
      },
      trigger: ['blur', 'change'],
    },
  ],
}

// 1. Individual field validity checks for showing green ticks inside inputs
const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
})

const isPasswordValid = computed(() => {
  const pwd = form.password
  return pwd.length >= 6 && pwd.length <= 30 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^a-zA-Z0-9]/.test(pwd)
})

// 2. Combined validity check to keep button disabled if anything is invalid
const isFormValid = computed(() => isEmailValid.value && isPasswordValid.value)

//loading becomes true, when submit is pressed, if again user presses, then it becomes false,preventing multiple backend requests;
//Initial request will be done, but not subsequent ones.( first line of submit() returns subsequent requests)

async function submit() {
  if (loading.value) return //prevent multiple baceknd requests,(when loading is true), user hits submit but keeps spamming submit button

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

    if (!result?.access_token) throw new Error('The API did not return an access token')

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, result.access_token)
    clearVerifiedSession()

    // Success, forces user to dashboard
    await router.replace('/')
    ElMessage.success('Signed-in successfully')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to sign-in')
  } finally {
    loading.value = false //making the submit button active and clickable again.
  }
}
</script>

<template>
  <main class="login-page">
    <el-card class="login-card" shadow="hover">
      <div class="brand-mark">
        <el-icon><Management /></el-icon>
      </div>
      <p class="eyebrow">EMPLOYEE MANAGEMENT SYSTEM</p>
      <h1>Company Admin Login</h1>
      <p class="login-description">Sign-in with your administrative account to manage employees</p>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
        <!-- Email Field -->
        <el-form-item label="Email" prop="email">
          <el-input v-model="form.email" type="email" autocomplete="username" placeholder="admin@company.com" clearable>
            <template #suffix>
              <el-icon v-if="isEmailValid" class="valid-tick">
                <CircleCheck />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Password Field -->
        <el-form-item label="Password" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            placeholder="Enter account password"
            show-password
            clearable
            @keyup.enter="submit"
          >
            <template #suffix>
              <el-icon v-if="isPasswordValid" class="valid-tick">
                <CircleCheck />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Submit Button (Disabled when form validation fails) -->
        <!--el button :loading  It swaps the button text for a spinning loading icon.
        It natively disables the button so the user cannot interact with it.-->
        <el-button
          class="submit-button"
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!isFormValid"
          @click="submit"
        >
          Login
        </el-button>
      </el-form>
    </el-card>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px 16px;
  background: radial-gradient(circle at top left, #eaf3ff, transparent 45%), #f5f7fa;
}
.login-card {
  width: min(440px, 100%);
  padding: 18px 14px;
  border: 1px solid #e6eaf0;
  border-radius: 18px;
  box-shadow: 0 18px 50px rgb(31 41 55 / 7%);
}
.brand-mark {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 13px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 24px;
}
.eyebrow {
  margin: 0 0 8px;
  color: #409eff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
}
h1 {
  margin: 0;
  color: #1f2937;
  font-size: 28px;
}
.login-description {
  margin: 10px 0 24px;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.55;
}
.submit-button {
  width: 100%;
  margin-top: 6px;
}
</style>
