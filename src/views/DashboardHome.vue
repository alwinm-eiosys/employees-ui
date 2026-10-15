<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiRequest } from '../services/api'
import { Management, User, UserFilled, ArrowRight } from '@element-plus/icons-vue'

const loading = ref(true)
const adminCount = ref(0)
const employeeCount = ref(0)

onMounted(async () => {
  try {
    const [admins, employees] = await Promise.all([
      apiRequest('/admins'),
      apiRequest('/employees?page=1&limit=1'),
    ])
    adminCount.value = Array.isArray(admins) ? admins.length : 0
    employeeCount.value = employees?.meta?.total ?? 0
  } catch {
    // The shared API handler and dashboard layout handle session errors.
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <div class="welcome-panel">
      <div>
        <p class="eyebrow">OVERVIEW</p>
        <h2>Welcome to your admin dashboard</h2>
        <p>Manage employee records and administrator accounts from one place.</p>
      </div>
      <div class="welcome-art"><el-icon><Management /></el-icon></div>
    </div>

    <div class="stat-grid">
      <el-card shadow="never" class="stat-card">
        <div class="stat-icon blue"><el-icon><User /></el-icon></div>
        <p>Employees</p><strong v-loading="loading">{{ employeeCount }}</strong>
        <RouterLink to="/employees">View employees <el-icon><ArrowRight /></el-icon></RouterLink>
      </el-card>
      <el-card shadow="never" class="stat-card">
        <div class="stat-icon green"><el-icon><UserFilled /></el-icon></div>
        <p>Administrators</p><strong v-loading="loading">{{ adminCount }}</strong>
        <RouterLink to="/admins">Manage admins <el-icon><ArrowRight /></el-icon></RouterLink>
      </el-card>
    </div>

    <div class="section-heading"><h3>Quick actions</h3><span>Common tasks</span></div>
    <div class="quick-grid">
      <RouterLink to="/employees" class="quick-link"><div class="quick-icon"><el-icon><User /></el-icon></div><div><strong>Manage employees</strong><p>Search, add, edit, delete or restore employee records.</p></div><el-icon class="arrow"><ArrowRight /></el-icon></RouterLink>
      <RouterLink to="/admins" class="quick-link"><div class="quick-icon"><el-icon><Management /></el-icon></div><div><strong>Manage admins</strong><p>Add administrator accounts and update account details.</p></div><el-icon class="arrow"><ArrowRight /></el-icon></RouterLink>
    </div>
  </section>
</template>

<style scoped>
.welcome-panel { display: flex; min-height: 190px; align-items: center; justify-content: space-between; gap: 24px; padding: 30px 34px; border: 1px solid #dce9f9; border-radius: 16px; background: linear-gradient(115deg, #fff 10%, #edf5ff 100%); }
.eyebrow { margin: 0 0 10px; color: #409eff; font-size: 11px; font-weight: 700; letter-spacing: .1em; }
.welcome-panel h2 { margin: 0 0 9px; color: #1f2937; font-size: clamp(21px, 2.5vw, 29px); }
.welcome-panel p:last-child { max-width: 550px; margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6; }
.welcome-art { display: grid; width: 104px; height: 104px; flex: 0 0 104px; place-items: center; border-radius: 26px; background: #fff; color: #409eff; font-size: 48px; box-shadow: 0 10px 28px rgb(64 158 255 / 12%); }
.stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
.stat-card { border-color: #e6eaf0; border-radius: 14px; }
.stat-card :deep(.el-card__body) { position: relative; padding: 23px; }
.stat-icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 12px; font-size: 20px; }
.stat-icon.blue { background: #ecf5ff; color: #409eff; }.stat-icon.green { background: #f0f9eb; color: #67c23a; }
.stat-card p { margin: 16px 0 4px; color: #6b7280; font-size: 13px; }
.stat-card strong { display: block; color: #1f2937; font-size: 30px; line-height: 1.25; }
.stat-card a { display: inline-flex; align-items: center; gap: 5px; margin-top: 15px; color: #409eff; font-size: 12px; font-weight: 600; }
.section-heading { display: flex; align-items: baseline; gap: 12px; margin: 30px 0 14px; }.section-heading h3 { margin: 0; font-size: 16px; }.section-heading span { color: #909399; font-size: 12px; }
.quick-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.quick-link { display: flex; align-items: center; gap: 14px; min-width: 0; padding: 18px; border: 1px solid #e6eaf0; border-radius: 13px; background: #fff; transition: border-color .15s, transform .15s; }
.quick-link:hover { transform: translateY(-2px); border-color: #b3d8ff; }.quick-icon { display: grid; width: 42px; height: 42px; flex: 0 0 42px; place-items: center; border-radius: 12px; background: #f4f4f5; color: #606266; font-size: 20px; }
.quick-link strong { color: #303133; font-size: 13px; }.quick-link p { margin: 5px 0 0; color: #909399; font-size: 12px; line-height: 1.5; }.arrow { flex: 0 0 auto; margin-left: auto; color: #909399; }
@media (max-width: 760px) { .welcome-panel { padding: 22px; }.welcome-art { display: none; }.stat-grid, .quick-grid { grid-template-columns: 1fr; } }
</style>
