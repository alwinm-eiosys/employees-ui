<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import Auth from './Auth.vue'
import Registration from './Registration.vue'
                                                                // removes a trailing slash from the URL, if there is one.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const AUTH_TOKEN_STORAGE_KEY = 'access_token'

const isAuthenticated = ref(false)
const isCheckingSession = ref(true)

const handleAuthenticated = () => {
  isAuthenticated.value = true
}

const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  isAuthenticated.value = false
  ElMessage.info('You have signed out.')
}

// Verify a saved token against the backend instead of trusting localStorage alone.
const restoreSession = async () => {
  const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  if (!token) {
    isCheckingSession.value = false
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) throw new Error('Saved session is no longer valid')//thrown for any status other than 200
    isAuthenticated.value = true       // for sucessful  status, set to true
  } catch {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    isAuthenticated.value = false
  } finally {
    isCheckingSession.value = false
  }
}

onMounted(restoreSession)
</script>

<template>
  <div class="app-root">
    <div v-if="isCheckingSession" class="session-checking">
      <el-card shadow="never" class="checking-card">
        <el-skeleton :rows="3" animated />
        <p>Checking your session…</p>
      </el-card>
    </div>

    <template v-else>
      <header v-if="isAuthenticated" class="app-bar">
        <div>
          <p class="app-eyebrow">EMPLOYEE MANAGEMENT SYSTEM</p>
          <h1>Employee Management</h1>
        </div>
        <el-button plain @click="logout">Sign out</el-button>
      </header>

      <Auth v-if="!isAuthenticated" @authenticated="handleAuthenticated" />
      <Registration v-else @session-expired="logout" />
    </template>
  </div>
</template>

<style>
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #303133;
  background: #f5f7fa;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* {
  box-sizing: border-box;
}

body {
  min-width: 320px;
  margin: 0;
}

button,
input {
  font: inherit;
}

.app-root {
  min-height: 100vh;
}

.app-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px clamp(16px, 4vw, 56px);
  background: #fff;
  border-bottom: 1px solid #e6eaf0;
}

.app-bar h1 {
  margin: 0;
  color: #1f2937;
  font-size: 19px;
  font-weight: 700;
}

.app-eyebrow {
  margin: 0 0 4px;
  color: #409eff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.session-checking {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background: #f5f7fa;
}

.checking-card {
  width: min(420px, 100%);
  border-radius: 12px;
}

.checking-card p {
  margin: 16px 0 0;
  color: #606266;
  font-size: 14px;
  text-align: center;
}
</style>
