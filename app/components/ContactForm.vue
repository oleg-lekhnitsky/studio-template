<script setup lang="ts">
import type { FormField } from '~/types/sanity'

defineProps<{ fields?: FormField[] }>()
const emit = defineEmits<{ success: [message: string] }>()
</script>

<template>
  <SubmissionForm
    context="General contact enquiry"
    success-message="Thank you. We’ll be in touch soon."
    :fields="fields"
    appearance="contact"
    submit-label="Send"
    @success="emit('success', $event)"
  />
</template>
