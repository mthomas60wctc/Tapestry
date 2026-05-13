<template>
  <q-layout view="hHh lpR fFf" class="bg-gradient">
    <q-page-container>
      <q-page class="flex flex-center">
        <q-card class="login-card">
          <q-card-section class="text-center">
            <div class="text-h4 text-weight-bold q-mb-md">Tapestry</div>
            <p class="text-subtitle2 text-grey">Book Workspace & Character Management</p>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-px-lg q-py-lg">
            <q-form @submit.prevent="handleLogin" class="q-gutter-md">
              <q-input
                v-model="email"
                label="Email"
                type="email"
                outlined
                dense
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Email is required',
                  (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format',
                ]"
              />

              <q-input
                v-model="password"
                label="Password"
                type="password"
                outlined
                dense
                lazy-rules
                :rules="[(val) => (val && val.length > 0) || 'Password is required']"
                @keyup.enter="handleLogin"
              />

              <div class="q-mt-lg">
                <q-btn
                  label="Login"
                  type="submit"
                  color="primary"
                  size="lg"
                  class="full-width"
                  :loading="isLoading"
                />
              </div>

              <div class="q-mt-md text-center">
                <span class="text-body2 text-grey">Don't have an account?</span>
                <q-btn
                  label="Sign Up"
                  flat
                  color="primary"
                  class="q-ml-xs"
                  @click="showSignUp = true"
                />
              </div>
            </q-form>

            <div v-if="error" class="q-mt-md">
              <q-banner class="bg-negative text-white rounded-borders">
                {{ error }}
              </q-banner>
            </div>
          </q-card-section>
        </q-card>

        <!-- Sign Up Dialog -->
        <q-dialog v-model="showSignUp">
          <q-card class="signup-card">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">Create Account</div>
              <q-space />
              <q-btn icon="close" flat round dense @click="showSignUp = false" />
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="handleSignUp" class="q-gutter-md">
                <q-input
                  v-model="signUpForm.username"
                  label="Username"
                  type="text"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(val) => (val && val.length > 0) || 'Username is required']"
                />

                <q-input
                  v-model="signUpForm.email"
                  label="Email"
                  type="email"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Email is required',
                    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format',
                  ]"
                />

                <q-input
                  v-model="signUpForm.password"
                  label="Password"
                  type="password"
                  outlined
                  dense
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length >= 6) || 'Password must be at least 6 characters',
                  ]"
                />

                <q-input
                  v-model="signUpForm.confirmPassword"
                  label="Confirm Password"
                  type="password"
                  outlined
                  dense
                  lazy-rules
                  :rules="[(val) => val === signUpForm.password || 'Passwords do not match']"
                />

                <q-btn
                  label="Create Account"
                  type="submit"
                  color="primary"
                  class="full-width"
                  :loading="isLoading"
                />
              </q-form>

              <div v-if="signUpError" class="q-mt-md">
                <q-banner class="bg-negative text-white rounded-borders">
                  {{ signUpError }}
                </q-banner>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import { auth } from 'boot/firebaseInit'

const router = useRouter()
const $q = useQuasar()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)
const showSignUp = ref(false)
const signUpError = ref('')

const signUpForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = getErrorMessage(err.code)
  } finally {
    isLoading.value = false
  }
}

const handleSignUp = async () => {
  signUpError.value = ''
  isLoading.value = true

  try {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      signUpForm.value.email,
      signUpForm.value.password,
    )

    await updateProfile(credentials.user, {
      displayName: signUpForm.value.username.trim(),
    })

    showSignUp.value = false
    email.value = signUpForm.value.email
    password.value = signUpForm.value.password
    signUpForm.value = { username: '', email: '', password: '', confirmPassword: '' }
    $q.notify({
      type: 'positive',
      message: 'Account created! You are now logged in.',
      position: 'top',
    })
    router.push('/dashboard')
  } catch (err) {
    signUpError.value = getErrorMessage(err.code)
  } finally {
    isLoading.value = false
  }
}

const getErrorMessage = (code) => {
  const messages = {
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'This email is already in use',
    'auth/weak-password': 'Password is too weak',
    'auth/operation-not-allowed': 'Operation not allowed',
  }
  return messages[code] || 'An error occurred. Please try again.'
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.signup-card {
  min-width: 350px;
}
</style>
