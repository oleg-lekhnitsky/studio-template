<script setup lang="ts">
import type { FormField } from '~/types/sanity'

defineProps<{ fields?: FormField[] }>()
</script>

<template>
  <SubmissionForm
    context="General contact enquiry"
    success-message="Thank you. We’ll be in touch."
    :fields="fields"
  />
</template>
