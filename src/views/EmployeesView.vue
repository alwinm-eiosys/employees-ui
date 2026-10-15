<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmployeeForm from '../components/EmployeeForm.vue'
import { apiRequest } from '../services/api'
import { Delete, Edit, Plus, Refresh, Search, RefreshLeft, Filter } from '@element-plus/icons-vue'

const employees = ref([])
const loading = ref(false)
const formSaving = ref(false)
const dialogVisible = ref(false)
const editingEmployee = ref(null)
const showDeleted = ref(false)
const meta = reactive({ total: 0, totalPages: 0 })
const filters = reactive({
  search: '', department: '', designation: '', employmentType: '', employmentStatus: '',
  joinedFrom: '', joinedTill: '',
})
const pagination = reactive({ page: 1, limit: 5 })
const sorting = reactive({ sortBy: 'id', order: 'ASC' })
const pageTitle = computed(() => showDeleted.value ? 'Deleted employees' : 'Employees')

const departments = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Human Resources', value: 'hr' },
  { label: 'Sales', value: 'sales' },
]
const employmentTypes = [
  { label: 'Full-Time', value: 'full-time' },
  { label: 'Part-Time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
]
const employmentStatuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'On Leave', value: 'on-leave' },
  { label: 'Terminated', value: 'terminated' },
]

function buildQuery() {
  const query = new URLSearchParams({
    page: String(pagination.page),
    limit: String(pagination.limit),
    sortBy: sorting.sortBy,
    order: sorting.order,
  })
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== null && value !== undefined) query.set(key, value)
  }
  return query.toString()
}

async function loadEmployees() {
  loading.value = true
  try {
    const endpoint = showDeleted.value ? '/employees/deleted' : '/employees'
    const result = await apiRequest(`${endpoint}?${buildQuery()}`)
    employees.value = result?.data ?? []
    meta.total = result?.meta?.total ?? 0
    meta.totalPages = result?.meta?.totalPages ?? 0
    if (pagination.page > 1 && employees.value.length === 0 && pagination.page > meta.totalPages) {
      pagination.page = Math.max(1, meta.totalPages)
      await loadEmployees()
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to load employees.')
  } finally {
    loading.value = false
  }
}

function runSearch() {
  pagination.page = 1
  void loadEmployees()
}

function resetFilters() {
  Object.assign(filters, {
    search: '', department: '', designation: '', employmentType: '', employmentStatus: '',
    joinedFrom: '', joinedTill: '',
  })
  pagination.page = 1
  void loadEmployees()
}

function handleSortChange({ prop, order }) {
  const allowed = ['id', 'firstName', 'lastName', 'employeeCode', 'email', 'dateOfJoining', 'basicSalary', 'createdAt']
  if (prop && allowed.includes(prop) && order) {
    sorting.sortBy = prop
    sorting.order = order === 'descending' ? 'DESC' : 'ASC'
  } else {
    sorting.sortBy = 'id'
    sorting.order = 'ASC'
  }
  pagination.page = 1
  void loadEmployees()
}

function changePage(page) {
  pagination.page = page
  void loadEmployees()
}

function changeLimit(limit) {
  pagination.limit = limit
  pagination.page = 1
  void loadEmployees()
}

function openCreateDialog() {
  editingEmployee.value = null
  dialogVisible.value = true
}

function openEditDialog(employee) {
  editingEmployee.value = { ...employee, skills: Array.isArray(employee.skills) ? [...employee.skills] : [] }
  dialogVisible.value = true
}

async function saveEmployee(payload) {
  if (formSaving.value) return
  formSaving.value = true
  try {
    if (editingEmployee.value?.id) {
      await apiRequest(`/employees/${editingEmployee.value.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
      ElMessage.success('Employee updated.')
    } else {
      await apiRequest('/employees', { method: 'POST', body: JSON.stringify(payload) })
      ElMessage.success('Employee added.')
    }
    dialogVisible.value = false
    await loadEmployees()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'Unable to save employee.')
  } finally {
    formSaving.value = false
  }
}

async function deleteEmployee(employee) {
  const fullName = `${employee.firstName} ${employee.lastName}`
  try {
    await ElMessageBox.confirm(
      `Move ${fullName} to deleted employees? The record can be restored later.`,
      'Delete employee',
      { confirmButtonText: 'Delete employee', cancelButtonText: 'Cancel', type: 'warning' },
    )
    await apiRequest(`/employees/${employee.id}`, { method: 'DELETE' })
    ElMessage.success('Employee soft-deleted.')
    await loadEmployees()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error instanceof Error ? error.message : 'Unable to delete employee.')
  }
}

async function restoreEmployee(employee) {
  try {
    await ElMessageBox.confirm(
      `Restore ${employee.firstName} ${employee.lastName}?`,
      'Restore employee',
      { confirmButtonText: 'Restore', cancelButtonText: 'Cancel', type: 'info' },
    )
    await apiRequest(`/employees/${employee.id}/restore`, { method: 'PATCH' })
    ElMessage.success('Employee restored.')
    await loadEmployees()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(error instanceof Error ? error.message : 'Unable to restore employee.')
  }
}

function switchDeletedView(value) {
  showDeleted.value = value
  pagination.page = 1
  void loadEmployees()
}

onMounted(loadEmployees)
</script>

<template>
  <section>
    <div class="page-heading">
      <div><h2 class="page-title">{{ pageTitle }}</h2><p class="page-subtitle">Search and maintain employee records. Deleted records stay in the database and can be restored.</p></div>
      <div class="heading-actions">
        <el-button :icon="Refresh" :loading="loading" @click="loadEmployees">Refresh</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">Add employee</el-button>
      </div>
    </div>

    <div class="view-switch">
      <el-segmented :model-value="showDeleted" :options="[{ label: 'Active employees', value: false }, { label: 'Deleted employees', value: true }]" @change="switchDeletedView" />
      <span class="total-count">{{ meta.total }} record{{ meta.total === 1 ? '' : 's' }}</span>
    </div>

    <el-card shadow="never" class="filter-card">
      <div class="table-toolbar">
        <el-input v-model="filters.search" placeholder="Search name, email or employee code" clearable @keyup.enter="runSearch" @clear="runSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-select v-model="filters.department" placeholder="Department" clearable @change="runSearch">
          <el-option v-for="option in departments" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-model="filters.designation" placeholder="Designation" clearable @keyup.enter="runSearch" @clear="runSearch" />
        <el-select v-model="filters.employmentType" placeholder="Employment type" clearable @change="runSearch">
          <el-option v-for="option in employmentTypes" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-select v-model="filters.employmentStatus" placeholder="Status" clearable @change="runSearch">
          <el-option v-for="option in employmentStatuses" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </div>
      <div class="table-toolbar secondary-toolbar">
        <el-date-picker v-model="filters.joinedFrom" type="date" value-format="YYYY-MM-DD" placeholder="Joined from" clearable @change="runSearch" />
        <el-date-picker v-model="filters.joinedTill" type="date" value-format="YYYY-MM-DD" placeholder="Joined till" clearable @change="runSearch" />
        <el-button :icon="Filter" @click="runSearch">Apply filters</el-button>
        <el-button text :icon="RefreshLeft" @click="resetFilters">Reset filters</el-button>
      </div>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table
        :data="employees"
        v-loading="loading"
        row-key="id"
        :default-sort="{ prop: 'id', order: 'ascending' }"
        @sort-change="handleSortChange"
        empty-text="No employees found"
      >
        <el-table-column prop="id" label="ID" width="78" sortable="custom" />
        <el-table-column prop="employeeCode" label="Employee code" min-width="140" sortable="custom" />
        <el-table-column prop="firstName" label="Name" min-width="180" sortable="custom">
          <template #default="scope">{{ scope.row.firstName }} {{ scope.row.middleName ? `${scope.row.middleName} ` : '' }}{{ scope.row.lastName }}</template>
        </el-table-column>
        <el-table-column prop="email" label="Email" min-width="220" sortable="custom" show-overflow-tooltip />
        <el-table-column prop="department" label="Department" min-width="130" />
        <el-table-column prop="designation" label="Designation" min-width="160" show-overflow-tooltip />
        <el-table-column prop="employmentType" label="Type" min-width="120" />
        <el-table-column prop="employmentStatus" label="Status" min-width="120">
          <template #default="scope"><el-tag :type="scope.row.employmentStatus === 'active' ? 'success' : scope.row.employmentStatus === 'terminated' ? 'danger' : 'info'" effect="light">{{ scope.row.employmentStatus }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="dateOfJoining" label="Joining date" min-width="130" sortable="custom" />
        <el-table-column prop="basicSalary" label="Basic salary" min-width="130" sortable="custom">
          <template #default="scope">{{ Number(scope.row.basicSalary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</template>
        </el-table-column>
        <el-table-column v-if="showDeleted" prop="deletedAt" label="Deleted at" min-width="180" />
        <el-table-column label="Actions" fixed="right" :width="showDeleted ? 130 : 120" align="right">
          <template #default="scope">
            <template v-if="showDeleted">
              <el-tooltip content="Restore employee" placement="top"><el-button circle text type="success" :icon="RefreshLeft" aria-label="Restore employee" @click="restoreEmployee(scope.row)" /></el-tooltip>
            </template>
            <template v-else>
              <el-tooltip content="Edit employee" placement="top"><el-button circle text type="primary" :icon="Edit" aria-label="Edit employee" @click="openEditDialog(scope.row)" /></el-tooltip>
              <el-tooltip content="Delete employee" placement="top"><el-button circle text type="danger" :icon="Delete" aria-label="Delete employee" @click="deleteEmployee(scope.row)" /></el-tooltip>
            </template>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-row">
        <span class="muted">Page {{ pagination.page }} of {{ Math.max(1, meta.totalPages) }}</span>
        <el-pagination
          :current-page="pagination.page"
          :page-size="pagination.limit"
          :page-sizes="[5, 10, 20, 50]"
          :total="meta.total"
          layout="sizes, prev, pager, next, ->, total"
          @current-change="changePage"
          @size-change="changeLimit"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editingEmployee ? 'Edit employee' : 'Add employee'" width="min(1220px, 96vw)" top="3vh" class="employee-dialog" destroy-on-close>
      <EmployeeForm :employee="editingEmployee" :saving="formSaving" @save="saveEmployee" @cancel="dialogVisible = false" />
    </el-dialog>
  </section>
</template>

<style scoped>
.heading-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.view-switch { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 0 0 14px; }
.total-count { color: #909399; font-size: 12px; }
.filter-card { margin-bottom: 16px; border-color: #e6eaf0; border-radius: 14px; }
.filter-card :deep(.el-card__body) { padding: 16px; }
.table-toolbar { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin: 0; }
.table-toolbar + .table-toolbar { margin-top: 12px; }
.table-toolbar .el-input { width: 250px; }
.table-toolbar .el-select { width: 170px; }
.table-toolbar .el-date-editor { width: 175px; }
.table-card { border-color: #e6eaf0; border-radius: 14px; }
.table-card :deep(.el-card__body) { padding: 0; }
:global(.employee-dialog .el-dialog__body) { max-height: calc(94vh - 130px); overflow-y: auto; padding-top: 8px; }
.table-card :deep(.el-table th.el-table__cell) { background: #fafbfc; color: #606266; font-weight: 600; }
.pagination-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; }
@media (max-width: 760px) { .heading-actions { width: 100%; }.heading-actions .el-button { flex: 1; }.table-toolbar .el-input, .table-toolbar .el-select, .table-toolbar .el-date-editor { width: 100%; }.pagination-row { align-items: flex-start; flex-direction: column; }.view-switch { align-items: flex-start; flex-direction: column; } }
</style>
