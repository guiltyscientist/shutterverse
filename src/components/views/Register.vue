<template>
    <div class="register-view">
        <h1>Register</h1>
        <form @submit.prevent="handleRegister">
            <input type="email" v-model="email" placeholder="Email">
            <input type="password" v-model="password" placeholder="Password">
            <button type="submit">Register</button>
        </form>
        <router-link to="/login">Already have an account?</router-link>
    </div>
</template>

<script>
export default {
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        async handleRegister() {
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.email,
                        password: this.password
                    })
                });
                
                if (response.ok) {
                    this.$router.push('/login');
                }
            } catch (error) {
                console.error('Registration failed:', error);
            }
        }
    }
}
</script>