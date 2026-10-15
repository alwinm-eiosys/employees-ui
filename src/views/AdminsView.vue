<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { apiRequest } from '../services/api'
import { Delete, Edit, Plus, Refresh } from '@element-plus/icons-vue'

const admins = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref()
const editingId = ref(null)
const isEditing = computed(() => editingId.value !== null)
const form = reactive({ email: '', password: '' })
const rules = {
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
  ],
  password: [{
    validator: (_rule, value, callback) => {
      if (!isEditing.value && !value) return callback(new Error('Password is required'))
      if (value && value.length < 8) return callback(new Error('Password must be at least 8 characters'))
      if (value && new TextEncoder().encode(value).length > 72) return callback(new Error('Password must be no more than 72 UTF-8 bytes'))
      callback()
    },
    trigger: 'blur',
  }],
}

async function loadAdmins() {
  loading.value = true
  try {
    admins.value = await apiRequest('/admins')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to load admins.')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingId.value = null
  form.email = ''
  form.password = ''
  dialogVisible.value = true
}

function openEditDialog(admin) {
  editingId.value = admin.id
  form.email = admin.email
  form.password = ''
  dialogVisible.value = true
}

function closeDialog() {
  dialogVisible.value = false
  formRef.value?.clearValidate()
}

async function saveAdmin() {
  if (saving.value) return
  try {
    await formRef.value.validate()
  } catch {
    return
  }
  saving.value = true
  const payload = { email: form.email.trim().toLowerCase() }
  if (!isEditing.value || form.password) payload.password = form.password
  try {
    if (isEditing.value) {
      await apiRequest(`/admins/${editingId.value}`, { method: 'PATCH', body: JSON.stringify(payload) })
      ElMessage.success('Admin updated.')
    } else {
      await apiRequest('/admins', { method: 'POST', body: JSON.stringify(payload) })
      ElMessage.success('Admin created.')
    }
    closeDialog()
    await loadAdmins()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to save admin.')
  } finally {
    saving.value = false
  }
}

async function deleteAdmin(admin) {
  try {
    await ElMessageBox.confirm(
      `Delete the admin account ${admin.email}? This action cannot be undone.`,
      'Delete administrator',
      { confirmButtonText: 'Delete admin', cancelButtonText: 'Cancel', type: 'warning' },
    )
    await apiRequest(`/admins/${admin.id}`, { method: 'DELETE' })
    ElMessage.success('Admin deleted.')
    await loadAdmins()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error instanceof Error ? error.message : 'Unable to delete admin.')
  }
}

onMounted(loadAdmins)
</script>

<template>
  <section>
    <div class="page-heading">
      <div><h2 class="page-title">Admins</h2><p class="page-subtitle">Create and maintain administrator accounts. Passwords are write-only and never displayed.</p></div>
      <div class="heading-actions">
        <el-button :icon="Refresh" :loading="loading" @click="loadAdmins">Refresh</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">Add admin</el-button>
      </div>
    </div>

    <el-card shadow="never" class="table-card">
      <el-table :data="admins" v-loading="loading" row-key="id" empty-text="No admins found">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="email" label="Email" min-width="260" show-overflow-tooltip />
        <el-table-column label="Password" width="150"><template #default><span class="muted">Never displayed</span></template></el-table-column>
        <el-table-column label="Actions" width="150" fixed="right" align="right">
          <template #default="scope">
            <el-tooltip content="Edit admin" placement="top"><el-button circle text type="primary" :icon="Edit" aria-label="Edit admin" @click="openEditDialog(scope.row)" /></el-tooltip>
            <el-tooltip content="Delete admin" placement="top"><el-button circle text type="danger" :icon="Delete" aria-label="Delete admin" @click="deleteAdmin(scope.row)" /></el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="isEditing ? 'Edit admin' : 'Add admin'" width="min(540px, 94vw)" @closed="formRef?.clearValidate()">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="saveAdmin">
        <el-form-item label="Email address" prop="email"><el-input v-model="form.email" type="email" autocomplete="username" placeholder="admin@company.com" clearable /></el-form-item>
        <el-form-item :label="isEditing ? 'New password (optional)' : 'Password'" prop="password">
          <el-input v-model="form.password" type="password" :autocomplete="isEditing ? 'new-password' : 'new-password'" :placeholder="isEditing ? 'Leave blank to keep the current password' : 'At least 8 characters'" show-password />
          <div class="field-hint">The API hashes the password with bcrypt. It cannot be retrieved later.</div>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="closeDialog">Cancel</el-button><el-button type="primary" :loading="saving" @click="saveAdmin">{{ isEditing ? 'Save changes' : 'Create admin' }}</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.heading-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.table-card { border-color: #e6eaf0; border-radius: 14px; }
.table-card :deep(.el-card__body) { padding: 0; }
.field-hint { margin-top: 7px; color: #909399; font-size: 12px; line-height: 1.5; }
@media (max-width: 760px) { .heading-actions { width: 100%; }.heading-actions .el-button { flex: 1; } }
</style>
