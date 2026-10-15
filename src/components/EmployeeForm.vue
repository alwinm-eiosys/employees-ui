<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Message } from '@element-plus/icons-vue'

const props = defineProps({
  employee: { type: Object, default: null },
  saving: { type: Boolean, default: false },
})
const emit = defineEmits(['save', 'cancel'])
const isEditing = computed(() => Boolean(props.employee?.id))
const formRef = ref()

const createInitialForm = () => ({
  firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: '',
  email: '', mobileNumber: '', alternateMobileNumber: '',
  addressLine1: '', addressLine2: '', city: '', state: '', country: 'India', pincode: '',
  employeeCode: '', department: '', designation: '', employmentType: '', dateOfJoining: '',
  reportingManagerId: null, workLocation: '', employmentStatus: 'active',
  basicSalary: null, hra: 0, allowances: 0, deductions: 0,
  bankAccountNumber: '', ifscCode: '',
  highestQualification: '', previousExperience: 0, skills: [],
  emergencyContactName: '', emergencyContactNumber: '', emergencyContactRelationship: '',
})

const form = reactive(createInitialForm())
const namePattern = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/
const mobilePattern = /^[6-9]\d{9}$/
const disableFutureDates = (date) => date.getTime() > Date.now()

const requiredOrPreserved = (fieldLabel, pattern, patternMessage) => ({
  validator: (_rule, value, callback) => {
    if (isEditing.value && !value) return callback()
    if (!value) return callback(new Error(`${fieldLabel} is required`))
    if (!pattern.test(value)) return callback(new Error(patternMessage))
    callback()
  },
  trigger: 'blur',
})

const rules = {
  firstName: [
    { required: true, message: 'First name is required', trigger: 'blur' },
    { min: 2, max: 50, message: 'Use 2 to 50 characters', trigger: 'blur' },
    { pattern: namePattern, message: 'Use letters, spaces, apostrophes or hyphens', trigger: 'blur' },
  ],
  middleName: [
    { validator: (_, value, callback) => (!value || (value.length <= 50 && namePattern.test(value))) ? callback() : callback(new Error('Use up to 50 letters, spaces, apostrophes or hyphens')), trigger: 'blur' },
  ],
  lastName: [
    { required: true, message: 'Last name is required', trigger: 'blur' },
    { max: 50, message: 'Maximum 50 characters', trigger: 'blur' },
    { pattern: namePattern, message: 'Use letters, spaces, apostrophes or hyphens', trigger: 'blur' },
  ],
  dateOfBirth: [{ required: true, message: 'Date of birth is required', trigger: 'change' }],
  gender: [{ required: true, message: 'Select a gender', trigger: 'change' }],
  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address', trigger: 'blur' },
  ],
  mobileNumber: [
    { required: true, message: 'Mobile number is required', trigger: 'blur' },
    { pattern: mobilePattern, message: 'Enter a valid 10-digit Indian mobile number', trigger: 'blur' },
  ],
  alternateMobileNumber: [
    { validator: (_, value, callback) => (!value || mobilePattern.test(value)) ? callback() : callback(new Error('Enter a valid 10-digit Indian mobile number')), trigger: 'blur' },
  ],
  addressLine1: [{ required: true, message: 'Address line 1 is required', trigger: 'blur' }],
  city: [{ required: true, message: 'City is required', trigger: 'blur' }],
  state: [{ required: true, message: 'State is required', trigger: 'blur' }],
  country: [{ required: true, message: 'Country is required', trigger: 'blur' }],
  pincode: [
    { required: true, message: 'Pincode is required', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: 'Pincode must contain 6 digits', trigger: 'blur' },
  ],
  employeeCode: [
    { required: true, message: 'Employee code is required', trigger: 'blur' },
    { max: 20, message: 'Maximum 20 characters', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9-]+$/, message: 'Use letters, numbers and hyphens only', trigger: 'blur' },
  ],
  department: [{ required: true, message: 'Select a department', trigger: 'change' }],
  designation: [{ required: true, message: 'Designation is required', trigger: 'blur' }],
  employmentType: [{ required: true, message: 'Select an employment type', trigger: 'change' }],
  dateOfJoining: [{ required: true, message: 'Date of joining is required', trigger: 'change' }],
  workLocation: [{ required: true, message: 'Work location is required', trigger: 'blur' }],
  employmentStatus: [{ required: true, message: 'Select an employment status', trigger: 'change' }],
  basicSalary: [
    { required: true, message: 'Basic salary is required', trigger: 'change' },
    { type: 'number', min: 1, max: 10000000, message: 'Enter a salary between 1 and 10,000,000', trigger: 'change' },
  ],
  hra: [{ type: 'number', min: 0, message: 'HRA cannot be negative', trigger: 'change' }],
  allowances: [{ type: 'number', min: 0, message: 'Allowances cannot be negative', trigger: 'change' }],
  deductions: [{ type: 'number', min: 0, message: 'Deductions cannot be negative', trigger: 'change' }],
  bankAccountNumber: [requiredOrPreserved('Bank account number', /^\d{9,18}$/, 'Enter 9 to 18 digits')],
  ifscCode: [requiredOrPreserved('IFSC code', /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/, 'Enter a valid IFSC code')],
  previousExperience: [{ type: 'number', min: 0, max: 60, message: 'Experience must be between 0 and 60 years', trigger: 'change' }],
  emergencyContactName: [
    { validator: (_, value, callback) => (!value || (value.length <= 100 && namePattern.test(value))) ? callback() : callback(new Error('Use letters, spaces, apostrophes or hyphens')), trigger: 'blur' },
  ],
  emergencyContactNumber: [
    { validator: (_, value, callback) => (!value || mobilePattern.test(value)) ? callback() : callback(new Error('Enter a valid 10-digit Indian mobile number')), trigger: 'blur' },
  ],
}

// These values mirror the backend enums in employee.entity.ts.
const departments = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Human Resources', value: 'hr' },
  { label: 'Sales', value: 'sales' },
]
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
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
const skillSuggestions = [
  'JavaScript', 'TypeScript', 'Vue.js', 'React', 'Node.js', 'NestJS',
  'Python', 'SQL', 'PostgreSQL', 'Docker', 'AWS',
]

function loadForm(employee) {
  const values = createInitialForm()
  if (employee) {
    for (const key of Object.keys(values)) {
      if (key === 'bankAccountNumber' || key === 'ifscCode') continue
      if (employee[key] !== undefined) values[key] = employee[key]
    }
    values.dateOfBirth = employee.dateOfBirth ? String(employee.dateOfBirth).slice(0, 10) : ''
    values.dateOfJoining = employee.dateOfJoining ? String(employee.dateOfJoining).slice(0, 10) : ''
    values.reportingManagerId = employee.reportingManagerId ?? null
    values.skills = Array.isArray(employee.skills) ? [...employee.skills] : []
    // Bank fields are intentionally not returned by the API (select:false); blank means keep existing.
    values.bankAccountNumber = ''
    values.ifscCode = ''
  }
  Object.assign(form, values)
  nextTick(() => formRef.value?.clearValidate())
}

watch(() => props.employee, (employee) => loadForm(employee), { immediate: true })

const optionalTextFields = [
  'middleName', 'alternateMobileNumber', 'addressLine2', 'highestQualification',
  'emergencyContactName', 'emergencyContactNumber', 'emergencyContactRelationship',
]

function buildPayload() {
  const payload = { ...form, skills: [...form.skills] }
  for (const field of optionalTextFields) {
    const value = payload[field]
    payload[field] = value?.trim() || (isEditing.value ? null : undefined)
  }
  payload.employeeCode = payload.employeeCode.trim().toUpperCase()
  payload.email = payload.email.trim().toLowerCase()
  payload.ifscCode = payload.ifscCode.trim().toUpperCase() || undefined
  payload.bankAccountNumber = payload.bankAccountNumber.trim() || undefined
  if (isEditing.value) {
    payload.reportingManagerId = payload.reportingManagerId ?? null
    payload.skills = payload.skills.length ? payload.skills : null
  } else {
    payload.reportingManagerId = payload.reportingManagerId ?? undefined
    payload.skills = payload.skills.length ? payload.skills : undefined
  }
  return payload
}

async function submitForm() {
  if (props.saving) return
  try {
    await formRef.value.validate()
  } catch {
    ElMessage.error('Please correct the highlighted fields.')
    return
  }
  emit('save', buildPayload())
}

function resetForm() {
  loadForm(props.employee)
  ElMessage.info(isEditing.value ? 'Form restored to saved values.' : 'Form reset.')
}
</script>


<template>
  <main class="page">
    <header class="page-header">
      <div>
        <p class="eyebrow">EMPLOYEE MANAGEMENT SYSTEM</p>
        <h1>{{ isEditing ? 'Edit Employee' : 'Add Employee' }}</h1>
        <p class="subtitle">{{ isEditing ? 'Update the employee details. Leave bank fields blank to keep the saved values.' : 'Enter the employee details below. Fields marked with * are required.' }}</p>
      </div>
      <div class="header-actions">
        <el-button @click="resetForm">Reset</el-button>
        <el-button @click="emit('cancel')">Cancel</el-button>
      </div>
    </header>

    <el-alert
      :title="isEditing ? 'Employee ID and Employee Code remain assigned to this record.' : 'Employee ID is generated automatically by the backend. Employee Code is entered below and must be unique.'"
      type="info"
      :closable="false"
      show-icon
      class="info-alert"
    />

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      status-icon
      class="employee-form"
      @submit.prevent="submitForm"
    >
      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <div>
              <h2>1. Basic Details</h2>
              <p>Personal information for the employee record.</p>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="First Name *" prop="firstName">
              <el-input v-model="form.firstName" maxlength="50" placeholder="Enter first name" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Middle Name" prop="middleName">
              <el-input v-model="form.middleName" maxlength="50" placeholder="Optional" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Last Name *" prop="lastName">
              <el-input v-model="form.lastName" maxlength="50" placeholder="Enter last name" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Date of Birth *" prop="dateOfBirth">
              <el-date-picker
                v-model="form.dateOfBirth"
                type="date"
                value-format="YYYY-MM-DD"
                format="DD MMM YYYY"
                :disabled-date="disableFutureDates"
                placeholder="Select date of birth"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Gender *" prop="gender">
              <el-select v-model="form.gender" placeholder="Select gender" class="full-width">
                <el-option v-for="option in genderOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <div>
              <h2>2. Contact Details</h2>
              <p>Contact numbers and residential address.</p>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Email *" prop="email">
              <el-input v-model="form.email" type="email" placeholder="name@example.com" clearable>
                <template #prefix><el-icon><Message /></el-icon></template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Mobile Number *" prop="mobileNumber">
              <el-input v-model="form.mobileNumber" maxlength="10" inputmode="numeric" placeholder="10-digit mobile number" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Alternate Mobile Number" prop="alternateMobileNumber">
              <el-input v-model="form.alternateMobileNumber" maxlength="10" inputmode="numeric" placeholder="Optional" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="Address Line 1 *" prop="addressLine1">
              <el-input v-model="form.addressLine1" maxlength="150" placeholder="House / building, street" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item label="Address Line 2" prop="addressLine2">
              <el-input v-model="form.addressLine2" maxlength="150" placeholder="Area / landmark (optional)" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="City *" prop="city">
              <el-input v-model="form.city" maxlength="60" placeholder="City" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="State *" prop="state">
              <el-input v-model="form.state" maxlength="60" placeholder="State" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="Country *" prop="country">
              <el-input v-model="form.country" maxlength="60" placeholder="Country" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="Pincode *" prop="pincode">
              <el-input v-model="form.pincode" maxlength="6" inputmode="numeric" placeholder="6-digit pincode" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <div>
              <h2>3. Employment Details</h2>
              <p>Values for dropdowns match the enums defined in the NestJS entity.</p>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Employee Code *" prop="employeeCode">
              <el-input v-model="form.employeeCode" maxlength="20" placeholder="e.g. EMP-1001" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Department *" prop="department">
              <el-select v-model="form.department" placeholder="Select department" class="full-width">
                <el-option v-for="option in departments" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Designation *" prop="designation">
              <el-input v-model="form.designation" maxlength="100" placeholder="e.g. Software Engineer" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Employment Type *" prop="employmentType">
              <el-select v-model="form.employmentType" placeholder="Select employment type" class="full-width">
                <el-option v-for="option in employmentTypes" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Date of Joining *" prop="dateOfJoining">
              <el-date-picker
                v-model="form.dateOfJoining"
                type="date"
                value-format="YYYY-MM-DD"
                format="DD MMM YYYY"
                placeholder="Select joining date"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Reporting Manager ID" prop="reportingManagerId">
              <el-input-number v-model="form.reportingManagerId" :min="1" :precision="0" :step="1" controls-position="right" placeholder="Optional employee ID" class="full-width" />
              <span class="field-hint">Enter an existing employee's generated ID, not their employee code.</span>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Work Location *" prop="workLocation">
              <el-input v-model="form.workLocation" maxlength="100" placeholder="Office / city / remote" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Employment Status *" prop="employmentStatus">
              <el-select v-model="form.employmentStatus" placeholder="Select status" class="full-width">
                <el-option v-for="option in employmentStatuses" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <div>
              <h2>4. Salary and Bank Details</h2>
              <p>Bank account and IFSC are sent to the API for storage; the backend is configured not to return them in normal responses.</p>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="Basic Salary *" prop="basicSalary">
              <el-input-number v-model="form.basicSalary" :min="1" :max="10000000" :precision="2" :step="1000" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="HRA" prop="hra">
              <el-input-number v-model="form.hra" :min="0" :max="9999999999.99" :precision="2" :step="500" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="Allowances" prop="allowances">
              <el-input-number v-model="form.allowances" :min="0" :max="9999999999.99" :precision="2" :step="500" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="6">
            <el-form-item label="Deductions" prop="deductions">
              <el-input-number v-model="form.deductions" :min="0" :max="9999999999.99" :precision="2" :step="500" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="isEditing ? 'Bank Account Number (leave blank to keep current)' : 'Bank Account Number *'" prop="bankAccountNumber">
              <el-input v-model="form.bankAccountNumber" type="password" show-password maxlength="18" inputmode="numeric" autocomplete="off" placeholder="9 to 18 digits" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="isEditing ? 'IFSC Code (leave blank to keep current)' : 'IFSC Code *'" prop="ifscCode">
              <el-input v-model="form.ifscCode" maxlength="11" placeholder="e.g. ABCD0123456" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <el-card class="section-card" shadow="never">
        <template #header>
          <div class="section-header">
            <div>
              <h2>5. Additional Details</h2>
              <p>Education, experience, skills and emergency contact.</p>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Highest Qualification" prop="highestQualification">
              <el-input v-model="form.highestQualification" maxlength="100" placeholder="e.g. BE Information Technology" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Previous Experience (years)" prop="previousExperience">
              <el-input-number v-model="form.previousExperience" :min="0" :max="60" :precision="1" :step="0.5" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Skills" prop="skills">
              <el-select
                v-model="form.skills"
                multiple
                filterable
                allow-create
                default-first-option
                :reserve-keyword="false"
                :multiple-limit="20"
                placeholder="Select or type skills"
                class="full-width"
              >
                <el-option v-for="skill in skillSuggestions" :key="skill" :label="skill" :value="skill" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Emergency Contact Name" prop="emergencyContactName">
              <el-input v-model="form.emergencyContactName" maxlength="100" placeholder="Full name" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Emergency Contact Number" prop="emergencyContactNumber">
              <el-input v-model="form.emergencyContactNumber" maxlength="10" inputmode="numeric" placeholder="10-digit mobile number" clearable />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Emergency Contact Relationship" prop="emergencyContactRelationship">
              <el-input v-model="form.emergencyContactRelationship" maxlength="50" placeholder="e.g. Parent, spouse" clearable />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <div class="form-footer">
        <el-button size="large" @click="emit('cancel')">Cancel</el-button>
        <el-button type="primary" size="large" :loading="saving" @click="submitForm">
          {{ isEditing ? 'Save changes' : 'Add employee' }}
        </el-button>
      </div>
    </el-form>
  </main>
</template>

<style scoped>
.page {
  min-height: auto;
  padding: 8px 4px;
  background: transparent;
  color: #303133;
}

.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto 24px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #409eff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.page-header h1 {
  margin: 0 0 8px;
  color: #1f2937;
  font-size: clamp(24px, 3vw, 32px);
  font-weight: 700;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  flex-shrink: 0;
  gap: 10px;
}

.info-alert,
.employee-form {
  max-width: 1400px;
  margin-right: auto;
  margin-left: auto;
}

.info-alert {
  margin-bottom: 20px;
}

.section-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border-color: #e6eaf0;
}

.section-header h2 {
  margin: 0 0 5px;
  color: #303133;
  font-size: 17px;
  font-weight: 650;
}

.section-header p {
  margin: 0;
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

.full-width {
  width: 100%;
}

.field-hint {
  display: block;
  margin-top: 5px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 8px 0 28px;
}

@media (max-width: 768px) {
  .page {
    min-height: auto;
    padding: 8px 4px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .form-footer {
    position: sticky;
    bottom: 0;
    z-index: 5;
    padding: 12px;
    background: rgb(245 247 250 / 94%);
    box-shadow: 0 -4px 15px rgb(0 0 0 / 6%);
  }
}
</style>
