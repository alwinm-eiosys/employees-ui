<script setup>
import { reactive, ref } from 'vue'
import { Message } from '@element-plus/icons-vue'

const formRef = ref()
const submitting = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  gender: '',
  password: '',

  email: '',
  phone: '',

  country: '',
  skills: [],
  department: [],
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
    { required: true, message: 'First Name is required', trigger: 'blur' },
    { min: 2, message: 'Minimum 2 characters needed', trigger: 'blur' },
  ],

  email: [
    { required: true, message: 'Email is required', trigger: 'blur' },
    { type: 'email', message: 'Enter valid email', trigger: 'blur' },
  ],

  password: [
    { required: true, message: 'Password required', trigger: 'blur' },
    { min: 6, message: 'Minimum 6 characters needed', trigger: 'blur' },
  ],
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1>Macrosoft Employee Management System</h1>
        <p>Everything at your service</p>
      </div>

      <div class="header-actions">
        <el-button @click="resetForm">Reset</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">Submit</el-button>
      </div>
    </div>

    <!--label-position lets us position labels fior all input fields wrt their input field-->
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
          <!--So each card can have its own header content-->
          <div class="section-header">
            <div>
              <h2>Basic Information</h2>
              <span>Fill your valid personal data</span>
            </div>
          </div>
        </template>

        <el-row :gutter="24">
          <el-col :xs="24" sm="12" lg="8">
            <el-form-item label="First Name" prop="firstName">
              <el-input v-model="form.firstName" placeholder="Enter first name" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" sm="12" lg="8">
            <el-form-item label="Last Name" prop="lastName">
              <el-input v-model="form.lastName" placeholder="Enter last name" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" sm="12" lg="8">
            <el-form-item label="Email" prop="email">
              <el-input v-model="form.email" type="email" placeholder="abc@example.com" clearable>
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-card>
    </el-form>
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
</style>
