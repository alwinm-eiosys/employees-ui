<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AUTH_TOKEN_STORAGE_KEY, apiRequest } from '@/services/api'
import { clearVerifiedSession } from '@/router/session'
import { ElMessage } from 'element-plus'
import { Management, House, User, Fold, SwitchButton } from '@element-plus/icons-vue'

const route = useRoute() // gives info about current active route, Ex: path & name
const router = useRouter() // for routing
const collapsed = ref(false) // dashboard collapsed/expanded state
const currentAdmin = ref(null)

const pageTitle = computed(() => {
  if (route.name === 'admins') return 'Admin management'
  if (route.name === 'employees') return 'Employee management'
  return 'Dashboard'
})

async function loadCurrentAdmin() {
  try {
    currentAdmin.value = await apiRequest('/auth/me')
  } catch {
    // The shared API handler clears an invalid token and emits auth:expired.
  }
}

function handleSessionExpired() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  clearVerifiedSession()
  ElMessage.warning('Your session has expired, kindly login again!')
  void router.replace('/login')
}

function logout() {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
  clearVerifiedSession()
  currentAdmin.value = null
  router.replace('/login')
  ElMessage.info('You have signed out!')
}

onMounted(() => {
  window.addEventListener('auth:expired', handleSessionExpired)
  void loadCurrentAdmin()
})

onUnmounted(() => {
  window.removeEventListener('auth:expired', handleSessionExpired)
})
</script>

<template>
  <el-container class="dashboard-shell">
    <el-aside class="sidebar" :width="collapsed ? '68px' : '240px'">
      <div class="sidebar-brand" :class="{ compact: collapsed }">
        <div class="brand-icon">
          <el-icon><Management /></el-icon>
        </div>
        <div v-if="!collapsed" class="brand-copy">
          <strong>PeopleDesk</strong>
          <span>Admin workspace</span>
        </div>
      </div>
      <el-menu :default-active="route.path" router :collapse="collapsed" class="sidebar-menu">
        <el-menu-item index="/">
          <el-icon><House /></el-icon><template #title>Overview</template>
        </el-menu-item>
        <el-menu-item index="/employees">
          <el-icon><User /></el-icon><template #title>Employees</template>
        </el-menu-item>
        <el-menu-item index="/admins">
          <el-icon><Management /></el-icon><template #title>Admins</template>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer" v-if="!collapsed"><span>Employee Management</span><small>Admin console</small></div>
    </el-aside>

    <el-container class="main-column">
      <el-header class="topbar">
        <div class="topbar-left">
          <el-button text circle aria-label="Collapse sidebar" @click="collapsed = !collapsed">
            <el-icon><Fold /></el-icon>
          </el-button>
          <div>
            <h1>{{ pageTitle }}</h1>
            <p>Manage your team and employee records</p>
          </div>
        </div>
        <div class="topbar-user">
          <div class="avatar">
            <el-icon><User /></el-icon>
          </div>
          <div class="user-copy">
            <strong>{{ currentAdmin?.email || 'Administrator' }}</strong
            ><span>Admin account</span>
          </div>
          <el-button text @click="logout"
            ><el-icon><SwitchButton /></el-icon><span class="logout-label">Sign out</span></el-button
          >
        </div>
      </el-header>

      <el-main class="main-content"><router-view /></el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.dashboard-shell {
  min-height: 100vh;
  background: #f5f7fa;
}
.sidebar {
  position: relative;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 100vh;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #e6eaf0;
  transition: width 0.18s ease;
}
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 82px;
  padding: 16px 18px;
  border-bottom: 1px solid #f0f2f5;
}
.sidebar-brand.compact {
  justify-content: center;
  padding-inline: 8px;
}
.brand-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  place-items: center;
  border-radius: 11px;
  background: #ecf5ff;
  color: #409eff;
  font-size: 20px;
}
.brand-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 3px;
}
.brand-copy strong {
  color: #1f2937;
  font-size: 16px;
}
.brand-copy span,
.sidebar-footer small {
  color: #909399;
  font-size: 11px;
}
.sidebar-menu {
  flex: 1;
  border-right: 0;
  padding: 14px 8px;
}
.sidebar-menu :deep(.el-menu-item) {
  height: 46px;
  margin-bottom: 6px;
  border-radius: 9px;
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #ecf5ff;
  color: #337ecc;
  font-weight: 600;
}
.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin: 12px 18px 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f2f5;
  color: #606266;
  font-size: 12px;
}
.main-column {
  min-width: 0;
}
.topbar {
  display: flex;
  height: 82px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 0 28px;
  background: #fff;
  border-bottom: 1px solid #e6eaf0;
}
.topbar-left,
.topbar-user {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}
.topbar-left h1 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
}
.topbar-left p {
  margin: 4px 0 0;
  color: #909399;
  font-size: 12px;
}
.topbar-user {
  gap: 10px;
}
.avatar {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 50%;
  background: #f4f4f5;
  color: #606266;
}
.user-copy {
  display: flex;
  max-width: 220px;
  flex-direction: column;
  gap: 3px;
}
.user-copy strong {
  overflow: hidden;
  color: #303133;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-copy span {
  color: #909399;
  font-size: 11px;
}
.main-content {
  min-width: 0;
  padding: 28px;
}
@media (max-width: 760px) {
  .sidebar {
    width: 68px !important;
  }
  .sidebar-brand {
    justify-content: center;
    padding-inline: 8px;
  }
  .brand-copy,
  .sidebar-footer,
  .sidebar-menu :deep(.el-menu-item [class*='title']) {
    display: none;
  }
  .sidebar-menu {
    padding-inline: 4px;
  }
  .topbar {
    height: 72px;
    padding-inline: 12px;
  }
  .topbar-left {
    gap: 6px;
  }
  .topbar-left p,
  .user-copy,
  .logout-label {
    display: none;
  }
  .main-content {
    padding: 18px 12px;
  }
}
</style>
