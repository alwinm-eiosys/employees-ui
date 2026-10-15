<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { Message, Plus, Delete, UploadFilled } from '@element-plus/icons-vue'

const formRef = ref()
const submitting = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  amount: 0,
  description: '',

  country: '',
  skills: [],
  department: [],

  gender: '',
  employmentType: '',

  permissions: [],

  notifications: true,
  sms: false,

  active: true,

  date: null,
  dateRange: [],
  month: null,
  year: null,
  time: null,
  datetime: null,
  datetimeRange: [],

  experience: 5,
  rating: 4,
  color: '#409EFF',

  autocomplete: '',

  transfer: [],

  education: [
    {
      id: Date.now(),
      degree: '',
      institute: '',
      year: new Date().getFullYear(),
    },
  ],
})

const rules = {
  firstName: [
    {
      required: true,
      message: 'First name is required',
      trigger: 'blur',
    },
    {
      min: 2,
      message: 'Minimum 2 characters',
      trigger: 'blur',
    },
  ],

  email: [
    {
      required: true,
      message: 'Email is required',
      trigger: 'blur',
    },
    {
      type: 'email',
      message: 'Enter a valid email address',
      trigger: 'blur',
    },
  ],

  password: [
    {
      required: true,
      message: 'Password is required',
      trigger: 'blur',
    },
    {
      min: 6,
      message: 'Minimum 6 characters',
      trigger: 'blur',
    },
  ],
}

const countries = [
  { label: 'India', value: 'india' },
  { label: 'United States', value: 'usa' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Australia', value: 'australia' },
  { label: 'Canada', value: 'canada' },
]

const skills = [
  'Vue.js',
  'React',
  'Angular',
  'Node.js',
  'NestJS',
  'PostgreSQL',
  'MongoDB',
  'Docker',
]

const departmentOptions = [
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'devops', label: 'DevOps' },
    ],
  },
  {
    value: 'sales',
    label: 'Sales',
    children: [
      { value: 'inside-sales', label: 'Inside Sales' },
      { value: 'field-sales', label: 'Field Sales' },
    ],
  },
  {
    value: 'hr',
    label: 'Human Resources',
  },
  {
    value: 'finance',
    label: 'Finance',
  },
]

const transferData = Array.from({ length: 10 }, (_, index) => ({
  key: index + 1,
  label: `Permission ${index + 1}`,
}))

const cities = [
  { value: 'Mumbai' },
  { value: 'Pune' },
  { value: 'Delhi' },
  { value: 'Bangalore' },
  { value: 'Hyderabad' },
  { value: 'Chennai' },
]

const querySearch = (queryString, callback) => {
  const results = queryString
    ? cities.filter((item) => item.value.toLowerCase().includes(queryString.toLowerCase()))
    : cities

  callback(results)
}

const addEducation = () => {
  form.education.push({
    id: Date.now(),
    degree: '',
    institute: '',
    year: new Date().getFullYear(),
  })
}

const removeEducation = (index) => {
  if (form.education.length === 1) {
    ElMessage.warning('At least one education record is required')
    return
  }

  form.education.splice(index, 1)
}

const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  const isImage = allowedTypes.includes(file.type)
  const isValidSize = file.size / 1024 / 1024 < 5

  if (!isImage) {
    ElMessage.error('Only JPG, PNG or WEBP images are allowed')

    return false
  }

  if (!isValidSize) {
    ElMessage.error('Image size must be less than 5MB')

    return false
  }

  return false
}

const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    submitting.value = true

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('FORM SUBMITTED:', JSON.parse(JSON.stringify(form)))

    ElMessage.success('Form submitted successfully')
  } catch {
    ElMessage.error('Please fix the validation errors')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  formRef.value?.resetFields()

  form.skills = []
  form.permissions = []
  form.department = []
  form.dateRange = []
  form.datetimeRange = []
  form.transfer = []

  form.education = [
    {
      id: Date.now(),
      degree: '',
      institute: '',
      year: new Date().getFullYear(),
    },
  ]

  ElMessage.info('Form has been reset')
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Element Plus Form Playground</h1>
        <p>Complete form component showcase</p>
      </div>

      <div class="header-actions">
        <el-button @click="resetForm">Reset</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">
          Submit Form
        </el-button>
      </div>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      status-icon
      class="playground-form"
    >
      <!-- BASIC INPUTS -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>Basic Inputs</h2>
              <span>Text, password, number and textarea controls</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="First Name" prop="firstName">
              <el-input v-model="form.firstName" placeholder="Enter first name" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Last Name">
              <el-input v-model="form.lastName" placeholder="Enter last name" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" type="email" placeholder="example@email.com" clearable>
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Password" prop="password">
              <el-input
                v-model="form.password"
                type="password"
                placeholder="Enter password"
                show-password
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Phone">
              <el-input
                v-model="form.phone"
                placeholder="Enter phone number"
                maxlength="10"
                show-word-limit
              >
                <template #prepend>+91</template>
              </el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Amount">
              <el-input-number
                v-model="form.amount"
                :min="0"
                :max="1000000"
                :step="100"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24">
            <el-form-item label="Description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="Enter description..."
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- SELECTION -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>Selection Controls</h2>
              <span>Select, radio, checkbox and switch components</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Country">
              <el-select
                v-model="form.country"
                placeholder="Select country"
                filterable
                clearable
                class="full-width"
              >
                <el-option
                  v-for="item in countries"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Skills">
              <el-select
                v-model="form.skills"
                multiple
                filterable
                collapse-tags
                collapse-tags-tooltip
                placeholder="Select skills"
                class="full-width"
              >
                <el-option v-for="skill in skills" :key="skill" :label="skill" :value="skill" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Department">
              <el-cascader
                v-model="form.department"
                :options="departmentOptions"
                clearable
                filterable
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Gender">
              <el-radio-group v-model="form.gender">
                <el-radio value="male">Male</el-radio>
                <el-radio value="female">Female</el-radio>
                <el-radio value="other">Other</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Employment Type">
              <el-radio-group v-model="form.employmentType">
                <el-radio-button value="full-time"> Full Time </el-radio-button>

                <el-radio-button value="part-time"> Part Time </el-radio-button>

                <el-radio-button value="contract"> Contract </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Permissions">
              <el-checkbox-group v-model="form.permissions">
                <el-checkbox value="read">Read</el-checkbox>
                <el-checkbox value="write">Write</el-checkbox>
                <el-checkbox value="delete">Delete</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Account Settings">
              <el-checkbox v-model="form.notifications"> Email Notifications </el-checkbox>

              <el-checkbox v-model="form.sms"> SMS Notifications </el-checkbox>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Account Status">
              <el-switch v-model="form.active" active-text="Active" inactive-text="Inactive" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- DATE TIME -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>Date & Time</h2>
              <span>Date, range, month, year and time controls</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Select date"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Date Range">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Month">
              <el-date-picker
                v-model="form.month"
                type="month"
                placeholder="Select month"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Year">
              <el-date-picker
                v-model="form.year"
                type="year"
                placeholder="Select year"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Time">
              <el-time-picker v-model="form.time" placeholder="Select time" class="full-width" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Date & Time">
              <el-date-picker
                v-model="form.datetime"
                type="datetime"
                placeholder="Select date & time"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :lg="8">
            <el-form-item label="Date & Time Range">
              <el-date-picker
                v-model="form.datetimeRange"
                type="datetimerange"
                start-placeholder="Start"
                end-placeholder="End"
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- ADVANCED -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>Advanced Controls</h2>
              <span>Slider, rating, color, transfer and autocomplete</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Experience">
              <el-slider v-model="form.experience" :min="0" :max="30" show-input />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Rating">
              <el-rate v-model="form.rating" allow-half show-score />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Favorite Color">
              <el-color-picker v-model="form.color" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Autocomplete">
              <el-autocomplete
                v-model="form.autocomplete"
                :fetch-suggestions="querySearch"
                placeholder="Search city"
                clearable
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="Transfer">
          <el-transfer
            v-model="form.transfer"
            :data="transferData"
            :titles="['Available', 'Selected']"
          />
        </el-form-item>
      </el-card>

      <!-- UPLOAD -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>File Upload</h2>
              <span>Avatar, document and multiple file uploads</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Profile Photo">
              <el-upload
                class="avatar-uploader"
                action="#"
                :show-file-list="false"
                :before-upload="beforeUpload"
              >
                <div class="upload-box">
                  <el-icon size="30">
                    <Plus />
                  </el-icon>
                  <span>Upload Photo</span>
                </div>
              </el-upload>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Documents">
              <el-upload action="#" multiple drag :auto-upload="false">
                <el-icon class="el-icon--upload">
                  <UploadFilled />
                </el-icon>

                <div class="el-upload__text">Drop files here or <em>click to upload</em></div>

                <template #tip>
                  <div class="el-upload__tip">PDF / DOC / DOCX files up to 10MB</div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <!-- DYNAMIC -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>Dynamic Form Fields</h2>
              <span>Add and remove multiple records dynamically</span>
            </div>

            <el-button type="primary" plain @click="addEducation">
              <el-icon><Plus /></el-icon>
              Add Education
            </el-button>
          </div>
        </template>

        <div v-for="(education, index) in form.education" :key="education.id" class="dynamic-row">
          <el-row :gutter="16" class="flex-1">
            <el-col :xs="24" :sm="8">
              <el-form-item :label="`Degree ${index + 1}`">
                <el-input v-model="education.degree" placeholder="e.g. B.Tech" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="8">
              <el-form-item :label="`Institute ${index + 1}`">
                <el-input v-model="education.institute" placeholder="Institute name" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="6">
              <el-form-item :label="`Year ${index + 1}`">
                <el-input-number
                  v-model="education.year"
                  :min="1950"
                  :max="2100"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-button type="danger" link @click="removeEducation(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </el-card>

      <!-- STATES -->
      <el-card class="section-card">
        <template #header>
          <div class="section-header">
            <div>
              <h2>Form States</h2>
              <span>Disabled, readonly and conditional controls</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" :sm="12">
            <el-form-item label="Disabled Input">
              <el-input model-value="Disabled value" disabled />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12">
            <el-form-item label="Readonly Input">
              <el-input model-value="Readonly value" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>

      <div class="form-footer">
        <el-button size="large" @click="resetForm"> Reset </el-button>

        <el-button type="primary" size="large" :loading="submitting" @click="submitForm">
          Submit
        </el-button>
      </div>
    </el-form>

    <el-card class="debug-card">
      <template #header>
        <div class="debug-header">
          <span>Form Model</span>
          <el-tag type="info">Development</el-tag>
        </div>
      </template>

      <pre>{{ JSON.stringify(form, null, 2) }}</pre>
    </el-card>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  
  padding: 32px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.section-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-header h2 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 600;
}

.section-header span {
  color: #909399;
  font-size: 13px;
}

.full-width {
  width: 100%;
}

.el-form-item {
  margin-bottom: 22px;
}

.dynamic-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 18px;
  margin-bottom: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.flex-1 {
  flex: 1;
}

.upload-box {
  width: 180px;
  height: 140px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;

  border: 1px dashed #dcdfe6;
  border-radius: 8px;

  color: #909399;

  cursor: pointer;
  transition: 0.2s;
}

.upload-box:hover {
  border-color: #409eff;
  color: #409eff;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  padding: 20px;

  background: white;

  border-radius: 12px;

  margin-bottom: 24px;
}

.debug-card {
  border-radius: 12px;
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.debug-card pre {
  margin: 0;
  padding: 20px;

  max-height: 500px;
  overflow: auto;

  background: #1e1e1e;
  color: #d4d4d4;

  border-radius: 8px;

  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .el-button {
    flex: 1;
  }

  .dynamic-row {
    flex-direction: column;
  }

  .form-footer {
    position: sticky;
    bottom: 0;
    z-index: 10;

    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.08);
  }
}
</style>
