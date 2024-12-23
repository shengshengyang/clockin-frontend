// quasar-project/src/composables/useAuth.ts
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(false)
const router = useRouter()

const login = () => {
  isLoggedIn.value = true
  router.push('/map')
}

const logout = () => {
  isLoggedIn.value = false
  router.push('/')
  router.go(0)
}

export { isLoggedIn, login, logout }
